-- Task Assignment System Migration
-- Adds due dates, priority, and assignment tracking to contributions table

-- Add new columns to contributions table for task management
ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assignee_notes TEXT,
  ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10,2);

-- Create indexes for efficient task queries
CREATE INDEX IF NOT EXISTS idx_contributions_due_date ON contributions(due_date) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_contributions_priority ON contributions(priority, due_date) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_contributions_assignee ON contributions(contributor_id, status, due_date);

-- Add a view for "My Tasks" functionality
CREATE OR REPLACE VIEW my_tasks AS
SELECT 
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
  END as urgency_status
FROM contributions c
JOIN internal_projects p ON c.project_id = p.id
JOIN organizations o ON p.organization_id = o.id
WHERE c.contributor_id IS NOT NULL;

-- Function to get task load for a user
CREATE OR REPLACE FUNCTION get_user_task_load(user_id UUID)
RETURNS TABLE (
  total_tasks INTEGER,
  overdue_tasks INTEGER,
  high_priority_tasks INTEGER,
  hours_committed DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_tasks,
    COUNT(CASE WHEN due_date < CURRENT_DATE THEN 1 END)::INTEGER as overdue_tasks,
    COUNT(CASE WHEN priority IN ('high', 'urgent') THEN 1 END)::INTEGER as high_priority_tasks,
    COALESCE(SUM(estimated_hours), 0) as hours_committed
  FROM contributions
  WHERE contributor_id = user_id
    AND status NOT IN ('completed', 'verified');
END;
$$ LANGUAGE plpgsql;

-- Update some existing test tasks with due dates and priorities for testing
UPDATE contributions 
SET 
  due_date = CASE 
    WHEN RANDOM() < 0.2 THEN CURRENT_DATE - INTERVAL '2 days'
    WHEN RANDOM() < 0.4 THEN CURRENT_DATE
    WHEN RANDOM() < 0.6 THEN CURRENT_DATE + INTERVAL '3 days'
    WHEN RANDOM() < 0.8 THEN CURRENT_DATE + INTERVAL '7 days'
    ELSE CURRENT_DATE + INTERVAL '14 days'
  END,
  priority = CASE 
    WHEN RANDOM() < 0.1 THEN 'urgent'
    WHEN RANDOM() < 0.3 THEN 'high'
    WHEN RANDOM() < 0.7 THEN 'medium'
    ELSE 'low'
  END,
  estimated_hours = ROUND((RANDOM() * 8 + 1)::NUMERIC, 1)
WHERE due_date IS NULL;