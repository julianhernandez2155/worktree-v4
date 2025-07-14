-- Add organizational chart fields to support hierarchical structure

-- Add hierarchical fields to organization_members
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS reports_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS position_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_description text;

-- Add org chart configuration to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS org_chart_config jsonb DEFAULT '{
  "showVacancies": true,
  "showDescriptions": false,
  "layout": "tree",
  "publiclyVisible": true
}'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_reports_to ON public.organization_members(reports_to);
CREATE INDEX IF NOT EXISTS idx_org_members_position_order ON public.organization_members(position_order);

-- Add constraint to prevent circular reporting relationships
CREATE OR REPLACE FUNCTION check_circular_reporting() 
RETURNS TRIGGER AS $$
DECLARE
  current_id uuid;
  checked_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  -- Only check if reports_to is being set
  IF NEW.reports_to IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if the user is trying to report to themselves
  IF NEW.user_id = NEW.reports_to THEN
    RAISE EXCEPTION 'A member cannot report to themselves';
  END IF;
  
  -- Check for circular references
  current_id := NEW.reports_to;
  WHILE current_id IS NOT NULL LOOP
    -- Check if we've seen this ID before (circular reference)
    IF current_id = ANY(checked_ids) OR current_id = NEW.user_id THEN
      RAISE EXCEPTION 'Circular reporting relationship detected';
    END IF;
    
    -- Add to checked IDs
    checked_ids := array_append(checked_ids, current_id);
    
    -- Get the next level up
    SELECT reports_to INTO current_id
    FROM public.organization_members
    WHERE user_id = current_id 
    AND organization_id = NEW.organization_id
    AND is_active = true;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for circular reporting check
DROP TRIGGER IF EXISTS check_circular_reporting_trigger ON public.organization_members;
CREATE TRIGGER check_circular_reporting_trigger
  BEFORE INSERT OR UPDATE OF reports_to ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION check_circular_reporting();

-- Update RLS policies to allow viewing reporting structure
-- Members can see who reports to whom in their organization
CREATE POLICY "Organization members can view reporting structure" ON public.organization_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

-- Set initial position order based on role hierarchy
UPDATE public.organization_members
SET position_order = CASE role
  WHEN 'president' THEN 1
  WHEN 'vice_president' THEN 2
  WHEN 'treasurer' THEN 3
  WHEN 'secretary' THEN 4
  WHEN 'admin' THEN 5
  WHEN 'tech_lead' THEN 10
  WHEN 'project_lead' THEN 11
  ELSE 20
END
WHERE position_order = 0;