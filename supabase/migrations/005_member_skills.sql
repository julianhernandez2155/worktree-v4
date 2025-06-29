-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create member_skills junction table
CREATE TABLE IF NOT EXISTS member_skills (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'self_reported' CHECK (source IN ('self_reported', 'task_verified', 'peer_endorsed')),
    verified_at TIMESTAMPTZ,
    endorsed_by_count INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, skill_id)
);

-- Create task_required_skills table
CREATE TABLE IF NOT EXISTS task_required_skills (
    task_id UUID REFERENCES contributions(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    importance TEXT DEFAULT 'required' CHECK (importance IN ('required', 'preferred')),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (task_id, skill_id)
);

-- Create indexes for performance (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_member_skills_user ON member_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_member_skills_skill ON member_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_task_skills_task ON task_required_skills(task_id);
CREATE INDEX IF NOT EXISTS idx_task_skills_skill ON task_required_skills(skill_id);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_required_skills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view skills" ON skills;
DROP POLICY IF EXISTS "Only admins can manage skills" ON skills;
DROP POLICY IF EXISTS "Admins can insert skills" ON skills;
DROP POLICY IF EXISTS "Admins can update skills" ON skills;
DROP POLICY IF EXISTS "Admins can delete skills" ON skills;
DROP POLICY IF EXISTS "Users can view all member skills" ON member_skills;
DROP POLICY IF EXISTS "Users can manage their own skills" ON member_skills;
DROP POLICY IF EXISTS "Users can update their own skills" ON member_skills;
DROP POLICY IF EXISTS "Users can delete their own skills" ON member_skills;
DROP POLICY IF EXISTS "Anyone can view task required skills" ON task_required_skills;
DROP POLICY IF EXISTS "Task creators can manage required skills" ON task_required_skills;
DROP POLICY IF EXISTS "Task creators can insert required skills" ON task_required_skills;
DROP POLICY IF EXISTS "Task creators can update required skills" ON task_required_skills;
DROP POLICY IF EXISTS "Task creators can delete required skills" ON task_required_skills;

-- Skills policies (everyone can read)
CREATE POLICY "Anyone can view skills" ON skills
    FOR SELECT USING (true);

-- Admin policies for skills table
CREATE POLICY "Admins can insert skills" ON skills
    FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can update skills" ON skills
    FOR UPDATE USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can delete skills" ON skills
    FOR DELETE USING (auth.jwt()->>'role' = 'admin');

-- Member skills policies
CREATE POLICY "Users can view all member skills" ON member_skills
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own skills" ON member_skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" ON member_skills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills" ON member_skills
    FOR DELETE USING (auth.uid() = user_id);

-- Task required skills policies
CREATE POLICY "Anyone can view task required skills" ON task_required_skills
    FOR SELECT USING (true);

-- Task creators can manage required skills
CREATE POLICY "Task creators can insert required skills" ON task_required_skills
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM contributions c
            INNER JOIN internal_projects p ON c.project_id = p.id
            INNER JOIN organization_members om ON p.organization_id = om.organization_id
            WHERE c.id = task_required_skills.task_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Task creators can update required skills" ON task_required_skills
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM contributions c
            INNER JOIN internal_projects p ON c.project_id = p.id
            INNER JOIN organization_members om ON p.organization_id = om.organization_id
            WHERE c.id = task_required_skills.task_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Task creators can delete required skills" ON task_required_skills
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM contributions c
            INNER JOIN internal_projects p ON c.project_id = p.id
            INNER JOIN organization_members om ON p.organization_id = om.organization_id
            WHERE c.id = task_required_skills.task_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
    );

-- Insert initial skills data (only if table is empty)
INSERT INTO skills (name, category, description)
SELECT * FROM (VALUES
    -- Technical Skills
    ('Python', 'Technical', 'Programming in Python'),
    ('JavaScript', 'Technical', 'Frontend and backend JavaScript development'),
    ('React', 'Technical', 'React.js framework for web applications'),
    ('Data Analysis', 'Technical', 'Analyzing and interpreting data'),
    ('Web Development', 'Technical', 'Building web applications'),
    ('Mobile Development', 'Technical', 'iOS and Android app development'),
    ('Database Management', 'Technical', 'SQL and NoSQL database design'),
    ('Machine Learning', 'Technical', 'ML algorithms and implementations'),
    ('UI/UX Design', 'Technical', 'User interface and experience design'),
    ('API Development', 'Technical', 'RESTful and GraphQL API design'),

    -- Creative Skills
    ('Graphic Design', 'Creative', 'Visual design and branding'),
    ('Video Editing', 'Creative', 'Video production and post-processing'),
    ('Photography', 'Creative', 'Professional photography'),
    ('Content Writing', 'Creative', 'Blog posts, articles, and copy'),
    ('Social Media Content', 'Creative', 'Creating engaging social content'),
    ('Illustration', 'Creative', 'Digital and traditional illustration'),
    ('Animation', 'Creative', '2D/3D animation and motion graphics'),
    ('Music Production', 'Creative', 'Audio recording and mixing'),

    -- Business Skills
    ('Marketing', 'Business', 'Marketing strategy and campaigns'),
    ('Sales', 'Business', 'Sales techniques and relationship building'),
    ('Financial Analysis', 'Business', 'Financial modeling and analysis'),
    ('Project Management', 'Business', 'Planning and executing projects'),
    ('Business Strategy', 'Business', 'Strategic planning and analysis'),
    ('Market Research', 'Business', 'Conducting market analysis'),
    ('Fundraising', 'Business', 'Raising funds and sponsorships'),
    ('Event Planning', 'Business', 'Organizing and managing events'),

    -- Leadership Skills
    ('Team Leadership', 'Leadership', 'Leading and motivating teams'),
    ('Public Speaking', 'Leadership', 'Presenting to audiences'),
    ('Mentoring', 'Leadership', 'Guiding and developing others'),
    ('Conflict Resolution', 'Leadership', 'Mediating and resolving conflicts'),
    ('Decision Making', 'Leadership', 'Strategic decision making'),
    ('Delegation', 'Leadership', 'Effective task delegation'),

    -- Communication Skills
    ('Written Communication', 'Communication', 'Clear written expression'),
    ('Verbal Communication', 'Communication', 'Effective speaking skills'),
    ('Active Listening', 'Communication', 'Understanding and responding'),
    ('Presentation Skills', 'Communication', 'Delivering presentations'),
    ('Negotiation', 'Communication', 'Negotiating agreements'),
    ('Cross-cultural Communication', 'Communication', 'Working across cultures'),

    -- Operations Skills
    ('Data Entry', 'Operations', 'Accurate data input and management'),
    ('Research', 'Operations', 'Conducting thorough research'),
    ('Administrative Support', 'Operations', 'Office and administrative tasks'),
    ('Customer Service', 'Operations', 'Supporting customers and users'),
    ('Quality Assurance', 'Operations', 'Testing and ensuring quality'),
    ('Documentation', 'Operations', 'Creating clear documentation'),
    ('Process Improvement', 'Operations', 'Optimizing workflows')
) AS v(name, category, description)
WHERE NOT EXISTS (SELECT 1 FROM skills LIMIT 1);

-- Function to automatically add verified skills when tasks are completed
CREATE OR REPLACE FUNCTION add_verified_skill_on_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- When a task is marked as completed, add its required skills to the assignee's profile
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Add skills from task_required_skills to member_skills
        INSERT INTO member_skills (user_id, skill_id, source, verified_at)
        SELECT 
            ta.assignee_id,
            trs.skill_id,
            'task_verified',
            NOW()
        FROM task_required_skills trs
        INNER JOIN task_assignees ta ON ta.task_id = trs.task_id
        WHERE trs.task_id = NEW.id
        AND ta.assignee_id IS NOT NULL
        ON CONFLICT (user_id, skill_id) 
        DO UPDATE SET 
            source = CASE 
                WHEN member_skills.source = 'self_reported' THEN 'task_verified'
                ELSE member_skills.source
            END,
            verified_at = CASE
                WHEN member_skills.source = 'self_reported' THEN NOW()
                ELSE member_skills.verified_at
            END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS verify_skills_on_task_completion ON contributions;

-- Create trigger for automatic skill verification
CREATE TRIGGER verify_skills_on_task_completion
    AFTER UPDATE ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION add_verified_skill_on_task_completion();