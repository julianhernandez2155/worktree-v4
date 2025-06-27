-- Fix for the type error in add_task_assignee function
-- The error "operator does not exist: boolean > integer" is caused by incorrect variable type

-- Drop and recreate the function with the correct implementation
DROP FUNCTION IF EXISTS add_task_assignee(UUID, UUID, UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION add_task_assignee(
  p_task_id UUID,
  p_assignee_id UUID,
  p_assigned_by UUID,
  p_is_primary BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  v_row_count INTEGER;
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
  
  -- Get the number of affected rows
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  
  -- Return true if any rows were affected
  RETURN v_row_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Also fix the remove_task_assignee function
DROP FUNCTION IF EXISTS remove_task_assignee(UUID, UUID);

CREATE OR REPLACE FUNCTION remove_task_assignee(
  p_task_id UUID,
  p_assignee_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_row_count INTEGER;
  v_was_primary BOOLEAN;
BEGIN
  -- Check if this was the primary assignee
  SELECT is_primary INTO v_was_primary
  FROM task_assignees
  WHERE task_id = p_task_id AND assignee_id = p_assignee_id;
  
  -- Delete the assignee
  DELETE FROM task_assignees
  WHERE task_id = p_task_id AND assignee_id = p_assignee_id;
  
  -- Get the number of affected rows
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  
  -- If we removed the primary assignee, make the oldest remaining assignee primary
  IF v_row_count > 0 AND v_was_primary THEN
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
  
  -- Return true if any rows were deleted
  RETURN v_row_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Verify the functions were created correctly
SELECT 
  routine_name,
  routine_type,
  data_type,
  pg_get_functiondef(p.oid) as definition
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public' 
AND routine_name IN ('add_task_assignee', 'remove_task_assignee')
ORDER BY routine_name;