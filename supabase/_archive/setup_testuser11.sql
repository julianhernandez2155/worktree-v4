-- Setup testuser11@syr.edu with full access to Syracuse Tech Club

-- Create profile for the new user
INSERT INTO profiles (
  id, 
  full_name, 
  email, 
  year_of_study, 
  major, 
  skills, 
  user_type, 
  primary_role, 
  onboarding_completed
) VALUES (
  '949a58ee-1e3e-4582-95c0-80bab692d14d',
  'Alex Johnson',
  'testuser11@syr.edu',
  'Senior',
  'Computer Science',
  ARRAY['Python', 'JavaScript', 'React', 'TypeScript', 'Leadership', 'Project Management', 'Public Speaking'],
  ARRAY['student', 'org_leader'],
  'org_member',
  true
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  year_of_study = EXCLUDED.year_of_study,
  major = EXCLUDED.major,
  skills = EXCLUDED.skills,
  user_type = EXCLUDED.user_type,
  primary_role = EXCLUDED.primary_role,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- Add as president of Syracuse Tech Club (highest privileges)
INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', '949a58ee-1e3e-4582-95c0-80bab692d14d', 'president', NOW() - INTERVAL '2 years')
ON CONFLICT DO NOTHING;

-- Make them a co-admin of the organization (optional - gives admin access)
-- UPDATE organizations 
-- SET admin_id = '949a58ee-1e3e-4582-95c0-80bab692d14d'
-- WHERE id = 'c1111111-1111-1111-1111-111111111111';

-- Assign them to a vacant leadership role (Vice President)
UPDATE organization_roles
SET current_holder_id = '949a58ee-1e3e-4582-95c0-80bab692d14d',
    term_end_date = '2025-05-15'
WHERE organization_id = 'c1111111-1111-1111-1111-111111111111' 
  AND title = 'Vice President';

-- Create a project owned by this user
INSERT INTO internal_projects (id, organization_id, name, description, timeline, status, created_by) VALUES
  ('d1111115-1111-1111-1111-111111111115', 
   'c1111111-1111-1111-1111-111111111111', 
   'Member Portal Redesign', 
   'Redesign the member portal with better UX and mobile support', 
   'this_month', 
   'active', 
   '949a58ee-1e3e-4582-95c0-80bab692d14d')
ON CONFLICT (id) DO NOTHING;

-- Add a contribution/task for this user
INSERT INTO contributions (project_id, contributor_id, task_name, task_description, skills_used, status, contribution_type) VALUES
  ('d1111111-1111-1111-1111-111111111111', 
   '949a58ee-1e3e-4582-95c0-80bab692d14d', 
   'Architecture Planning', 
   'Design the system architecture for AI Study Buddy', 
   ARRAY['TypeScript', 'React', 'Project Management'], 
   'in_progress', 
   'internal')
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 
  p.full_name,
  p.email,
  o.name as organization,
  om.role as member_role,
  COALESCE(r.title, 'No formal role') as leadership_role
FROM profiles p
JOIN organization_members om ON p.id = om.user_id
JOIN organizations o ON om.organization_id = o.id
LEFT JOIN organization_roles r ON r.current_holder_id = p.id AND r.organization_id = o.id
WHERE p.id = '949a58ee-1e3e-4582-95c0-80bab692d14d';

-- Success message
SELECT 'User setup complete! You can now login and visit /dashboard/org/syracuse-tech' as message;