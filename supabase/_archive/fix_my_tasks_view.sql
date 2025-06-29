-- Fix my_tasks view to work with multiple assignees
-- Run this in Supabase SQL editor

-- Drop the old view if it exists
DROP VIEW IF EXISTS my_tasks;

-- Create updated my_tasks view
CREATE VIEW my_tasks AS
SELECT DISTINCT
  c.*,
  p.name as project_name,
  p.organization_id,
  o.name as organization_name,
  o.slug as organization_slug,
  CASE 
    WHEN c.due_date < CURRENT_DATE AND c.status NOT IN ('completed', 'verified') THEN 'overdue'
    WHEN c.due_date = CURRENT_DATE AND c.status NOT IN ('completed', 'verified') THEN 'due_today'
    WHEN c.due_date = CURRENT_DATE + INTERVAL '1 day' AND c.status NOT IN ('completed', 'verified') THEN 'due_tomorrow'
    WHEN c.due_date <= CURRENT_DATE + INTERVAL '7 days' AND c.status NOT IN ('completed', 'verified') THEN 'due_this_week'
    ELSE 'upcoming'
  END as urgency_status,
  ta.is_primary,
  ta.assignee_id
FROM contributions c
JOIN internal_projects p ON c.project_id = p.id
JOIN organizations o ON p.organization_id = o.id
JOIN task_assignees ta ON c.id = ta.task_id;