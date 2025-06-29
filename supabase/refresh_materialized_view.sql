-- Refresh the materialized view for project skill matches
REFRESH MATERIALIZED VIEW CONCURRENTLY project_skill_matches;

-- Check if the view has data
SELECT COUNT(*) as project_count FROM project_skill_matches;