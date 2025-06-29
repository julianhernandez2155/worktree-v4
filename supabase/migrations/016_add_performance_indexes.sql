-- Add performance indexes for optimizing Supabase queries
-- This migration adds indexes identified through query analysis

-- Enable pg_trgm extension for text search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Foreign key indexes (critical for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_member_skills_user_id ON member_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_member_skills_skill_id ON member_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_task_required_skills_task_id ON task_required_skills(task_id);
CREATE INDEX IF NOT EXISTS idx_task_required_skills_skill_id ON task_required_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_contributions_project_id ON contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_assignee_id ON task_assignees(assignee_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_saved_projects_user_project ON saved_projects(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_user_project ON project_applications(applicant_id, project_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_user ON organization_members(organization_id, user_id);

-- Partial index for active public projects (frequently queried)
CREATE INDEX IF NOT EXISTS idx_internal_projects_public_active 
  ON internal_projects(is_public, status) 
  WHERE is_public = true AND status = 'active';

-- Text search indexes using trigram similarity
CREATE INDEX IF NOT EXISTS idx_internal_projects_name_trgm 
  ON internal_projects USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_internal_projects_description_trgm 
  ON internal_projects USING gin(public_description gin_trgm_ops);

-- Organization search indexes
CREATE INDEX IF NOT EXISTS idx_organizations_name_trgm 
  ON organizations USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_organizations_slug 
  ON organizations(slug);

-- Profile search indexes
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm 
  ON profiles USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_username 
  ON profiles(username) WHERE username IS NOT NULL;

-- Skills lookup index
CREATE INDEX IF NOT EXISTS idx_skills_name 
  ON skills(name);

-- Task status and deadline indexes
CREATE INDEX IF NOT EXISTS idx_contributions_status 
  ON contributions(status) 
  WHERE status IN ('pending', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_contributions_due_date 
  ON contributions(due_date) 
  WHERE due_date IS NOT NULL;

-- Application deadline index for filtering
CREATE INDEX IF NOT EXISTS idx_internal_projects_deadline 
  ON internal_projects(application_deadline) 
  WHERE application_deadline IS NOT NULL;

-- Timestamp indexes for sorting
CREATE INDEX IF NOT EXISTS idx_internal_projects_created_at 
  ON internal_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at 
  ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_organization_members_joined_at 
  ON organization_members(joined_at DESC);

-- Add comment explaining the indexes
COMMENT ON INDEX idx_internal_projects_public_active IS 'Optimizes queries for public active projects in discover feed';
COMMENT ON INDEX idx_saved_projects_user_project IS 'Optimizes checking if user has saved a project';
COMMENT ON INDEX idx_project_applications_user_project IS 'Optimizes checking if user has applied to a project';