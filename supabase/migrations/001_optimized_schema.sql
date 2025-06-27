-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query performance monitoring

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'leader', 'admin');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'completed', 'archived');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'blocked');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for universities
CREATE INDEX idx_universities_domain ON universities(domain);
CREATE INDEX idx_universities_created_at ON universities(created_at DESC);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'student',
    profile_picture_url TEXT,
    bio TEXT,
    graduation_year INTEGER,
    major VARCHAR(255),
    settings JSONB DEFAULT '{}',
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for users
CREATE INDEX idx_users_university_id ON users(university_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_active ON users(last_active_at DESC);
CREATE INDEX idx_users_graduation_year ON users(graduation_year);
-- Full text search on name
CREATE INDEX idx_users_name_search ON users USING gin(
    to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    category VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(university_id, slug)
);

-- Performance indexes for organizations
CREATE INDEX idx_orgs_university_id ON organizations(university_id);
CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_category ON organizations(category);
CREATE INDEX idx_orgs_active_verified ON organizations(is_active, is_verified) WHERE is_active = true;
CREATE INDEX idx_orgs_member_count ON organizations(member_count DESC);
-- Full text search
CREATE INDEX idx_orgs_search ON organizations USING gin(
    to_tsvector('english', name || ' ' || coalesce(description, ''))
);

-- Skills table with categories
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    description TEXT,
    icon VARCHAR(50),
    is_verified BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for skills
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_usage ON skills(usage_count DESC);
-- Trigram index for fuzzy search
CREATE INDEX idx_skills_name_trgm ON skills USING gin(name gin_trgm_ops);

-- Organization members with roles
CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    PRIMARY KEY (organization_id, user_id)
);

-- Performance indexes for organization members
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);
CREATE INDEX idx_org_members_active ON organization_members(is_active) WHERE is_active = true;
CREATE INDEX idx_org_members_joined_at ON organization_members(joined_at DESC);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    max_members INTEGER,
    current_members INTEGER DEFAULT 0,
    time_commitment_hours_per_week INTEGER,
    is_recruiting BOOLEAN DEFAULT true,
    tags TEXT[],
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- Performance indexes for projects
CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_recruiting ON projects(is_recruiting) WHERE is_recruiting = true;
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_tags ON projects USING gin(tags);
-- Composite index for common queries
CREATE INDEX idx_projects_active_recruiting ON projects(organization_id, status, is_recruiting) 
    WHERE status IN ('planning', 'active') AND is_recruiting = true;

-- Project members
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    contribution_hours DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (project_id, user_id)
);

-- Performance indexes for project members
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
CREATE INDEX idx_project_members_active ON project_members(is_active) WHERE is_active = true;

-- User skills with proficiency
CREATE TABLE user_skills (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level skill_level DEFAULT 'beginner',
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    endorsed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, skill_id)
);

-- Performance indexes for user skills
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX idx_user_skills_verified ON user_skills(is_verified) WHERE is_verified = true;
CREATE INDEX idx_user_skills_level ON user_skills(level);
CREATE INDEX idx_user_skills_endorsed ON user_skills(endorsed_count DESC);

-- Project required skills
CREATE TABLE project_skills (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level skill_level DEFAULT 'beginner',
    is_required BOOLEAN DEFAULT true,
    PRIMARY KEY (project_id, skill_id)
);

-- Performance indexes
CREATE INDEX idx_project_skills_skill_id ON project_skills(skill_id);
CREATE INDEX idx_project_skills_required ON project_skills(is_required) WHERE is_required = true;

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    priority INTEGER DEFAULT 0,
    due_date DATE,
    estimated_hours DECIMAL(10,2),
    actual_hours DECIMAL(10,2),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Performance indexes for tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
-- Composite index for task boards
CREATE INDEX idx_tasks_board_view ON tasks(project_id, status, priority DESC);

-- Applications for projects
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    message TEXT,
    response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    UNIQUE(project_id, user_id)
);

-- Performance indexes
CREATE INDEX idx_applications_project_id ON applications(project_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_pending ON applications(project_id, status) WHERE status = 'pending';

-- Activity feed for real-time updates
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(100),
    target_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for activities
CREATE INDEX idx_activities_actor_id ON activities(actor_id);
CREATE INDEX idx_activities_org_id ON activities(organization_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
-- Composite index for feed queries
CREATE INDEX idx_activities_feed ON activities(organization_id, created_at DESC);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Analytics events for tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for analytics
CREATE TABLE analytics_events_2025_01 PARTITION OF analytics_events
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE analytics_events_2025_02 PARTITION OF analytics_events
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- Add more partitions as needed

-- Indexes for analytics
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Materialized view for skill demand analytics
CREATE MATERIALIZED VIEW skill_demand_analytics AS
SELECT 
    s.id,
    s.name,
    s.category,
    COUNT(DISTINCT ps.project_id) as projects_requiring,
    COUNT(DISTINCT us.user_id) as users_with_skill,
    AVG(CASE WHEN us.level = 'beginner' THEN 1
             WHEN us.level = 'intermediate' THEN 2
             WHEN us.level = 'advanced' THEN 3
             WHEN us.level = 'expert' THEN 4
        END) as avg_skill_level
FROM skills s
LEFT JOIN project_skills ps ON s.id = ps.skill_id
LEFT JOIN user_skills us ON s.id = us.skill_id
GROUP BY s.id, s.name, s.category;

-- Index for the materialized view
CREATE INDEX idx_skill_demand_projects ON skill_demand_analytics(projects_requiring DESC);

-- Function to update member counts
CREATE OR REPLACE FUNCTION update_member_counts() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE organizations 
        SET member_count = member_count + 1 
        WHERE id = NEW.organization_id;
        
        UPDATE projects 
        SET current_members = current_members + 1 
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE organizations 
        SET member_count = member_count - 1 
        WHERE id = OLD.organization_id;
        
        UPDATE projects 
        SET current_members = current_members - 1 
        WHERE id = OLD.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for member count updates
CREATE TRIGGER update_org_member_count
AFTER INSERT OR DELETE ON organization_members
FOR EACH ROW EXECUTE FUNCTION update_member_counts();

CREATE TRIGGER update_project_member_count
AFTER INSERT OR DELETE ON project_members
FOR EACH ROW EXECUTE FUNCTION update_member_counts();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and other profiles at their university
CREATE POLICY users_select_policy ON users FOR SELECT
    USING (auth.uid() = id OR university_id IN (
        SELECT university_id FROM users WHERE id = auth.uid()
    ));

-- Users can update their own profile
CREATE POLICY users_update_policy ON users FOR UPDATE
    USING (auth.uid() = id);

-- Organizations visible to users at the same university
CREATE POLICY orgs_select_policy ON organizations FOR SELECT
    USING (university_id IN (
        SELECT university_id FROM users WHERE id = auth.uid()
    ));

-- Project visibility based on organization membership
CREATE POLICY projects_select_policy ON projects FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
        OR is_recruiting = true
    );

-- Task visibility for project members
CREATE POLICY tasks_select_policy ON tasks FOR SELECT
    USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Users can only see their own applications
CREATE POLICY applications_select_policy ON applications FOR SELECT
    USING (user_id = auth.uid());

-- Users can only see their own notifications
CREATE POLICY notifications_select_policy ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;