-- Create Type Enums for Better Type Safety
-- This migration creates proper enum types to replace text fields with CHECK constraints

-- 1. Contribution/Task Status
DO $$ BEGIN
  CREATE TYPE contribution_status AS ENUM ('pending', 'in_progress', 'completed', 'verified');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Priority Levels
DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Skill Source Types
DO $$ BEGIN
  CREATE TYPE skill_source AS ENUM ('self_reported', 'task_verified', 'peer_endorsed', 'migrated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. Organization Member Roles
DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('member', 'admin', 'president', 'vice_president', 'treasurer', 'secretary', 'tech_lead', 'project_lead');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Opportunity Types
DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM ('internship', 'volunteer', 'paid', 'research', 'project', 'mentorship');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 6. Application Status
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Note: To actually use these enums, you would need to:
-- 1. Create new columns with the enum types
-- 2. Migrate data from old text columns
-- 3. Drop old columns
-- 4. Rename new columns
-- This is a complex migration that should be done carefully in production

-- Example of how to migrate a column (DO NOT RUN in production without backup):
-- ALTER TABLE contributions ADD COLUMN status_new contribution_status;
-- UPDATE contributions SET status_new = status::contribution_status;
-- ALTER TABLE contributions DROP COLUMN status;
-- ALTER TABLE contributions RENAME COLUMN status_new TO status;

-- For now, these enums exist for future use and documentation purposes