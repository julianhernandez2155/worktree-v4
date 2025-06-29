-- Fix RLS policies for contributions table
-- The error about member_skills suggests there might be a trigger or cascading update

-- First, check if completed_at column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contributions' 
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE contributions ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- Drop all existing policies on contributions
DROP POLICY IF EXISTS "Anyone can view contributions" ON contributions;
DROP POLICY IF EXISTS "Org members can create contributions" ON contributions;
DROP POLICY IF EXISTS "Org members can update contributions" ON contributions;
DROP POLICY IF EXISTS "Org members can delete contributions" ON contributions;
DROP POLICY IF EXISTS "Users can update tasks they have access to" ON contributions;
DROP POLICY IF EXISTS "Org members can create tasks" ON contributions;

-- Create comprehensive policies

-- 1. View policy - anyone can view
CREATE POLICY "Anyone can view contributions" ON contributions
FOR SELECT USING (true);

-- 2. Insert policy - org members can create
CREATE POLICY "Org members can create contributions" ON contributions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM internal_projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = contributions.project_id
    AND om.user_id = auth.uid()
  )
);

-- 3. Update policy - org members and assignees can update
CREATE POLICY "Org members and assignees can update contributions" ON contributions
FOR UPDATE USING (
  -- User is a member of the organization
  EXISTS (
    SELECT 1 FROM internal_projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = contributions.project_id
    AND om.user_id = auth.uid()
  )
  OR
  -- User is the assigned contributor
  contributor_id = auth.uid()
  OR
  -- User is an assignee
  EXISTS (
    SELECT 1 FROM task_assignees ta
    WHERE ta.task_id = contributions.id
    AND ta.assignee_id = auth.uid()
  )
);

-- 4. Delete policy - org members can delete
CREATE POLICY "Org members can delete contributions" ON contributions
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM internal_projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = contributions.project_id
    AND om.user_id = auth.uid()
  )
);

-- Check if there are any triggers that might be causing the member_skills error
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'contributions';