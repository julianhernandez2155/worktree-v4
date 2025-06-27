-- Check if the RPC functions exist
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('add_task_assignee', 'remove_task_assignee')
ORDER BY routine_name;