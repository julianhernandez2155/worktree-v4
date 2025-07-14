-- Add 'in_review' status to the valid_status constraint
-- This allows the more intuitive kanban workflow: To Do → In Progress → In Review → Done

-- First drop the existing constraint
ALTER TABLE contributions DROP CONSTRAINT IF EXISTS valid_status;

-- Add the new constraint with 'in_review' included
ALTER TABLE contributions 
ADD CONSTRAINT valid_status 
CHECK (status IN ('pending', 'in_progress', 'in_review', 'completed', 'verified'));