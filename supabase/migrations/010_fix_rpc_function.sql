-- Fix the get_recommended_projects function to handle cases where materialized view is empty

-- First, ensure the materialized view is populated
REFRESH MATERIALIZED VIEW CONCURRENTLY project_skill_matches;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_recommended_projects(UUID, INTEGER, INTEGER);

-- Create an improved version that handles empty materialized view
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
    -- Check if materialized view has data
    IF NOT EXISTS (SELECT 1 FROM project_skill_matches LIMIT 1) THEN
        -- If empty, return projects without skill matching
        RETURN QUERY
        SELECT 
            p.id,
            p.name,
            p.organization_id,
            o.name,
            o.logo_url,
            50.0 as match_score, -- Default score
            ARRAY[]::UUID[] as required_skills,
            ARRAY[]::UUID[] as preferred_skills,
            ARRAY[]::UUID[] as matched_skills,
            ARRAY[]::UUID[] as missing_skills,
            p.application_deadline,
            EXISTS(SELECT 1 FROM saved_projects WHERE user_id = p_user_id AND project_id = p.id),
            EXISTS(SELECT 1 FROM project_applications WHERE applicant_id = p_user_id AND project_id = p.id)
        FROM internal_projects p
        JOIN organizations o ON o.id = p.organization_id
        WHERE p.is_public = true 
        AND p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT p_limit
        OFFSET p_offset;
    ELSE
        -- Normal flow with skill matching
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
                    WHEN us.skills IS NULL THEN 0.0
                    ELSE (
                        (cardinality(us.skills & psm.required_skills)::FLOAT / 
                         GREATEST(cardinality(psm.required_skills), 1)::FLOAT * 70.0) +
                        (cardinality(us.skills & COALESCE(psm.preferred_skills, ARRAY[]::UUID[]))::FLOAT / 
                         GREATEST(cardinality(COALESCE(psm.preferred_skills, ARRAY[]::UUID[])), 1)::FLOAT * 30.0)
                    )
                END as score,
                CASE 
                    WHEN us.skills IS NULL THEN ARRAY[]::UUID[]
                    ELSE us.skills & COALESCE(psm.required_skills || psm.preferred_skills, ARRAY[]::UUID[])
                END as matched,
                CASE 
                    WHEN us.skills IS NULL THEN COALESCE(psm.required_skills, ARRAY[]::UUID[])
                    ELSE COALESCE(psm.required_skills, ARRAY[]::UUID[]) - COALESCE(us.skills, ARRAY[]::UUID[])
                END as missing
            FROM internal_projects p
            JOIN organizations o ON o.id = p.organization_id
            LEFT JOIN project_skill_matches psm ON psm.project_id = p.id
            LEFT JOIN user_skills us ON true
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
            COALESCE(sp.required_skills, ARRAY[]::UUID[]),
            COALESCE(sp.preferred_skills, ARRAY[]::UUID[]),
            COALESCE(sp.matched, ARRAY[]::UUID[]),
            COALESCE(sp.missing, ARRAY[]::UUID[]),
            sp.application_deadline,
            EXISTS(SELECT 1 FROM saved_projects WHERE user_id = p_user_id AND project_id = sp.id),
            EXISTS(SELECT 1 FROM project_applications WHERE applicant_id = p_user_id AND project_id = sp.id)
        FROM scored_projects sp
        ORDER BY sp.score DESC, sp.application_deadline ASC NULLS LAST
        LIMIT p_limit
        OFFSET p_offset;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;