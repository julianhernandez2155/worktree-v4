-- Fix team_members RLS policies to prevent infinite recursion

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Team leads and org admins can manage team members" ON public.team_members;

-- Create simpler policies without circular references

-- View policy: Users can view team members if they're in the same organization
CREATE POLICY "Organization members can view team members" ON public.team_members
  FOR SELECT
  USING (
    team_id IN (
      SELECT ot.id 
      FROM public.organization_teams ot
      WHERE ot.organization_id IN (
        SELECT om.organization_id 
        FROM public.organization_members om 
        WHERE om.user_id = auth.uid()
      )
    )
  );

-- Insert/Update/Delete policy: Team leads and org admins
CREATE POLICY "Team leads and org admins can manage team members" ON public.team_members
  FOR ALL
  USING (
    -- User is org admin/president
    team_id IN (
      SELECT ot.id 
      FROM public.organization_teams ot
      JOIN public.organization_members om ON om.organization_id = ot.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'president')
    )
    OR
    -- User is team lead
    EXISTS (
      SELECT 1 FROM public.team_members tm_check
      WHERE tm_check.team_id = team_members.team_id
      AND tm_check.user_id = auth.uid()
      AND tm_check.role = 'lead'
    )
  );