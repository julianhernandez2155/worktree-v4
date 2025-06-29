-- Add new fields to organizations table for enhanced profiles
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS what_we_do text,
ADD COLUMN IF NOT EXISTS values text[],
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meeting_schedule text,
ADD COLUMN IF NOT EXISTS join_process text,
ADD COLUMN IF NOT EXISTS founded_date date;

-- Add constraints for social_links structure
ALTER TABLE organizations 
ADD CONSTRAINT social_links_is_array CHECK (jsonb_typeof(social_links) = 'array');

-- Update RLS policies to allow org admins to update these fields
CREATE POLICY "Organization admins can update org details" ON organizations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organizations.id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role IN ('admin', 'president')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organizations.id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role IN ('admin', 'president')
  )
);

-- Add achievement and image_url to internal_projects for showcase
ALTER TABLE internal_projects
ADD COLUMN IF NOT EXISTS achievement text,
ADD COLUMN IF NOT EXISTS image_url text;

-- Create index on organization slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for organizations table if it doesn't exist
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at 
BEFORE UPDATE ON organizations 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add sample social links structure comment
COMMENT ON COLUMN organizations.social_links IS 'Array of objects with platform and url keys. Example: [{"platform": "instagram", "url": "https://instagram.com/..."}, {"platform": "discord", "url": "https://discord.gg/..."}]';