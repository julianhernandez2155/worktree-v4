-- First, let's add the description column if it doesn't exist
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add other missing columns if they don't exist
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Now insert the initial skills data (only if table is empty)
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
WHERE NOT EXISTS (SELECT 1 FROM skills LIMIT 1)
ON CONFLICT (name) DO NOTHING;  -- Skip if skill name already exists