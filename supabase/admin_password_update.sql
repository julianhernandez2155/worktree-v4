-- Admin method to update user passwords
-- This requires service_role access or admin privileges

-- First, let's see if we can access the auth schema
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- If you have admin access, try this to update a specific user:
-- Note: You might need to run this with elevated privileges

-- Option 1: Try updating through a function if available
-- Some Supabase setups have helper functions
SELECT * FROM pg_proc WHERE proname LIKE '%password%';

-- Option 2: Create a temporary admin function (if you have permissions)
CREATE OR REPLACE FUNCTION set_user_password(user_email TEXT, new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE email = user_email;
END;
$$;

-- Then use it:
-- SELECT set_user_password('testuser1@syr.edu', 'testpass123');

-- Option 3: The simplest approach - just create a new user with a real email
-- Go to Dashboard > Authentication > Users > Add User > Create new user
-- Use an email you control, then update the seed data to use that user's ID