-- Seed Data for Dashboard-Created Users
-- 
-- INSTRUCTIONS:
-- 1. First create these users in Supabase Dashboard (Authentication > Users > Add user):
--    - testuser1@syr.edu (password: testpass123)
--    - testuser2@syr.edu (password: testpass123)
--    - testuser3@syr.edu (password: testpass123)
--    - testuser4@syr.edu (password: testpass123)
-- 
-- 2. Copy each user's ID after creation
-- 3. Replace the placeholder IDs below with the actual IDs
-- 4. Run this SQL file

-- REPLACE THESE WITH YOUR ACTUAL USER IDS FROM SUPABASE DASHBOARD
-- Example format: '12345678-1234-1234-1234-123456789012'
DO $$
DECLARE
  user1_id UUID := 'REPLACE_WITH_USER1_ID'; -- testuser1@syr.edu
  user2_id UUID := 'REPLACE_WITH_USER2_ID'; -- testuser2@syr.edu
  user3_id UUID := 'REPLACE_WITH_USER3_ID'; -- testuser3@syr.edu
  user4_id UUID := 'REPLACE_WITH_USER4_ID'; -- testuser4@syr.edu
BEGIN

-- Insert skills if they don't exist
INSERT INTO skills (name, category)
SELECT * FROM (VALUES
  ('Python', 'technical'),
  ('JavaScript', 'technical'),
  ('React', 'technical'),
  ('TypeScript', 'technical'),
  ('Graphic Design', 'creative'),
  ('Social Media Marketing', 'creative'),
  ('Video Editing', 'creative'),
  ('Event Planning', 'leadership'),
  ('Public Speaking', 'interpersonal'),
  ('Leadership', 'leadership'),
  ('Project Management', 'leadership'),
  ('Budget Management', 'analytical'),
  ('Data Analysis', 'analytical')
) AS v(name, category)
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE skills.name = v.name);

-- Create profiles for the users
INSERT INTO profiles (id, full_name, email, year_of_study, major, skills, user_type, primary_role, onboarding_completed) VALUES
  (user1_id, 'Alex Chen', 'testuser1@syr.edu', 'Senior', 'Computer Science', 
   ARRAY['Python', 'JavaScript', 'React', 'Leadership', 'Project Management'], 
   ARRAY['student', 'org_leader'], 'org_member', true),
  
  (user2_id, 'Jordan Smith', 'testuser2@syr.edu', 'Junior', 'Information Management', 
   ARRAY['Data Analysis', 'Python', 'Public Speaking'], 
   ARRAY['student'], 'org_member', true),
  
  (user3_id, 'Sam Johnson', 'testuser3@syr.edu', 'Sophomore', 'Marketing', 
   ARRAY['Social Media Marketing', 'Graphic Design', 'Video Editing'], 
   ARRAY['student'], 'org_member', true),
  
  (user4_id, 'Riley Davis', 'testuser4@syr.edu', 'Junior', 'Computer Engineering', 
   ARRAY['Python', 'JavaScript', 'TypeScript', 'Budget Management'], 
   ARRAY['student'], 'org_member', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  year_of_study = EXCLUDED.year_of_study,
  major = EXCLUDED.major,
  skills = EXCLUDED.skills,
  user_type = EXCLUDED.user_type,
  primary_role = EXCLUDED.primary_role,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- Create a test organization
INSERT INTO organizations (id, name, slug, description, category, member_count, admin_id, verified) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Syracuse Tech Club', 'syracuse-tech', 
   'Building cool tech projects together', 'Engineering', 15, user1_id, true)
ON CONFLICT (id) DO UPDATE SET
  admin_id = user1_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Add members to the organization
INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', user1_id, 'president', NOW() - INTERVAL '1 year'),
  ('c1111111-1111-1111-1111-111111111111', user2_id, 'treasurer', NOW() - INTERVAL '6 months'),
  ('c1111111-1111-1111-1111-111111111111', user3_id, 'social_media_manager', NOW() - INTERVAL '4 months'),
  ('c1111111-1111-1111-1111-111111111111', user4_id, 'member', NOW() - INTERVAL '3 months')
ON CONFLICT DO NOTHING;

-- Create organization roles (if table exists)
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_roles') THEN
  INSERT INTO organization_roles (id, organization_id, title, description, required_skills, current_holder_id, term_end_date) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 
     'President', 'Lead the organization and set strategic direction', 
     ARRAY['Leadership', 'Public Speaking', 'Project Management'], user1_id, '2025-05-15'),
    
    ('e1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 
     'Treasurer', 'Manage organization budget and finances', 
     ARRAY['Budget Management', 'Data Analysis'], user2_id, '2026-05-15'),
    
    ('e1111113-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111111', 
     'Social Media Manager', 'Manage online presence and engagement', 
     ARRAY['Social Media Marketing', 'Graphic Design', 'Video Editing'], user3_id, '2026-05-15'),
    
    ('e1111114-1111-1111-1111-111111111114', 'c1111111-1111-1111-1111-111111111111', 
     'Workshop Coordinator', 'Organize weekly tech workshops', 
     ARRAY['Event Planning', 'Public Speaking', 'JavaScript'], NULL, NULL) -- Vacant role!
  ON CONFLICT (id) DO NOTHING;
END IF;

-- Create a sample project (if table exists)
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internal_projects') THEN
  INSERT INTO internal_projects (id, organization_id, name, description, timeline, status, created_by) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 
     'Club Website Redesign', 'Modernize our club website with Next.js', 
     'this_semester', 'active', user1_id)
  ON CONFLICT (id) DO NOTHING;
END IF;

-- Success message
RAISE NOTICE '';
RAISE NOTICE '============================================';
RAISE NOTICE 'Seed data prepared!';
RAISE NOTICE '============================================';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Create users in Supabase Dashboard';
RAISE NOTICE '2. Replace the user IDs in this file';
RAISE NOTICE '3. Run this SQL file';
RAISE NOTICE '4. Login with any test user';
RAISE NOTICE '5. Visit /dashboard/org/syracuse-tech';
RAISE NOTICE '';

END $$;