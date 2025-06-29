-- Check if we already have skills in the skills table
SELECT COUNT(*) as skill_count FROM skills;

-- See what skills exist
SELECT id, name, category FROM skills ORDER BY category, name;

-- Check if anyone has skills in member_skills table
SELECT COUNT(*) as member_skill_count FROM member_skills;

-- See which users have skills assigned
SELECT 
    p.full_name,
    COUNT(ms.skill_id) as skill_count
FROM profiles p
LEFT JOIN member_skills ms ON ms.user_id = p.id
GROUP BY p.id, p.full_name
HAVING COUNT(ms.skill_id) > 0;

-- Check what's in the old skills array column
SELECT 
    full_name,
    skills,
    array_length(skills, 1) as skill_count
FROM profiles
WHERE skills IS NOT NULL AND array_length(skills, 1) > 0;