-- Create teams/cabinets system for organizations
CREATE TABLE IF NOT EXISTS public.organization_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  color text DEFAULT '#6366f1', -- Default to a nice purple
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_teams_pkey PRIMARY KEY (id),
  CONSTRAINT organization_teams_organization_id_fkey FOREIGN KEY (organization_id) 
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT organization_teams_unique_slug UNIQUE (organization_id, slug)
);

-- Create team members junction table
CREATE TABLE IF NOT EXISTS public.team_members (
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (team_id, user_id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) 
    REFERENCES public.organization_teams(id) ON DELETE CASCADE,
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add team assignment to projects
ALTER TABLE public.internal_projects 
ADD COLUMN IF NOT EXISTS team_id uuid,
ADD COLUMN IF NOT EXISTS lead_id uuid,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS labels jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS estimated_hours integer,
ADD COLUMN IF NOT EXISTS actual_hours integer DEFAULT 0,
ADD CONSTRAINT internal_projects_team_id_fkey FOREIGN KEY (team_id) 
  REFERENCES public.organization_teams(id) ON DELETE SET NULL,
ADD CONSTRAINT internal_projects_lead_id_fkey FOREIGN KEY (lead_id) 
  REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_teams_org_id ON public.organization_teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_internal_projects_team_id ON public.internal_projects(team_id);
CREATE INDEX IF NOT EXISTS idx_internal_projects_lead_id ON public.internal_projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_internal_projects_priority ON public.internal_projects(priority);
CREATE INDEX IF NOT EXISTS idx_internal_projects_due_date ON public.internal_projects(due_date);

-- RLS Policies for organization_teams
ALTER TABLE public.organization_teams ENABLE ROW LEVEL SECURITY;

-- View teams: Members of the organization can view teams
CREATE POLICY "Organization members can view teams" ON public.organization_teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organization_teams.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Create/Update/Delete teams: Only org admins
CREATE POLICY "Organization admins can manage teams" ON public.organization_teams
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organization_teams.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('admin', 'president')
    )
  );

-- RLS Policies for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- View team members: Organization members can view
CREATE POLICY "Organization members can view team members" ON public.team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.organization_teams ot
      JOIN public.organization_members om ON om.organization_id = ot.organization_id
      WHERE ot.id = team_members.team_id
      AND om.user_id = auth.uid()
    )
  );

-- Manage team members: Team leads and org admins
CREATE POLICY "Team leads and org admins can manage team members" ON public.team_members
  FOR ALL
  USING (
    -- User is team lead
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'lead'
    )
    OR
    -- User is org admin
    EXISTS (
      SELECT 1 
      FROM public.organization_teams ot
      JOIN public.organization_members om ON om.organization_id = ot.organization_id
      WHERE ot.id = team_members.team_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'president')
    )
  );

-- Add updated_at trigger for teams
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organization_teams_updated_at 
  BEFORE UPDATE ON public.organization_teams 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();