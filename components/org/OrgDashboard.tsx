'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { 
  Users, 
  FolderOpen, 
  UserCheck, 
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Target,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface OrgDashboardProps {
  orgSlug: string;
}

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  filledRoles: number;
  totalRoles: number;
  atRiskRoles: number;
  skillGaps: number;
  topSkills: string[];
}

export function OrgDashboard({ orgSlug }: OrgDashboardProps) {
  const [organization, setOrganization] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    filledRoles: 0,
    totalRoles: 0,
    atRiskRoles: 0,
    skillGaps: 0,
    topSkills: [],
  });
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, [orgSlug]);

  const loadDashboardData = async () => {
    try {
      // Load organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', orgSlug)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Load members
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('*, user:profiles(*)')
        .eq('organization_id', orgData.id);

      // Load projects
      const { data: projectData } = await supabase
        .from('internal_projects')
        .select('*')
        .eq('organization_id', orgData.id);

      // Load skill needs
      const { data: skillNeedsData } = await supabase
        .from('organization_skill_needs')
        .select('*, skill:skills(name)')
        .eq('organization_id', orgData.id)
        .gte('current_gap_level', 3); // Gaps with level 3+ are significant

      // Calculate stats
      const totalMembers = memberData?.length || 0;
      const activeMembers = memberData?.filter(m => {
        // Members who have contributions in the last 30 days
        return true; // TODO: Implement actual activity check
      }).length || 0;

      const activeProjects = projectData?.filter(p => p.status === 'active').length || 0;
      const completedProjects = projectData?.filter(p => p.status === 'completed').length || 0;

      // Get all skills from members
      const allSkills = memberData?.flatMap(m => m.user?.skills || []) || [];
      const skillCounts = allSkills.reduce((acc: any, skill: string) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {});
      const topSkills = Object.entries(skillCounts)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([skill]) => skill);

      setStats({
        totalMembers,
        activeMembers,
        totalProjects: projectData?.length || 0,
        activeProjects,
        completedProjects,
        filledRoles: 5, // TODO: Implement actual role tracking
        totalRoles: 8,
        atRiskRoles: 2,
        skillGaps: skillNeedsData?.length || 0,
        topSkills,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Members',
      value: stats.totalMembers,
      subtitle: `${stats.activeMembers} active this week`,
      icon: Users,
      color: 'from-neon-green to-green-600',
      href: `/dashboard/org/${orgSlug}/members`,
      trend: '+12%',
    },
    {
      title: 'Projects',
      value: stats.activeProjects,
      subtitle: `${stats.completedProjects} completed`,
      icon: FolderOpen,
      color: 'from-neon-blue to-blue-600',
      href: `/dashboard/org/${orgSlug}/projects`,
      trend: '+3',
    },
    {
      title: 'Roles',
      value: `${stats.filledRoles}/${stats.totalRoles}`,
      subtitle: `${stats.atRiskRoles} need successors`,
      icon: UserCheck,
      color: 'from-neon-purple to-purple-600',
      href: `/dashboard/org/${orgSlug}/roles`,
      alert: stats.atRiskRoles > 0,
    },
    {
      title: 'Skill Gaps',
      value: stats.skillGaps,
      subtitle: 'Urgent needs',
      icon: Target,
      color: 'from-neon-coral to-red-600',
      href: `/dashboard/org/${orgSlug}/skills`,
      alert: stats.skillGaps > 0,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{organization?.name}</h1>
          <p className="text-gray-400 mt-1">{organization?.description}</p>
        </div>
        <div className="flex gap-3">
          <NeonButton variant="secondary" icon={<Calendar />}>
            Schedule
          </NeonButton>
          <NeonButton 
            icon={<Plus />}
            onClick={() => setShowCreateProject(true)}
          >
            Create Project
          </NeonButton>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} variants={itemVariants}>
              <Link href={card.href}>
                <GlassCard className="group cursor-pointer relative overflow-hidden h-full">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  
                  {/* Alert indicator */}
                  {card.alert && (
                    <div className="absolute top-4 right-4">
                      <div className="relative">
                        <AlertCircle className="w-5 h-5 text-neon-coral" />
                        <div className="absolute inset-0 animate-ping">
                          <AlertCircle className="w-5 h-5 text-neon-coral opacity-75" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-20`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {card.trend && (
                        <div className="flex items-center gap-1 text-neon-green text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>{card.trend}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-sm text-gray-400 mb-1">{card.title}</h3>
                    <p className="text-3xl font-bold mb-2">{card.value}</p>
                    <p className="text-sm text-gray-400">{card.subtitle}</p>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute bottom-0 right-0 transform translate-x-full group-hover:translate-x-0 transition-transform">
                    <ArrowRight className="w-4 h-4 text-gray-400 mr-4 mb-4" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-purple" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href={`/dashboard/org/${orgSlug}/projects/new`}>
            <div className="p-4 bg-dark-surface rounded-lg hover:bg-dark-elevated transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-medium">Create Project</h3>
                  <p className="text-sm text-gray-400">Start a new internal project</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>

          <Link href={`/dashboard/org/${orgSlug}/members/invite`}>
            <div className="p-4 bg-dark-surface rounded-lg hover:bg-dark-elevated transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-neon-blue" />
                </div>
                <div>
                  <h3 className="font-medium">Invite Member</h3>
                  <p className="text-sm text-gray-400">Add someone to your org</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>

          <Link href={`/dashboard/org/${orgSlug}/gigs/new`}>
            <div className="p-4 bg-dark-surface rounded-lg hover:bg-dark-elevated transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-purple/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <h3 className="font-medium">Post a Gig</h3>
                  <p className="text-sm text-gray-400">Find external talent</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        </div>
      </GlassCard>

      {/* Top Skills */}
      {stats.topSkills.length > 0 && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4">Organization Skills</h2>
          <div className="flex flex-wrap gap-2">
            {stats.topSkills.map((skill, index) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="px-4 py-2 bg-dark-surface rounded-full text-sm border border-dark-border hover:border-neon-green/50 transition-colors">
                  {skill}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          orgSlug={orgSlug}
          onClose={() => setShowCreateProject(false)}
          onProjectCreated={() => {
            setShowCreateProject(false);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}