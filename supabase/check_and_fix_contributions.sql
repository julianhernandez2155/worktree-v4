-- First, let's check what columns already exist in the contributions table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'contributions'
ORDER BY ordinal_position;

-- If you need to add only specific columns, use these individually:

-- Add due_date if it doesn't exist
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add assigned_at if it doesn't exist
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Add assignee_notes if it doesn't exist
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS assignee_notes TEXT;

-- Add estimated_hours if it doesn't exist
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10,2);

-- Check if the constraint already exists before adding it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'contributions_priority_check'
    ) THEN
        ALTER TABLE contributions
        ADD CONSTRAINT contributions_priority_check 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
END $$;