-- Performance Optimization Migration
-- This adds critical indexes and constraints for better query performance

-- 1. Foreign Key Indexes (Critical for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_project_id ON contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor_id ON contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_assignee_id ON task_assignees(assignee_id);
CREATE INDEX IF NOT EXISTS idx_member_skills_skill_id ON member_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_task_required_skills_task_id ON task_required_skills(task_id);
CREATE INDEX IF NOT EXISTS idx_task_required_skills_skill_id ON task_required_skills(skill_id);

-- 2. Query Optimization Indexes
-- Active contributions (excludes completed ones for better performance)
CREATE INDEX IF NOT EXISTS idx_contributions_active_status 
ON contributions(status) 
WHERE status IN ('pending', 'in_progress');

-- Active opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_active 
ON opportunities(status) 
WHERE status = 'active';

-- Skills by category
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- Organization by slug (already UNIQUE, but let's ensure it exists)
-- CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug); -- Already UNIQUE

-- Member skills by user (for profile queries)
CREATE INDEX IF NOT EXISTS idx_member_skills_user_added 
ON member_skills(user_id, added_at DESC);

-- 3. Composite Indexes for Common Queries
-- Organization members with role
CREATE INDEX IF NOT EXISTS idx_org_members_org_role 
ON organization_members(organization_id, role);

-- Tasks by project and status
CREATE INDEX IF NOT EXISTS idx_contributions_project_status 
ON contributions(project_id, status);

-- User activities by user and time
CREATE INDEX IF NOT EXISTS idx_user_activities_user_time 
ON user_activities(user_id, created_at DESC);

-- 4. Unique Constraints to Prevent Duplicates
-- Prevent duplicate task assignments
ALTER TABLE task_assignees 
ADD CONSTRAINT unique_task_assignee UNIQUE (task_id, assignee_id);

-- 5. Add check constraints for data integrity
-- Ensure valid priority values
ALTER TABLE contributions 
ADD CONSTRAINT valid_priority 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Ensure valid status values
ALTER TABLE contributions 
ADD CONSTRAINT valid_status 
CHECK (status IN ('pending', 'in_progress', 'completed', 'verified'));

-- Ensure valid skill source
ALTER TABLE member_skills
ADD CONSTRAINT valid_skill_source
CHECK (source IN ('self_reported', 'task_verified', 'peer_endorsed', 'migrated'));

-- 6. Performance statistics view (optional but useful)
-- Note: Column names vary by PostgreSQL version
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    s.schemaname,
    s.relname as tablename,
    s.indexrelname as indexname,
    s.idx_scan as index_scans,
    s.idx_tup_read as tuples_read,
    s.idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes s
WHERE s.schemaname = 'public'
ORDER BY s.idx_scan DESC;