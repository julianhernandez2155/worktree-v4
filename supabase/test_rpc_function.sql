-- Test if the RPC function exists and check for any issues

-- 1. Check if function exists
SELECT 
    p.proname as function_name,
    pg_catalog.pg_get_function_result(p.oid) as return_type,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments
FROM pg_catalog.pg_proc p
WHERE p.proname = 'get_recommended_projects';

-- 2. Check if materialized view exists
SELECT 
    schemaname,
    matviewname,
    matviewowner,
    ispopulated,
    definition
FROM pg_matviews
WHERE matviewname = 'project_skill_matches';

-- 3. Check if materialized view has data
SELECT COUNT(*) as row_count FROM project_skill_matches;

-- 4. Test the function with a sample user ID (replace with actual user ID)
-- SELECT * FROM get_recommended_projects('YOUR_USER_ID_HERE'::uuid, 5, 0);