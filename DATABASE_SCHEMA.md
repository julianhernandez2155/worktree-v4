# Worktree v4 - Database Schema
*Last Updated: June 30, 2025*

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

## Tables Overview

### applications (LEGACY - replaced by project_applications)
```sql
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  opportunity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::application_status,
  cover_letter text,
  resume_url text,
  match_score double precision,
  ai_feedback jsonb,
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id),
  CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### contextual_prompts
```sql
CREATE TABLE public.contextual_prompts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  prompt_type text NOT NULL,
  trigger_condition text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_text text,
  shown_to_users integer DEFAULT 0,
  completed_by_users integer DEFAULT 0,
  conversion_rate double precision DEFAULT 
CASE
    WHEN (shown_to_users > 0) THEN ((completed_by_users)::double precision / (shown_to_users)::double precision)
    ELSE (0)::double precision
END,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contextual_prompts_pkey PRIMARY KEY (id)
);
```

### contributions (Tasks)
```sql
CREATE TABLE public.contributions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  contributor_id uuid,
  task_name text NOT NULL,
  task_description text,
  skills_used ARRAY,
  hours_worked numeric,
  completion_quality integer CHECK (completion_quality >= 1 AND completion_quality <= 5),
  verified_by uuid,
  contribution_type text NOT NULL,
  status text DEFAULT 'in_progress'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'verified'::text])),
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  due_date date,
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])),
  assigned_at timestamp with time zone,
  assignee_notes text,
  estimated_hours numeric,
  subtasks jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT contributions_pkey PRIMARY KEY (id),
  CONSTRAINT contributions_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.profiles(id),
  CONSTRAINT contributions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id),
  CONSTRAINT contributions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.internal_projects(id)
);
```

### internal_projects
```sql
CREATE TABLE public.internal_projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid,
  name text NOT NULL,
  description text,
  timeline text,
  status text DEFAULT 'active'::text,
  created_by uuid,
  visibility text DEFAULT 'internal'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_public boolean DEFAULT false,
  max_applicants integer,
  application_deadline timestamp with time zone,
  required_commitment_hours integer,
  preferred_start_date date,
  public_description text,
  application_requirements text,
  published_at timestamp with time zone,
  view_count integer DEFAULT 0,
  application_count integer DEFAULT 0,
  achievement text,
  image_url text,
  CONSTRAINT internal_projects_pkey PRIMARY KEY (id),
  CONSTRAINT internal_projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT internal_projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
```

### invitations
```sql
CREATE TABLE public.invitations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  inviter_id uuid,
  invitee_email text NOT NULL,
  organization_id uuid,
  invitation_code text DEFAULT (gen_random_uuid())::text UNIQUE,
  status text DEFAULT 'sent'::text,
  sent_at timestamp with time zone DEFAULT now(),
  opened_at timestamp with time zone,
  accepted_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
  CONSTRAINT invitations_pkey PRIMARY KEY (id),
  CONSTRAINT invitations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT invitations_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES public.profiles(id)
);
```

### member_skills
```sql
CREATE TABLE public.member_skills (
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  source text DEFAULT 'self_reported'::text CHECK (source = ANY (ARRAY['self_reported'::text, 'task_verified'::text, 'peer_endorsed'::text])),
  verified_at timestamp with time zone,
  endorsed_by_count integer DEFAULT 0,
  CONSTRAINT member_skills_pkey PRIMARY KEY (user_id, skill_id),
  CONSTRAINT member_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id),
  CONSTRAINT member_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### onboarding_progress
```sql
CREATE TABLE public.onboarding_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  user_type text NOT NULL,
  steps_completed jsonb DEFAULT '{}'::jsonb,
  last_prompt_shown text,
  last_prompt_timestamp timestamp with time zone,
  completion_percentage double precision DEFAULT 0.0,
  quality_score double precision,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT onboarding_progress_pkey PRIMARY KEY (id),
  CONSTRAINT onboarding_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### opportunities (LEGACY - replaced by internal_projects)
```sql
CREATE TABLE public.opportunities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  type USER-DEFINED NOT NULL,
  difficulty USER-DEFINED NOT NULL,
  time_commitment text NOT NULL,
  location text,
  is_remote boolean DEFAULT false,
  start_date date,
  end_date date,
  application_deadline date,
  required_skills ARRAY DEFAULT '{}'::text[],
  preferred_skills ARRAY DEFAULT '{}'::text[],
  skill_embeddings USER-DEFINED,
  status USER-DEFINED DEFAULT 'draft'::opportunity_status,
  view_count integer DEFAULT 0,
  application_count integer DEFAULT 0,
  CONSTRAINT opportunities_pkey PRIMARY KEY (id),
  CONSTRAINT opportunities_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
```

### organization_analytics
```sql
CREATE TABLE public.organization_analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid,
  skill_sufficiency_score double precision,
  project_completion_rate double precision,
  member_utilization_rate double precision,
  external_dependency_rate double precision,
  active_members integer,
  total_projects integer,
  calculated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT organization_analytics_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
```

### organization_members
```sql
CREATE TABLE public.organization_members (
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_members_pkey PRIMARY KEY (organization_id, user_id),
  CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### organization_roles
```sql
CREATE TABLE public.organization_roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid,
  title text NOT NULL,
  description text,
  required_skills ARRAY,
  current_holder_id uuid,
  term_end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_roles_pkey PRIMARY KEY (id),
  CONSTRAINT organization_roles_current_holder_id_fkey FOREIGN KEY (current_holder_id) REFERENCES public.profiles(id),
  CONSTRAINT organization_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
```

### organization_skill_needs
```sql
CREATE TABLE public.organization_skill_needs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid,
  skill_id uuid,
  need_type text NOT NULL,
  frequency text,
  last_fulfilled timestamp with time zone,
  current_gap_level integer CHECK (current_gap_level >= 1 AND current_gap_level <= 5),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_skill_needs_pkey PRIMARY KEY (id),
  CONSTRAINT organization_skill_needs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_skill_needs_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
```

### organizations
```sql
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'::text),
  description text,
  logo_url text,
  website text,
  verified boolean DEFAULT false,
  admin_id uuid NOT NULL,
  member_count integer DEFAULT 1,
  category text NOT NULL,
  mission text,
  what_we_do text,
  values ARRAY,
  email text,
  location text,
  social_links jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof(social_links) = 'array'::text),
  meeting_schedule jsonb DEFAULT '{}'::jsonb,
  join_process text,
  founded_date date,
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id)
);
```

### profiles
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  username text UNIQUE CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  full_name text,
  avatar_url text,
  bio text,
  year_of_study text,
  major text,
  interests ARRAY DEFAULT '{}'::text[],
  looking_for ARRAY DEFAULT '{}'::text[],
  interest_embeddings USER-DEFINED,
  user_type ARRAY DEFAULT '{}'::text[],
  primary_role text,
  psychometric_profile jsonb DEFAULT '{}'::jsonb,
  assessment_status jsonb DEFAULT '{}'::jsonb,
  profile_completeness double precision DEFAULT 0.0,
  last_assessment_prompt timestamp with time zone,
  onboarding_completed boolean DEFAULT false,
  university_id uuid,
  email text,
  tagline text CHECK (char_length(tagline) <= 100),
  external_links jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof(external_links) = 'array'::text),
  cover_photo_url text,
  open_to_opportunities boolean DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

### project_applications
```sql
CREATE TABLE public.project_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  applicant_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text])),
  cover_letter text,
  portfolio_urls ARRAY,
  availability_hours_per_week integer,
  expected_start_date date,
  skill_match_score double precision,
  matched_skills ARRAY,
  missing_skills ARRAY,
  applied_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  reviewer_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_applications_pkey PRIMARY KEY (id),
  CONSTRAINT project_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id),
  CONSTRAINT project_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.profiles(id),
  CONSTRAINT project_applications_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.internal_projects(id)
);
```

### project_views
```sql
CREATE TABLE public.project_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  viewer_id uuid,
  viewed_at timestamp with time zone DEFAULT now(),
  view_duration_seconds integer,
  referrer text,
  CONSTRAINT project_views_pkey PRIMARY KEY (id),
  CONSTRAINT project_views_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.internal_projects(id),
  CONSTRAINT project_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id)
);
```

### saved_opportunities (LEGACY)
```sql
CREATE TABLE public.saved_opportunities (
  user_id uuid NOT NULL,
  opportunity_id uuid NOT NULL,
  saved_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_opportunities_pkey PRIMARY KEY (user_id, opportunity_id),
  CONSTRAINT saved_opportunities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT saved_opportunities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id)
);
```

### saved_projects
```sql
CREATE TABLE public.saved_projects (
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  saved_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_projects_pkey PRIMARY KEY (user_id, project_id),
  CONSTRAINT saved_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT saved_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.internal_projects(id)
);
```

### skill_progression
```sql
CREATE TABLE public.skill_progression (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  skill_id uuid,
  initial_level USER-DEFINED,
  current_level USER-DEFINED,
  verified_through_work boolean DEFAULT false,
  endorsement_count integer DEFAULT 0,
  projects_used_in integer DEFAULT 0,
  last_used timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT skill_progression_pkey PRIMARY KEY (id),
  CONSTRAINT skill_progression_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT skill_progression_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
```

### skills
```sql
CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  embedding USER-DEFINED,
  usage_count integer DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);
```

### skills_array_backup
```sql
CREATE TABLE public.skills_array_backup (
  id uuid,
  full_name text,
  skills ARRAY,
  backed_up_at timestamp with time zone
);
```

### task_assignees
```sql
CREATE TABLE public.task_assignees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL,
  assignee_id uuid NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_assignees_pkey PRIMARY KEY (id),
  CONSTRAINT task_assignees_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.profiles(id),
  CONSTRAINT task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.contributions(id),
  CONSTRAINT task_assignees_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.profiles(id)
);
```

### task_required_skills
```sql
CREATE TABLE public.task_required_skills (
  task_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  importance text DEFAULT 'required'::text CHECK (importance = ANY (ARRAY['required'::text, 'preferred'::text])),
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_required_skills_pkey PRIMARY KEY (task_id, skill_id),
  CONSTRAINT task_required_skills_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.contributions(id),
  CONSTRAINT task_required_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
```

### universities
```sql
CREATE TABLE public.universities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE,
  location text,
  logo_url text,
  student_count integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT universities_pkey PRIMARY KEY (id)
);
```

### user_activities
```sql
CREATE TABLE public.user_activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_activities_pkey PRIMARY KEY (id),
  CONSTRAINT user_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### user_assessments
```sql
CREATE TABLE public.user_assessments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  assessment_type text NOT NULL,
  raw_scores jsonb NOT NULL,
  computed_profile jsonb,
  context text,
  completed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_assessments_pkey PRIMARY KEY (id),
  CONSTRAINT user_assessments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### user_psychometrics
```sql
CREATE TABLE public.user_psychometrics (
  user_id uuid NOT NULL,
  assessment_type text NOT NULL,
  raw_scores jsonb NOT NULL,
  computed_profile text,
  percentile_scores jsonb,
  assessed_at timestamp with time zone DEFAULT now(),
  context text,
  CONSTRAINT user_psychometrics_pkey PRIMARY KEY (user_id, assessment_type),
  CONSTRAINT user_psychometrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

## Key Relationships

### User-Centric Relationships
- `profiles` → `organization_members` → `organizations`
- `profiles` → `task_assignees` → `contributions`
- `profiles` → `member_skills` → `skills`
- `profiles` → `project_applications` → `internal_projects`

### Organization-Centric Relationships
- `organizations` → `internal_projects`
- `organizations` → `organization_members` → `profiles`
- `organizations` → `organization_roles`
- `organizations` → `organization_skill_needs` → `skills`

### Project-Centric Relationships
- `internal_projects` → `contributions` → `task_assignees` → `profiles`
- `internal_projects` → `project_applications` → `profiles`
- `contributions` → `task_required_skills` → `skills`

## Important Notes

1. **Legacy Tables**: 
   - `opportunities` and `applications` are legacy tables replaced by `internal_projects` and `project_applications`
   - `saved_opportunities` references the legacy opportunities table

2. **USER-DEFINED Types**: 
   - Several columns use custom types that are defined in Supabase but not shown in this schema
   - Examples: application_status, opportunity_status, skill levels, embeddings

3. **Key Patterns**:
   - All primary keys are UUIDs with default `uuid_generate_v4()` or `gen_random_uuid()`
   - Most tables have `created_at` and `updated_at` timestamps
   - JSONB is used for flexible data (subtasks, social_links, metadata)
   - Arrays are used for simple lists (skills, values)

4. **Normalized Skills**:
   - Skills are normalized through `member_skills` junction table
   - The `skills_array_backup` table appears to be from a migration

5. **Task System**:
   - `contributions` table represents tasks despite its name
   - `contributor_id` field is legacy - use `task_assignees` for multiple assignee support

## Optimization Notes

### Implemented Indexes (from migration 016)
- All foreign key relationships have indexes
- Common query patterns are indexed
- Full-text search indexes using pg_trgm

### RPC Functions (from migration 017)
- `get_projects_with_skills_and_status` - Optimized project discovery
- `get_organization_members_with_skills` - Optimized member directory
- `get_user_contributions_with_context` - Optimized portfolio queries