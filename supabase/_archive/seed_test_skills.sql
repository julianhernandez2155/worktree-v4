-- First, ensure we have some skills in the skills table
INSERT INTO skills (name, category, description) VALUES
  ('JavaScript', 'Technical', 'JavaScript programming language'),
  ('TypeScript', 'Technical', 'TypeScript programming language'),
  ('React', 'Technical', 'React framework'),
  ('Python', 'Technical', 'Python programming language'),
  ('Public Speaking', 'Soft Skills', 'Public speaking and presentation skills'),
  ('Circuit Design', 'Technical', 'Electronic circuit design'),
  ('Arduino', 'Technical', 'Arduino programming and hardware'),
  ('Data Analysis', 'Technical', 'Data analysis and visualization'),
  ('Machine Learning', 'Technical', 'Machine learning and AI'),
  ('Video Editing', 'Creative', 'Video editing and production'),
  ('CAD Design', 'Technical', 'Computer-aided design'),
  ('Budget Management', 'Business', 'Financial planning and budgeting')
ON CONFLICT (name) DO NOTHING;

-- Update the skills array in profiles table with some test data
-- This is temporary - we should eventually migrate to using member_skills table
UPDATE profiles SET skills = ARRAY['JavaScript', 'React', 'TypeScript'] 
WHERE full_name = 'Julian';

UPDATE profiles SET skills = ARRAY['Python', 'Public Speaking'] 
WHERE full_name = 'Aisha Patel';

UPDATE profiles SET skills = ARRAY['Circuit Design', 'Arduino', 'Data Analysis'] 
WHERE full_name = 'Emma Thompson';

UPDATE profiles SET skills = ARRAY['Python', 'Machine Learning', 'Video Editing'] 
WHERE full_name = 'James Liu';

UPDATE profiles SET skills = ARRAY['CAD Design', 'Python', 'Budget Management'] 
WHERE full_name = 'Mike Rodriguez';

UPDATE profiles SET skills = ARRAY['Python', 'JavaScript', 'React', 'TypeScript'] 
WHERE full_name = 'Alex Johnson';

-- Also populate the member_skills table for consistency
-- First get the skill IDs
WITH skill_map AS (
  SELECT id, name FROM skills
),
user_skills AS (
  SELECT 
    p.id as user_id,
    s.id as skill_id
  FROM profiles p
  CROSS JOIN LATERAL unnest(p.skills) AS skill_name
  JOIN skill_map s ON s.name = skill_name
)
INSERT INTO member_skills (user_id, skill_id, source)
SELECT user_id, skill_id, 'self_reported'
FROM user_skills
ON CONFLICT (user_id, skill_id) DO NOTHING;