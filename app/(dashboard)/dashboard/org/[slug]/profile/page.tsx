import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OrganizationProfile } from '@/components/org/OrganizationProfile';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: org } = await supabase
    .from('organizations')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!org) {
    return {
      title: 'Organization Not Found',
    };
  }

  return {
    title: `${org.name} Profile | Worktree`,
    description: org.description || `View ${org.name}'s profile on Worktree`,
  };
}

export default async function OrgProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // Get organization details
  const { data: organization, error } = await supabase
    .from('organizations')
    .select(`
      *,
      organization_members!inner(
        user_id,
        role
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !organization) {
    notFound();
  }

  // Get member count
  const { count: memberCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organization.id);

  // Get active projects count
  const { count: projectCount } = await supabase
    .from('internal_projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organization.id)
    .eq('status', 'active');

  // Get public projects (current opportunities)
  const { data: publicProjects } = await supabase
    .from('internal_projects')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('is_public', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  // Get completed projects for showcase
  const { data: completedProjects } = await supabase
    .from('internal_projects')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(9);

  // Get unique skills count from all projects
  const { data: projectSkills } = await supabase
    .from('internal_projects')
    .select('skills_needed')
    .eq('organization_id', organization.id)
    .eq('status', 'active');
  
  // Count unique skills
  const uniqueSkills = new Set<string>();
  projectSkills?.forEach(project => {
    if (project.skills_needed && Array.isArray(project.skills_needed)) {
      project.skills_needed.forEach((skill: string) => uniqueSkills.add(skill));
    }
  });
  const skillsCount = uniqueSkills.size;
  const skillsList = Array.from(uniqueSkills);

  // Get leadership team members
  const { data: leadershipTeam } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      user:profiles!user_id(
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq('organization_id', organization.id)
    .in('role', ['president', 'vice_president', 'treasurer', 'secretary', 'admin'])
    .order('role');

  // Get recent activities (completed tasks)
  const { data: recentActivities } = await supabase
    .from('contributions')
    .select(`
      id,
      title,
      status,
      completed_at,
      project:internal_projects!project_id(
        id,
        name
      )
    `)
    .eq('status', 'completed')
    .in('project_id', publicProjects?.map(p => p.id) || [])
    .order('completed_at', { ascending: false })
    .limit(5);

  // Check if current user is a member
  const { data: { user } } = await supabase.auth.getUser();
  const isMember = user ? organization.organization_members.some(
    (member: any) => member.user_id === user.id
  ) : false;

  const isAdmin = user ? organization.organization_members.some(
    (member: any) => member.user_id === user.id && 
    ['admin', 'president'].includes(member.role)
  ) : false;

  return (
    <OrganizationProfile
      organization={organization}
      memberCount={memberCount || 0}
      projectCount={projectCount || 0}
      publicProjects={publicProjects || []}
      completedProjects={completedProjects || []}
      skillsCount={skillsCount}
      skillsList={skillsList}
      leadershipTeam={leadershipTeam || []}
      recentActivities={recentActivities || []}
      isMember={isMember}
      isAdmin={isAdmin}
    />
  );
}