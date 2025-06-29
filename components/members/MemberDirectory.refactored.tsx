'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search,
  Grid3x3,
  List,
  SlidersHorizontal,
  UserPlus
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useAsyncOperation } from '@/lib/hooks/useAsyncOperation';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

import { MemberCard } from './MemberCard';
import { SkillSearch } from './SkillSearch';

interface Member {
  id: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    skills: string[];
    year_of_study?: string;
    major?: string;
  };
  role: string;
  joined_at: string;
}

interface MemberDirectoryProps {
  orgSlug: string;
}

type ViewMode = 'grid' | 'list';

/**
 * Member Directory Component
 * Displays organization members with search and filter capabilities
 */
export function MemberDirectory({ orgSlug }: MemberDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const supabase = createClient();

  // Use standardized async operation hook
  const {
    data: organizationData,
    loading,
    error,
    execute: loadData,
  } = useAsyncOperation<{ organization: any; members: Member[] }>();

  // Load organization and members data
  useEffect(() => {
    loadOrganizationData();
  }, [orgSlug]);

  const loadOrganizationData = async () => {
    await loadData(async () => {
      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('slug', orgSlug)
        .single();

      if (orgError) throw orgError;
      if (!org) throw new Error('Organization not found');

      // Get members with profiles
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          role,
          joined_at,
          profiles!organization_members_user_id_fkey(
            id,
            full_name,
            avatar_url,
            year_of_study,
            major
          )
        `)
        .eq('organization_id', org.id)
        .order('joined_at');

      if (memberError) throw memberError;

      // Get all member user IDs
      const memberIds = memberData?.map(m => m.profiles.id) || [];

      // Get skills for all members
      const { data: memberSkillsData } = await supabase
        .from('member_skills')
        .select(`
          user_id,
          skills!member_skills_skill_id_fkey(name)
        `)
        .in('user_id', memberIds);

      // Create user skills map
      const userSkillsMap = memberSkillsData?.reduce((acc, ms) => {
        if (!acc[ms.user_id]) {
          acc[ms.user_id] = [];
        }
        if (ms.skills?.name) {
          acc[ms.user_id].push(ms.skills.name);
        }
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Format members data
      const formattedMembers: Member[] = (memberData || []).map(item => {
        const userProfile = item.profiles;
        const userId = userProfile?.id || '';
        return {
          id: userId,
          user: {
            ...userProfile,
            skills: userSkillsMap[userId] || []
          },
          role: item.role,
          joined_at: item.joined_at
        };
      });

      return {
        organization: org,
        members: formattedMembers
      };
    });
  };

  // Filter members based on search and skills
  const filteredMembers = useMemo(() => {
    if (!organizationData) return [];
    
    let filtered = organizationData.members;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        member.user.full_name?.toLowerCase().includes(query) ||
        member.user.major?.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    }

    // Apply skill filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(member =>
        selectedSkills.every(skill => 
          member.user.skills.includes(skill)
        )
      );
    }

    return filtered;
  }, [organizationData, searchQuery, selectedSkills]);

  // Group members by role
  const membersByRole = useMemo(() => {
    const groups: Record<string, Member[]> = {};
    
    filteredMembers.forEach(member => {
      const role = member.role || 'member';
      if (!groups[role]) groups[role] = [];
      groups[role].push(member);
    });

    // Sort roles by priority
    const roleOrder = ['president', 'vice_president', 'treasurer', 'secretary', 'admin', 'leader', 'member'];
    const sortedGroups: Record<string, Member[]> = {};
    
    roleOrder.forEach(role => {
      if (groups[role]) {
        sortedGroups[role] = groups[role];
      }
    });

    // Add any remaining roles
    Object.keys(groups).forEach(role => {
      if (!sortedGroups[role]) {
        sortedGroups[role] = groups[role];
      }
    });

    return sortedGroups;
  }, [filteredMembers]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-dark-card rounded-lg animate-pulse" />
        <SkeletonList count={6} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={loadOrganizationData}
        title="Failed to load members"
      />
    );
  }

  const organization = organizationData?.organization;
  const totalMembers = organizationData?.members.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-neon-green" />
              Members
            </h2>
            <p className="text-gray-400 mt-1">
              {totalMembers} {totalMembers === 1 ? 'member' : 'members'} 
              {organization && ` in ${organization.name}`}
            </p>
          </div>
          
          <NeonButton icon={<UserPlus className="h-4 w-4" />}>
            Invite Members
          </NeonButton>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, major, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border 
                       rounded-lg text-white placeholder-gray-500 focus:outline-none 
                       focus:ring-2 focus:ring-neon-green/50 transition-all"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'grid' 
                  ? "bg-neon-green text-black" 
                  : "bg-dark-surface text-gray-400 hover:text-white"
              )}
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'list' 
                  ? "bg-neon-green text-black" 
                  : "bg-dark-surface text-gray-400 hover:text-white"
              )}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              showFilters 
                ? "bg-neon-green text-black" 
                : "bg-dark-surface text-gray-400 hover:text-white"
            )}
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
            {selectedSkills.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                {selectedSkills.length}
              </span>
            )}
          </button>
        </div>

        {/* Skill filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-dark-border">
                <SkillSearch
                  selectedSkills={selectedSkills}
                  onSkillsChange={setSelectedSkills}
                  placeholder="Filter by skills..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Members grid/list */}
      {filteredMembers.length === 0 ? (
        <GlassCard className="p-12">
          <EmptyState
            icon={Users}
            title="No members found"
            description={
              searchQuery || selectedSkills.length > 0
                ? "Try adjusting your search or filters"
                : "No members in this organization yet"
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-8">
          {Object.entries(membersByRole).map(([role, roleMembers]) => (
            <div key={role} className="space-y-4">
              <h3 className="text-lg font-semibold text-white capitalize">
                {role.replace('_', ' ')}s ({roleMembers.length})
              </h3>
              
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              )}>
                <AnimatePresence mode="popLayout">
                  {roleMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MemberCard
                        member={member}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}