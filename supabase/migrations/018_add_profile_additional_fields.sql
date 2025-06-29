-- Add additional profile fields for comprehensive user profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS interests text[],
ADD COLUMN IF NOT EXISTS looking_for text[];

-- Add constraints
ALTER TABLE profiles
ADD CONSTRAINT phone_format_check 
CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$');

ALTER TABLE profiles
ADD CONSTRAINT website_url_check
CHECK (website IS NULL OR website ~ '^https?://');

ALTER TABLE profiles
ADD CONSTRAINT linkedin_url_check
CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://(www\.)?linkedin\.com/');

ALTER TABLE profiles
ADD CONSTRAINT github_url_check
CHECK (github_url IS NULL OR github_url ~ '^https?://(www\.)?github\.com/');