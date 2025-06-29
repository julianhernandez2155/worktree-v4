'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MemberCard } from './MemberCard';
import { SkillSearch } from './SkillSearch';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Users, 
  Search,
  Grid3x3,
  List,
  SlidersHorizontal,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

export function MemberDirectory({ orgSlug }: MemberDirectoryProps) {
  const [organization, setOrganization] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadMembers();
  }, [orgSlug]);

  const loadMembers = async () => {
    try {
      // Get organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', orgSlug)
        .single();

      if (!orgData) throw new Error('Organization not found');
      setOrganization(orgData);

      // Get members with their profiles
      const { data: memberData, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          joined_at,
          user:profiles!inner (
            id,
            full_name,
            avatar_url,
            year_of_study,
            major
          )
        `)
        .eq('organization_id', orgData.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // Now fetch skills for each member from member_skills table
      const memberIds = memberData?.map(m => m.user.id) || [];
      const { data: memberSkillsData } = await supabase
        .from('member_skills')
        .select(`
          user_id,
          skill:skills!skill_id(name)
        `)
        .in('user_id', memberIds);

      // Create a map of user_id to skills array
      const userSkillsMap = memberSkillsData?.reduce((acc, ms) => {
        if (!acc[ms.user_id]) {
          acc[ms.user_id] = [];
        }
        if (ms.skill?.name) {
          acc[ms.user_id].push(ms.skill.name);
        }
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Map the data to the correct Member interface structure
      const formattedMembers: Member[] = (memberData || []).map(item => {
        // Handle the case where user might be null or undefined
        const userProfile = item.user as any;
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
      
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique skills from members
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    members.forEach(member => {
      member.user?.skills?.forEach(skill => skills.add(skill));
    });
    return Array.from(skills).sort();
  }, [members]);

  // Filter members based on search and selected skills
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        member.user?.full_name?.toLowerCase().includes(searchLower) ||
        member.role?.toLowerCase().includes(searchLower) ||
        member.user?.major?.toLowerCase().includes(searchLower) ||
        member.user?.skills?.some(skill => skill.toLowerCase().includes(searchLower));

      // Skill filter
      const matchesSkills = selectedSkills.length === 0 ||
        selectedSkills.every(skill => member.user?.skills?.includes(skill));

      return matchesSearch && matchesSkills;
    });
  }, [members, searchQuery, selectedSkills]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-gray-400 mt-1">
            {members.length} talented individuals in {organization?.name}
          </p>
        </div>
        <NeonButton icon={<UserPlus />}>
          Invite Member
        </NeonButton>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, role, major, or skills..."
                className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-3 rounded-lg border transition-all",
                showFilters 
                  ? "bg-neon-green/20 border-neon-green text-neon-green" 
                  : "bg-dark-surface border-dark-border hover:border-neon-green/50"
              )}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* View mode toggle */}
            <div className="flex bg-dark-surface rounded-lg border border-dark-border p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded transition-all",
                  viewMode === 'grid' 
                    ? "bg-dark-card text-neon-green" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded transition-all",
                  viewMode === 'list' 
                    ? "bg-dark-card text-neon-green" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
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
                <SkillSearch
                  availableSkills={allSkills}
                  selectedSkills={selectedSkills}
                  onSkillsChange={setSelectedSkills}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Results count */}
      {(searchQuery || selectedSkills.length > 0) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {filteredMembers.length} of {members.length} members
          </p>
          {(searchQuery || selectedSkills.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkills([]);
              }}
              className="text-sm text-neon-green hover:text-neon-green/80 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Members Grid/List */}
      {filteredMembers.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No members found</h3>
          <p className="text-gray-400">
            {searchQuery || selectedSkills.length > 0
              ? 'Try adjusting your filters'
              : 'Invite your first member to get started'}
          </p>
        </GlassCard>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          )}
        >
          {filteredMembers.map((member) => (
            <motion.div key={member.user.id} variants={itemVariants}>
              <MemberCard
                member={member}
                viewMode={viewMode}
                orgSlug={orgSlug}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}