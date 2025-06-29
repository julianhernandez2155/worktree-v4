import { 
  Briefcase, 
  Target, 
  TrendingUp, 
  Users,
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react';
import Link from 'next/link';

import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { GlassCard } from '@/components/ui/GlassCard';
import { MatchQualityIndicator } from '@/components/ui/MatchQualityIndicator';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user profile with additional data
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      university:universities(name),
      user_skills(
        skill:skills(name, category),
        level,
        endorsed_count
      )
    `)
    .eq('id', user?.id)
    .single();

  // Get user's organizations
  const { data: memberships } = await supabase
    .from('organization_members')
    .select(`
      organization:organizations(
        id,
        name,
        logo_url,
        member_count
      ),
      role
    `)
    .eq('user_id', user?.id)
    .eq('is_active', true);

  // Get recommended opportunities (mock data for now)
  const recommendedOpportunities = [
    {
      id: '1',
      title: 'Frontend Developer for Student Portal',
      organization: 'Tech Club',
      difficulty: 'intermediate' as const,
      matchQuality: 'strong' as const,
      matchScore: 85,
      deadline: '2 weeks',
      skills: ['React', 'TypeScript', 'Tailwind CSS']
    },
    {
      id: '2',
      title: 'Marketing Lead for Hackathon',
      organization: 'Innovation Hub',
      difficulty: 'beginner' as const,
      matchQuality: 'perfect' as const,
      matchScore: 92,
      deadline: '1 month',
      skills: ['Social Media', 'Content Creation', 'Event Planning']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.first_name || 'Student'}!
        </h1>
        <p className="text-gray-400">
          {profile?.university?.name || 'Your University'} • Class of {profile?.graduation_year || '20XX'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Skills</p>
              <p className="text-2xl font-bold">{profile?.user_skills?.length || 0}</p>
            </div>
            <BookOpen className="w-8 h-8 text-neon-green" />
          </div>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Organizations</p>
              <p className="text-2xl font-bold">{memberships?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-neon-blue" />
          </div>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Projects</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <Briefcase className="w-8 h-8 text-neon-purple" />
          </div>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Impact Hours</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <Award className="w-8 h-8 text-neon-coral" />
          </div>
        </GlassCard>
      </div>

      {/* Recommended Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Link href="/opportunities">
            <NeonButton variant="ghost" size="sm" icon={<ChevronRight />} iconPosition="right">
              View All
            </NeonButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedOpportunities.map((opp) => (
            <GlassCard key={opp.id} hover glow="green">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{opp.title}</h3>
                    <p className="text-gray-400 text-sm">{opp.organization}</p>
                  </div>
                  <DifficultyBadge level={opp.difficulty} size="sm" />
                </div>

                <div className="flex items-center gap-4">
                  <MatchQualityIndicator 
                    quality={opp.matchQuality} 
                    score={opp.matchScore} 
                    showScore 
                  />
                  <span className="text-sm text-gray-400">• {opp.deadline}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {opp.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-dark-surface rounded-md text-xs">
                      {skill}
                    </span>
                  ))}
                </div>

                <Link href={`/opportunities/${opp.id}`}>
                  <NeonButton fullWidth size="sm" icon={<Target />}>
                    View Details
                  </NeonButton>
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Skill Progress */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Skills</h2>
          <Link href="/skills">
            <NeonButton variant="ghost" size="sm" icon={<TrendingUp />} iconPosition="right">
              Manage Skills
            </NeonButton>
          </Link>
        </div>

        {profile?.user_skills && profile.user_skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.user_skills.slice(0, 6).map((userSkill: any) => (
              <GlassCard key={userSkill.skill.name} variant="surface">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{userSkill.skill.name}</p>
                    <p className="text-sm text-gray-400 capitalize">{userSkill.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neon-green">{userSkill.endorsed_count} endorsements</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard>
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">You haven't added any skills yet</p>
              <Link href="/onboarding/skills">
                <NeonButton size="sm">Add Skills</NeonButton>
              </Link>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}