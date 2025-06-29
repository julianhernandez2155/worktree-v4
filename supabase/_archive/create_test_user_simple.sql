-- Simple approach: Create a test user through Supabase Dashboard
-- 
-- OPTION 1: Use Supabase Dashboard (Recommended)
-- 1. Go to your Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Enter email: testuser@example.com
-- 4. Enter password: testpass123
-- 5. Click "Create user"
-- 6. Copy the user ID that's generated
-- 7. Run the SQL below with that user ID

-- OPTION 2: Create via SQL (if you have the auth schema access)
-- Note: This requires elevated permissions

-- After creating the user above, run this to set up their profile:
-- Replace 'YOUR_USER_ID_HERE' with the actual ID from step 6 above

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
  'YOUR_USER_ID_HERE', -- Replace with actual user ID
  'Test User',
  'testuser@example.com',
  'Junior',
  'Computer Science',
  ARRAY['Python', 'JavaScript', 'React'],
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

-- Add them to Syracuse Robotics Club as president
INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'YOUR_USER_ID_HERE', 'president', NOW())
ON CONFLICT DO NOTHING;

-- Update the organization admin to be this user
UPDATE organizations 
SET admin_id = 'YOUR_USER_ID_HERE'
WHERE id = 'c1111111-1111-1111-1111-111111111111';