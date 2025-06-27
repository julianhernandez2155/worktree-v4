-- Option 1: Reset password via Supabase Dashboard (RECOMMENDED)
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find "Sarah Chen" (schen@syr.edu) 
-- 3. Click the three dots menu > "Send password recovery"
-- 4. Or click "Reset password" and set it to: testpass123

-- Option 2: Use your existing account
-- Since you already have an account (0742e278-5afc-45e6-8c4a-90a15b6eedca),
-- let's add you to the test organizations:

-- First check if you have a profile
SELECT id, full_name, email, onboarding_completed 
FROM profiles 
WHERE id = '0742e278-5afc-45e6-8c4a-90a15b6eedca';

-- Create/update your profile
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
  '0742e278-5afc-45e6-8c4a-90a15b6eedca',
  'Julian',
  'your-email@example.com', -- Update this
  'Senior',
  'Computer Science',
  ARRAY['JavaScript', 'React', 'TypeScript', 'Python'],
  ARRAY['student', 'org_leader'],
  'org_member',
  true
)
ON CONFLICT (id) DO UPDATE SET
  onboarding_completed = true,
  user_type = COALESCE(profiles.user_type, EXCLUDED.user_type),
  primary_role = COALESCE(profiles.primary_role, EXCLUDED.primary_role);

-- Add you to Syracuse Robotics Club as a member
INSERT INTO organization_members (organization_id, user_id, role, joined_at) 
VALUES ('c1111111-1111-1111-1111-111111111111', '0742e278-5afc-45e6-8c4a-90a15b6eedca', 'member', NOW())
ON CONFLICT DO NOTHING;

-- Verify your setup
SELECT 
  p.full_name,
  p.email,
  p.onboarding_completed,
  o.name as organization,
  om.role
FROM profiles p
JOIN organization_members om ON p.id = om.user_id
JOIN organizations o ON om.organization_id = o.id
WHERE p.id = '0742e278-5afc-45e6-8c4a-90a15b6eedca';

-- Option 3: Check which test users have profiles set up correctly
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.onboarding_completed,
  COUNT(om.organization_id) as org_count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN organization_members om ON u.id = om.user_id
WHERE u.email IN ('schen@syr.edu', 'psingh@syr.edu', 'obrown@syr.edu', 'dpark@syr.edu')
GROUP BY u.id, u.email, p.full_name, p.onboarding_completed;