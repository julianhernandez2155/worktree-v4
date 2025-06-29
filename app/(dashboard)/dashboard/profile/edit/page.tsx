import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

export default async function EditProfilePage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  // Get user's profile with all related data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members (
        organization_id,
        role,
        joined_at,
        organizations (
          id,
          name,
          slug,
          logo_url
        )
      ),
      member_skills (
        skill_id,
        user_id,
        added_at,
        verified_at,
        endorsed_by_count,
        source,
        skills (
          id,
          name,
          category
        )
      )
    `)
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('Error fetching profile:', error);
    redirect('/dashboard');
  }

  // Get user's contributions for preview data
  const { data: contributions } = await supabase
    .from('task_assignees')
    .select(`
      assigned_at,
      completed_at,
      contributions!inner (
        id,
        title,
        description,
        status,
        points,
        due_date,
        created_at,
        internal_projects (
          id,
          name,
          organization_id,
          organizations (
            id,
            name,
            slug,
            logo_url
          )
        ),
        task_required_skills (
          required,
          skills (
            id,
            name,
            category
          )
        )
      )
    `)
    .eq('user_id', profile.id)
    .order('assigned_at', { ascending: false })
    .limit(10);

  // Transform member_skills to add computed properties
  const transformedProfile = {
    ...profile,
    member_skills: profile.member_skills?.map((ms: any) => ({
      ...ms,
      verified: ms.verified_at !== null,
      endorsement_count: ms.endorsed_by_count || 0,
      proficiency_level: 'intermediate' // Default for now
    }))
  };

  // Calculate preview data
  const previewData = {
    stats: {
      projectsCompleted: contributions?.filter(c => c.completed_at).length || 0,
      organizationsJoined: profile.organization_members?.length || 0,
      skillsVerified: profile.member_skills?.filter(s => s.verified_at !== null).length || 0,
      totalSkills: profile.member_skills?.length || 0,
      contributionHours: 0, // TODO: Calculate from contributions
    },
    contributions: contributions || [],
    recentActivity: contributions?.filter(c => c.completed_at).map(c => ({ 
      completed_at: c.completed_at 
    })) || []
  };

  return <ProfileEditor profile={transformedProfile} previewData={previewData} />;
}