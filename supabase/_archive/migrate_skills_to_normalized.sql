-- First, extract all unique skills from the arrays and add them to the skills table
WITH all_skills AS (
  SELECT DISTINCT unnest(skills) as skill_name
  FROM profiles
  WHERE skills IS NOT NULL
)
INSERT INTO skills (name, category, description)
SELECT 
  skill_name,
  CASE 
    -- Technical skills
    WHEN skill_name IN ('JavaScript', 'TypeScript', 'React', 'Python', 'R', 'SQL', 
                        'Circuit Design', 'Arduino', 'CAD Design', 'Excel') THEN 'Technical'
    -- Creative skills
    WHEN skill_name IN ('Graphic Design', 'Video Editing', 'UI/UX Design', 
                        'Content Writing', 'Social Media Marketing') THEN 'Creative'
    -- Business skills
    WHEN skill_name IN ('Project Management', 'Budget Management', 'Event Planning') THEN 'Business'
    -- Data skills
    WHEN skill_name IN ('Data Analysis', 'Machine Learning', 'Data Visualization') THEN 'Data Science'
    -- Soft skills
    WHEN skill_name IN ('Public Speaking', 'Leadership') THEN 'Soft Skills'
    ELSE 'Other'
  END as category,
  skill_name || ' skill' as description
FROM all_skills
ON CONFLICT (name) DO NOTHING;

-- Now migrate the array data to member_skills table
WITH user_skills AS (
  SELECT 
    p.id as user_id,
    unnest(p.skills) as skill_name
  FROM profiles p
  WHERE p.skills IS NOT NULL AND array_length(p.skills, 1) > 0
),
skill_mapping AS (
  SELECT 
    us.user_id,
    s.id as skill_id
  FROM user_skills us
  JOIN skills s ON s.name = us.skill_name
)
INSERT INTO member_skills (user_id, skill_id, source, added_at)
SELECT 
  user_id, 
  skill_id, 
  'migrated',
  NOW()
FROM skill_mapping
ON CONFLICT (user_id, skill_id) DO NOTHING;

-- Verify the migration
SELECT 
  'Skills migrated successfully!' as status,
  COUNT(DISTINCT user_id) as users_with_skills,
  COUNT(*) as total_skill_assignments
FROM member_skills;