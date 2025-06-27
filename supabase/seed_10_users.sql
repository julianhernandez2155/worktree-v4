-- Seed Data for 10 Dashboard-Created Users
-- 
-- INSTRUCTIONS:
-- 1. You've already created testuser1@syr.edu through testuser10@syr.edu with password: LOL
-- 2. Copy each user's ID from Supabase Dashboard (Authentication > Users)
-- 3. Replace the placeholder IDs below with the actual IDs
-- 4. Run this SQL file

-- USER IDS FROM SUPABASE DASHBOARD
DO $$
DECLARE
  user1_id UUID := '747ab81a-b6b7-4f5c-85d5-097505f15ca4';   -- testuser1@syr.edu
  user2_id UUID := 'ac85e653-6a59-4d21-b988-6558ff569903';   -- testuser2@syr.edu
  user3_id UUID := 'f6f8f753-562f-4050-9581-c2a58e2b3be8';   -- testuser3@syr.edu
  user4_id UUID := '3a8a5959-c9fe-41ea-b15a-b04db20e6e74';   -- testuser4@syr.edu
  user5_id UUID := '5fd2645f-9a98-495b-a14d-028ab88cd391';   -- testuser5@syr.edu
  user6_id UUID := 'de5af467-fb77-4055-a4bb-54b4132f7b18';   -- testuser6@syr.edu
  user7_id UUID := '88e70cf1-6cc5-4c45-bdc9-3c95c8d05dcc';   -- testuser7@syr.edu
  user8_id UUID := '01c83cb4-26b1-4313-b897-b9d6a71cf196';   -- testuser8@syr.edu
  user9_id UUID := '166a27d0-82f0-4c68-bbe7-6b5c60fe1365';   -- testuser9@syr.edu
  user10_id UUID := 'fb71686d-a567-441d-9068-cc3b39b5ac72'; -- testuser10@syr.edu
BEGIN

-- Insert skills if they don't exist
INSERT INTO skills (name, category)
SELECT * FROM (VALUES
  ('Python', 'technical'),
  ('JavaScript', 'technical'),
  ('React', 'technical'),
  ('TypeScript', 'technical'),
  ('Node.js', 'technical'),
  ('Machine Learning', 'technical'),
  ('CAD Design', 'technical'),
  ('Arduino', 'technical'),
  ('Graphic Design', 'creative'),
  ('Social Media Marketing', 'creative'),
  ('Video Editing', 'creative'),
  ('UI/UX Design', 'creative'),
  ('Content Writing', 'creative'),
  ('Event Planning', 'leadership'),
  ('Public Speaking', 'interpersonal'),
  ('Leadership', 'leadership'),
  ('Project Management', 'leadership'),
  ('Budget Management', 'analytical'),
  ('Data Analysis', 'analytical'),
  ('Excel', 'analytical'),
  ('Teaching', 'interpersonal')
) AS v(name, category)
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE skills.name = v.name);

-- Create profiles for all 10 users
INSERT INTO profiles (id, full_name, email, year_of_study, major, skills, user_type, primary_role, onboarding_completed) VALUES
  -- Tech Club Leadership
  (user1_id, 'Sarah Chen', 'testuser1@syr.edu', 'Senior', 'Computer Science', 
   ARRAY['Python', 'JavaScript', 'React', 'Leadership', 'Project Management', 'Public Speaking'], 
   ARRAY['student', 'org_leader'], 'org_member', true),
  
  (user2_id, 'Mike Rodriguez', 'testuser2@syr.edu', 'Junior', 'Mechanical Engineering', 
   ARRAY['CAD Design', 'Python', 'Budget Management', 'Arduino'], 
   ARRAY['student', 'org_leader'], 'org_member', true),
  
  (user3_id, 'Emma Thompson', 'testuser3@syr.edu', 'Senior', 'Marketing', 
   ARRAY['Social Media Marketing', 'Graphic Design', 'Video Editing', 'Event Planning'], 
   ARRAY['student', 'org_leader'], 'org_member', true),
  
  -- Regular Members
  (user4_id, 'James Liu', 'testuser4@syr.edu', 'Junior', 'Computer Science', 
   ARRAY['Python', 'Machine Learning', 'Data Analysis', 'Teaching'], 
   ARRAY['student'], 'org_member', true),
  
  (user5_id, 'Aisha Patel', 'testuser5@syr.edu', 'Sophomore', 'Information Management', 
   ARRAY['Data Analysis', 'Excel', 'Python', 'Public Speaking'], 
   ARRAY['student'], 'org_member', true),
  
  (user6_id, 'Carlos Martinez', 'testuser6@syr.edu', 'Freshman', 'Computer Engineering', 
   ARRAY['JavaScript', 'React', 'Node.js'], 
   ARRAY['student'], 'org_member', true),
  
  (user7_id, 'Rachel Green', 'testuser7@syr.edu', 'Senior', 'Graphic Design', 
   ARRAY['UI/UX Design', 'Graphic Design', 'Video Editing', 'Content Writing'], 
   ARRAY['student'], 'org_member', true),
  
  (user8_id, 'David Park', 'testuser8@syr.edu', 'Junior', 'Business Administration', 
   ARRAY['Budget Management', 'Excel', 'Project Management', 'Leadership'], 
   ARRAY['student'], 'org_member', true),
  
  (user9_id, 'Sofia Nguyen', 'testuser9@syr.edu', 'Sophomore', 'Communications', 
   ARRAY['Content Writing', 'Social Media Marketing', 'Public Speaking'], 
   ARRAY['student'], 'org_member', true),
  
  (user10_id, 'Alex Kim', 'testuser10@syr.edu', 'Junior', 'Data Science', 
   ARRAY['Python', 'Machine Learning', 'Data Analysis', 'TypeScript'], 
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

-- Create one organization
INSERT INTO organizations (id, name, slug, description, category, member_count, admin_id, verified) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Syracuse Tech Club', 'syracuse-tech', 
   'Building innovative tech projects and learning together', 'Engineering', 40, user1_id, true)
ON CONFLICT (id) DO UPDATE SET
  admin_id = EXCLUDED.admin_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Add all 10 members to the organization with various roles
INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', user1_id, 'president', NOW() - INTERVAL '2 years'),
  ('c1111111-1111-1111-1111-111111111111', user2_id, 'treasurer', NOW() - INTERVAL '1 year'),
  ('c1111111-1111-1111-1111-111111111111', user3_id, 'marketing_lead', NOW() - INTERVAL '1.5 years'),
  ('c1111111-1111-1111-1111-111111111111', user4_id, 'tech_lead', NOW() - INTERVAL '1 year'),
  ('c1111111-1111-1111-1111-111111111111', user5_id, 'data_analyst', NOW() - INTERVAL '6 months'),
  ('c1111111-1111-1111-1111-111111111111', user6_id, 'member', NOW() - INTERVAL '3 months'),
  ('c1111111-1111-1111-1111-111111111111', user7_id, 'creative_director', NOW() - INTERVAL '8 months'),
  ('c1111111-1111-1111-1111-111111111111', user8_id, 'event_coordinator', NOW() - INTERVAL '4 months'),
  ('c1111111-1111-1111-1111-111111111111', user9_id, 'social_media_manager', NOW() - INTERVAL '6 months'),
  ('c1111111-1111-1111-1111-111111111111', user10_id, 'workshop_coordinator', NOW() - INTERVAL '1 year')
ON CONFLICT DO NOTHING;

-- Create organization roles (if table exists)
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_roles') THEN
  INSERT INTO organization_roles (id, organization_id, title, description, required_skills, current_holder_id, term_end_date) VALUES
    -- Leadership Roles
    ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 
     'President', 'Lead strategic direction and represent at university events', 
     ARRAY['Leadership', 'Public Speaking', 'Project Management'], user1_id, '2025-05-15'),
    
    ('e1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 
     'Vice President', 'Support president and lead special initiatives', 
     ARRAY['Leadership', 'Project Management', 'Public Speaking'], NULL, NULL), -- VACANT!
    
    ('e1111113-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111111', 
     'Treasurer', 'Manage $8,000 annual budget and sponsorships', 
     ARRAY['Budget Management', 'Excel', 'Financial Planning'], user2_id, '2026-05-15'),
    
    -- Technical Roles
    ('e1111114-1111-1111-1111-111111111114', 'c1111111-1111-1111-1111-111111111111', 
     'Tech Lead', 'Oversee all technical projects and architecture decisions', 
     ARRAY['Python', 'JavaScript', 'Project Management'], user4_id, '2026-05-15'),
    
    ('e1111115-1111-1111-1111-111111111115', 'c1111111-1111-1111-1111-111111111111', 
     'Workshop Coordinator', 'Plan and run weekly technical workshops', 
     ARRAY['Teaching', 'Event Planning', 'Python'], user10_id, '2026-05-15'),
    
    -- Creative Roles
    ('e1111116-1111-1111-1111-111111111116', 'c1111111-1111-1111-1111-111111111111', 
     'Marketing Lead', 'Manage brand and outreach strategy', 
     ARRAY['Social Media Marketing', 'Content Writing', 'Leadership'], user3_id, '2025-05-15'),
    
    ('e1111117-1111-1111-1111-111111111117', 'c1111111-1111-1111-1111-111111111111', 
     'Creative Director', 'Oversee all design work and visual identity', 
     ARRAY['Graphic Design', 'UI/UX Design', 'Video Editing'], user7_id, '2025-05-15'),
    
    ('e1111118-1111-1111-1111-111111111118', 'c1111111-1111-1111-1111-111111111111', 
     'Social Media Manager', 'Manage Instagram, Twitter, and LinkedIn presence', 
     ARRAY['Social Media Marketing', 'Content Writing', 'Graphic Design'], user9_id, '2026-05-15'),
    
    -- Operations Roles
    ('e1111119-1111-1111-1111-111111111119', 'c1111111-1111-1111-1111-111111111111', 
     'Event Coordinator', 'Plan and execute all club events', 
     ARRAY['Event Planning', 'Budget Management', 'Leadership'], user8_id, '2026-05-15'),
    
    ('e1111120-1111-1111-1111-111111111120', 'c1111111-1111-1111-1111-111111111111', 
     'Recruitment Chair', 'Lead member recruitment and onboarding', 
     ARRAY['Public Speaking', 'Event Planning', 'Leadership'], NULL, NULL) -- VACANT!
  ON CONFLICT (id) DO NOTHING;
END IF;

-- Create sample projects (if table exists)
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internal_projects') THEN
  INSERT INTO internal_projects (id, organization_id, name, description, timeline, status, created_by) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 
     'AI Study Buddy App', 'Build an AI-powered study assistant for students', 
     'this_semester', 'active', user1_id),
    
    ('d1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 
     'Club Website Redesign', 'Modernize website with Next.js and better UX', 
     'this_month', 'active', user4_id),
    
    ('d1111113-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111111', 
     'Spring Recruitment Video', 'Create promotional video for admitted students day', 
     'this_week', 'active', user3_id),
    
    ('d1111114-1111-1111-1111-111111111114', 'c1111111-1111-1111-1111-111111111111', 
     'Hackathon Platform', 'Build registration system for spring hackathon', 
     'this_month', 'active', user10_id)
  ON CONFLICT (id) DO NOTHING;
END IF;

-- Success message
RAISE NOTICE '';
RAISE NOTICE '============================================';
RAISE NOTICE 'Seed data loaded successfully!';
RAISE NOTICE '============================================';
RAISE NOTICE '';
RAISE NOTICE 'Syracuse Tech Club now has 10 members!';
RAISE NOTICE '';
RAISE NOTICE 'Test accounts (password: LOL):';
RAISE NOTICE '- testuser1@syr.edu (Sarah Chen - President)';
RAISE NOTICE '- testuser2@syr.edu (Mike Rodriguez - Treasurer)';
RAISE NOTICE '- testuser3@syr.edu (Emma Thompson - Marketing Lead)';
RAISE NOTICE '- testuser4@syr.edu (James Liu - Tech Lead)';
RAISE NOTICE '- And 6 more members...';
RAISE NOTICE '';
RAISE NOTICE 'Visit: http://localhost:3000/dashboard/org/syracuse-tech';
RAISE NOTICE '';
RAISE NOTICE 'Roles with upcoming transitions:';
RAISE NOTICE '- President (Sarah) - graduates May 2025';
RAISE NOTICE '- Marketing Lead (Emma) - graduates May 2025';
RAISE NOTICE '- Creative Director (Rachel) - graduates May 2025';
RAISE NOTICE '';
RAISE NOTICE 'Vacant roles to fill:';
RAISE NOTICE '- Vice President';
RAISE NOTICE '- Recruitment Chair';
RAISE NOTICE '';

END $$;