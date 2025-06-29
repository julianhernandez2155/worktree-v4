-- Add bio field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio text;

-- Add constraint to limit bio length (500 characters)
ALTER TABLE profiles 
ADD CONSTRAINT bio_length_check 
CHECK (char_length(bio) <= 500);