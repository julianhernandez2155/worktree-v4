-- Fix for missing RPC functions
-- Run this in Supabase SQL editor

-- Create the add_task_assignee function
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

-- Also create the remove_task_assignee function for completeness
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