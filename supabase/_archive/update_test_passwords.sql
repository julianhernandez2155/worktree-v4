-- Update passwords for test users
-- Run this in Supabase SQL Editor

-- Method 1: Update all test users to have password 'testpass123'
UPDATE auth.users 
SET encrypted_password = crypt('testpass123', gen_salt('bf'))
WHERE email LIKE 'testuser%@syr.edu';

-- Verify the update
SELECT id, email, email_confirmed_at
FROM auth.users 
WHERE email LIKE 'testuser%@syr.edu'
ORDER BY email;

-- You can now login with:
-- Email: testuser1@syr.edu
-- Password: testpass123
-- (same password for all test users)