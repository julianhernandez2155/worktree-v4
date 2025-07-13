-- Remove contribution_type column from contributions table
-- This column is redundant as the type can be inferred from the presence of project_id

-- First, drop the dependent view
DROP VIEW IF EXISTS my_tasks;

-- Drop the column
ALTER TABLE contributions 
DROP COLUMN contribution_type;

-- Recreate the my_tasks view without the contribution_type column
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