-- Fix for current user profile
-- Run this with YOUR user ID from Supabase Auth

-- First, check if your user exists in profiles
SELECT id, email, full_name, onboarding_completed FROM profiles 
WHERE id = '0742e278-5afc-45e6-8c4a-90a15b6eedca';

-- If the above returns nothing or has missing fields, run this:
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
  '0742e278-5afc-45e6-8c4a-90a15b6eedca', -- Your user ID
  'Julian', -- Your name
  'your-email@example.com', -- Your email
  'Senior', 
  'Computer Science',
  ARRAY['JavaScript', 'React', 'TypeScript'],
  ARRAY['student', 'org_leader'],
  'org_member',
  true
)
ON CONFLICT (id) DO UPDATE SET
  onboarding_completed = COALESCE(profiles.onboarding_completed, EXCLUDED.onboarding_completed),
  user_type = COALESCE(profiles.user_type, EXCLUDED.user_type),
  primary_role = COALESCE(profiles.primary_role, EXCLUDED.primary_role),
  full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
  year_of_study = COALESCE(profiles.year_of_study, EXCLUDED.year_of_study),
  major = COALESCE(profiles.major, EXCLUDED.major),
  skills = COALESCE(profiles.skills, EXCLUDED.skills);

-- Also add yourself to one of the test organizations
INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', '0742e278-5afc-45e6-8c4a-90a15b6eedca', 'member', NOW())
ON CONFLICT DO NOTHING;

-- Check the result
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.onboarding_completed,
  o.name as organization_name,
  om.role
FROM profiles p
LEFT JOIN organization_members om ON p.id = om.user_id
LEFT JOIN organizations o ON om.organization_id = o.id
WHERE p.id = '0742e278-5afc-45e6-8c4a-90a15b6eedca';