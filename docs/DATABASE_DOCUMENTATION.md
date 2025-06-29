# Worktree v4 Database Documentation

## Table of Contents
1. [Overview](#overview)
2. [Schema Documentation](#schema-documentation)
3. [Optimization Recommendations](#optimization-recommendations)
4. [Implementation Status](#implementation-status)

## Overview

Worktree v4 is a platform connecting undergraduate students with campus organizations and opportunities. The database is built on PostgreSQL (via Supabase) and uses:
- UUID primary keys for all tables
- Timestamp with timezone for all date/time fields
- JSONB for flexible structured data
- Arrays for simple lists
- Row Level Security (RLS) for access control

## Schema Documentation

### 1. User Management

#### `profiles`
**Purpose**: Core user profile information, linked to Supabase authentication
```sql
profiles (
  id uuid PRIMARY KEY,                    -- Links to auth.users(id)
  username text UNIQUE,                   -- Unique username (3-30 chars)
  full_name text,                        -- Display name
  email text,                            -- Contact email
  avatar_url text,                       -- Profile picture URL
  bio text,                              -- User bio/description
  
  -- Academic info
  year_of_study text,                    -- Freshman, Sophomore, etc.
  major text,                            -- Academic major
  university_id uuid,                    -- FK to universities (MISSING TABLE)
  
  -- Preferences (arrays)
  interests text[],                      -- Topics of interest
  looking_for text[],                    -- What they seek (mentorship, etc.)
  user_type text[],                      -- Student, alumni, etc.
  primary_role text,                     -- Main role identifier
  
  -- Profile metadata
  profile_completeness double precision,  -- 0-1 completion score
  onboarding_completed boolean,          -- Finished onboarding?
  interest_embeddings vector,            -- AI embeddings for matching
  
  -- Psychometric data
  psychometric_profile jsonb,            -- Personality assessment results
  assessment_status jsonb,               -- Assessment completion tracking
  last_assessment_prompt timestamptz,    -- Last assessment reminder
  
  -- Timestamps
  created_at timestamptz,
  updated_at timestamptz
)
```

**Issues**: 
- Missing `universities` table
- `skills` array column removed but embeddings remain
- Psychometric features not implemented

### 2. Organizations

#### `organizations`
**Purpose**: Student organizations/clubs on campus
```sql
organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,                    -- Organization name
  slug text UNIQUE NOT NULL,             -- URL-friendly ID (lowercase-hyphen)
  description text,                      -- About the organization
  category text NOT NULL,                -- Type: academic, social, etc.
  
  -- Management
  admin_id uuid NOT NULL,                -- FK to profiles(id) - main admin
  member_count integer DEFAULT 1,        -- Cached member count
  
  -- Branding
  logo_url text,                         -- Organization logo
  website text,                          -- External website
  verified boolean DEFAULT false,        -- Verified by platform?
  
  -- Timestamps
  created_at timestamptz,
  updated_at timestamptz
)
```

#### `organization_members`
**Purpose**: Junction table for organization membership
```sql
organization_members (
  organization_id uuid,                  -- FK to organizations(id)
  user_id uuid,                         -- FK to profiles(id)
  role text DEFAULT 'member',           -- member, admin, president, treasurer, etc.
  joined_at timestamptz,
  PRIMARY KEY (organization_id, user_id)
)
```

### 3. Skills System

#### `skills`
**Purpose**: Master list of all available skills
```sql
skills (
  id uuid PRIMARY KEY,
  name text UNIQUE NOT NULL,            -- Skill name
  category text NOT NULL,               -- Technical, Creative, Business, etc.
  description text,                     -- Skill description
  embedding vector,                     -- AI embedding for similarity
  usage_count integer DEFAULT 0,        -- How many users have this
  is_active boolean DEFAULT true,       -- Available for selection?
  created_at timestamptz,
  updated_at timestamptz
)
```

#### `member_skills`
**Purpose**: Skills possessed by users (normalized many-to-many)
```sql
member_skills (
  user_id uuid,                         -- FK to profiles(id)
  skill_id uuid,                        -- FK to skills(id)
  source text DEFAULT 'self_reported',  -- How skill was added
  verified_at timestamptz,              -- When verified (if applicable)
  endorsed_by_count integer DEFAULT 0,  -- Peer endorsements
  added_at timestamptz,
  PRIMARY KEY (user_id, skill_id)
)
```

#### `skill_progression`
**Purpose**: Track skill development over time
```sql
skill_progression (
  id uuid PRIMARY KEY,
  user_id uuid,                         -- FK to profiles(id)
  skill_id uuid,                        -- FK to skills(id)
  initial_level text,                   -- Starting proficiency
  current_level text,                   -- Current proficiency
  verified_through_work boolean,        -- Proven through tasks?
  endorsement_count integer,            -- Total endorsements
  projects_used_in integer,             -- Projects utilizing this skill
  last_used timestamptz,                -- Last project using skill
  created_at timestamptz
)
```

### 4. Projects & Tasks

#### `internal_projects`
**Purpose**: Projects within organizations
```sql
internal_projects (
  id uuid PRIMARY KEY,
  organization_id uuid,                 -- FK to organizations(id)
  name text NOT NULL,                   -- Project name
  description text,                     -- Project details
  timeline text,                        -- Duration/schedule
  status text DEFAULT 'active',         -- active, completed, paused
  visibility text DEFAULT 'internal',   -- internal, public
  created_by uuid,                      -- FK to profiles(id)
  created_at timestamptz,
  updated_at timestamptz
)
```

#### `contributions` (Tasks)
**Purpose**: Individual tasks within projects
```sql
contributions (
  id uuid PRIMARY KEY,
  project_id uuid,                      -- FK to internal_projects(id)
  contributor_id uuid,                  -- FK to profiles(id) - LEGACY
  
  -- Task details
  task_name text NOT NULL,              -- Task title
  task_description text,                -- Full description
  contribution_type text NOT NULL,      -- task, milestone, etc.
  
  -- Status tracking
  status text DEFAULT 'in_progress',    -- pending, in_progress, completed, verified
  priority text DEFAULT 'medium',       -- low, medium, high, urgent
  
  -- Time management
  estimated_hours numeric,              -- Expected time
  hours_worked numeric,                 -- Actual time spent
  due_date date,                        -- Deadline
  assigned_at timestamptz,              -- When assigned
  completed_at timestamptz,             -- When finished
  
  -- Quality
  completion_quality integer,           -- 1-5 rating
  verified_by uuid,                     -- FK to profiles(id) - reviewer
  
  -- Additional data
  skills_used text[],                   -- DEPRECATED - use task_required_skills
  assignee_notes text,                  -- Notes from assignee
  subtasks jsonb DEFAULT '[]',          -- Subtask array
  
  created_at timestamptz
)
```

**Subtask Structure** (in JSONB):
```json
{
  "id": "uuid",
  "title": "string",
  "completed": boolean,
  "created_at": "timestamp",
  "completed_at": "timestamp"
}
```

#### `task_assignees`
**Purpose**: Multiple assignees per task
```sql
task_assignees (
  id uuid PRIMARY KEY,
  task_id uuid NOT NULL,                -- FK to contributions(id)
  assignee_id uuid NOT NULL,            -- FK to profiles(id)
  assigned_by uuid,                     -- FK to profiles(id)
  is_primary boolean DEFAULT false,     -- Primary assignee?
  assigned_at timestamptz,
  created_at timestamptz
)
```

#### `task_required_skills`
**Purpose**: Skills needed for tasks
```sql
task_required_skills (
  task_id uuid,                         -- FK to contributions(id)
  skill_id uuid,                        -- FK to skills(id)
  importance text DEFAULT 'required',   -- required, preferred
  added_at timestamptz,
  PRIMARY KEY (task_id, skill_id)
)
```

### 5. Opportunities & Applications

#### `opportunities`
**Purpose**: External opportunities (jobs, internships)
```sql
opportunities (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,        -- FK to organizations(id)
  
  -- Details
  title text NOT NULL,                  -- Opportunity title
  description text NOT NULL,            -- Full description
  type text NOT NULL,                   -- internship, volunteer, paid
  difficulty text NOT NULL,             -- beginner, intermediate, advanced
  time_commitment text NOT NULL,        -- Hours per week
  
  -- Location
  location text,                        -- Physical location
  is_remote boolean DEFAULT false,      -- Remote allowed?
  
  -- Timeline
  start_date date,                      -- When it starts
  end_date date,                        -- When it ends
  application_deadline date,            -- Apply by date
  
  -- Requirements
  required_skills text[],               -- Must-have skills
  preferred_skills text[],              -- Nice-to-have skills
  skill_embeddings vector,              -- AI embeddings
  
  -- Status
  status text DEFAULT 'draft',          -- draft, active, closed
  view_count integer DEFAULT 0,         -- View tracking
  application_count integer DEFAULT 0,  -- Application tracking
  
  created_at timestamptz,
  updated_at timestamptz
)
```

#### `applications`
**Purpose**: User applications to opportunities
```sql
applications (
  id uuid PRIMARY KEY,
  opportunity_id uuid NOT NULL,         -- FK to opportunities(id)
  user_id uuid NOT NULL,                -- FK to profiles(id)
  status text DEFAULT 'pending',        -- pending, reviewed, accepted, rejected
  cover_letter text,                    -- Application letter
  resume_url text,                      -- Resume file URL
  match_score double precision,         -- AI-calculated fit score
  ai_feedback jsonb,                    -- AI analysis results
  created_at timestamptz,
  updated_at timestamptz
)
```

#### `saved_opportunities`
**Purpose**: Bookmarked opportunities
```sql
saved_opportunities (
  user_id uuid,                         -- FK to profiles(id)
  opportunity_id uuid,                  -- FK to opportunities(id)
  saved_at timestamptz,
  PRIMARY KEY (user_id, opportunity_id)
)
```

### 6. Organization Management

#### `organization_roles`
**Purpose**: Leadership positions within organizations
```sql
organization_roles (
  id uuid PRIMARY KEY,
  organization_id uuid,                 -- FK to organizations(id)
  title text NOT NULL,                  -- Role title
  description text,                     -- Role responsibilities
  required_skills text[],               -- Skills needed
  current_holder_id uuid,               -- FK to profiles(id)
  term_end_date date,                   -- When term ends
  created_at timestamptz,
  updated_at timestamptz
)
```

#### `organization_skill_needs`
**Purpose**: Track skill gaps in organizations
```sql
organization_skill_needs (
  id uuid PRIMARY KEY,
  organization_id uuid,                 -- FK to organizations(id)
  skill_id uuid,                        -- FK to skills(id)
  need_type text NOT NULL,              -- immediate, recurring, future
  frequency text,                       -- How often needed
  last_fulfilled timestamptz,           -- Last time had this skill
  current_gap_level integer,            -- 1-5 severity
  created_at timestamptz,
  updated_at timestamptz
)
```

### 7. Analytics & Tracking

#### `organization_analytics`
**Purpose**: Calculated metrics for organizations
```sql
organization_analytics (
  id uuid PRIMARY KEY,
  organization_id uuid,                 -- FK to organizations(id)
  skill_sufficiency_score double,       -- 0-1 skill coverage
  project_completion_rate double,       -- 0-1 completion rate
  member_utilization_rate double,       -- 0-1 member activity
  external_dependency_rate double,      -- 0-1 external help needed
  active_members integer,               -- Active member count
  total_projects integer,               -- Total projects
  calculated_at timestamptz
)
```

#### `user_activities`
**Purpose**: Activity log for users
```sql
user_activities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,                -- FK to profiles(id)
  action text NOT NULL,                 -- viewed, created, completed, etc.
  resource_type text NOT NULL,          -- task, project, opportunity
  resource_id uuid,                     -- ID of resource
  metadata jsonb,                       -- Additional context
  created_at timestamptz
)
```

### 8. User Experience

#### `onboarding_progress`
**Purpose**: Track user onboarding completion
```sql
onboarding_progress (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE,                  -- FK to profiles(id)
  user_type text NOT NULL,              -- student, org_leader, etc.
  steps_completed jsonb DEFAULT '{}',   -- {step_name: boolean}
  last_prompt_shown text,               -- Last prompt ID
  last_prompt_timestamp timestamptz,    -- When shown
  completion_percentage double,         -- 0-1 completion
  quality_score double,                 -- Profile quality score
  created_at timestamptz,
  updated_at timestamptz
)
```

#### `contextual_prompts`
**Purpose**: Smart prompts to guide users
```sql
contextual_prompts (
  id uuid PRIMARY KEY,
  prompt_type text NOT NULL,            -- Type of prompt
  trigger_condition text NOT NULL,      -- When to show
  title text NOT NULL,                  -- Prompt title
  message text NOT NULL,                -- Prompt content
  action_text text,                     -- CTA button text
  shown_to_users integer DEFAULT 0,     -- Display count
  completed_by_users integer DEFAULT 0, -- Completion count
  conversion_rate double,               -- Calculated rate
  active boolean DEFAULT true,          -- Currently active?
  created_at timestamptz
)
```

#### `invitations`
**Purpose**: Invite users to organizations
```sql
invitations (
  id uuid PRIMARY KEY,
  inviter_id uuid,                      -- FK to profiles(id)
  invitee_email text NOT NULL,          -- Email to invite
  organization_id uuid,                 -- FK to organizations(id)
  invitation_code text UNIQUE,          -- Unique invite code
  status text DEFAULT 'sent',           -- sent, opened, accepted
  sent_at timestamptz,
  opened_at timestamptz,
  accepted_at timestamptz,
  expires_at timestamptz                -- 7 days default
)
```

### 9. Assessment System

#### `user_assessments`
**Purpose**: Store assessment results
```sql
user_assessments (
  id uuid PRIMARY KEY,
  user_id uuid,                         -- FK to profiles(id)
  assessment_type text NOT NULL,        -- personality, skills, etc.
  raw_scores jsonb NOT NULL,            -- Raw assessment data
  computed_profile jsonb,               -- Processed results
  context text,                         -- Assessment context
  completed_at timestamptz
)
```

#### `user_psychometrics`
**Purpose**: Psychometric profiling
```sql
user_psychometrics (
  user_id uuid,                         -- FK to profiles(id)
  assessment_type text,                 -- Assessment name
  raw_scores jsonb NOT NULL,            -- Raw data
  computed_profile text,                -- Profile type
  percentile_scores jsonb,              -- Percentile rankings
  assessed_at timestamptz,
  context text,                         -- Context/notes
  PRIMARY KEY (user_id, assessment_type)
)
```

### 10. Backup Tables

#### `skills_array_backup`
**Purpose**: Backup of old skills array data
```sql
skills_array_backup (
  id uuid,
  full_name text,
  skills text[],
  backed_up_at timestamptz
)
```

## Optimization Recommendations

### 1. Missing Indexes (High Priority)
```sql
-- Foreign key indexes (critical for joins)
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_contributions_project_id ON contributions(project_id);
CREATE INDEX idx_contributions_contributor_id ON contributions(contributor_id);
CREATE INDEX idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_assignee_id ON task_assignees(assignee_id);
CREATE INDEX idx_member_skills_skill_id ON member_skills(skill_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);

-- Query optimization indexes
CREATE INDEX idx_contributions_status ON contributions(status) WHERE status != 'completed';
CREATE INDEX idx_opportunities_status ON opportunities(status) WHERE status = 'active';
CREATE INDEX idx_org_slug ON organizations(slug); -- Already UNIQUE but good to note
CREATE INDEX idx_profiles_username ON profiles(username); -- Already UNIQUE
CREATE INDEX idx_skills_name ON skills(name); -- Already UNIQUE
CREATE INDEX idx_skills_category ON skills(category);
```

### 2. Data Type Improvements
```sql
-- Create proper enums instead of text with CHECK constraints
CREATE TYPE user_role AS ENUM ('member', 'admin', 'president', 'vice_president', 'treasurer', 'secretary', 'tech_lead');
CREATE TYPE contribution_status AS ENUM ('pending', 'in_progress', 'completed', 'verified');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE skill_source AS ENUM ('self_reported', 'task_verified', 'peer_endorsed');
CREATE TYPE opportunity_type AS ENUM ('internship', 'volunteer', 'paid', 'research', 'project');
CREATE TYPE opportunity_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
```

### 3. Missing Tables
```sql
-- Universities table (referenced by profiles)
CREATE TABLE universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE, -- edu domain
  location text,
  logo_url text,
  student_count integer,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key
ALTER TABLE profiles 
ADD CONSTRAINT profiles_university_id_fkey 
FOREIGN KEY (university_id) REFERENCES universities(id);
```

### 4. Schema Normalization Issues

**Remove redundant columns:**
- `contributions.skills_used` - use `task_required_skills` instead
- `contributions.contributor_id` - use `task_assignees` instead
- Consider moving embeddings to separate table

**Embeddings table (optional):**
```sql
CREATE TABLE embeddings (
  entity_type text NOT NULL, -- 'profile', 'skill', 'opportunity'
  entity_id uuid NOT NULL,
  embedding_type text NOT NULL, -- 'skill', 'interest'
  embedding vector(1536),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id, embedding_type)
);
```

### 5. Data Integrity Constraints
```sql
-- Ensure at least one assignee per task
CREATE OR REPLACE FUNCTION check_task_has_assignee() 
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM task_assignees WHERE task_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Task must have at least one assignee';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure member_count accuracy
CREATE OR REPLACE FUNCTION update_organization_member_count() 
RETURNS trigger AS $$
BEGIN
  UPDATE organizations 
  SET member_count = (
    SELECT COUNT(*) FROM organization_members 
    WHERE organization_id = COALESCE(NEW.organization_id, OLD.organization_id)
  )
  WHERE id = COALESCE(NEW.organization_id, OLD.organization_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_member_count
AFTER INSERT OR DELETE ON organization_members
FOR EACH ROW EXECUTE FUNCTION update_organization_member_count();
```

### 6. Performance Optimizations

**Materialized views for analytics:**
```sql
CREATE MATERIALIZED VIEW org_skill_coverage AS
SELECT 
  o.id as org_id,
  s.id as skill_id,
  s.name as skill_name,
  COUNT(DISTINCT ms.user_id) as members_with_skill
FROM organizations o
CROSS JOIN skills s
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN member_skills ms ON ms.user_id = om.user_id AND ms.skill_id = s.id
GROUP BY o.id, s.id, s.name;

CREATE INDEX idx_org_skill_coverage ON org_skill_coverage(org_id, skill_id);
```

**Partial indexes for common queries:**
```sql
-- Active tasks only
CREATE INDEX idx_active_contributions 
ON contributions(project_id, status) 
WHERE status IN ('pending', 'in_progress');

-- Recent activities
CREATE INDEX idx_recent_activities 
ON user_activities(user_id, created_at DESC) 
WHERE created_at > (CURRENT_DATE - INTERVAL '30 days');
```

### 7. Cleanup Recommendations

1. **Drop unused columns:**
   - `profiles.psychometric_profile` (if not implementing)
   - `profiles.assessment_status` (if not implementing)
   - `contributions.skills_used` (replaced by task_required_skills)

2. **Archive old data:**
   - Move completed tasks older than 1 year to archive table
   - Clean up expired invitations

3. **Add cascading deletes:**
   ```sql
   ALTER TABLE member_skills 
   DROP CONSTRAINT member_skills_user_id_fkey,
   ADD CONSTRAINT member_skills_user_id_fkey 
   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
   ```

## Implementation Status

### ✅ Implemented & Working
- User profiles and authentication
- Organizations and membership
- Skills system (normalized)
- Projects and tasks
- Multiple task assignees
- Subtasks (as JSONB)

### 🚧 Partially Implemented
- Opportunities (table exists, no UI)
- Applications (table exists, no UI)
- Organization analytics (table exists, not calculated)
- Skill progression (table exists, not tracked)

### ❌ Not Implemented
- Universities table
- Psychometric assessments
- Contextual prompts system
- Organization roles
- Invitations flow
- Activity tracking

### 🗑️ To Be Removed
- `contributions.skills_used` column
- `profiles.skills` column (already removed)
- `profiles.skill_embeddings` column (already removed)
- Psychometric columns if not using