-- Populate usernames from email addresses if not already set
UPDATE profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL AND email IS NOT NULL;

-- Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles(username);

-- Add trigger to automatically set username from email on insert
CREATE OR REPLACE FUNCTION set_username_from_email()
RETURNS trigger AS $$
BEGIN
  -- Only set username if it's not provided and email is available
  IF NEW.username IS NULL AND NEW.email IS NOT NULL THEN
    NEW.username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new profiles
DROP TRIGGER IF EXISTS set_username_on_insert ON profiles;
CREATE TRIGGER set_username_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_username_from_email();

-- Also handle updates where email changes but username is still null
DROP TRIGGER IF EXISTS set_username_on_update ON profiles;
CREATE TRIGGER set_username_on_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.username IS NULL AND NEW.email IS NOT NULL AND NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION set_username_from_email();