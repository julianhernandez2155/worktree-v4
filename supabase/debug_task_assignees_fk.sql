-- Debug task_assignees foreign key relationships

-- Check if the foreign key exists
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS foreign_table_name,
    a.attname AS column_name,
    af.attname AS foreign_column_name
FROM 
    pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE 
    c.contype = 'f'
    AND c.conrelid = 'task_assignees'::regclass;

-- Check the actual foreign key constraint
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='task_assignees';

-- Try a simpler query approach
-- Let's test if we can query the data directly
SELECT 
    ta.*,
    p.id as profile_id,
    p.full_name,
    p.username,
    p.avatar_url
FROM task_assignees ta
LEFT JOIN profiles p ON ta.assignee_id = p.id
WHERE ta.task_id = 'a6e75e2a-d3ea-4bfd-bf4f-7a6b63ce1df1'
ORDER BY ta.is_primary DESC, ta.assigned_at ASC;