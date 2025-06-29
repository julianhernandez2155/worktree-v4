import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MemberSkills } from '@/components/members/MemberSkills';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Shield, 
  GraduationCap,
  Award,
  Activity
} from 'lucide-react';
import Link from 'next/link';

async function getMemberData(userId: string, orgSlug: string) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .single();
    
  if (!org) return null;
  
  // Get member details
  const { data: member, error: memberError } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      user_id,
      role,
      joined_at,
      user:profiles!user_id(
        id,
        full_name,
        username,
        email,
        avatar_url,
        bio,
        major,
        year_of_study
      )
    `)
    .eq('organization_id', org.id)
    .eq('user_id', userId)
    .single();
    
  if (memberError) {
    console.error('Member query error:', memberError);
    return null;
  }
    
  if (!member) return null;
  
  // Get member's completed tasks count
  const { count: completedTasks } = await supabase
    .from('contributions')
    .select('*', { count: 'exact', head: true })
    .eq('contributor_id', userId)
    .eq('status', 'completed')
    .eq('project_id', org.id);
    
  // Get member's projects involvement
  const { data: projects } = await supabase
    .from('internal_projects')
    .select('id, name')
    .eq('organization_id', org.id)
    .contains('team_member_ids', [userId])
    .limit(5);
  
  return {
    member,
    org,
    isOwnProfile: currentUser?.id === userId,
    completedTasks: completedTasks || 0,
    projects: projects || []
  };
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ slug: string; userId: string }>;
}) {
  const { slug, userId } = await params;
  const data = await getMemberData(userId, slug);
  
  if (!data) {
    notFound();
  }
  
  const { member, org, isOwnProfile, completedTasks, projects } = data;
  const profile = member.user;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href={`/dashboard/org/${slug}/members`}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-surface hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </Link>
      
      {/* Profile Header */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-24 h-24 rounded-full border-2 border-neon-green"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-dark-surface border-2 border-neon-green 
                            flex items-center justify-center">
                <span className="text-2xl font-bold text-neon-green">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
                {profile.username && (
                  <p className="text-dark-muted">@{profile.username}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-4 w-4 text-neon-green" />
                    <span className="capitalize">{member.role}</span>
                  </span>
                  {profile.major && (
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 text-blue-400" />
                      {profile.major}
                    </span>
                  )}
                  {profile.year_of_study && (
                    <span className="text-dark-muted">
                      {profile.year_of_study}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              {!isOwnProfile && (
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-surface hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  Message
                </button>
              )}
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-dark-muted">{profile.bio}</p>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">{completedTasks}</div>
                <div className="text-xs text-dark-muted">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{projects.length}</div>
                <div className="text-xs text-dark-muted">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-dark-muted flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Skills Section */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <Suspense fallback={<LoadingSpinner />}>
          <MemberSkills 
            userId={userId} 
            isOwnProfile={isOwnProfile}
          />
        </Suspense>
      </div>
      
      {/* Recent Activity */}
      {projects.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-neon-green" />
            Active Projects
          </h3>
          <div className="space-y-2">
            {projects.map(project => (
              <Link
                key={project.id}
                href={`/dashboard/org/${slug}/projects/${project.id}`}
                className="block p-3 bg-dark-surface rounded-lg hover:bg-dark-border transition-colors"
              >
                <span className="text-white">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Achievements (Future) */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-400" />
          Achievements
        </h3>
        <p className="text-dark-muted text-center py-8">
          Coming soon: Badges and achievements based on contributions
        </p>
      </div>
    </div>
  );
}