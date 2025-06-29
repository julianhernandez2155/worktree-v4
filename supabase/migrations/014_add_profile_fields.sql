-- Add tagline field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tagline text;

-- Add external_links field to profiles table (JSONB array)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]'::jsonb;

-- Add check constraint to ensure external_links is an array
ALTER TABLE profiles 
ADD CONSTRAINT external_links_is_array 
CHECK (jsonb_typeof(external_links) = 'array');