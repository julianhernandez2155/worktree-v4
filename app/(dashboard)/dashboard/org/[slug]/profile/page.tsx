import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OrganizationProfile } from '@/components/org/OrganizationProfile';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  
  const { data: org } = await supabase
    .from('organizations')
    .select('name, description')
    .eq('slug', params.slug)
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
    .eq('slug', params.slug)
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

  // Get public projects
  const { data: publicProjects } = await supabase
    .from('internal_projects')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('is_public', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

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
      isMember={isMember}
      isAdmin={isAdmin}
    />
  );
}