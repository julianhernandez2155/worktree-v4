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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

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

interface MemberWithSkillsRPC {
  member_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  full_name: string;
  avatar_url: string | null;
  year_of_study: string | null;
  major: string | null;
  skills: string[];
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const supabase = createClient();

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadMembers();
  }, [orgSlug, debouncedSearchQuery]);

  const loadMembers = async () => {
    try {
      // Get organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', orgSlug)
        .single();

      if (!orgData) {throw new Error('Organization not found');}
      setOrganization(orgData);

      // Use optimized RPC function to get members with skills in one query
      const { data: memberData, error } = await supabase
        .rpc('get_organization_members_with_skills', {
          p_org_id: orgData.id,
          p_search: debouncedSearchQuery || null
        });

      if (error) {throw error;}

      // Map the data to the correct Member interface structure
      const formattedMembers: Member[] = ((memberData as MemberWithSkillsRPC[]) || []).map(item => {
        return {
          id: item.user_id,
          user: {
            id: item.user_id,
            full_name: item.full_name,
            avatar_url: item.avatar_url,
            year_of_study: item.year_of_study,
            major: item.major,
            skills: item.skills || []
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

  // Filter members based on selected skills (text search is handled server-side)
  const filteredMembers = useMemo(() => {
    if (selectedSkills.length === 0) {
      return members;
    }
    
    return members.filter(member => {
      // Skill filter - member must have all selected skills
      return selectedSkills.every(skill => member.user?.skills?.includes(skill));
    });
  }, [members, selectedSkills]);

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
                placeholder="Search by name or major..."
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