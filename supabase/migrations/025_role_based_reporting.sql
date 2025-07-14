-- Change reporting structure from person-based to role-based
-- Add reports_to_role column to store the role that this position reports to
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS reports_to_role text;

ALTER TABLE public.vacant_positions 
ADD COLUMN IF NOT EXISTS reports_to_role text;

-- Migrate existing data if needed (convert user references to role references)
-- This would need to be customized based on your existing data
-- UPDATE public.organization_members om
-- SET reports_to_role = (
--   SELECT role FROM public.organization_members 
--   WHERE user_id = om.reports_to 
--   AND organization_id = om.organization_id
-- )
-- WHERE reports_to IS NOT NULL;

-- Drop the old reports_to columns (optional - you might want to keep them for now)
-- ALTER TABLE public.organization_members DROP COLUMN reports_to;
-- ALTER TABLE public.vacant_positions DROP COLUMN reports_to;