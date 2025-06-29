-- Check for any triggers on contributions table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'contributions';

-- Check RLS policies on member_skills
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    tablename = 'member_skills';

-- Check RLS policies on contributions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    tablename = 'contributions';

-- Check if there are any functions that might be called
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as result_type,
    pg_get_function_arguments(p.oid) as arguments
FROM 
    pg_proc p
    LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    p.proname LIKE '%member_skill%' 
    OR p.proname LIKE '%contribution%'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema');