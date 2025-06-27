# Fix for Task Assignment Error

## Problem
When trying to assign multiple people to a task, you're getting:
- `404 Not Found` error on the RPC function call
- Error message: `"operator does not exist: boolean > integer"`

## Root Cause
The `add_task_assignee` function has a type mismatch error. The `GET DIAGNOSTICS` command returns an integer, but the original code was trying to assign it to a boolean variable and then compare it with `> 0`.

## Solution
Run the SQL script `fix_add_task_assignee_type_error.sql` in your Supabase SQL Editor.

### Steps to Fix:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Fix Script**
   - Copy the entire contents of `/supabase/fix_add_task_assignee_type_error.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify the Fix**
   - The script automatically includes a verification query at the end
   - You should see both functions listed with their definitions

4. **Test in Your App**
   - Go back to your application
   - Try assigning a task to multiple people
   - It should work without errors now

## What the Fix Does
1. Drops the existing broken functions
2. Recreates them with proper variable types:
   - Changes `v_success BOOLEAN` to `v_row_count INTEGER`
   - Properly handles the row count comparison
3. Maintains all the original functionality

## If You Still Get Errors
- Make sure you're running the script in the correct Supabase project
- Check that the `task_assignees` table exists
- Verify your Supabase connection is working properly