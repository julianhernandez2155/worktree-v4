-- Migration: Add public projects and discover feed functionality
-- Description: Extends internal_projects with public visibility and adds application system

-- Add columns to internal_projects for public visibility
ALTER TABLE internal_projects 
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN max_applicants INTEGER,
ADD COLUMN application_deadline TIMESTAMPTZ,
ADD COLUMN required_commitment_hours INTEGER,
ADD COLUMN preferred_start_date DATE,
ADD COLUMN public_description TEXT, -- Longer description for public view
ADD COLUMN application_requirements TEXT, -- What to include in application
ADD COLUMN published_at TIMESTAMPTZ,
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN application_count INTEGER DEFAULT 0;

-- Create project applications table
CREATE TABLE project_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES internal_projects(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn')),
    cover_letter TEXT,
    portfolio_urls TEXT[],
    availability_hours_per_week INTEGER,
    expected_start_date DATE,
    -- Skill matching
    skill_match_score DOUBLE PRECISION,
    matched_skills UUID[], -- Array of skill IDs that match
    missing_skills UUID[], -- Array of required skills user doesn't have
    -- Metadata
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, applicant_id)
);

-- Create saved projects table
CREATE TABLE saved_projects (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES internal_projects(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id)
);

-- Create project views tracking table
CREATE TABLE project_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES internal_projects(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    view_duration_seconds INTEGER,
    referrer TEXT, -- Where they came from (search, recommended, etc.)
    UNIQUE(project_id, viewer_id, viewed_at)
);

-- Add indexes for performance
CREATE INDEX idx_projects_public ON internal_projects(is_public, status) WHERE is_public = true;
CREATE INDEX idx_projects_deadline ON internal_projects(application_deadline) WHERE is_public = true;
CREATE INDEX idx_projects_published ON internal_projects(published_at DESC) WHERE is_public = true;
CREATE INDEX idx_projects_org_public ON internal_projects(organization_id, is_public);

CREATE INDEX idx_applications_project ON project_applications(project_id);
CREATE INDEX idx_applications_applicant ON project_applications(applicant_id);
CREATE INDEX idx_applications_status ON project_applications(status);
CREATE INDEX idx_applications_pending ON project_applications(project_id, status) WHERE status = 'pending';
CREATE INDEX idx_applications_skill_score ON project_applications(skill_match_score DESC);

CREATE INDEX idx_saved_projects_user ON saved_projects(user_id);
CREATE INDEX idx_project_views_project ON project_views(project_id);
CREATE INDEX idx_project_views_viewer ON project_views(viewer_id);

-- Create materialized view for project skill demand
CREATE MATERIALIZED VIEW project_skill_matches AS
WITH project_skills_agg AS (
    SELECT 
        p.id as project_id,
        p.organization_id,
        p.name as project_name,
        p.is_public,
        p.status,
        p.application_deadline,
        array_agg(DISTINCT trs.skill_id) FILTER (WHERE trs.importance = 'required') as required_skills,
        array_agg(DISTINCT trs.skill_id) FILTER (WHERE trs.importance = 'preferred') as preferred_skills,
        count(DISTINCT trs.skill_id) as total_skills_needed
    FROM internal_projects p
    LEFT JOIN contributions c ON c.project_id = p.id
    LEFT JOIN task_required_skills trs ON trs.task_id = c.id
    WHERE p.is_public = true AND p.status = 'active'
    GROUP BY p.id, p.organization_id, p.name, p.is_public, p.status, p.application_deadline
)
SELECT 
    ps.*,
    o.name as organization_name,
    o.logo_url as organization_logo,
    o.verified as organization_verified
FROM project_skills_agg ps
JOIN organizations o ON o.id = ps.organization_id;

-- Create index on materialized view
CREATE INDEX idx_project_skill_matches_deadline ON project_skill_matches(application_deadline);
CREATE INDEX idx_project_skill_matches_skills ON project_skill_matches USING gin(required_skills);

-- Function to calculate skill match score for a user and project
CREATE OR REPLACE FUNCTION calculate_skill_match_score(
    p_user_id UUID,
    p_project_id UUID
) RETURNS TABLE (
    match_score DOUBLE PRECISION,
    matched_required_skills UUID[],
    matched_preferred_skills UUID[],
    missing_required_skills UUID[],
    total_required_skills INTEGER,
    total_preferred_skills INTEGER
) AS $$
DECLARE
    user_skills UUID[];
    project_required_skills UUID[];
    project_preferred_skills UUID[];
BEGIN
    -- Get user's skills
    SELECT array_agg(skill_id) INTO user_skills
    FROM member_skills
    WHERE user_id = p_user_id;

    -- Get project's required and preferred skills
    SELECT 
        array_agg(DISTINCT trs.skill_id) FILTER (WHERE trs.importance = 'required'),
        array_agg(DISTINCT trs.skill_id) FILTER (WHERE trs.importance = 'preferred')
    INTO project_required_skills, project_preferred_skills
    FROM contributions c
    JOIN task_required_skills trs ON trs.task_id = c.id
    WHERE c.project_id = p_project_id;

    -- Calculate matches
    RETURN QUERY
    SELECT 
        CASE 
            WHEN array_length(project_required_skills, 1) IS NULL THEN 100.0
            WHEN array_length(project_required_skills, 1) = 0 THEN 100.0
            ELSE (
                (array_length(user_skills, 1) FILTER (WHERE user_skills && project_required_skills), 1)::FLOAT / 
                array_length(project_required_skills, 1)::FLOAT * 70.0) +
                (array_length(user_skills, 1) FILTER (WHERE user_skills && project_preferred_skills), 1)::FLOAT / 
                GREATEST(array_length(project_preferred_skills, 1), 1)::FLOAT * 30.0)
            )
        END as match_score,
        user_skills && project_required_skills as matched_required_skills,
        user_skills && project_preferred_skills as matched_preferred_skills,
        project_required_skills - user_skills as missing_required_skills,
        array_length(project_required_skills, 1) as total_required_skills,
        array_length(project_preferred_skills, 1) as total_preferred_skills;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended projects for a user
CREATE OR REPLACE FUNCTION get_recommended_projects(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    project_id UUID,
    project_name TEXT,
    organization_id UUID,
    organization_name TEXT,
    organization_logo TEXT,
    match_score DOUBLE PRECISION,
    required_skills UUID[],
    preferred_skills UUID[],
    matched_skills UUID[],
    missing_skills UUID[],
    application_deadline TIMESTAMPTZ,
    is_saved BOOLEAN,
    has_applied BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH user_skills AS (
        SELECT array_agg(skill_id) as skills
        FROM member_skills
        WHERE user_id = p_user_id
    ),
    scored_projects AS (
        SELECT 
            p.id,
            p.name,
            p.organization_id,
            o.name as org_name,
            o.logo_url,
            p.application_deadline,
            psm.required_skills,
            psm.preferred_skills,
            CASE 
                WHEN array_length(psm.required_skills, 1) IS NULL THEN 100.0
                ELSE (
                    (cardinality(us.skills & psm.required_skills)::FLOAT / 
                     GREATEST(cardinality(psm.required_skills), 1)::FLOAT * 70.0) +
                    (cardinality(us.skills & psm.preferred_skills)::FLOAT / 
                     GREATEST(cardinality(psm.preferred_skills), 1)::FLOAT * 30.0)
                )
            END as score,
            us.skills & (psm.required_skills || psm.preferred_skills) as matched,
            psm.required_skills - us.skills as missing
        FROM internal_projects p
        JOIN organizations o ON o.id = p.organization_id
        JOIN project_skill_matches psm ON psm.project_id = p.id
        CROSS JOIN user_skills us
        WHERE p.is_public = true 
        AND p.status = 'active'
        AND (p.application_deadline IS NULL OR p.application_deadline > NOW())
    )
    SELECT 
        sp.id,
        sp.name,
        sp.organization_id,
        sp.org_name,
        sp.logo_url,
        sp.score,
        sp.required_skills,
        sp.preferred_skills,
        sp.matched,
        sp.missing,
        sp.application_deadline,
        EXISTS(SELECT 1 FROM saved_projects WHERE user_id = p_user_id AND project_id = sp.id) as is_saved,
        EXISTS(SELECT 1 FROM project_applications WHERE applicant_id = p_user_id AND project_id = sp.id) as has_applied
    FROM scored_projects sp
    ORDER BY sp.score DESC, sp.application_deadline ASC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON project_applications
    FOR SELECT USING (auth.uid() = applicant_id);

-- Organization admins can view applications to their projects
CREATE POLICY "Org admins can view project applications" ON project_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_projects p
            JOIN organization_members om ON om.organization_id = p.organization_id
            WHERE p.id = project_applications.project_id
            AND om.user_id = auth.uid()
            AND om.role IN ('admin', 'president', 'project_lead')
        )
    );

-- Users can create applications
CREATE POLICY "Users can create applications" ON project_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Users can update their own applications
CREATE POLICY "Users can update own applications" ON project_applications
    FOR UPDATE USING (auth.uid() = applicant_id);

-- Saved projects policies
CREATE POLICY "Users can view own saved projects" ON saved_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save projects" ON saved_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave projects" ON saved_projects
    FOR DELETE USING (auth.uid() = user_id);

-- Project views are insert-only for analytics
CREATE POLICY "Users can track views" ON project_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Update trigger for project applications
CREATE TRIGGER update_project_applications_updated_at 
    BEFORE UPDATE ON project_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_project_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE internal_projects 
    SET view_count = view_count + 1
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_views_on_insert
    AFTER INSERT ON project_views
    FOR EACH ROW EXECUTE FUNCTION increment_project_view_count();

-- Function to update application count
CREATE OR REPLACE FUNCTION update_project_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE internal_projects 
        SET application_count = application_count + 1
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE internal_projects 
        SET application_count = application_count - 1
        WHERE id = OLD.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_application_count
    AFTER INSERT OR DELETE ON project_applications
    FOR EACH ROW EXECUTE FUNCTION update_project_application_count();

-- Refresh materialized view periodically (can be called via cron job)
CREATE OR REPLACE FUNCTION refresh_project_skill_matches()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY project_skill_matches;
END;
$$ LANGUAGE plpgsql;