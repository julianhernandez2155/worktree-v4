-- Check if member_skills table has data
SELECT 
  'member_skills table' as source,
  COUNT(DISTINCT user_id) as users_with_skills,
  COUNT(*) as total_skills
FROM member_skills;

-- Check profiles.skills array
SELECT 
  'profiles.skills array' as source,
  COUNT(*) as users_with_skills,
  SUM(array_length(skills, 1)) as total_skills
FROM profiles
WHERE skills IS NOT NULL AND array_length(skills, 1) > 0;

-- Compare both - see which users have skills in which table
SELECT 
  p.full_name,
  array_length(p.skills, 1) as array_skills_count,
  COUNT(ms.skill_id) as normalized_skills_count,
  CASE 
    WHEN array_length(p.skills, 1) > 0 AND COUNT(ms.skill_id) > 0 THEN 'Both'
    WHEN array_length(p.skills, 1) > 0 THEN 'Array only'
    WHEN COUNT(ms.skill_id) > 0 THEN 'Normalized only'
    ELSE 'None'
  END as data_source
FROM profiles p
LEFT JOIN member_skills ms ON ms.user_id = p.id
GROUP BY p.id, p.full_name, p.skills
ORDER BY p.full_name;