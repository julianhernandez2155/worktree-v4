-- Fix RLS policies for task_required_skills table

-- First, check if RLS is enabled
ALTER TABLE task_required_skills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view task required skills" ON task_required_skills;
DROP POLICY IF EXISTS "Task creator can add required skills" ON task_required_skills;
DROP POLICY IF EXISTS "Task creator can update required skills" ON task_required_skills;
DROP POLICY IF EXISTS "Task creator can delete required skills" ON task_required_skills;

-- Create new policies

-- 1. Anyone can view task required skills
CREATE POLICY "Anyone can view task required skills" ON task_required_skills
FOR SELECT USING (true);

-- 2. Authenticated users can add required skills to tasks
CREATE POLICY "Authenticated users can add required skills" ON task_required_skills
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Users can update task required skills for tasks in their organizations
CREATE POLICY "Org members can update task required skills" ON task_required_skills
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM contributions c
    JOIN internal_projects p ON c.project_id = p.id
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE c.id = task_required_skills.task_id
    AND om.user_id = auth.uid()
  )
);

-- 4. Users can delete task required skills for tasks in their organizations
CREATE POLICY "Org members can delete task required skills" ON task_required_skills
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM contributions c
    JOIN internal_projects p ON c.project_id = p.id
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE c.id = task_required_skills.task_id
    AND om.user_id = auth.uid()
  )
);

-- Also check if the user has INSERT permission on contributions table
-- This might be the actual issue if the task creation itself is failing
DROP POLICY IF EXISTS "Org members can create tasks" ON contributions;

CREATE POLICY "Org members can create tasks" ON contributions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM internal_projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = contributions.project_id
    AND om.user_id = auth.uid()
  )
);