# Easiest Way to Update Test User Passwords

Since direct SQL access to auth.users might be restricted, use the Supabase Dashboard:

## Quick Method - Update Just One Test User
1. Go to Supabase Dashboard > Authentication > Users
2. Find `testuser1@syr.edu` 
3. Click the three dots menu (⋮) on the right
4. Click "Reset password"
5. Enter new password: `testpass123`
6. Click "Update"

Now you can login as:
- Email: testuser1@syr.edu
- Password: testpass123

This user (Sarah Chen) is the President of Syracuse Tech Club and has full access to all features.

## Alternative - Check if you can run this simpler query:
```sql
-- Just check what columns are available
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users';
```

If that works, we can see what columns are accessible in your Supabase setup.