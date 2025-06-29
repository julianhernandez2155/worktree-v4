import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProfileEditor } from '@/components/org/ProfileEditor';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', slug)
    .single();

  if (!org) {
    return {
      title: 'Edit Organization',
    };
  }

  return {
    title: `Edit ${org.name} | Worktree`,
  };
}

export default async function EditOrgProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // Get organization details
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !organization) {
    notFound();
  }

  // Check if current user is an admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    notFound();
  }

  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organization.id)
    .eq('user_id', user.id)
    .single();

  const isAdmin = member && ['admin', 'president'].includes(member.role);

  if (!isAdmin) {
    notFound(); // Only admins can edit
  }

  // Get all the data needed for the preview
  const { count: memberCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organization.id);

  const { count: projectCount } = await supabase
    .from('internal_projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organization.id)
    .eq('status', 'active');

  const { data: publicProjects } = await supabase
    .from('internal_projects')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('is_public', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: completedProjects } = await supabase
    .from('internal_projects')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(9);

  // Get unique skills
  const { data: projectSkills } = await supabase
    .from('internal_projects')
    .select('skills_needed')
    .eq('organization_id', organization.id)
    .eq('status', 'active');
  
  const uniqueSkills = new Set<string>();
  projectSkills?.forEach(project => {
    if (project.skills_needed && Array.isArray(project.skills_needed)) {
      project.skills_needed.forEach((skill: string) => uniqueSkills.add(skill));
    }
  });
  const skillsCount = uniqueSkills.size;
  const skillsList = Array.from(uniqueSkills);

  // Get leadership team
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

  // Get recent activities
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

  return (
    <ProfileEditor
      organization={organization}
      previewData={{
        memberCount: memberCount || 0,
        projectCount: projectCount || 0,
        publicProjects: publicProjects || [],
        completedProjects: completedProjects || [],
        skillsCount,
        skillsList,
        leadershipTeam: leadershipTeam || [],
        recentActivities: recentActivities || [],
        isMember: true,
        isAdmin: true
      }}
    />
  );
}