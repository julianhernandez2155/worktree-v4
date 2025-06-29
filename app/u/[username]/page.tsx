import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/components/profile/UserProfile';

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  
  // Query user by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', username)
    .single();

  if (!profile) {
    return {
      title: 'User Not Found | Worktree',
    };
  }

  return {
    title: `${profile.full_name || username} | Worktree`,
    description: profile.bio || `View ${profile.full_name}'s profile on Worktree`,
    openGraph: {
      title: `${profile.full_name || username} | Worktree`,
      description: profile.bio || `View ${profile.full_name}'s profile on Worktree`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function UserProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const _search = await searchParams;
  // const activeTab = (search.tab as 'overview' | 'experience' | 'skills' | 'portfolio') || 'overview';
  const supabase = await createClient();
  
  // Get current user if logged in
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  // Query full user profile data
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
    .eq('username', username)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Get user's contributions/tasks
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
    .order('assigned_at', { ascending: false });

  // Calculate statistics
  const stats = {
    projectsCompleted: contributions?.filter((c: { completed_at: string | null }) => c.completed_at).length || 0,
    organizationsJoined: profile.organization_members?.length || 0,
    skillsVerified: profile.member_skills?.filter((s: { verified_at: string | null }) => s.verified_at !== null).length || 0,
    totalSkills: profile.member_skills?.length || 0,
    contributionHours: 0, // TODO: Calculate from contributions
  };

  // Get recent activity for activity heatmap
  const { data: recentActivity } = await supabase
    .from('task_assignees')
    .select('completed_at')
    .eq('user_id', profile.id)
    .not('completed_at', 'is', null)
    .gte('completed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
    .order('completed_at', { ascending: false });

  // Transform member_skills to add computed properties
  const transformedProfile = {
    ...profile,
    member_skills: profile.member_skills?.map((ms: {
      skill_id: string;
      user_id: string;
      added_at: string;
      verified_at: string | null;
      endorsed_by_count: number;
      source: string;
      skills: {
        id: string;
        name: string;
        category: string;
      }
    }) => ({
      ...ms,
      verified: ms.verified_at !== null,
      endorsement_count: ms.endorsed_by_count || 0,
      proficiency_level: 'intermediate' // Default for now
    }))
  };

  return (
    <UserProfile
      profile={transformedProfile}
      stats={stats}
      contributions={contributions || []}
      recentActivity={recentActivity || []}
      isOwnProfile={currentUser?.id === profile.id}
    />
  );
}