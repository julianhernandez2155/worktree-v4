# Worktree v4 Database Schema

## Overview
This document provides the current database schema for Worktree v4, organized by functional areas.

## Core Tables

### Users & Profiles
```sql
-- User profiles linked to Supabase auth
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE,
  full_name text,
  email text,
  avatar_url text,
  bio text,
  year_of_study text,
  major text,
  university_id uuid,
  -- Arrays for interests/preferences
  interests text[],
  looking_for text[],
  user_type text[],
  primary_role text,
  -- Profile metadata
  profile_completeness double precision DEFAULT 0.0,
  onboarding_completed boolean DEFAULT false,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Organizations
```sql
-- Student organizations
organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL, -- URL-friendly identifier
  description text,
  category text NOT NULL,
  admin_id uuid REFERENCES profiles(id),
  -- Metadata
  logo_url text,
  website text,
  verified boolean DEFAULT false,
  member_count integer DEFAULT 1,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Organization membership
organization_members (
  organization_id uuid REFERENCES organizations(id),
  user_id uuid REFERENCES profiles(id),
  role text DEFAULT 'member', -- member, admin, president, etc.
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
)
```

## Skills System

### Skills
```sql
-- Master list of skills
skills (
  id uuid PRIMARY KEY,
  name text UNIQUE NOT NULL,
  category text NOT NULL, -- Technical, Creative, Business, etc.
  description text,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- User skills (normalized)
member_skills (
  user_id uuid REFERENCES profiles(id),
  skill_id uuid REFERENCES skills(id),
  source text DEFAULT 'self_reported', -- self_reported, task_verified, peer_endorsed
  verified_at timestamptz,
  endorsed_by_count integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
)

-- Skill progression tracking
skill_progression (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  skill_id uuid REFERENCES skills(id),
  initial_level text, -- beginner, intermediate, advanced
  current_level text,
  verified_through_work boolean DEFAULT false,
  endorsement_count integer DEFAULT 0,
  projects_used_in integer DEFAULT 0,
  last_used timestamptz,
  created_at timestamptz DEFAULT now()
)
```

## Projects & Tasks

### Projects
```sql
-- Internal organization projects
internal_projects (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  description text,
  timeline text,
  status text DEFAULT 'active', -- active, completed, paused
  visibility text DEFAULT 'internal', -- internal, public
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Tasks (Contributions)
```sql
-- Tasks/contributions within projects
contributions (
  id uuid PRIMARY KEY,
  project_id uuid REFERENCES internal_projects(id),
  contributor_id uuid REFERENCES profiles(id), -- Legacy single assignee
  -- Task details
  task_name text NOT NULL,
  task_description text,
  contribution_type text NOT NULL, -- task, milestone, etc.
  -- Status & priority
  status text DEFAULT 'in_progress', -- pending, in_progress, completed, verified
  priority text DEFAULT 'medium', -- low, medium, high, urgent
  -- Time tracking
  estimated_hours numeric,
  hours_worked numeric,
  due_date date,
  assigned_at timestamptz,
  completed_at timestamptz,
  -- Quality & verification
  completion_quality integer CHECK (completion_quality BETWEEN 1 AND 5),
  verified_by uuid REFERENCES profiles(id),
  -- Notes & subtasks
  assignee_notes text,
  subtasks jsonb DEFAULT '[]', -- Array of {id, title, completed, created_at}
  -- Metadata
  created_at timestamptz DEFAULT now()
)

-- Multiple assignees support
task_assignees (
  id uuid PRIMARY KEY,
  task_id uuid REFERENCES contributions(id),
  assignee_id uuid REFERENCES profiles(id),
  assigned_by uuid REFERENCES profiles(id),
  is_primary boolean DEFAULT false,
  assigned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
)

-- Required skills for tasks
task_required_skills (
  task_id uuid REFERENCES contributions(id),
  skill_id uuid REFERENCES skills(id),
  importance text DEFAULT 'required', -- required, preferred
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (task_id, skill_id)
)
```

## Opportunities & Applications

### Opportunities
```sql
-- External opportunities (jobs, internships, etc.)
opportunities (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  -- Details
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL, -- internship, volunteer, paid, etc.
  difficulty text NOT NULL, -- beginner, intermediate, advanced
  time_commitment text NOT NULL,
  -- Location
  location text,
  is_remote boolean DEFAULT false,
  -- Timeline
  start_date date,
  end_date date,
  application_deadline date,
  -- Skills
  required_skills text[] DEFAULT '{}',
  preferred_skills text[] DEFAULT '{}',
  -- Status & metrics
  status text DEFAULT 'draft', -- draft, active, closed
  view_count integer DEFAULT 0,
  application_count integer DEFAULT 0,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Applications to opportunities
applications (
  id uuid PRIMARY KEY,
  opportunity_id uuid REFERENCES opportunities(id),
  user_id uuid REFERENCES profiles(id),
  status text DEFAULT 'pending', -- pending, reviewed, accepted, rejected
  cover_letter text,
  resume_url text,
  match_score double precision, -- AI-calculated match
  ai_feedback jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Saved opportunities
saved_opportunities (
  user_id uuid REFERENCES profiles(id),
  opportunity_id uuid REFERENCES opportunities(id),
  saved_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, opportunity_id)
)
```

## Analytics & Tracking

### Organization Analytics
```sql
organization_analytics (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  -- Metrics
  skill_sufficiency_score double precision,
  project_completion_rate double precision,
  member_utilization_rate double precision,
  external_dependency_rate double precision,
  active_members integer,
  total_projects integer,
  calculated_at timestamptz DEFAULT now()
)

-- User activity tracking
user_activities (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
)
```

## Additional Features

### Onboarding
```sql
onboarding_progress (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES profiles(id),
  user_type text NOT NULL,
  steps_completed jsonb DEFAULT '{}',
  last_prompt_shown text,
  last_prompt_timestamp timestamptz,
  completion_percentage double precision DEFAULT 0.0,
  quality_score double precision,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Invitations
```sql
invitations (
  id uuid PRIMARY KEY,
  inviter_id uuid REFERENCES profiles(id),
  invitee_email text NOT NULL,
  organization_id uuid REFERENCES organizations(id),
  invitation_code text UNIQUE,
  status text DEFAULT 'sent',
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  accepted_at timestamptz,
  expires_at timestamptz DEFAULT (now() + '7 days'::interval)
)
```

## Optimization Opportunities

### Current Issues to Address:
1. **Missing indexes** on foreign keys and frequently queried columns
2. **Redundant embeddings columns** (skill_embeddings, interest_embeddings) - consider separate table
3. **Legacy skills_used array** in contributions table - should use task_required_skills
4. **Missing universities table** referenced by profiles.university_id
5. **USER-DEFINED types** need proper enum definitions

### Recommended Optimizations:

1. **Add missing indexes**:
```sql
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_contributions_project ON contributions(project_id);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_member_skills_skill ON member_skills(skill_id);
CREATE INDEX idx_task_assignees_assignee ON task_assignees(assignee_id);
```

2. **Create enums for better type safety**:
```sql
CREATE TYPE contribution_status AS ENUM ('pending', 'in_progress', 'completed', 'verified');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE skill_source AS ENUM ('self_reported', 'task_verified', 'peer_endorsed');
```

3. **Add universities table**:
```sql
CREATE TABLE universities (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  domain text UNIQUE,
  location text,
  created_at timestamptz DEFAULT now()
);
```

4. **Consider moving embeddings to separate table**:
```sql
CREATE TABLE profile_embeddings (
  user_id uuid REFERENCES profiles(id),
  embedding_type text, -- skill, interest
  embedding vector(1536), -- or appropriate dimension
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, embedding_type)
);
```

## Notes
- All timestamps use `timestamptz` (timestamp with time zone)
- UUIDs are used for all primary keys
- Composite primary keys used for junction tables
- JSONB used for flexible structured data (subtasks, metadata)
- Arrays used for simple lists (interests, user_type)