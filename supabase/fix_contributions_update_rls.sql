-- Fix RLS policies for contributions table UPDATE operations

-- First check existing policies
DROP POLICY IF EXISTS "Org members can update tasks" ON contributions;
DROP POLICY IF EXISTS "Assignees can update their tasks" ON contributions;
DROP POLICY IF EXISTS "Contributors can update their tasks" ON contributions;

-- Create a comprehensive UPDATE policy
CREATE POLICY "Users can update tasks they have access to" ON contributions
FOR UPDATE USING (
  -- User is a member of the organization that owns the project
  EXISTS (
    SELECT 1 FROM internal_projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = contributions.project_id
    AND om.user_id = auth.uid()
  )
  OR
  -- User is the assigned contributor (legacy single assignee)
  contributor_id = auth.uid()
  OR
  -- User is one of the assignees (new multi-assignee system)
  EXISTS (
    SELECT 1 FROM task_assignees ta
    WHERE ta.task_id = contributions.id
    AND ta.assignee_id = auth.uid()
  )
)
WITH CHECK (
  -- Same conditions for the new row
  EXISTS (
    SELECT 1 FROM internal_projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = contributions.project_id
    AND om.user_id = auth.uid()
  )
  OR
  contributor_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM task_assignees ta
    WHERE ta.task_id = contributions.id
    AND ta.assignee_id = auth.uid()
  )
);

-- Also ensure completed_at column exists
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