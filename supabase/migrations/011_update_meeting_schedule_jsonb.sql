-- Convert meeting_schedule from text to JSONB for structured data
ALTER TABLE organizations 
ALTER COLUMN meeting_schedule TYPE jsonb 
USING CASE 
  WHEN meeting_schedule IS NULL OR meeting_schedule = '' THEN '{}'::jsonb
  ELSE jsonb_build_object(
    'monday', jsonb_build_object('enabled', false, 'time', ''),
    'tuesday', jsonb_build_object('enabled', false, 'time', ''),
    'wednesday', jsonb_build_object('enabled', false, 'time', ''),
    'thursday', jsonb_build_object('enabled', false, 'time', ''),
    'friday', jsonb_build_object('enabled', false, 'time', ''),
    'saturday', jsonb_build_object('enabled', false, 'time', ''),
    'sunday', jsonb_build_object('enabled', false, 'time', ''),
    'legacy_text', meeting_schedule
  )
END;

-- Set default for new rows
ALTER TABLE organizations 
ALTER COLUMN meeting_schedule SET DEFAULT '{}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN organizations.meeting_schedule IS 'JSON object with days as keys. Each day has {enabled: boolean, time: string}. Example: {"monday": {"enabled": true, "time": "7:00 PM"}, "tuesday": {"enabled": false, "time": ""}}';