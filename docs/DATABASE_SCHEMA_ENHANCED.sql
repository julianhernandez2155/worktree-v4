-- Worktree v4 Enhanced Database Schema
-- Optimized for performance, analytics, and scalability
-- Compatible with Supabase/PostgreSQL 15+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query performance monitoring

-- =====================================================
-- SECTION 1: CORE TABLES WITH ENHANCED FEATURES
-- =====================================================

-- Universities table with additional metadata
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    website_url TEXT,
    logo_url TEXT,
    timezone TEXT DEFAULT 'America/New_York',
    settings JSONB DEFAULT '{}', -- Flexible settings storage
    feature_flags JSONB DEFAULT '{"beta_features": false}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(domain, '')), 'B')
    ) STORED
);

-- Optimized indexes
CREATE INDEX idx_universities_domain ON universities(domain);
CREATE INDEX idx_universities_search ON universities USING GIN(search_vector);
CREATE INDEX idx_universities_settings ON universities USING GIN(settings);

-- Users table with enhanced profile and analytics
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL CHECK(role IN ('student', 'leader', 'admin', 'advisor')) DEFAULT 'student',
    status TEXT NOT NULL CHECK(status IN ('active', 'pending_verification', 'suspended', 'deactivated')) DEFAULT 'pending_verification',
    
    -- Enhanced profile fields
    profile_picture_url TEXT,
    bio TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    personal_website TEXT,
    resume_url TEXT,
    
    -- Academic information
    graduation_year INT CHECK(graduation_year >= 2020 AND graduation_year <= 2050),
    major TEXT,
    minor TEXT,
    gpa DECIMAL(3,2) CHECK(gpa >= 0 AND gpa <= 4.0),
    
    -- Demographics (handle with care - FERPA)
    is_first_generation BOOLEAN,
    is_international BOOLEAN,
    preferred_pronouns TEXT,
    
    -- Engagement tracking
    last_login_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    onboarding_completed_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    
    -- Preferences and settings
    preferences JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "push": true,
            "sms": false
        },
        "privacy": {
            "profile_visibility": "public",
            "show_email": false
        }
    }',
    
    -- AI embeddings for recommendation engine
    profile_embedding vector(1536),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Computed fields for analytics
    days_since_last_login INT GENERATED ALWAYS AS (
        EXTRACT(DAY FROM NOW() - COALESCE(last_login_at, created_at))::INT
    ) STORED,
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(first_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(last_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(bio, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(major, '')), 'B')
    ) STORED
);

-- Performance indexes
CREATE INDEX idx_users_university_id ON users(university_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_graduation_year ON users(graduation_year);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX idx_users_search ON users USING GIN(search_vector);
CREATE INDEX idx_users_embedding ON users USING ivfflat(profile_embedding vector_cosine_ops);

-- =====================================================
-- SECTION 2: ENHANCED SKILLS SYSTEM
-- =====================================================

-- Skill categories with hierarchy support
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES skill_categories(id),
    icon_url TEXT,
    color_hex TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills with enhanced metadata
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES skill_categories(id),
    description TEXT,
    
    -- Skill metadata
    is_technical BOOLEAN DEFAULT false,
    is_verified_only BOOLEAN DEFAULT false, -- Requires endorsement
    difficulty_level INT CHECK(difficulty_level BETWEEN 1 AND 5),
    
    -- Market data
    market_demand_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    average_salary INT,
    job_postings_count INT DEFAULT 0,
    
    -- AI embeddings for similarity matching
    skill_embedding vector(1536),
    
    -- Usage tracking
    user_count INT DEFAULT 0,
    project_count INT DEFAULT 0,
    last_trending_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for skills
CREATE INDEX idx_skills_category ON skills(category_id);
CREATE INDEX idx_skills_technical ON skills(is_technical);
CREATE INDEX idx_skills_demand ON skills(market_demand_score DESC);
CREATE INDEX idx_skills_embedding ON skills USING ivfflat(skill_embedding vector_cosine_ops);

-- User skills with verification tracking
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    
    -- Skill proficiency
    level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
    years_experience DECIMAL(3,1) CHECK(years_experience >= 0),
    
    -- Verification
    source TEXT NOT NULL CHECK(source IN ('self_assessed', 'course_completion', 'project_verified', 'peer_endorsed', 'instructor_verified')),
    verification_count INT DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Evidence
    evidence_urls TEXT[], -- Links to projects, certificates, etc.
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, skill_id)
);

-- Performance indexes
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX idx_user_skills_level ON user_skills(level);
CREATE INDEX idx_user_skills_verified ON user_skills(source) WHERE source != 'self_assessed';

-- =====================================================
-- SECTION 3: ORGANIZATIONS WITH ANALYTICS
-- =====================================================

-- Organizations with enhanced features
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL, -- URL-friendly name
    description TEXT,
    mission_statement TEXT,
    
    -- Contact and social
    email TEXT,
    website_url TEXT,
    instagram_handle TEXT,
    linkedin_url TEXT,
    
    -- Branding
    logo_url TEXT,
    cover_image_url TEXT,
    primary_color_hex TEXT,
    
    -- Classification
    category TEXT CHECK(category IN ('academic', 'social', 'professional', 'sports', 'arts', 'service', 'greek_life', 'cultural')),
    subcategories TEXT[],
    tags TEXT[],
    
    -- Status and verification
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    founded_year INT,
    
    -- Settings
    settings JSONB DEFAULT '{
        "recruitment": {
            "accepting_members": true,
            "application_required": false
        },
        "visibility": {
            "public_profile": true,
            "show_members": true
        }
    }',
    
    -- Analytics
    total_members INT DEFAULT 0,
    active_members_30d INT DEFAULT 0,
    total_projects INT DEFAULT 0,
    total_events INT DEFAULT 0,
    engagement_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C')
    ) STORED,
    
    UNIQUE(university_id, slug)
);

-- Indexes
CREATE INDEX idx_orgs_university ON organizations(university_id);
CREATE INDEX idx_orgs_category ON organizations(category);
CREATE INDEX idx_orgs_active ON organizations(is_active, is_verified);
CREATE INDEX idx_orgs_search ON organizations USING GIN(search_vector);
CREATE INDEX idx_orgs_tags ON organizations USING GIN(tags);

-- Organization membership with history
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role and permissions
    role TEXT NOT NULL CHECK(role IN ('member', 'officer', 'president', 'vice_president', 'treasurer', 'secretary', 'advisor')) DEFAULT 'member',
    custom_title TEXT, -- e.g., "Director of Marketing"
    permissions JSONB DEFAULT '{}',
    
    -- Membership timeline
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN GENERATED ALWAYS AS (left_at IS NULL) STORED,
    
    -- Engagement tracking
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    contribution_hours DECIMAL(6,2) DEFAULT 0,
    projects_led INT DEFAULT 0,
    events_attended INT DEFAULT 0,
    
    -- Notes and recognition
    bio TEXT,
    achievements TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(organization_id, user_id)
);

-- Indexes
CREATE INDEX idx_org_members_org ON organization_members(organization_id) WHERE is_active;
CREATE INDEX idx_org_members_user ON organization_members(user_id) WHERE is_active;
CREATE INDEX idx_org_members_role ON organization_members(role) WHERE is_active;
CREATE INDEX idx_org_members_joined ON organization_members(joined_at DESC);

-- =====================================================
-- SECTION 4: PROJECTS WITH TASK MANAGEMENT
-- =====================================================

-- Projects with comprehensive tracking
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Project details
    type TEXT CHECK(type IN ('event_planning', 'software', 'research', 'community_service', 'creative', 'other')),
    visibility TEXT CHECK(visibility IN ('public', 'members_only', 'invite_only')) DEFAULT 'public',
    
    -- Timeline
    status TEXT NOT NULL CHECK(status IN ('ideation', 'planning', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    estimated_hours INT,
    actual_hours DECIMAL(6,2),
    
    -- Team settings
    max_members INT DEFAULT 10,
    current_members INT DEFAULT 0,
    application_deadline DATE,
    
    -- Resources
    budget DECIMAL(10,2),
    resources_needed TEXT[],
    tools_used TEXT[],
    
    -- Outcomes
    impact_statement TEXT,
    deliverables JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    
    -- AI and search
    project_embedding vector(1536),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Search vector
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED,
    
    UNIQUE(organization_id, slug)
);

-- Indexes
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);
CREATE INDEX idx_projects_embedding ON projects USING ivfflat(project_embedding vector_cosine_ops);

-- Project members with contributions
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role in project
    role TEXT DEFAULT 'contributor',
    responsibilities TEXT[],
    
    -- Contribution tracking
    hours_contributed DECIMAL(6,2) DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    commits_count INT DEFAULT 0, -- For software projects
    
    -- Timeline
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN GENERATED ALWAYS AS (left_at IS NULL) STORED,
    
    -- Recognition
    contribution_summary TEXT,
    skills_demonstrated UUID[], -- References to skills table
    peer_feedback_score DECIMAL(3,2), -- Average from endorsements
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

-- Indexes
CREATE INDEX idx_project_members_project ON project_members(project_id) WHERE is_active;
CREATE INDEX idx_project_members_user ON project_members(user_id) WHERE is_active;

-- Project required skills
CREATE TABLE IF NOT EXISTS project_required_skills (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    importance TEXT CHECK(importance IN ('required', 'preferred', 'nice_to_have')) DEFAULT 'preferred',
    min_level TEXT CHECK(min_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    PRIMARY KEY (project_id, skill_id)
);

-- Tasks within projects
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id), -- For subtasks
    
    -- Task details
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK(type IN ('feature', 'bug', 'documentation', 'research', 'design', 'other')),
    
    -- Assignment and status
    assignee_id UUID REFERENCES users(id),
    status TEXT NOT NULL CHECK(status IN ('backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled')) DEFAULT 'todo',
    priority TEXT CHECK(priority IN ('urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
    
    -- Time tracking
    estimated_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    
    -- Dependencies
    blocked_by UUID[], -- Array of task IDs
    
    -- Metadata
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id) WHERE status NOT IN ('done', 'cancelled');
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status NOT IN ('done', 'cancelled');

-- =====================================================
-- SECTION 5: EVENTS AND ATTENDANCE
-- =====================================================

-- Events with rich features
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Event type and format
    type TEXT CHECK(type IN ('meeting', 'workshop', 'social', 'networking', 'competition', 'conference', 'other')),
    format TEXT NOT NULL CHECK(format IN ('in_person', 'virtual', 'hybrid')) DEFAULT 'in_person',
    
    -- Schedule
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    recurrence_rule TEXT, -- iCal RRULE format
    
    -- Location
    location_name TEXT,
    location_address TEXT,
    location_coordinates POINT, -- PostGIS point
    virtual_meeting_url TEXT,
    
    -- Capacity and registration
    max_attendees INT,
    registration_required BOOLEAN DEFAULT false,
    registration_deadline TIMESTAMPTZ,
    waitlist_enabled BOOLEAN DEFAULT false,
    
    -- Resources
    materials_url TEXT,
    recording_url TEXT,
    
    -- Status
    status TEXT CHECK(status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CHECK (end_time > start_time),
    UNIQUE(organization_id, slug)
);

-- Indexes
CREATE INDEX idx_events_org ON events(organization_id);
CREATE INDEX idx_events_time ON events(start_time, end_time);
CREATE INDEX idx_events_status ON events(status);

-- Event attendance with engagement tracking
CREATE TABLE IF NOT EXISTS event_attendees (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Registration
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    registration_status TEXT NOT NULL CHECK(registration_status IN ('confirmed', 'waitlist', 'cancelled')) DEFAULT 'confirmed',
    
    -- Attendance
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    attendance_duration INTERVAL GENERATED ALWAYS AS (checked_out_at - checked_in_at) STORED,
    
    -- Engagement
    participation_score INT CHECK(participation_score BETWEEN 0 AND 100),
    feedback_rating INT CHECK(feedback_rating BETWEEN 1 AND 5),
    feedback_comment TEXT,
    
    -- Metadata
    source TEXT CHECK(source IN ('direct', 'invitation', 'organization', 'friend')),
    notes TEXT,
    
    PRIMARY KEY (event_id, user_id)
);

-- Indexes
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX idx_event_attendees_checkin ON event_attendees(checked_in_at) WHERE checked_in_at IS NOT NULL;

-- =====================================================
-- SECTION 6: APPLICATIONS AND OPPORTUNITIES
-- =====================================================

-- Opportunities (projects seeking members)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Opportunity details
    title TEXT NOT NULL,
    description TEXT,
    role_description TEXT,
    time_commitment_hours_per_week INT,
    duration_weeks INT,
    is_paid BOOLEAN DEFAULT false,
    compensation_details TEXT,
    
    -- Requirements
    required_skills UUID[], -- Array of skill IDs
    preferred_skills UUID[],
    other_requirements TEXT[],
    
    -- Application settings
    application_deadline TIMESTAMPTZ,
    spots_available INT DEFAULT 1,
    spots_filled INT DEFAULT 0,
    
    -- Status
    status TEXT CHECK(status IN ('draft', 'open', 'closed', 'filled')) DEFAULT 'draft',
    
    -- Search and matching
    opportunity_embedding vector(1536),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_opportunities_project ON opportunities(project_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_deadline ON opportunities(application_deadline) WHERE status = 'open';
CREATE INDEX idx_opportunities_embedding ON opportunities USING ivfflat(opportunity_embedding vector_cosine_ops);

-- Applications with comprehensive tracking
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Application content
    cover_letter TEXT,
    answers JSONB DEFAULT '{}', -- Custom question responses
    resume_url TEXT,
    portfolio_urls TEXT[],
    
    -- Status tracking
    status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'under_review', 'interviewed', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'draft',
    
    -- Review process
    reviewer_id UUID REFERENCES users(id),
    review_score INT CHECK(review_score BETWEEN 0 AND 100),
    review_notes TEXT,
    
    -- Timeline
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,
    
    -- Match scoring
    skill_match_score DECIMAL(3,2), -- 0-1 score
    experience_match_score DECIMAL(3,2),
    overall_match_score DECIMAL(3,2),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(opportunity_id, user_id)
);

-- Indexes
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted ON applications(submitted_at DESC) WHERE status != 'draft';

-- =====================================================
-- SECTION 7: ENDORSEMENTS AND SOCIAL PROOF
-- =====================================================

-- Flexible endorsement system
CREATE TABLE IF NOT EXISTS endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endorser_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    
    -- What is being endorsed
    entity_type TEXT NOT NULL CHECK(entity_type IN ('skill', 'project_contribution', 'leadership', 'general')),
    entity_id UUID, -- ID of skill, project_member record, etc.
    
    -- Endorsement content
    title TEXT,
    comment TEXT,
    
    -- Credibility
    relationship TEXT CHECK(relationship IN ('teammate', 'supervisor', 'peer', 'mentor', 'instructor')),
    worked_together_months INT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    
    -- Privacy
    is_public BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CHECK(endorser_id != recipient_id)
);

-- Indexes
CREATE INDEX idx_endorsements_recipient ON endorsements(recipient_id);
CREATE INDEX idx_endorsements_endorser ON endorsements(endorser_id);
CREATE INDEX idx_endorsements_entity ON endorsements(entity_type, entity_id);

-- =====================================================
-- SECTION 8: ANALYTICS AND REPORTING TABLES
-- =====================================================

-- Daily user analytics (materialized for performance)
CREATE TABLE IF NOT EXISTS user_daily_stats (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Activity metrics
    login_count INT DEFAULT 0,
    page_views INT DEFAULT 0,
    actions_taken INT DEFAULT 0,
    time_spent_minutes INT DEFAULT 0,
    
    -- Engagement metrics
    projects_viewed INT DEFAULT 0,
    applications_submitted INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    events_attended INT DEFAULT 0,
    
    -- Social metrics
    endorsements_given INT DEFAULT 0,
    endorsements_received INT DEFAULT 0,
    connections_made INT DEFAULT 0,
    
    PRIMARY KEY (user_id, date)
);

-- Indexes
CREATE INDEX idx_user_daily_stats_date ON user_daily_stats(date DESC);

-- Organization analytics
CREATE TABLE IF NOT EXISTS organization_monthly_stats (
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    
    -- Membership
    total_members INT DEFAULT 0,
    new_members INT DEFAULT 0,
    departed_members INT DEFAULT 0,
    active_members INT DEFAULT 0,
    
    -- Activity
    projects_created INT DEFAULT 0,
    projects_completed INT DEFAULT 0,
    events_hosted INT DEFAULT 0,
    total_event_attendance INT DEFAULT 0,
    
    -- Engagement
    average_member_hours DECIMAL(6,2),
    participation_rate DECIMAL(3,2), -- 0-1
    
    -- Skills
    unique_skills_developed INT DEFAULT 0,
    total_skill_endorsements INT DEFAULT 0,
    
    PRIMARY KEY (organization_id, month)
);

-- =====================================================
-- SECTION 9: AUDIT AND COMPLIANCE
-- =====================================================

-- Audit log for compliance and debugging
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    -- Action details
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Partition by month for performance
-- CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- =====================================================
-- SECTION 10: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all relevant tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON %I 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at()', t, t);
    END LOOP;
END $$;

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_user_engagement_score(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    score DECIMAL := 0;
BEGIN
    -- Calculate based on various factors
    SELECT 
        LEAST(10, (
            (COUNT(DISTINCT pm.project_id) * 2) + -- Projects participated
            (COUNT(DISTINCT ea.event_id) * 0.5) + -- Events attended
            (COUNT(DISTINCT e.id) * 1) + -- Endorsements received
            (COALESCE(AVG(us.verification_count), 0) * 0.5) -- Skill verifications
        ))
    INTO score
    FROM users u
    LEFT JOIN project_members pm ON u.id = pm.user_id AND pm.is_active
    LEFT JOIN event_attendees ea ON u.id = ea.user_id AND ea.checked_in_at IS NOT NULL
    LEFT JOIN endorsements e ON u.id = e.recipient_id
    LEFT JOIN user_skills us ON u.id = us.user_id
    WHERE u.id = p_user_id
    GROUP BY u.id;
    
    RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to match users with opportunities
CREATE OR REPLACE FUNCTION match_user_to_opportunities(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE(
    opportunity_id UUID,
    match_score DECIMAL,
    skill_match DECIMAL,
    availability_match DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH user_data AS (
        SELECT 
            u.id,
            u.profile_embedding,
            ARRAY_AGG(us.skill_id) as user_skills,
            COUNT(pm.id) as active_projects
        FROM users u
        LEFT JOIN user_skills us ON u.id = us.user_id
        LEFT JOIN project_members pm ON u.id = pm.user_id AND pm.is_active
        WHERE u.id = p_user_id
        GROUP BY u.id, u.profile_embedding
    )
    SELECT 
        o.id as opportunity_id,
        (
            0.6 * COALESCE(
                ARRAY_LENGTH(
                    ARRAY_INTERSECT(ud.user_skills, o.required_skills), 1
                )::DECIMAL / NULLIF(ARRAY_LENGTH(o.required_skills, 1), 0),
                0
            ) +
            0.3 * (1 - (ud.active_projects::DECIMAL / 5)) + -- Availability score
            0.1 * COALESCE(
                1 - (o.opportunity_embedding <=> ud.profile_embedding),
                0.5
            )
        ) as match_score,
        COALESCE(
            ARRAY_LENGTH(
                ARRAY_INTERSECT(ud.user_skills, o.required_skills), 1
            )::DECIMAL / NULLIF(ARRAY_LENGTH(o.required_skills, 1), 0),
            0
        ) as skill_match,
        (1 - LEAST(ud.active_projects::DECIMAL / 5, 1)) as availability_match
    FROM opportunities o
    CROSS JOIN user_data ud
    WHERE o.status = 'open'
    AND o.application_deadline > NOW()
    AND NOT EXISTS (
        SELECT 1 FROM applications a 
        WHERE a.opportunity_id = o.id 
        AND a.user_id = p_user_id
    )
    ORDER BY match_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 11: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY users_view_own ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can view other users in same university (privacy settings permitting)
CREATE POLICY users_view_university ON users
    FOR SELECT USING (
        university_id IN (
            SELECT university_id FROM users WHERE id = auth.uid()
        )
        AND (preferences->>'profile_visibility' = 'public' OR id = auth.uid())
    );

-- Users can update their own profile
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Organization leaders can manage their organization
CREATE POLICY org_leaders_manage ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('president', 'vice_president', 'advisor')
            AND is_active
        )
    );

-- Project members can view their projects
CREATE POLICY project_members_view ON projects
    FOR SELECT USING (
        visibility = 'public' 
        OR id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Add more policies as needed...

-- =====================================================
-- SECTION 12: PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Create indexes for foreign keys (if not exists)
DO $$
BEGIN
    -- This script creates indexes on all foreign key columns
    -- that don't already have an index
    FOR r IN
        SELECT
            tc.table_name,
            kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = tc.table_name
            AND indexdef LIKE '%' || kcu.column_name || '%'
        )
    LOOP
        EXECUTE format('CREATE INDEX idx_%I_%I_fk ON %I(%I)',
            r.table_name, r.column_name, r.table_name, r.column_name);
    END LOOP;
END $$;

-- Analyze tables for query planner
ANALYZE;

-- =====================================================
-- SECTION 13: INITIAL DATA AND CONSTANTS
-- =====================================================

-- Insert default skill categories
INSERT INTO skill_categories (name, description, display_order) VALUES
    ('Programming Languages', 'Software development languages', 1),
    ('Frameworks & Libraries', 'Development frameworks and libraries', 2),
    ('Data & Analytics', 'Data science and analytics tools', 3),
    ('Design & Creative', 'Design tools and creative skills', 4),
    ('Business & Management', 'Business and leadership skills', 5),
    ('Communication', 'Written and verbal communication', 6),
    ('Research', 'Research and analysis skills', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert common skills
INSERT INTO skills (name, category_id, is_technical, difficulty_level) 
SELECT 
    skill_name,
    (SELECT id FROM skill_categories WHERE name = category_name),
    is_tech,
    diff_level
FROM (VALUES
    ('Python', 'Programming Languages', true, 3),
    ('JavaScript', 'Programming Languages', true, 3),
    ('React', 'Frameworks & Libraries', true, 4),
    ('SQL', 'Data & Analytics', true, 3),
    ('Project Management', 'Business & Management', false, 3),
    ('Public Speaking', 'Communication', false, 2),
    ('Data Analysis', 'Data & Analytics', true, 3),
    ('Graphic Design', 'Design & Creative', true, 3),
    ('Leadership', 'Business & Management', false, 4),
    ('Team Collaboration', 'Communication', false, 2)
) AS t(skill_name, category_name, is_tech, diff_level)
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;