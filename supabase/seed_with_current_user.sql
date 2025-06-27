-- Seed Data using YOUR current auth user
-- First, get your user ID by running this query:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then replace this ID with your actual user ID:
DO $$
DECLARE
  current_user_id UUID := 'YOUR_USER_ID_HERE'; -- <-- REPLACE THIS!
BEGIN
  -- Insert skills
  INSERT INTO skills (name, category)
  SELECT * FROM (VALUES
    ('Python', 'technical'),
    ('Graphic Design', 'creative'),
    ('Social Media Marketing', 'creative'),
    ('Event Planning', 'leadership'),
    ('Public Speaking', 'interpersonal'),
    ('Data Analysis', 'analytical'),
    ('Video Editing', 'creative'),
    ('Budget Management', 'analytical'),
    ('JavaScript', 'technical'),
    ('Project Management', 'leadership'),
    ('CAD Design', 'technical'),
    ('Machine Learning', 'technical'),
    ('Excel', 'analytical'),
    ('Leadership', 'leadership'),
    ('UI/UX Design', 'creative')
  ) AS v(name, category)
  WHERE NOT EXISTS (SELECT 1 FROM skills WHERE skills.name = v.name);

  -- Update your profile
  UPDATE profiles 
  SET 
    full_name = 'Test User',
    year_of_study = 'Senior',
    major = 'Computer Science',
    skills = ARRAY['Python', 'Leadership', 'Project Management'],
    user_type = ARRAY['student', 'org_leader'],
    primary_role = 'org_member',
    onboarding_completed = true
  WHERE id = current_user_id;

  -- Create test organizations with YOU as the admin
  INSERT INTO organizations (id, name, slug, description, category, member_count, admin_id, verified) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Syracuse Robotics Club', 'syracuse-robotics', 'Building the future with robots and AI', 'Engineering', 24, current_user_id, true),
    ('c2222222-2222-2222-2222-222222222222', 'Data Science Society', 'data-science-soc', 'Exploring data, ML, and analytics together', 'Academic', 45, current_user_id, true)
  ON CONFLICT (id) DO NOTHING;

  -- Add yourself as president of both orgs
  INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
    ('c1111111-1111-1111-1111-111111111111', current_user_id, 'president', NOW() - INTERVAL '2 years'),
    ('c2222222-2222-2222-2222-222222222222', current_user_id, 'president', NOW() - INTERVAL '1 year')
  ON CONFLICT DO NOTHING;

  -- Add some roles
  INSERT INTO organization_roles (id, organization_id, title, description, required_skills, current_holder_id, term_end_date) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'President', 'Lead the organization', ARRAY['Leadership', 'Public Speaking'], current_user_id, '2025-05-15'),
    ('e1111113-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111111', 'Social Media Manager', 'Manage social media', ARRAY['Social Media Marketing'], NULL, NULL), -- Vacant!
    ('e1111114-1111-1111-1111-111111111114', 'c1111111-1111-1111-1111-111111111111', 'Treasurer', 'Manage finances', ARRAY['Budget Management', 'Excel'], NULL, NULL) -- Vacant!
  ON CONFLICT (id) DO NOTHING;

  -- Add projects
  INSERT INTO internal_projects (id, organization_id, name, description, timeline, status, created_by) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Battle Bot Competition', 'Build robot for spring competition', 'this_semester', 'active', current_user_id),
    ('d1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 'Recruitment Video', 'Create promotional video', 'this_month', 'active', current_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Add some unassigned tasks
  INSERT INTO contributions (project_id, contributor_id, task_name, task_description, skills_used, status, contribution_type) VALUES
    ('d1111111-1111-1111-1111-111111111111', NULL, 'Create team shirts', 'Design team shirts for competition', ARRAY['Graphic Design'], 'in_progress', 'internal'),
    ('d1111112-1111-1111-1111-111111111112', NULL, 'Film workshop footage', 'Record Tuesday night build session', ARRAY['Video Editing'], 'in_progress', 'internal'),
    ('d1111112-1111-1111-1111-111111111112', NULL, 'Edit final video', 'Create 2-minute promotional video', ARRAY['Video Editing'], 'in_progress', 'internal')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE 'Visit http://localhost:3000/dashboard/org/syracuse-robotics';
END $$;