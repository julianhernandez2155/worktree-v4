-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE opportunity_type AS ENUM ('project', 'internship', 'research', 'volunteer', 'job', 'event');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE opportunity_status AS ENUM ('draft', 'active', 'closed', 'archived');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    year_of_study TEXT,
    major TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    looking_for TEXT[] DEFAULT '{}',
    skill_embeddings vector(1536),
    interest_embeddings vector(1536),
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30)
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    verified BOOLEAN DEFAULT FALSE,
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 1,
    category TEXT NOT NULL,
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Organization members junction table
CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (organization_id, user_id)
);

-- Opportunities table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type opportunity_type NOT NULL,
    difficulty difficulty_level NOT NULL,
    time_commitment TEXT NOT NULL,
    location TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    application_deadline DATE,
    required_skills TEXT[] DEFAULT '{}',
    preferred_skills TEXT[] DEFAULT '{}',
    skill_embeddings vector(1536),
    status opportunity_status DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0
);

-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status application_status DEFAULT 'pending',
    cover_letter TEXT,
    resume_url TEXT,
    match_score FLOAT,
    ai_feedback JSONB,
    UNIQUE(opportunity_id, user_id)
);

-- Skills table (for autocomplete and categorization)
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    embedding vector(1536),
    usage_count INTEGER DEFAULT 0
);

-- User activity tracking
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Saved opportunities
CREATE TABLE saved_opportunities (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, opportunity_id)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX idx_profiles_interests ON profiles USING GIN(interests);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_opportunities_org_id ON opportunities(organization_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_difficulty ON opportunities(difficulty);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);

-- Create vector similarity indexes
CREATE INDEX idx_profiles_skill_embeddings ON profiles USING ivfflat (skill_embeddings vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_opportunities_skill_embeddings ON opportunities USING ivfflat (skill_embeddings vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_skills_embedding ON skills USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to match opportunities based on skill embeddings
CREATE OR REPLACE FUNCTION match_opportunities(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    limit_count int DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    organization_id UUID,
    difficulty difficulty_level,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.title,
        o.organization_id,
        o.difficulty,
        1 - (o.skill_embeddings <=> query_embedding) as similarity
    FROM opportunities o
    WHERE 
        o.status = 'active'
        AND o.skill_embeddings IS NOT NULL
        AND 1 - (o.skill_embeddings <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized recommendations for a user
CREATE OR REPLACE FUNCTION get_user_recommendations(
    user_id UUID,
    limit_count int DEFAULT 10
)
RETURNS TABLE(
    opportunity_id UUID,
    match_score float,
    reasons JSONB
) AS $$
DECLARE
    user_embedding vector(1536);
BEGIN
    -- Get user's skill embeddings
    SELECT skill_embeddings INTO user_embedding
    FROM profiles
    WHERE id = user_id;
    
    IF user_embedding IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    WITH matches AS (
        SELECT 
            o.id,
            1 - (o.skill_embeddings <=> user_embedding) as similarity,
            o.difficulty,
            o.required_skills,
            p.skills as user_skills
        FROM opportunities o
        CROSS JOIN profiles p
        WHERE 
            o.status = 'active'
            AND o.skill_embeddings IS NOT NULL
            AND p.id = user_id
            AND NOT EXISTS (
                SELECT 1 FROM applications a 
                WHERE a.opportunity_id = o.id AND a.user_id = user_id
            )
    )
    SELECT 
        id as opportunity_id,
        similarity as match_score,
        jsonb_build_object(
            'skill_match', similarity,
            'difficulty_match', CASE 
                WHEN difficulty = 'beginner' THEN 1.0
                WHEN difficulty = 'intermediate' THEN 0.8
                WHEN difficulty = 'advanced' THEN 0.6
                ELSE 0.4
            END,
            'overlapping_skills', (
                SELECT array_agg(skill) 
                FROM unnest(required_skills) skill 
                WHERE skill = ANY(user_skills)
            )
        ) as reasons
    FROM matches
    ORDER BY similarity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations: Anyone can view, members can update
CREATE POLICY "Organizations are viewable by everyone" ON organizations FOR SELECT USING (true);
CREATE POLICY "Organization admins can update" ON organizations FOR UPDATE 
    USING (auth.uid() = admin_id OR EXISTS (
        SELECT 1 FROM organization_members 
        WHERE organization_id = organizations.id 
        AND user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
    ));
CREATE POLICY "Authenticated users can create organizations" ON organizations FOR INSERT 
    WITH CHECK (auth.uid() = admin_id);

-- Organization members: Viewable by org members, manageable by admins
CREATE POLICY "Organization members viewable by members" ON organization_members FOR SELECT 
    USING (auth.uid() IN (
        SELECT user_id FROM organization_members WHERE organization_id = organization_members.organization_id
    ));
CREATE POLICY "Organization admins can manage members" ON organization_members FOR ALL 
    USING (auth.uid() IN (
        SELECT admin_id FROM organizations WHERE id = organization_members.organization_id
    ));

-- Opportunities: Public read, org members can manage
CREATE POLICY "Active opportunities are viewable by everyone" ON opportunities FOR SELECT 
    USING (status = 'active' OR organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
CREATE POLICY "Organization members can manage opportunities" ON opportunities FOR ALL 
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Applications: Users can view their own, orgs can view applications to their opportunities
CREATE POLICY "Users can view own applications" ON applications FOR SELECT 
    USING (user_id = auth.uid() OR opportunity_id IN (
        SELECT id FROM opportunities WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));
CREATE POLICY "Users can create own applications" ON applications FOR INSERT 
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own applications" ON applications FOR UPDATE 
    USING (user_id = auth.uid());

-- User activities: Users can only see their own
CREATE POLICY "Users can view own activities" ON user_activities FOR SELECT 
    USING (user_id = auth.uid());
CREATE POLICY "Users can insert own activities" ON user_activities FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Saved opportunities: Users can only manage their own
CREATE POLICY "Users can manage own saved opportunities" ON saved_opportunities FOR ALL 
    USING (user_id = auth.uid());