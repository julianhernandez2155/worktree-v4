-- Add display_title column to store the human-readable position title
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS display_title text;

-- Update existing positions to have display titles based on their roles
UPDATE public.organization_members
SET display_title = 
  CASE 
    WHEN role = 'president' THEN 'President'
    WHEN role = 'vice_president' THEN 'Vice President'
    WHEN role = 'secretary' THEN 'Secretary'
    WHEN role = 'treasurer' THEN 'Treasurer'
    WHEN role = 'admin' THEN 'Administrator'
    WHEN role = 'member' THEN 'Member'
    ELSE INITCAP(REPLACE(role, '_', ' '))
  END
WHERE display_title IS NULL;