-- Fix the array intersection issue by using proper array operations

-- Drop the existing function
DROP FUNCTION IF EXISTS get_recommended_projects(UUID, INTEGER, INTEGER);

-- Create a function to calculate array intersection for UUIDs
CREATE OR REPLACE FUNCTION array_intersect_uuid(a uuid[], b uuid[])
RETURNS uuid[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT unnest(a)
        INTERSECT
        SELECT unnest(b)
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to calculate array difference for UUIDs
CREATE OR REPLACE FUNCTION array_diff_uuid(a uuid[], b uuid[])
RETURNS uuid[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT unnest(a)
        EXCEPT
        SELECT unnest(b)
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recreate the get_recommended_projects function with proper array operations
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
        SELECT COALESCE(array_agg(skill_id), ARRAY[]::UUID[]) as skills
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
            COALESCE(psm.required_skills, ARRAY[]::UUID[]) as req_skills,
            COALESCE(psm.preferred_skills, ARRAY[]::UUID[]) as pref_skills,
            us.skills as user_skill_array
        FROM internal_projects p
        JOIN organizations o ON o.id = p.organization_id
        LEFT JOIN project_skill_matches psm ON psm.project_id = p.id
        CROSS JOIN user_skills us
        WHERE p.is_public = true 
        AND p.status = 'active'
        AND (p.application_deadline IS NULL OR p.application_deadline > NOW())
    ),
    calculated_projects AS (
        SELECT 
            sp.*,
            array_intersect_uuid(sp.user_skill_array, sp.req_skills) as matched_req,
            array_intersect_uuid(sp.user_skill_array, sp.pref_skills) as matched_pref,
            array_diff_uuid(sp.req_skills, sp.user_skill_array) as missing_req,
            CASE 
                WHEN cardinality(sp.req_skills) = 0 THEN 100.0
                ELSE (
                    (cardinality(array_intersect_uuid(sp.user_skill_array, sp.req_skills))::FLOAT / 
                     cardinality(sp.req_skills)::FLOAT * 70.0) +
                    (CASE 
                        WHEN cardinality(sp.pref_skills) = 0 THEN 0
                        ELSE cardinality(array_intersect_uuid(sp.user_skill_array, sp.pref_skills))::FLOAT / 
                             cardinality(sp.pref_skills)::FLOAT * 30.0
                    END)
                )
            END as score
        FROM scored_projects sp
    )
    SELECT 
        cp.id AS project_id,
        cp.name AS project_name,
        cp.organization_id,
        cp.org_name AS organization_name,
        cp.logo_url AS organization_logo,
        cp.score AS match_score,
        cp.req_skills AS required_skills,
        cp.pref_skills AS preferred_skills,
        array_cat(cp.matched_req, cp.matched_pref) AS matched_skills,
        cp.missing_req AS missing_skills,
        cp.application_deadline,
        EXISTS(SELECT 1 FROM saved_projects sp WHERE sp.user_id = p_user_id AND sp.project_id = cp.id) AS is_saved,
        EXISTS(SELECT 1 FROM project_applications pa WHERE pa.applicant_id = p_user_id AND pa.project_id = cp.id) AS has_applied
    FROM calculated_projects cp
    ORDER BY cp.score DESC, cp.application_deadline ASC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_recommended_projects(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION array_intersect_uuid(uuid[], uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION array_diff_uuid(uuid[], uuid[]) TO authenticated;