-- Add cover_photo_url and update tagline constraint to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cover_photo_url text;

-- Update tagline constraint to be longer (100 chars for professional headline)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS tagline_length_check;

ALTER TABLE profiles 
ADD CONSTRAINT tagline_length_check 
CHECK (char_length(tagline) <= 100);

-- Add open_to_opportunities flag
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS open_to_opportunities boolean DEFAULT false;