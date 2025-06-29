-- Add subtasks support to contributions table
-- Subtasks are stored as JSONB for flexibility

-- Add subtasks column to contributions table
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;

-- Create an index on subtasks for better query performance
CREATE INDEX IF NOT EXISTS idx_contributions_subtasks ON contributions USING gin (subtasks);

-- Example subtask structure:
-- [
--   {
--     "id": "uuid",
--     "title": "Research competitor designs",
--     "completed": false,
--     "created_at": "2024-01-15T10:00:00Z",
--     "completed_at": null
--   },
--   {
--     "id": "uuid", 
--     "title": "Create initial mockups",
--     "completed": true,
--     "created_at": "2024-01-15T10:00:00Z",
--     "completed_at": "2024-01-16T14:30:00Z"
--   }
-- ]

-- Function to calculate subtask completion percentage
CREATE OR REPLACE FUNCTION calculate_subtask_progress(subtasks JSONB)
RETURNS INTEGER AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
BEGIN
  -- Count total subtasks
  SELECT COUNT(*) INTO total_count FROM jsonb_array_elements(subtasks);
  
  -- Count completed subtasks
  SELECT COUNT(*) INTO completed_count 
  FROM jsonb_array_elements(subtasks) AS subtask
  WHERE (subtask->>'completed')::boolean = true;
  
  -- Return percentage (0-100)
  IF total_count = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((completed_count::FLOAT / total_count) * 100);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add some example subtasks to existing tasks for testing
UPDATE contributions
SET subtasks = 
  CASE 
    WHEN RANDOM() < 0.3 THEN '[]'::jsonb
    WHEN RANDOM() < 0.6 THEN 
      jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid(),
          'title', 'Define requirements',
          'completed', true,
          'created_at', NOW() - INTERVAL '2 days',
          'completed_at', NOW() - INTERVAL '1 day'
        ),
        jsonb_build_object(
          'id', gen_random_uuid(),
          'title', 'Create initial design',
          'completed', false,
          'created_at', NOW() - INTERVAL '1 day',
          'completed_at', null
        )
      )
    ELSE
      jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid(),
          'title', 'Research phase',
          'completed', true,
          'created_at', NOW() - INTERVAL '3 days',
          'completed_at', NOW() - INTERVAL '2 days'
        ),
        jsonb_build_object(
          'id', gen_random_uuid(),
          'title', 'Implementation',
          'completed', true,
          'created_at', NOW() - INTERVAL '2 days',
          'completed_at', NOW() - INTERVAL '1 day'
        ),
        jsonb_build_object(
          'id', gen_random_uuid(),
          'title', 'Testing',
          'completed', false,
          'created_at', NOW() - INTERVAL '1 day',
          'completed_at', null
        )
      )
  END
WHERE subtasks IS NULL;