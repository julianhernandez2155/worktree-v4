-- Create a separate table for vacant positions since we can't make user_id nullable in organization_members
CREATE TABLE IF NOT EXISTS public.vacant_positions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL,
  display_title text NOT NULL,
  reports_to uuid REFERENCES public.profiles(id),
  position_order integer DEFAULT 0,
  position_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for vacant positions
ALTER TABLE public.vacant_positions ENABLE ROW LEVEL SECURITY;

-- View policy: Organization members can view vacant positions
CREATE POLICY "Organization members can view vacant positions" ON public.vacant_positions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Management policy: Organization admins/presidents can manage vacant positions
CREATE POLICY "Organization admins can manage vacant positions" ON public.vacant_positions
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'president')
    )
  );

-- Add display_title to organization_members for custom position titles
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS display_title text;

-- Update existing positions to have display titles
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