-- Enhanced onboarding schema for Hook & Nudge approach
-- Supports Internal Strength First philosophy

-- Check if profiles table exists (from migration 002)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Table "profiles" does not exist. Please run 002_complete_schema.sql first.';
  END IF;
END $$;

-- Update profiles table with enhanced fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT[] DEFAULT '{}'; -- ['student', 'org_leader', 'admin']
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_role TEXT; -- 'org_member', 'freelancer', 'both'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS psychometric_profile JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assessment_status JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completeness FLOAT DEFAULT 0.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_assessment_prompt TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Ensure required types exist
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Organization skill needs tracking
CREATE TABLE IF NOT EXISTS organization_skill_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  need_type TEXT NOT NULL, -- 'recurring', 'project_based', 'urgent'
  frequency TEXT, -- 'weekly', 'monthly', 'per_semester'
  last_fulfilled TIMESTAMPTZ,
  current_gap_level INTEGER CHECK (current_gap_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, skill_id)
);

-- Internal projects (before going public)
CREATE TABLE IF NOT EXISTS internal_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  timeline TEXT, -- 'this_week', 'this_month', 'this_semester'
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES profiles(id),
  visibility TEXT DEFAULT 'internal', -- 'internal' or 'public'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contributions tracking (internal and external work)
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES internal_projects(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_description TEXT,
  skills_used TEXT[],
  hours_worked DECIMAL(10,2),
  completion_quality INTEGER CHECK (completion_quality BETWEEN 1 AND 5),
  verified_by UUID REFERENCES profiles(id),
  contribution_type TEXT NOT NULL, -- 'internal' or 'external'
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'verified'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Gamification and progress tracking
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  user_type TEXT NOT NULL, -- 'student', 'org_leader', 'admin'
  steps_completed JSONB DEFAULT '{}',
  last_prompt_shown TEXT,
  last_prompt_timestamp TIMESTAMPTZ,
  completion_percentage FLOAT DEFAULT 0.0,
  quality_score FLOAT, -- Based on data completeness
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contextual prompt tracking
CREATE TABLE IF NOT EXISTS contextual_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_type TEXT NOT NULL,
  trigger_condition TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_text TEXT,
  shown_to_users INTEGER DEFAULT 0,
  completed_by_users INTEGER DEFAULT 0,
  conversion_rate FLOAT GENERATED ALWAYS AS 
    (CASE WHEN shown_to_users > 0 THEN completed_by_users::FLOAT / shown_to_users ELSE 0 END) STORED,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User assessments (psychometric data)
CREATE TABLE IF NOT EXISTS user_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL, -- 'big_five', 'riasec', 'grit', 'work_style'
  raw_scores JSONB NOT NULL,
  computed_profile JSONB, -- e.g., {"archetype": "Creative Architect", "traits": [...]}
  context TEXT, -- Where/why it was triggered
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work style and psychometric profiles
CREATE TABLE IF NOT EXISTS user_psychometrics (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  raw_scores JSONB NOT NULL,
  computed_profile TEXT, -- 'Creative Architect', 'Strategic Leader', etc.
  percentile_scores JSONB, -- Compared to other students
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  context TEXT,
  PRIMARY KEY (user_id, assessment_type)
);

-- Invitation tracking for network effects
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invitation_code TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  status TEXT DEFAULT 'sent', -- 'sent', 'opened', 'accepted', 'expired'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Organization health analytics
CREATE TABLE IF NOT EXISTS organization_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  skill_sufficiency_score FLOAT, -- % of needs met internally
  project_completion_rate FLOAT,
  member_utilization_rate FLOAT, -- % of members actively contributing
  external_dependency_rate FLOAT, -- % of tasks requiring external help
  active_members INTEGER,
  total_projects INTEGER,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, calculated_at)
);

-- Skill progression tracking (need to check if user_skills exists first)
CREATE TABLE IF NOT EXISTS skill_progression (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  initial_level difficulty_level,
  current_level difficulty_level,
  verified_through_work BOOLEAN DEFAULT false,
  endorsement_count INTEGER DEFAULT 0,
  projects_used_in INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Organization Roles (for succession planning)
CREATE TABLE IF NOT EXISTS organization_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[],
  current_holder_id UUID REFERENCES profiles(id),
  term_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_skill_needs_org_id ON organization_skill_needs(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_skill_needs_urgency ON organization_skill_needs(need_type, current_gap_level DESC);
CREATE INDEX IF NOT EXISTS idx_internal_projects_org_id ON internal_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_internal_projects_visibility ON internal_projects(visibility);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor ON contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_contributions_project ON contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_contextual_prompts_active ON contextual_prompts(active, conversion_rate DESC);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user ON user_assessments(user_id, assessment_type);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_org_analytics_org ON organization_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_roles_org_id ON organization_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_roles_holder ON organization_roles(current_holder_id);

-- Sample contextual prompts
INSERT INTO contextual_prompts (prompt_type, trigger_condition, title, message, action_text) VALUES
  ('skill_match', 'org_has_skill_need', 'Your org needs you!', 'The {org_name} often needs {skill_name} skills. Do you have this skill?', 'Add to profile'),
  ('project_match', 'new_project_posted', 'New project alert!', 'A new project needs someone with {skill_name} skills', 'View project'),
  ('assessment_nudge', 'added_3_skills', 'Discover your work style', 'Take a 3-minute quiz to get matched with perfect projects', 'Start quiz'),
  ('verification_prompt', 'completed_first_task', 'Great work!', 'Add {skill_name} to your verified skills?', 'Add skill')
ON CONFLICT DO NOTHING;

-- Function to calculate organization health metrics
CREATE OR REPLACE FUNCTION calculate_organization_health(org_id UUID)
RETURNS TABLE (
  skill_sufficiency FLOAT,
  project_completion FLOAT,
  member_utilization FLOAT,
  external_dependency FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH org_stats AS (
    SELECT 
      o.id,
      COUNT(DISTINCT om.user_id) as total_members,
      COUNT(DISTINCT c.contributor_id) as active_members,
      COUNT(DISTINCT ip.id) as total_projects,
      COUNT(DISTINCT CASE WHEN ip.status = 'completed' THEN ip.id END) as completed_projects,
      COUNT(DISTINCT CASE WHEN ip.visibility = 'public' THEN ip.id END) as public_projects
    FROM organizations o
    LEFT JOIN organization_members om ON o.id = om.organization_id
    LEFT JOIN internal_projects ip ON o.id = ip.organization_id
    LEFT JOIN contributions c ON ip.id = c.project_id AND c.contribution_type = 'internal'
    WHERE o.id = org_id
    GROUP BY o.id
  ),
  skill_stats AS (
    SELECT 
      COUNT(DISTINCT osn.skill_id) as skills_needed,
      COUNT(DISTINCT CASE WHEN p.skills @> ARRAY[s.name] THEN osn.skill_id END) as skills_available
    FROM organization_skill_needs osn
    LEFT JOIN organization_members om ON osn.organization_id = om.organization_id
    LEFT JOIN profiles p ON om.user_id = p.id
    LEFT JOIN skills s ON osn.skill_id = s.id
    WHERE osn.organization_id = org_id
  )
  SELECT 
    CASE WHEN ss.skills_needed > 0 
      THEN ss.skills_available::FLOAT / ss.skills_needed 
      ELSE 1.0 END as skill_sufficiency,
    CASE WHEN os.total_projects > 0 
      THEN os.completed_projects::FLOAT / os.total_projects 
      ELSE 0.0 END as project_completion,
    CASE WHEN os.total_members > 0 
      THEN os.active_members::FLOAT / os.total_members 
      ELSE 0.0 END as member_utilization,
    CASE WHEN os.total_projects > 0 
      THEN os.public_projects::FLOAT / os.total_projects 
      ELSE 0.0 END as external_dependency
  FROM org_stats os, skill_stats ss;
END;
$$ LANGUAGE plpgsql;

-- Function to update onboarding progress
CREATE OR REPLACE FUNCTION update_onboarding_progress() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Calculate completion percentage based on steps completed
  NEW.completion_percentage = (
    SELECT COUNT(*)::FLOAT / 
    CASE NEW.user_type 
      WHEN 'org_leader' THEN 5.0  -- 5 main steps for org leaders
      WHEN 'student' THEN 4.0     -- 4 main steps for students
      WHEN 'admin' THEN 3.0       -- 3 main steps for admins
      ELSE 1.0 
    END * 100
    FROM jsonb_object_keys(NEW.steps_completed) 
    WHERE (NEW.steps_completed->>jsonb_object_keys(NEW.steps_completed))::BOOLEAN = true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_onboarding_progress_trigger ON onboarding_progress;

-- Create trigger
CREATE TRIGGER update_onboarding_progress_trigger
BEFORE UPDATE ON onboarding_progress
FOR EACH ROW EXECUTE FUNCTION update_onboarding_progress();

-- Add updated_at triggers (drop existing first to avoid conflicts)
DROP TRIGGER IF EXISTS update_org_skill_needs_updated_at ON organization_skill_needs;
CREATE TRIGGER update_org_skill_needs_updated_at BEFORE UPDATE ON organization_skill_needs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_internal_projects_updated_at ON internal_projects;
CREATE TRIGGER update_internal_projects_updated_at BEFORE UPDATE ON internal_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_progress_updated_at ON onboarding_progress;
CREATE TRIGGER update_onboarding_progress_updated_at BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_roles_updated_at ON organization_roles;
CREATE TRIGGER update_organization_roles_updated_at BEFORE UPDATE ON organization_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced onboarding schema migration completed successfully!';
  RAISE NOTICE 'The following tables were created/updated:';
  RAISE NOTICE '- organization_roles (for succession planning)';
  RAISE NOTICE '- organization_skill_needs';
  RAISE NOTICE '- internal_projects';
  RAISE NOTICE '- contributions';
  RAISE NOTICE '- and more...';
END $$;