-- First, let's check if the function exists
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname = 'get_projects_with_skills_and_status';

-- Test the function with minimal parameters
SELECT * FROM get_projects_with_skills_and_status(
  p_limit := 1
);
