-- Test 1: Get projects without user (public view)
SELECT * FROM get_projects_with_skills_and_status(
  p_limit := 5
) LIMIT 1;

-- Test 2: Get organization members
-- Replace with an actual org ID from your database
SELECT * FROM get_organization_members_with_skills(
  p_org_id := (SELECT id FROM organizations LIMIT 1)
) LIMIT 1;

-- Test 3: Get project tasks
-- Replace with an actual project ID
SELECT * FROM get_project_tasks_with_details(
  p_project_id := (SELECT id FROM internal_projects WHERE is_public = true LIMIT 1)
) LIMIT 1;
