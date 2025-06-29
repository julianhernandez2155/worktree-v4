-- Seed Data for Syracuse University Organizations
-- This creates realistic sample data for testing the Organization Hub

-- IMPORTANT: Before running this seed data, you need to:
-- 1. Create auth users for each profile ID below using Supabase Auth
-- 2. Or modify the IDs to match existing auth users in your system

-- Create skills table if it doesn't exist
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample Skills
-- Using upsert to handle existing skills
INSERT INTO skills (id, name, category) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Python', 'technical'),
  ('a2222222-2222-2222-2222-222222222222', 'Graphic Design', 'creative'),
  ('a3333333-3333-3333-3333-333333333333', 'Social Media Marketing', 'creative'),
  ('a4444444-4444-4444-4444-444444444444', 'Event Planning', 'leadership'),
  ('a5555555-5555-5555-5555-555555555555', 'Public Speaking', 'interpersonal'),
  ('a6666666-6666-6666-6666-666666666666', 'Data Analysis', 'analytical'),
  ('a7777777-7777-7777-7777-777777777777', 'Video Editing', 'creative'),
  ('a8888888-8888-8888-8888-888888888888', 'Budget Management', 'analytical'),
  ('a9999999-9999-9999-9999-999999999999', 'JavaScript', 'technical'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Project Management', 'leadership'),
  ('abbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CAD Design', 'technical'),
  ('accccccc-cccc-cccc-cccc-cccccccccccc', 'Machine Learning', 'technical'),
  ('addddddd-dddd-dddd-dddd-dddddddddddd', 'Excel', 'analytical'),
  ('aeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Leadership', 'leadership'),
  ('afffffff-ffff-ffff-ffff-ffffffffffff', 'UI/UX Design', 'creative')
ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category;

-- Sample Users (All Syracuse Students)
-- First, ensure these users exist in auth.users (you'll need to create them via Supabase Auth)
-- Then insert their profiles
INSERT INTO profiles (id, full_name, email, year_of_study, major, skills, user_type, primary_role, onboarding_completed) VALUES
  -- Robotics Club Members
  ('b1111111-1111-1111-1111-111111111111', 'Sarah Chen', 'schen@syr.edu', 'Senior', 'Computer Science', ARRAY['Python', 'Project Management', 'Public Speaking', 'Leadership'], ARRAY['student', 'org_leader'], 'org_member', true),
  ('b1111112-1111-1111-1111-111111111112', 'Mike Rodriguez', 'mrodrig@syr.edu', 'Junior', 'Mechanical Engineering', ARRAY['CAD Design', 'Python', 'Budget Management'], ARRAY['student'], 'org_member', true),
  ('b1111113-1111-1111-1111-111111111113', 'Emma Thompson', 'ethomps@syr.edu', 'Sophomore', 'Electrical Engineering', ARRAY['Circuit Design', 'Arduino', 'Data Analysis'], ARRAY['student'], 'org_member', true),
  ('b1111114-1111-1111-1111-111111111114', 'James Liu', 'jliu03@syr.edu', 'Junior', 'Computer Science', ARRAY['Python', 'Machine Learning', 'Video Editing'], ARRAY['student'], 'org_member', true),
  ('b1111115-1111-1111-1111-111111111115', 'Aisha Patel', 'apatel@syr.edu', 'Freshman', 'Computer Engineering', ARRAY['Python', 'Public Speaking'], ARRAY['student'], 'org_member', true),
  
  -- Data Science Society Members
  ('b2222222-2222-2222-2222-222222222222', 'Priya Singh', 'psingh@syr.edu', 'Senior', 'Information Management', ARRAY['Python', 'Data Analysis', 'Machine Learning', 'Leadership'], ARRAY['student', 'org_leader'], 'org_member', true),
  ('b2222223-2222-2222-2222-222222222223', 'Alex Kim', 'akim05@syr.edu', 'Junior', 'Applied Statistics', ARRAY['R', 'Data Analysis', 'Public Speaking'], ARRAY['student'], 'org_member', true),
  ('b2222224-2222-2222-2222-222222222224', 'Marcus Johnson', 'mjohn12@syr.edu', 'Sophomore', 'Computer Science', ARRAY['Python', 'SQL', 'Data Visualization'], ARRAY['student'], 'org_member', true),
  
  -- Orange Marketing Members
  ('b3333333-3333-3333-3333-333333333333', 'Olivia Brown', 'obrown@syr.edu', 'Senior', 'Marketing', ARRAY['Social Media Marketing', 'Graphic Design', 'Event Planning', 'Leadership'], ARRAY['student', 'org_leader'], 'org_member', true),
  ('b3333334-3333-3333-3333-333333333334', 'Noah Davis', 'ndavis@syr.edu', 'Sophomore', 'Communication Design', ARRAY['Graphic Design', 'Video Editing', 'UI/UX Design'], ARRAY['student'], 'org_member', true),
  ('b3333335-3333-3333-3333-333333333335', 'Sophia Martinez', 'smarti08@syr.edu', 'Junior', 'Public Relations', ARRAY['Social Media Marketing', 'Content Writing', 'Event Planning'], ARRAY['student'], 'org_member', true),
  
  -- Student Association
  ('b4444444-4444-4444-4444-444444444444', 'David Park', 'dpark@syr.edu', 'Junior', 'Political Science', ARRAY['Public Speaking', 'Leadership', 'Event Planning', 'Budget Management'], ARRAY['student', 'org_leader'], 'org_member', true),
  ('b4444445-4444-4444-4444-444444444445', 'Rachel Green', 'rgreen@syr.edu', 'Senior', 'Policy Studies', ARRAY['Excel', 'Budget Management', 'Project Management'], ARRAY['student'], 'org_member', true)
ON CONFLICT (id) DO NOTHING;

-- Sample Organizations (All Syracuse)
INSERT INTO organizations (id, name, slug, description, category, member_count, admin_id, verified) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Syracuse Robotics Club', 'syracuse-robotics', 'Building the future with robots and AI', 'Engineering', 24, 'b1111111-1111-1111-1111-111111111111', true),
  ('c2222222-2222-2222-2222-222222222222', 'Data Science Society', 'data-science-soc', 'Exploring data, ML, and analytics together', 'Academic', 45, 'b2222222-2222-2222-2222-222222222222', true),
  ('c3333333-3333-3333-3333-333333333333', 'Orange Marketing Collective', 'orange-marketing', 'Creative campaigns for the Syracuse community', 'Business', 32, 'b3333333-3333-3333-3333-333333333333', true),
  ('c4444444-4444-4444-4444-444444444444', 'Student Association', 'student-association', 'Your voice in university governance', 'Leadership', 18, 'b4444444-4444-4444-4444-444444444444', true)
ON CONFLICT (id) DO NOTHING;

-- Organization Memberships
INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
  -- Robotics Club
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'president', NOW() - INTERVAL '2 years'),
  ('c1111111-1111-1111-1111-111111111111', 'b1111112-1111-1111-1111-111111111112', 'treasurer', NOW() - INTERVAL '1 year'),
  ('c1111111-1111-1111-1111-111111111111', 'b1111113-1111-1111-1111-111111111113', 'member', NOW() - INTERVAL '6 months'),
  ('c1111111-1111-1111-1111-111111111111', 'b1111114-1111-1111-1111-111111111114', 'tech_lead', NOW() - INTERVAL '1 year'),
  ('c1111111-1111-1111-1111-111111111111', 'b1111115-1111-1111-1111-111111111115', 'member', NOW() - INTERVAL '3 months'),
  
  -- Data Science Society
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'president', NOW() - INTERVAL '1 year'),
  ('c2222222-2222-2222-2222-222222222222', 'b2222223-2222-2222-2222-222222222223', 'workshop_coordinator', NOW() - INTERVAL '8 months'),
  ('c2222222-2222-2222-2222-222222222222', 'b2222224-2222-2222-2222-222222222224', 'member', NOW() - INTERVAL '1 year'),
  ('c2222222-2222-2222-2222-222222222222', 'b1111114-1111-1111-1111-111111111114', 'member', NOW() - INTERVAL '6 months'), -- James is in both!
  
  -- Orange Marketing
  ('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'president', NOW() - INTERVAL '1.5 years'),
  ('c3333333-3333-3333-3333-333333333333', 'b3333334-3333-3333-3333-333333333334', 'creative_director', NOW() - INTERVAL '4 months'),
  ('c3333333-3333-3333-3333-333333333333', 'b3333335-3333-3333-3333-333333333335', 'social_media_manager', NOW() - INTERVAL '1 year'),
  
  -- Student Association
  ('c4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'president', NOW() - INTERVAL '1 year'),
  ('c4444444-4444-4444-4444-444444444444', 'b4444445-4444-4444-4444-444444444445', 'treasurer', NOW() - INTERVAL '6 months')
ON CONFLICT DO NOTHING;

-- Organization Skill Needs
INSERT INTO organization_skill_needs (organization_id, skill_id, need_type, frequency, current_gap_level) VALUES
  -- Robotics Club needs
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'project_based', 'per_semester', 4), -- Needs Graphic Design
  ('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'recurring', 'weekly', 3), -- Needs Social Media
  ('c1111111-1111-1111-1111-111111111111', 'a7777777-7777-7777-7777-777777777777', 'urgent', 'monthly', 5), -- Needs Video Editing
  
  -- Data Science needs
  ('c2222222-2222-2222-2222-222222222222', 'a7777777-7777-7777-7777-777777777777', 'project_based', 'monthly', 5), -- Needs Video Editing
  ('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'recurring', 'weekly', 3), -- Needs Graphic Design
  
  -- Orange Marketing needs
  ('c3333333-3333-3333-3333-333333333333', 'a6666666-6666-6666-6666-666666666666', 'project_based', 'monthly', 4), -- Needs Data Analysis
  ('c3333333-3333-3333-3333-333333333333', 'a9999999-9999-9999-9999-999999999999', 'urgent', 'weekly', 5) -- Needs JavaScript
ON CONFLICT DO NOTHING;

-- Internal Projects
INSERT INTO internal_projects (id, organization_id, name, description, timeline, status, created_by) VALUES
  -- Robotics Projects
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Battle Bot Competition', 'Build robot for spring competition at RIT', 'this_semester', 'active', 'b1111111-1111-1111-1111-111111111111'),
  ('d1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 'Recruitment Video', 'Create promotional video for admitted students day', 'this_month', 'active', 'b1111111-1111-1111-1111-111111111111'),
  
  -- Data Science Projects
  ('d2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Dining Hall Analysis', 'Analyze and predict dining hall wait times', 'this_month', 'active', 'b2222222-2222-2222-2222-222222222222'),
  
  -- Marketing Projects
  ('d3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Block Party Campaign', 'Full marketing campaign for spring block party', 'this_week', 'active', 'b3333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Contributions (Tasks) - Mix of assigned and unassigned
INSERT INTO contributions (project_id, contributor_id, task_name, task_description, skills_used, status, contribution_type) VALUES
  -- Battle Bot Competition Tasks
  ('d1111111-1111-1111-1111-111111111111', 'b1111112-1111-1111-1111-111111111112', 'Design chassis', 'CAD design for lightweight chassis', ARRAY['CAD Design'], 'in_progress', 'internal'),
  ('d1111111-1111-1111-1111-111111111111', 'b1111114-1111-1111-1111-111111111114', 'Program autonomous mode', 'Python code for autonomous navigation', ARRAY['Python', 'Machine Learning'], 'completed', 'internal'),
  ('d1111111-1111-1111-1111-111111111111', NULL, 'Create team shirts', 'Design team shirts for competition', ARRAY['Graphic Design'], 'in_progress', 'internal'), -- Unassigned!
  
  -- Recruitment Video Tasks
  ('d1111112-1111-1111-1111-111111111112', NULL, 'Film workshop footage', 'Record Tuesday night build session', ARRAY['Video Editing'], 'in_progress', 'internal'), -- Unassigned!
  ('d1111112-1111-1111-1111-111111111112', NULL, 'Edit final video', 'Create 2-minute promotional video', ARRAY['Video Editing'], 'in_progress', 'internal'), -- Unassigned!
  
  -- Dining Hall Analysis
  ('d2222222-2222-2222-2222-222222222222', 'b2222224-2222-2222-2222-222222222224', 'Collect swipe data', 'Get anonymized dining hall entry data', ARRAY['Data Analysis'], 'completed', 'internal'),
  ('d2222222-2222-2222-2222-222222222222', NULL, 'Create visualization dashboard', 'Interactive dashboard for results', ARRAY['JavaScript', 'Data Visualization'], 'in_progress', 'internal'), -- Unassigned!
  
  -- Block Party Campaign
  ('d3333333-3333-3333-3333-333333333333', 'b3333334-3333-3333-3333-333333333334', 'Design event poster', 'Create eye-catching poster design', ARRAY['Graphic Design'], 'completed', 'internal'),
  ('d3333333-3333-3333-3333-333333333333', 'b3333335-3333-3333-3333-333333333335', 'Social media calendar', 'Plan 2-week social campaign', ARRAY['Social Media Marketing'], 'in_progress', 'internal')
ON CONFLICT DO NOTHING;

-- Organization Roles (for succession planning)
INSERT INTO organization_roles (id, organization_id, title, description, required_skills, current_holder_id, term_end_date) VALUES
  -- Robotics Club Roles
  ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'President', 'Lead the organization and represent at university events', ARRAY['Leadership', 'Public Speaking', 'Project Management'], 'b1111111-1111-1111-1111-111111111111', '2025-05-15'), -- Sarah graduates!
  ('e1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 'Treasurer', 'Manage $5,000 annual budget and sponsorships', ARRAY['Budget Management', 'Excel', 'Financial Planning'], 'b1111112-1111-1111-1111-111111111112', '2026-05-15'),
  ('e1111113-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111111', 'Social Media Manager', 'Manage Instagram, Twitter, and YouTube', ARRAY['Social Media Marketing', 'Graphic Design', 'Video Editing'], NULL, NULL), -- Vacant!
  ('e1111114-1111-1111-1111-111111111114', 'c1111111-1111-1111-1111-111111111111', 'Workshop Coordinator', 'Organize weekly build sessions and trainings', ARRAY['Event Planning', 'Teaching', 'Technical Skills'], NULL, NULL), -- Vacant!
  
  -- Data Science Society Roles  
  ('e2222221-2222-2222-2222-222222222221', 'c2222222-2222-2222-2222-222222222222', 'President', 'Lead strategic direction and partnerships', ARRAY['Leadership', 'Data Analysis', 'Public Speaking'], 'b2222222-2222-2222-2222-222222222222', '2025-05-15'), -- Priya graduates!
  ('e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Workshop Coordinator', 'Plan and run bi-weekly workshops', ARRAY['Teaching', 'Python', 'Public Speaking'], 'b2222223-2222-2222-2222-222222222223', '2026-05-15'),
  
  -- Orange Marketing Roles
  ('e3333331-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', 'President', 'Lead creative vision and client relations', ARRAY['Leadership', 'Marketing', 'Event Planning'], 'b3333333-3333-3333-3333-333333333333', '2025-05-15'), -- Olivia graduates!
  ('e3333332-3333-3333-3333-333333333332', 'c3333333-3333-3333-3333-333333333333', 'Creative Director', 'Oversee all design work', ARRAY['Graphic Design', 'UI/UX Design', 'Leadership'], 'b3333334-3333-3333-3333-333333333334', '2027-05-15'),
  
  -- Student Association Roles
  ('e4444441-4444-4444-4444-444444444441', 'c4444444-4444-4444-4444-444444444444', 'President', 'Represent student body to administration', ARRAY['Leadership', 'Public Speaking', 'Negotiation'], 'b4444444-4444-4444-4444-444444444444', '2026-05-15'),
  ('e4444442-4444-4444-4444-444444444442', 'c4444444-4444-4444-4444-444444444444', 'Treasurer', 'Manage $50,000 student activity budget', ARRAY['Excel', 'Budget Management', 'Financial Planning'], 'b4444445-4444-4444-4444-444444444445', '2025-05-15') -- Rachel graduates!
ON CONFLICT (id) DO NOTHING;