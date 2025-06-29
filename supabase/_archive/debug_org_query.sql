-- Debug the organization query issue

-- 1. First, let's check if the user exists in organization_members
SELECT 
  om.*,
  o.name as org_name
FROM organization_members om
LEFT JOIN organizations o ON om.organization_id = o.id
WHERE om.user_id = '949a58ee-1e3e-4582-95c0-80bab692d14d';

-- 2. Check if RLS is actually enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'organization_members');

-- 3. Check what policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'organization_members');

-- 4. Try a simpler approach - disable RLS temporarily for testing
-- WARNING: Only do this for debugging!
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE contributions DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;

-- 5. Test if the basic query works without RLS
SELECT 
  om.role,
  json_build_object(
    'id', o.id,
    'name', o.name,
    'slug', o.slug,
    'logo_url', o.logo_url
  ) as organization
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
WHERE om.user_id = '949a58ee-1e3e-4582-95c0-80bab692d14d';

-- This should now work. If it does, we know it's an RLS issue.
SELECT 'RLS disabled for debugging. Try logging in now!' as message;