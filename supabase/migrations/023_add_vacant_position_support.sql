-- Add support for vacant positions in organization_members
-- Allow user_id to be nullable for vacant positions
ALTER TABLE public.organization_members 
ALTER COLUMN user_id DROP NOT NULL;

-- Add is_vacant column to explicitly track vacant positions
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS is_vacant boolean DEFAULT false;

-- Update RLS policies to handle vacant positions
DROP POLICY IF EXISTS "Organization members can view their organization members" ON public.organization_members;

CREATE POLICY "Organization members can view their organization members" ON public.organization_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members om_check 
      WHERE om_check.user_id = auth.uid()
    )
  );

-- Ensure vacant positions can be managed by admins/presidents
DROP POLICY IF EXISTS "Organization admins can manage members" ON public.organization_members;

CREATE POLICY "Organization admins can manage members" ON public.organization_members
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members om_check
      WHERE om_check.user_id = auth.uid() 
      AND om_check.role IN ('admin', 'president')
    )
  );

-- Add check constraint to ensure vacant positions don't have user_id
ALTER TABLE public.organization_members
ADD CONSTRAINT vacant_position_check 
CHECK (
  (is_vacant = true AND user_id IS NULL) OR 
  (is_vacant = false AND user_id IS NOT NULL)
);