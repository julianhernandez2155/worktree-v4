-- Simple migration to add multiple assignees support
-- Run this in Supabase SQL editor

-- 1. Create task_assignees table
CREATE TABLE IF NOT EXISTS task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, assignee_id)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_assignee ON task_assignees(assignee_id);

-- 3. Migrate existing single assignees
INSERT INTO task_assignees (task_id, assignee_id, is_primary)
SELECT 
  id as task_id,
  contributor_id as assignee_id,
  true as is_primary
FROM contributions
WHERE contributor_id IS NOT NULL
ON CONFLICT (task_id, assignee_id) DO NOTHING;

-- 4. Create the add_task_assignee function
CREATE OR REPLACE FUNCTION add_task_assignee(
  p_task_id UUID,
  p_assignee_id UUID,
  p_assigned_by UUID,
  p_is_primary BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  -- If setting as primary, unset other primary assignees
  IF p_is_primary THEN
    UPDATE task_assignees 
    SET is_primary = false 
    WHERE task_id = p_task_id AND is_primary = true;
  END IF;
  
  -- Insert the new assignee
  INSERT INTO task_assignees (task_id, assignee_id, assigned_by, is_primary)
  VALUES (p_task_id, p_assignee_id, p_assigned_by, p_is_primary)
  ON CONFLICT (task_id, assignee_id) 
  DO UPDATE SET 
    is_primary = EXCLUDED.is_primary,
    assigned_at = NOW();
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql;