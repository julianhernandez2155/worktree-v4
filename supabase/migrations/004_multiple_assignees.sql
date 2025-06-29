-- Add support for multiple assignees per task
-- This creates a junction table to support many-to-many relationships

-- Create task_assignees junction table
CREATE TABLE IF NOT EXISTS task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  is_primary BOOLEAN DEFAULT false, -- Track primary assignee for notifications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, assignee_id) -- Prevent duplicate assignments
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_assignee ON task_assignees(assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_primary ON task_assignees(task_id) WHERE is_primary = true;

-- Migrate existing single assignees to the new table
INSERT INTO task_assignees (task_id, assignee_id, is_primary)
SELECT 
  id as task_id,
  contributor_id as assignee_id,
  true as is_primary
FROM contributions
WHERE contributor_id IS NOT NULL
ON CONFLICT (task_id, assignee_id) DO NOTHING;

-- Create a view for easier querying of tasks with assignees
CREATE OR REPLACE VIEW tasks_with_assignees AS
SELECT 
  c.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'username', p.username,
        'avatar_url', p.avatar_url,
        'skills', p.skills,
        'is_primary', ta.is_primary,
        'assigned_at', ta.assigned_at
      ) ORDER BY ta.is_primary DESC, ta.assigned_at
    ) FILTER (WHERE ta.id IS NOT NULL), 
    '[]'::json
  ) as assignees,
  COUNT(ta.id) as assignee_count
FROM contributions c
LEFT JOIN task_assignees ta ON c.id = ta.task_id
LEFT JOIN profiles p ON ta.assignee_id = p.id
GROUP BY c.id;

-- Function to add an assignee to a task
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

-- Function to remove an assignee from a task
CREATE OR REPLACE FUNCTION remove_task_assignee(
  p_task_id UUID,
  p_assignee_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
  v_was_primary BOOLEAN;
BEGIN
  -- Check if this was the primary assignee
  SELECT is_primary INTO v_was_primary
  FROM task_assignees
  WHERE task_id = p_task_id AND assignee_id = p_assignee_id;
  
  -- Delete the assignee
  DELETE FROM task_assignees
  WHERE task_id = p_task_id AND assignee_id = p_assignee_id;
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  
  -- If we removed the primary assignee, make the oldest remaining assignee primary
  IF v_success AND v_was_primary THEN
    UPDATE task_assignees
    SET is_primary = true
    WHERE task_id = p_task_id
    AND assignee_id = (
      SELECT assignee_id 
      FROM task_assignees 
      WHERE task_id = p_task_id 
      ORDER BY assigned_at 
      LIMIT 1
    );
  END IF;
  
  RETURN v_success;
END;
$$ LANGUAGE plpgsql;

-- Update the my_tasks view to work with multiple assignees
CREATE OR REPLACE VIEW my_tasks AS
SELECT DISTINCT
  c.*,
  p.name as project_name,
  p.organization_id,
  o.name as organization_name,
  o.slug as organization_slug,
  CASE 
    WHEN c.due_date < CURRENT_DATE AND c.status != 'completed' THEN 'overdue'
    WHEN c.due_date = CURRENT_DATE AND c.status != 'completed' THEN 'due_today'
    WHEN c.due_date = CURRENT_DATE + INTERVAL '1 day' AND c.status != 'completed' THEN 'due_tomorrow'
    WHEN c.due_date <= CURRENT_DATE + INTERVAL '7 days' AND c.status != 'completed' THEN 'due_this_week'
    ELSE 'upcoming'
  END as urgency_status,
  ta.is_primary
FROM contributions c
JOIN internal_projects p ON c.project_id = p.id
JOIN organizations o ON p.organization_id = o.id
JOIN task_assignees ta ON c.id = ta.task_id;

-- Add some test multiple assignees
DO $$
DECLARE
  task_record RECORD;
  member_record RECORD;
  counter INTEGER := 0;
BEGIN
  -- For some existing tasks, add additional assignees
  FOR task_record IN 
    SELECT c.id as task_id, c.project_id, c.contributor_id
    FROM contributions c
    WHERE c.contributor_id IS NOT NULL
    LIMIT 5
  LOOP
    -- Get other members from the same organization
    FOR member_record IN
      SELECT DISTINCT om.user_id
      FROM organization_members om
      JOIN internal_projects ip ON om.organization_id = ip.organization_id
      WHERE ip.id = task_record.project_id
        AND om.user_id != task_record.contributor_id
      ORDER BY RANDOM()
      LIMIT 1 + FLOOR(RANDOM() * 2)::INT -- Add 1-2 additional assignees
    LOOP
      INSERT INTO task_assignees (task_id, assignee_id, is_primary)
      VALUES (task_record.task_id, member_record.user_id, false)
      ON CONFLICT DO NOTHING;
      
      counter := counter + 1;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Added % additional assignees to tasks', counter;
END $$;