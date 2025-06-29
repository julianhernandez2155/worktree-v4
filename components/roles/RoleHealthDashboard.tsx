'use client';

import { motion } from 'framer-motion';
import { 
  UserPlus,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';

import { RoleCard } from './RoleCard';
import { SuccessionTimeline } from './SuccessionTimeline';

interface Role {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  current_holder_id?: string;
  current_holder?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    skills: string[];
    year_of_study?: string;
  };
  term_end_date?: string;
}

interface Candidate {
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    skills: string[];
    year_of_study?: string;
  };
  match_score: number;
  missing_skills: string[];
  ready: boolean;
}

interface RoleHealthDashboardProps {
  orgSlug: string;
}

export function RoleHealthDashboard({ orgSlug }: RoleHealthDashboardProps) {
  const [organization, setOrganization] = useState<any>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadRolesData();
  }, [orgSlug]);

  const loadRolesData = async () => {
    try {
      // Get organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', orgSlug)
        .single();

      if (!orgData) {throw new Error('Organization not found');}
      setOrganization(orgData);

      // Get roles with current holders
      const { data: rolesData, error: rolesError } = await supabase
        .from('organization_roles')
        .select(`
          *,
          current_holder:profiles (
            id,
            full_name,
            avatar_url,
            skills,
            year_of_study
          )
        `)
        .eq('organization_id', orgData.id)
        .order('title');

      if (rolesError) {throw rolesError;}
      setRoles(rolesData || []);

      // Get all members for succession planning
      const { data: memberData } = await supabase
        .from('organization_members')
        .select(`
          user:profiles (
            id,
            full_name,
            avatar_url,
            skills,
            year_of_study
          )
        `)
        .eq('organization_id', orgData.id);

      setMembers(memberData || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleStatus = (role: Role): 'stable' | 'at-risk' | 'vacant' => {
    if (!role.current_holder_id) {return 'vacant';}
    
    if (role.term_end_date) {
      const endDate = new Date(role.term_end_date);
      const today = new Date();
      const monthsUntilEnd = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsUntilEnd < 3) {return 'at-risk';}
    }
    
    return 'stable';
  };

  const getSuccessionCandidates = (role: Role): Candidate[] => {
    if (!role.required_skills || role.required_skills.length === 0) {return [];}

    return members
      .filter(m => m.user.id !== role.current_holder_id) // Exclude current holder
      .map(member => {
        const userSkills = member.user.skills || [];
        const matchingSkills = role.required_skills.filter(skill => 
          userSkills.includes(skill)
        );
        const missingSkills = role.required_skills.filter(skill => 
          !userSkills.includes(skill)
        );
        const matchScore = (matchingSkills.length / role.required_skills.length) * 100;

        return {
          user: member.user,
          match_score: matchScore,
          missing_skills: missingSkills,
          ready: matchScore >= 80
        };
      })
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 5); // Top 5 candidates
  };

  const stats = {
    totalRoles: roles.length,
    filledRoles: roles.filter(r => r.current_holder_id).length,
    vacantRoles: roles.filter(r => !r.current_holder_id).length,
    atRiskRoles: roles.filter(r => getRoleStatus(r) === 'at-risk').length,
  };

  const urgentRoles = roles.filter(r => getRoleStatus(r) !== 'stable');

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-gray-400 mt-1">
            Plan succession and ensure continuity for {organization?.name}
          </p>
        </div>
        <NeonButton icon={<UserPlus />}>
          Create Role
        </NeonButton>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Roles</p>
              <p className="text-2xl font-bold">{stats.totalRoles}</p>
            </div>
            <div className="p-3 bg-neon-blue/20 rounded-lg">
              <Users className="w-6 h-6 text-neon-blue" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Filled</p>
              <p className="text-2xl font-bold text-neon-green">{stats.filledRoles}</p>
            </div>
            <div className="p-3 bg-neon-green/20 rounded-lg">
              <UserPlus className="w-6 h-6 text-neon-green" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Vacant</p>
              <p className="text-2xl font-bold text-neon-coral">{stats.vacantRoles}</p>
            </div>
            <div className="p-3 bg-neon-coral/20 rounded-lg">
              <Target className="w-6 h-6 text-neon-coral" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">At Risk</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.atRiskRoles}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Urgent Attention Section */}
      {urgentRoles.length > 0 && (
        <GlassCard className="border-l-4 border-neon-coral">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-neon-coral mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Roles Needing Attention</h3>
              <div className="space-y-2">
                {urgentRoles.map(role => {
                  const status = getRoleStatus(role);
                  return (
                    <div key={role.id} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{role.title}</span>
                        {status === 'vacant' ? (
                          <span className="ml-2 text-sm text-neon-coral">Vacant</span>
                        ) : (
                          <span className="ml-2 text-sm text-yellow-500">
                            {role.current_holder?.full_name} graduates soon
                          </span>
                        )}
                      </div>
                      <NeonButton
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedRole(role)}
                      >
                        Find Successor
                      </NeonButton>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Succession Timeline */}
      <SuccessionTimeline roles={roles} />

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map(role => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RoleCard
              role={role}
              status={getRoleStatus(role)}
              candidates={getSuccessionCandidates(role)}
              onClick={() => setSelectedRole(role)}
            />
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <GlassCard>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-neon-purple/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Succession Insights</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Mike Rodriguez has 80% of the skills needed for Treasurer role</p>
              <p>• Consider recruiting someone with Social Media Marketing skills</p>
              <p>• 3 leadership positions need successors before May 2025</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}