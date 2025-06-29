import { createClient } from '@/lib/supabase/client';

export async function getRecommendedProjectsManual(userId: string) {
  const supabase = createClient();
  
  try {
    // First get user's skills
    const { data: userSkills } = await supabase
      .from('member_skills')
      .select('skill_id')
      .eq('user_id', userId);
    
    const userSkillIds = userSkills?.map(s => s.skill_id) || [];
    
    // Get all public active projects with their organizations
    const { data: projects } = await supabase
      .from('internal_projects')
      .select(`
        *,
        organization:organizations!organization_id(
          name,
          logo_url,
          verified
        )
      `)
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!projects) {return [];}
    
    // For each project, get required skills and calculate match
    const projectsWithSkills = await Promise.all(projects.map(async (project) => {
      // Get tasks for this project
      const { data: tasks } = await supabase
        .from('contributions')
        .select('id')
        .eq('project_id', project.id);
      
      const taskIds = tasks?.map(t => t.id) || [];
      
      if (taskIds.length === 0) {
        return {
          ...project,
          match_score: 50, // Default score for projects without tasks
          required_skills: [],
          preferred_skills: [],
          matched_skills: [],
          missing_skills: []
        };
      }
      
      // Get required skills for these tasks
      const { data: taskSkills } = await supabase
        .from('task_required_skills')
        .select(`
          skill_id,
          importance,
          skills!skill_id(id, name, category)
        `)
        .in('task_id', taskIds);
      
      const requiredSkillIds = taskSkills
        ?.filter(ts => ts.importance === 'required')
        .map(ts => ts.skill_id) || [];
      
      const preferredSkillIds = taskSkills
        ?.filter(ts => ts.importance === 'preferred')
        .map(ts => ts.skill_id) || [];
      
      // Calculate matches
      const matchedRequiredIds = requiredSkillIds.filter(id => userSkillIds.includes(id));
      const matchedPreferredIds = preferredSkillIds.filter(id => userSkillIds.includes(id));
      const missingRequiredIds = requiredSkillIds.filter(id => !userSkillIds.includes(id));
      
      // Calculate score
      let matchScore = 50; // Base score
      if (requiredSkillIds.length > 0) {
        const requiredMatch = (matchedRequiredIds.length / requiredSkillIds.length) * 70;
        const preferredMatch = preferredSkillIds.length > 0 
          ? (matchedPreferredIds.length / preferredSkillIds.length) * 30
          : 0;
        matchScore = Math.round(requiredMatch + preferredMatch);
      }
      
      // Get skill names
      const getSkillNames = (skillIds: string[]) => {
        return taskSkills
          ?.filter(ts => skillIds.includes(ts.skill_id))
          .map(ts => ts.skills?.name)
          .filter(Boolean) || [];
      };
      
      // Check if user has saved or applied
      const { data: saved } = await supabase
        .from('saved_projects')
        .select('project_id')
        .eq('user_id', userId)
        .eq('project_id', project.id)
        .single();
      
      const { data: application } = await supabase
        .from('project_applications')
        .select('status')
        .eq('applicant_id', userId)
        .eq('project_id', project.id)
        .single();
      
      return {
        ...project,
        match_score: matchScore,
        required_skills: getSkillNames(requiredSkillIds),
        preferred_skills: getSkillNames(preferredSkillIds),
        matched_skills: getSkillNames(matchedRequiredIds),
        missing_skills: getSkillNames(missingRequiredIds),
        is_saved: !!saved,
        has_applied: !!application,
        application_status: application?.status
      };
    }));
    
    // Sort by match score
    return projectsWithSkills.sort((a, b) => b.match_score - a.match_score);
    
  } catch (error) {
    console.error('Error in getRecommendedProjectsManual:', error);
    return [];
  }
}