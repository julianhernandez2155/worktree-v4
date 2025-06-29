-- Fix the skill verification trigger to handle RLS properly

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS verify_skills_on_task_completion ON contributions;
DROP FUNCTION IF EXISTS add_verified_skill_on_task_completion();

-- Create an updated function that handles permissions properly
CREATE OR REPLACE FUNCTION add_verified_skill_on_task_completion()
RETURNS TRIGGER 
SECURITY DEFINER -- This runs the function with the permissions of the function owner (superuser)
SET search_path = public
AS $$
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
            
        -- Also check for legacy single assignee (contributor_id)
        IF NEW.contributor_id IS NOT NULL THEN
            INSERT INTO member_skills (user_id, skill_id, source, verified_at)
            SELECT 
                NEW.contributor_id,
                trs.skill_id,
                'task_verified',
                NOW()
            FROM task_required_skills trs
            WHERE trs.task_id = NEW.id
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER verify_skills_on_task_completion
    AFTER UPDATE ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION add_verified_skill_on_task_completion();

-- Also update the member_skills RLS policies to be more permissive for system operations
DROP POLICY IF EXISTS "System can add verified skills" ON member_skills;

-- This policy allows the system (via triggers) to add verified skills
CREATE POLICY "System can add verified skills" ON member_skills
    FOR INSERT WITH CHECK (
        -- Allow if inserting your own skills
        auth.uid() = user_id 
        OR
        -- Allow if the skill is being added as 'task_verified' (system operation)
        (
            source = 'task_verified' 
            AND EXISTS (
                -- Verify the user is completing a task that grants this skill
                SELECT 1 FROM contributions c
                INNER JOIN task_assignees ta ON ta.task_id = c.id
                INNER JOIN task_required_skills trs ON trs.task_id = c.id
                WHERE c.status = 'completed'
                AND ta.assignee_id = member_skills.user_id
                AND trs.skill_id = member_skills.skill_id
            )
        )
    );