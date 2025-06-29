-- Create Universities Table
-- This table was referenced by profiles.university_id but was missing

-- Create the universities table
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE, -- e.g., 'syracuse.edu'
  location text,
  logo_url text,
  student_count integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add some common universities as seed data
INSERT INTO universities (name, domain, location) VALUES
  ('Syracuse University', 'syracuse.edu', 'Syracuse, NY'),
  ('Cornell University', 'cornell.edu', 'Ithaca, NY'),
  ('University of Rochester', 'rochester.edu', 'Rochester, NY'),
  ('Columbia University', 'columbia.edu', 'New York, NY'),
  ('New York University', 'nyu.edu', 'New York, NY')
ON CONFLICT (domain) DO NOTHING;

-- Add the foreign key constraint to profiles
-- First check if the constraint already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_university_id_fkey'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_university_id_fkey 
    FOREIGN KEY (university_id) REFERENCES universities(id);
  END IF;
END $$;

-- Create indexes for universities
CREATE INDEX IF NOT EXISTS idx_universities_domain ON universities(domain);
CREATE INDEX IF NOT EXISTS idx_universities_active ON universities(is_active) WHERE is_active = true;

-- Update existing profiles to link to universities based on email domain
-- This is optional - only run if you want to auto-link existing users
UPDATE profiles p
SET university_id = u.id
FROM universities u
WHERE p.email LIKE '%@' || u.domain
AND p.university_id IS NULL;