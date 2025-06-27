# How to Update Test User Passwords

Since the test emails aren't real, you can't use the password reset flow. Here are two methods:

## Method 1: SQL Update (Recommended)
Run the SQL file `/supabase/update_test_passwords.sql` in your Supabase SQL Editor. This sets all test users to password: `testpass123`

## Method 2: Supabase Dashboard (Manual)
1. Go to Supabase Dashboard > Authentication > Users
2. Find a test user (e.g., testuser1@syr.edu)
3. Click on the user to open their details
4. Click "Update password" button
5. Enter new password: `testpass123`
6. Click "Update"
7. Repeat for each test user you want to use

## Method 3: Create One Real Test User
If you have a real email address you can use:
1. Go to Authentication > Users
2. Click "Add user" > "Create new user"
3. Use your real email
4. Set password
5. Run this SQL to add them to the organization:

```sql
-- Replace YOUR_USER_ID with the ID from the created user
INSERT INTO profiles (id, full_name, email, year_of_study, major, skills, user_type, primary_role, onboarding_completed) 
VALUES (
  'YOUR_USER_ID', 
  'Test User', 
  'your-email@example.com',
  'Junior',
  'Computer Science',
  ARRAY['Python', 'JavaScript', 'React'],
  ARRAY['student', 'org_leader'],
  'org_member',
  true
)
ON CONFLICT (id) DO UPDATE SET
  onboarding_completed = true;

-- Add to Syracuse Tech Club
INSERT INTO organization_members (organization_id, user_id, role, joined_at) 
VALUES ('c1111111-1111-1111-1111-111111111111', 'YOUR_USER_ID', 'member', NOW());
```

## Testing the Login
After updating passwords, test login at:
- http://localhost:3000/login
- Email: testuser1@syr.edu  
- Password: testpass123

Then visit: http://localhost:3000/dashboard/org/syracuse-tech