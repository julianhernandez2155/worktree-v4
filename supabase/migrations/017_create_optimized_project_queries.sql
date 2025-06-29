-- Optimized RPC functions for complex queries
-- This migration creates database functions to replace N+1 queries

-- Function to get projects with all related data in a single query
CREATE OR REPLACE FUNCTION get_projects_with_skills_and_status(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_max_hours INT DEFAULT NULL,
  p_deadline_soon BOOLEAN DEFAULT FALSE,
  p_org_id UUID DEFAULT NULL
)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  public_description TEXT,
  organization_id UUID,
  organization_name TEXT,
  organization_slug TEXT,
  organization_logo TEXT,
  organization_verified BOOLEAN,
  required_commitment_hours INT,
  application_deadline TIMESTAMPTZ,
  application_count INT,
  is_saved BOOLEAN,
  has_applied BOOLEAN,
  application_status TEXT,
  required_skills TEXT[],
  preferred_skills TEXT[],
  matched_skills TEXT[],
  missing_skills TEXT[],
  match_score INT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_skills AS (
    SELECT ARRAY_AGG(DISTINCT s.name ORDER BY s.name) as skills
    FROM member_skills ms
    JOIN skills s ON s.id = ms.skill_id
    WHERE ms.user_id = p_user_id
  ),
  project_skills AS (
    SELECT 
      c.project_id,
      ARRAY_AGG(DISTINCT s.name ORDER BY s.name) FILTER (WHERE trs.importance = 'required') as required_skills,
      ARRAY_AGG(DISTINCT s.name ORDER BY s.name) FILTER (WHERE trs.importance = 'preferred') as preferred_skills
    FROM contributions c
    JOIN task_required_skills trs ON trs.task_id = c.id
    JOIN skills s ON s.id = trs.skill_id
    GROUP BY c.project_id
  )
  SELECT 
    p.id as project_id,
    p.name as project_name,
    p.public_description,
    p.organization_id,
    o.name as organization_name,
    o.slug as organization_slug,
    o.logo_url as organization_logo,
    o.verified as organization_verified,
    p.required_commitment_hours,
    p.application_deadline,
    p.application_count,
    CASE 
      WHEN p_user_id IS NULL THEN FALSE
      ELSE EXISTS(SELECT 1 FROM saved_projects sp WHERE sp.project_id = p.id AND sp.user_id = p_user_id)
    END as is_saved,
    CASE 
      WHEN p_user_id IS NULL THEN FALSE
      ELSE EXISTS(SELECT 1 FROM project_applications pa WHERE pa.project_id = p.id AND pa.applicant_id = p_user_id)
    END as has_applied,
    CASE 
      WHEN p_user_id IS NULL THEN NULL
      ELSE (SELECT status FROM project_applications pa WHERE pa.project_id = p.id AND pa.applicant_id = p_user_id LIMIT 1)
    END as application_status,
    COALESCE(ps.required_skills, ARRAY[]::TEXT[]) as required_skills,
    COALESCE(ps.preferred_skills, ARRAY[]::TEXT[]) as preferred_skills,
    CASE 
      WHEN p_user_id IS NULL THEN ARRAY[]::TEXT[]
      WHEN us.skills IS NOT NULL AND ps.required_skills IS NOT NULL 
      THEN ARRAY(SELECT unnest(ps.required_skills) INTERSECT SELECT unnest(us.skills))
      ELSE ARRAY[]::TEXT[]
    END as matched_skills,
    CASE 
      WHEN p_user_id IS NULL THEN COALESCE(ps.required_skills, ARRAY[]::TEXT[])
      WHEN us.skills IS NOT NULL AND ps.required_skills IS NOT NULL 
      THEN ARRAY(SELECT unnest(ps.required_skills) EXCEPT SELECT unnest(us.skills))
      ELSE COALESCE(ps.required_skills, ARRAY[]::TEXT[])
    END as missing_skills,
    CASE 
      WHEN p_user_id IS NULL THEN 0
      WHEN ps.required_skills IS NULL OR array_length(ps.required_skills, 1) IS NULL THEN 85
      WHEN us.skills IS NULL THEN 0
      ELSE LEAST(100, GREATEST(0, 
        COALESCE(
          (70 * array_length(ARRAY(SELECT unnest(ps.required_skills) INTERSECT SELECT unnest(us.skills)), 1)::FLOAT / NULLIF(array_length(ps.required_skills, 1), 0))::INT,
          0
        ) +
        COALESCE(
          (30 * array_length(ARRAY(SELECT unnest(COALESCE(ps.preferred_skills, ARRAY[]::TEXT[])) INTERSECT SELECT unnest(us.skills)), 1)::FLOAT / NULLIF(array_length(COALESCE(ps.preferred_skills, ARRAY[]::TEXT[]), 1), 0))::INT,
          0
        )
      ))::INT
    END as match_score,
    p.created_at
  FROM internal_projects p
  JOIN organizations o ON o.id = p.organization_id
  LEFT JOIN project_skills ps ON ps.project_id = p.id
  LEFT JOIN user_skills us ON true
  WHERE p.is_public = true 
    AND p.status = 'active'
    AND (p_search IS NULL OR p_search = '' OR 
         p.name ILIKE '%' || p_search || '%' OR 
         p.public_description ILIKE '%' || p_search || '%')
    AND (p_max_hours IS NULL OR p.required_commitment_hours <= p_max_hours)
    AND (NOT p_deadline_soon OR (p.application_deadline IS NOT NULL AND p.application_deadline <= NOW() + INTERVAL '7 days'))
    AND (p_org_id IS NULL OR p.organization_id = p_org_id)
  ORDER BY 
    CASE WHEN p_user_id IS NOT NULL THEN match_score ELSE 0 END DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to get organization members with their skills in one query
CREATE OR REPLACE FUNCTION get_organization_members_with_skills(
  p_org_id UUID,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  member_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  full_name TEXT,
  avatar_url TEXT,
  year_of_study TEXT,
  major TEXT,
  skills TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH member_skills_agg AS (
    SELECT 
      ms.user_id,
      ARRAY_AGG(DISTINCT s.name ORDER BY s.name) as skills
    FROM member_skills ms
    JOIN skills s ON s.id = ms.skill_id
    GROUP BY ms.user_id
  )
  SELECT 
    om.id as member_id,
    om.user_id,
    om.role,
    om.joined_at,
    p.full_name,
    p.avatar_url,
    p.year_of_study,
    p.major,
    COALESCE(msa.skills, ARRAY[]::TEXT[]) as skills
  FROM organization_members om
  JOIN profiles p ON p.id = om.user_id
  LEFT JOIN member_skills_agg msa ON msa.user_id = om.user_id
  WHERE om.organization_id = p_org_id
    AND (p_search IS NULL OR p_search = '' OR
         p.full_name ILIKE '%' || p_search || '%' OR
         p.major ILIKE '%' || p_search || '%')
  ORDER BY 
    CASE om.role 
      WHEN 'president' THEN 1
      WHEN 'vice_president' THEN 2
      WHEN 'treasurer' THEN 3
      WHEN 'secretary' THEN 4
      WHEN 'admin' THEN 5
      ELSE 6
    END,
    om.joined_at DESC;
END;
$$;

-- Function to get project tasks with assignees and skills
CREATE OR REPLACE FUNCTION get_project_tasks_with_details(
  p_project_id UUID
)
RETURNS TABLE (
  task_id UUID,
  task_name TEXT,
  task_description TEXT,
  status TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  assignees JSONB,
  required_skills TEXT[],
  preferred_skills TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH task_assignees_agg AS (
    SELECT 
      ta.task_id,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'user_id', p.id,
          'full_name', p.full_name,
          'avatar_url', p.avatar_url
        ) ORDER BY ta.assigned_at
      ) as assignees
    FROM task_assignees ta
    JOIN profiles p ON p.id = ta.assignee_id
    GROUP BY ta.task_id
  ),
  task_skills_agg AS (
    SELECT 
      trs.task_id,
      ARRAY_AGG(DISTINCT s.name ORDER BY s.name) FILTER (WHERE trs.importance = 'required') as required_skills,
      ARRAY_AGG(DISTINCT s.name ORDER BY s.name) FILTER (WHERE trs.importance = 'preferred') as preferred_skills
    FROM task_required_skills trs
    JOIN skills s ON s.id = trs.skill_id
    GROUP BY trs.task_id
  )
  SELECT 
    c.id as task_id,
    c.task_name,
    c.task_description,
    c.status,
    c.due_date,
    c.created_at,
    COALESCE(taa.assignees, '[]'::JSONB) as assignees,
    COALESCE(tsa.required_skills, ARRAY[]::TEXT[]) as required_skills,
    COALESCE(tsa.preferred_skills, ARRAY[]::TEXT[]) as preferred_skills
  FROM contributions c
  LEFT JOIN task_assignees_agg taa ON taa.task_id = c.id
  LEFT JOIN task_skills_agg tsa ON tsa.task_id = c.id
  WHERE c.project_id = p_project_id
  ORDER BY 
    CASE c.status 
      WHEN 'in_progress' THEN 1
      WHEN 'pending' THEN 2
      WHEN 'completed' THEN 3
      ELSE 4
    END,
    c.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_projects_with_skills_and_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_members_with_skills TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_tasks_with_details TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_projects_with_skills_and_status IS 'Optimized function to get projects with all related data including skills and user status in a single query';
COMMENT ON FUNCTION get_organization_members_with_skills IS 'Get organization members with their skills aggregated to avoid N+1 queries';
COMMENT ON FUNCTION get_project_tasks_with_details IS 'Get project tasks with assignees and required skills in a single query';