'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MemberWithSkills, Skill } from '@/types/skills';
import { SkillSelector } from '@/components/skills/SkillSelector';
import { NeonButton } from '@/components/ui/NeonButton';
import { Search, Users, UserPlus, ExternalLink, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillBasedMemberSearchProps {
  organizationId: string;
  requiredSkills?: string[];
  onMemberSelect?: (member: MemberWithSkills) => void;
  onNoMatchFound?: () => void;
  className?: string;
}

export function SkillBasedMemberSearch({
  organizationId,
  requiredSkills = [],
  onMemberSelect,
  onNoMatchFound,
  className
}: SkillBasedMemberSearchProps) {
  const [searchSkills, setSearchSkills] = useState<string[]>(requiredSkills);
  const [matchingMembers, setMatchingMembers] = useState<MemberWithSkills[]>([]);
  const [allMembers, setAllMembers] = useState<MemberWithSkills[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const supabase = createClient();

  // Load all organization members on mount
  useEffect(() => {
    loadOrganizationMembers();
  }, [organizationId]);

  // Auto-search if required skills provided
  useEffect(() => {
    if (requiredSkills.length > 0) {
      handleSearch();
    }
  }, [requiredSkills]);

  const loadOrganizationMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          user:profiles!user_id(
            id,
            full_name,
            username,
            avatar_url,
            email
          ),
          member_skills!inner(
            skill_id,
            source,
            verified_at,
            endorsed_by_count,
            skill:skills(
              id,
              name,
              category
            )
          )
        `)
        .eq('organization_id', organizationId);

      if (error) throw error;

      // Transform data to MemberWithSkills format
      const members: MemberWithSkills[] = data?.map(member => ({
        id: member.user.id,
        full_name: member.user.full_name,
        username: member.user.username,
        avatar_url: member.user.avatar_url,
        email: member.user.email,
        skills: member.member_skills || []
      })) || [];

      setAllMembers(members);
    } catch (error) {
      console.error('Error loading organization members:', error);
    }
  };

  const handleSearch = async () => {
    if (searchSkills.length === 0) {
      setMatchingMembers([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Filter members who have ALL the required skills
      const matches = allMembers.filter(member => {
        const memberSkillIds = member.skills.map(ms => ms.skill_id);
        return searchSkills.every(skillId => memberSkillIds.includes(skillId));
      });

      // Sort by number of verified skills
      matches.sort((a, b) => {
        const aVerified = a.skills.filter(s => s.source === 'task_verified').length;
        const bVerified = b.skills.filter(s => s.source === 'task_verified').length;
        return bVerified - aVerified;
      });

      setMatchingMembers(matches);
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Technical': 'text-blue-400',
      'Creative': 'text-purple-400',
      'Business': 'text-green-400',
      'Leadership': 'text-orange-400',
      'Communication': 'text-pink-400',
      'Operations': 'text-gray-400'
    };
    return colors[category] || 'text-gray-400';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">
          Find members with these skills:
        </label>
        <SkillSelector
          selectedSkills={searchSkills}
          onSkillsChange={setSearchSkills}
          placeholder="Select skills to search..."
          maxSkills={5}
        />
        <NeonButton
          onClick={handleSearch}
          loading={loading}
          disabled={searchSkills.length === 0}
          size="sm"
          icon={<Search className="h-4 w-4" />}
        >
          Search Members
        </NeonButton>
      </div>

      {/* Results */}
      {hasSearched && (
        <div>
          {matchingMembers.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-dark-muted">
                <Users className="h-4 w-4" />
                <span>{matchingMembers.length} member{matchingMembers.length !== 1 ? 's' : ''} found</span>
              </div>
              
              {matchingMembers.map(member => (
                <div
                  key={member.id}
                  className="p-4 bg-dark-card border border-dark-border rounded-lg hover:border-neon-green/50 
                           transition-all cursor-pointer"
                  onClick={() => onMemberSelect?.(member)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-white">{member.full_name}</h4>
                        {member.username && (
                          <p className="text-sm text-dark-muted">@{member.username}</p>
                        )}
                      </div>
                    </div>
                    <UserPlus className="h-4 w-4 text-neon-green" />
                  </div>

                  {/* Matched Skills */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {member.skills
                      .filter(ms => searchSkills.includes(ms.skill_id))
                      .map(ms => (
                        <span
                          key={ms.skill_id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs 
                                   bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-full"
                        >
                          {ms.source === 'task_verified' && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          <span className={getCategoryColor(ms.skill?.category || '')}>●</span>
                          {ms.skill?.name}
                        </span>
                      ))}
                  </div>

                  {/* Other Skills Preview */}
                  {member.skills.length > searchSkills.length && (
                    <p className="mt-2 text-xs text-dark-muted">
                      +{member.skills.length - searchSkills.filter(id => 
                        member.skills.some(ms => ms.skill_id === id)
                      ).length} other skills
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* No Matches Found */
            <div className="text-center py-8 space-y-4">
              <div className="text-dark-muted">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No members found with these skills</p>
                <p className="text-sm mt-1">
                  Try searching with fewer skills or different combinations
                </p>
              </div>
              
              {onNoMatchFound && (
                <div className="pt-4 border-t border-dark-border">
                  <p className="text-sm text-dark-muted mb-3">
                    Can't find the right person internally?
                  </p>
                  <NeonButton
                    onClick={onNoMatchFound}
                    variant="primary"
                    icon={<ExternalLink className="h-4 w-4" />}
                  >
                    Post to Campus Network
                  </NeonButton>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}