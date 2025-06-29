-- Fix malformed meeting_schedule data
-- This script will convert any double-stringified meeting_schedule data back to proper JSONB

-- First, let's check what data we have
SELECT id, name, 
       meeting_schedule,
       pg_typeof(meeting_schedule) as data_type
FROM organizations
WHERE meeting_schedule IS NOT NULL
LIMIT 5;

-- Fix double-stringified data
UPDATE organizations
SET meeting_schedule = 
  CASE 
    -- If it's a string that starts with '"' it's likely double-stringified
    WHEN meeting_schedule::text LIKE '"%' THEN
      (meeting_schedule::text)::jsonb
    -- If it's already proper JSONB, keep it
    WHEN jsonb_typeof(meeting_schedule) = 'object' THEN
      meeting_schedule
    -- If it's a plain string, try to parse it
    WHEN jsonb_typeof(meeting_schedule) = 'string' THEN
      CASE
        WHEN meeting_schedule::text = '{}' THEN '{}'::jsonb
        ELSE meeting_schedule::jsonb
      END
    -- Default to empty object
    ELSE 
      '{}'::jsonb
  END
WHERE meeting_schedule IS NOT NULL;

-- Verify the fix
SELECT id, name, 
       meeting_schedule,
       jsonb_typeof(meeting_schedule) as json_type
FROM organizations
WHERE meeting_schedule IS NOT NULL
LIMIT 5;