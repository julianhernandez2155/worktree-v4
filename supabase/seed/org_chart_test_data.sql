-- Test data for org chart visualization
-- This creates a simple reporting hierarchy for testing

-- First, find an organization with members
WITH org AS (
  SELECT o.id 
  FROM organizations o
  JOIN organization_members om ON om.organization_id = o.id
  GROUP BY o.id
  HAVING COUNT(om.user_id) > 3
  LIMIT 1
),
-- Get the members of that organization
members AS (
  SELECT om.user_id, om.role, p.full_name
  FROM organization_members om
  JOIN profiles p ON p.id = om.user_id
  WHERE om.organization_id = (SELECT id FROM org)
  AND om.is_active = true
  ORDER BY 
    CASE om.role
      WHEN 'president' THEN 1
      WHEN 'vice_president' THEN 2
      WHEN 'treasurer' THEN 3
      WHEN 'secretary' THEN 4
      ELSE 5
    END
  LIMIT 6
),
-- Assign president, vp, and other roles
role_assignments AS (
  SELECT 
    user_id,
    full_name,
    ROW_NUMBER() OVER () as rn
  FROM members
)
-- Update the reporting structure
UPDATE organization_members om
SET reports_to = CASE 
  WHEN ra.rn = 2 THEN (SELECT user_id FROM role_assignments WHERE rn = 1) -- VP reports to President
  WHEN ra.rn = 3 THEN (SELECT user_id FROM role_assignments WHERE rn = 1) -- Treasurer reports to President  
  WHEN ra.rn = 4 THEN (SELECT user_id FROM role_assignments WHERE rn = 1) -- Secretary reports to President
  WHEN ra.rn = 5 THEN (SELECT user_id FROM role_assignments WHERE rn = 2) -- Member reports to VP
  WHEN ra.rn = 6 THEN (SELECT user_id FROM role_assignments WHERE rn = 3) -- Member reports to Treasurer
  ELSE NULL -- President reports to no one
END
FROM role_assignments ra
WHERE om.user_id = ra.user_id
AND om.organization_id = (SELECT id FROM org);

-- Also update roles if they're all just 'member'
UPDATE organization_members om
SET role = CASE 
  WHEN ra.rn = 1 THEN 'president'
  WHEN ra.rn = 2 THEN 'vice_president'
  WHEN ra.rn = 3 THEN 'treasurer'
  WHEN ra.rn = 4 THEN 'secretary'
  ELSE om.role
END
FROM (
  SELECT user_id, ROW_NUMBER() OVER () as rn
  FROM organization_members
  WHERE organization_id = (SELECT id FROM org)
  AND is_active = true
  LIMIT 6
) ra
WHERE om.user_id = ra.user_id
AND om.organization_id = (SELECT id FROM org);