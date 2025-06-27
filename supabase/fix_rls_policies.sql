-- Fix Row Level Security (RLS) policies for organization access

-- First, check if RLS is enabled on these tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('organizations', 'organization_members', 'profiles', 'organization_roles');

-- Enable RLS on required tables (if not already enabled)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh (be careful in production!)
DROP POLICY IF EXISTS "Users can view organizations they are members of" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view organization roles" ON organization_roles;

-- Create permissive policies for authenticated users

-- Organizations: Users can view organizations they belong to
CREATE POLICY "Users can view organizations they are members of" ON organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = organizations.id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization Members: Users can view all memberships for their organizations
CREATE POLICY "Users can view their organization memberships" ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM organization_members om2
      WHERE om2.organization_id = organization_members.organization_id
      AND om2.user_id = auth.uid()
    )
  );

-- Profiles: Users can view all profiles (for member directory)
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Organization Roles: Users can view roles for their organizations
CREATE POLICY "Users can view organization roles" ON organization_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_roles.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Also create policies for other tables we're using
ALTER TABLE internal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Internal Projects: View projects in your organizations
CREATE POLICY "Users can view internal projects" ON internal_projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = internal_projects.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Contributions: View contributions in your organizations
CREATE POLICY "Users can view contributions" ON contributions
  FOR SELECT
  TO authenticated
  USING (
    contributor_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM internal_projects ip
      JOIN organization_members om ON om.organization_id = ip.organization_id
      WHERE ip.id = contributions.project_id
      AND om.user_id = auth.uid()
    )
  );

-- Skills: Everyone can view skills
CREATE POLICY "Users can view skills" ON skills
  FOR SELECT
  TO authenticated
  USING (true);

-- Test the policies with our user
SELECT 'Testing policies for user 949a58ee-1e3e-4582-95c0-80bab692d14d' as test_message;

-- This should return the organization
SELECT * FROM organizations o
WHERE EXISTS (
  SELECT 1 FROM organization_members om
  WHERE om.organization_id = o.id
  AND om.user_id = '949a58ee-1e3e-4582-95c0-80bab692d14d'
);

-- Success message
SELECT 'RLS policies created successfully!' as message;