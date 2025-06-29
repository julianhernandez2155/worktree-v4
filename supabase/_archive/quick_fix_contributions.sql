-- Quick fix to add missing columns to contributions table
-- Run this in Supabase SQL editor to fix the immediate error

-- Add the priority column with a default value
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Add the due_date column
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add other task management columns
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS assignee_notes TEXT;
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10,2);

-- Add a simple check constraint for priority values (only if it doesn't exist)
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