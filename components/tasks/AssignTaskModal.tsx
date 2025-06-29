'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  X, 
  User,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  user_id: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  role: string;
  skills: string[]; // Will be populated from member_skills
  requiredSkillMatches: string[];
  preferredSkillMatches: string[];
}

interface TaskRequiredSkill {
  skill_id: string;
  importance: 'required' | 'preferred';
  skill: {
    id: string;
    name: string;
  };
}

interface AssignTaskModalProps {
  taskId: string;
  orgSlug: string;
  onClose: () => void;
  onAssigned?: () => void;
  multiSelect?: boolean;
}

export function AssignTaskModal({ taskId, orgSlug, onClose, onAssigned, multiSelect = true }: AssignTaskModalProps) {
  const [task, setTask] = useState<any>(null);
  const [taskRequiredSkills, setTaskRequiredSkills] = useState<TaskRequiredSkill[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [existingAssignees, setExistingAssignees] = useState<string[]>([]);
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [taskId, orgSlug]);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, members, showOnlyMatches]);

  const loadData = async () => {
    try {
      // Load task details
      const { data: taskData } = await supabase
        .from('contributions')
        .select('*')
        .eq('id', taskId)
        .single();

      setTask(taskData);

      // Load task required skills
      const { data: requiredSkillsData } = await supabase
        .from('task_required_skills')
        .select(`
          skill_id,
          importance,
          skill:skills(id, name)
        `)
        .eq('task_id', taskId);

      setTaskRequiredSkills(requiredSkillsData || []);

      // Get existing assignees
      const { data: assigneesData } = await supabase
        .from('task_assignees')
        .select('assignee_id')
        .eq('task_id', taskId);
      
      if (assigneesData) {
        setExistingAssignees(assigneesData.map(a => a.assignee_id));
      }

      // Get organization ID
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org) return;

      // Load organization members with their profiles
      const { data: membersData } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:profiles!user_id(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', org.id);

      if (!membersData) return;

      // Get all member IDs
      const memberIds = membersData.map(m => m.user_id);

      // Fetch skills for all members
      const { data: memberSkillsData } = await supabase
        .from('member_skills')
        .select(`
          user_id,
          skill:skills!skill_id(name)
        `)
        .in('user_id', memberIds);

      // Create a map of user_id to skills
      const userSkillsMap = memberSkillsData?.reduce((acc, ms) => {
        if (!acc[ms.user_id]) {
          acc[ms.user_id] = [];
        }
        if (ms.skill?.name) {
          acc[ms.user_id].push(ms.skill.name);
        }
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Process members with skill matching
      const processedMembers: Member[] = membersData.map(member => {
        const memberSkills = userSkillsMap[member.user_id] || [];
        
        // Calculate skill matches
        const requiredSkillNames = requiredSkillsData
          ?.filter(rs => rs.importance === 'required')
          .map(rs => rs.skill.name) || [];
        
        const preferredSkillNames = requiredSkillsData
          ?.filter(rs => rs.importance === 'preferred')
          .map(rs => rs.skill.name) || [];

        const requiredMatches = memberSkills.filter(skill => 
          requiredSkillNames.includes(skill)
        );
        
        const preferredMatches = memberSkills.filter(skill => 
          preferredSkillNames.includes(skill)
        );

        return {
          ...member,
          skills: memberSkills,
          requiredSkillMatches: requiredMatches,
          preferredSkillMatches: preferredMatches
        };
      });

      // Sort by skill match (required skills first, then preferred)
      processedMembers.sort((a, b) => {
        const aScore = a.requiredSkillMatches.length * 2 + a.preferredSkillMatches.length;
        const bScore = b.requiredSkillMatches.length * 2 + b.preferredSkillMatches.length;
        return bScore - aScore;
      });

      setMembers(processedMembers);
      setFilteredMembers(processedMembers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => {
        const nameMatch = member.user.full_name?.toLowerCase().includes(query);
        const skillMatch = member.skills.some(skill => 
          skill.toLowerCase().includes(query)
        );
        return nameMatch || skillMatch;
      });
    }

    // Filter by skill matches if enabled
    if (showOnlyMatches) {
      filtered = filtered.filter(member => 
        member.requiredSkillMatches.length > 0 || 
        member.preferredSkillMatches.length > 0
      );
    }

    setFilteredMembers(filtered);
  };

  const handleAssign = async () => {
    if (selectedMembers.length === 0) return;

    try {
      setAssigning(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      // Add new assignees
      for (let i = 0; i < selectedMembers.length; i++) {
        const memberId = selectedMembers[i];
        const { error } = await supabase
          .rpc('add_task_assignee', {
            p_task_id: taskId,
            p_assignee_id: memberId,
            p_assigned_by: user?.id,
            p_is_primary: i === 0 && existingAssignees.length === 0 // First assignee is primary if no existing
          });

        if (error) throw error;
      }

      // Update task status if it was pending
      const { data: taskData } = await supabase
        .from('contributions')
        .select('status')
        .eq('id', taskId)
        .single();

      if (taskData?.status === 'pending') {
        await supabase
          .from('contributions')
          .update({ status: 'in_progress' })
          .eq('id', taskId);
      }

      onAssigned?.();
      onClose();
    } catch (error) {
      console.error('Error assigning task:', error);
    } finally {
      setAssigning(false);
    }
  };

  const getSkillMatchInfo = (member: Member) => {
    const totalRequired = taskRequiredSkills.filter(s => s.importance === 'required').length;
    const totalPreferred = taskRequiredSkills.filter(s => s.importance === 'preferred').length;
    
    const requiredPercent = totalRequired > 0 
      ? (member.requiredSkillMatches.length / totalRequired) * 100 
      : 0;
    
    const preferredPercent = totalPreferred > 0 
      ? (member.preferredSkillMatches.length / totalPreferred) * 100 
      : 0;

    const overallScore = (requiredPercent * 0.7) + (preferredPercent * 0.3);

    return {
      requiredPercent,
      preferredPercent,
      overallScore,
      hasAllRequired: requiredPercent === 100
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div>
            <h2 className="text-2xl font-bold text-white">Assign Task</h2>
            <p className="text-dark-muted mt-1">
              Find the best member for "{task?.task_name}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-dark-muted" />
          </button>
        </div>

        <div className="p-6">
          {/* Task Skills */}
          {taskRequiredSkills.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-dark-muted mb-2">Task Requirements</p>
              <div className="space-y-2">
                {taskRequiredSkills.filter(s => s.importance === 'required').length > 0 && (
                  <div>
                    <p className="text-xs text-dark-muted mb-1">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {taskRequiredSkills
                        .filter(s => s.importance === 'required')
                        .map((skill) => (
                          <span 
                            key={skill.skill_id}
                            className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full"
                          >
                            {skill.skill.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
                {taskRequiredSkills.filter(s => s.importance === 'preferred').length > 0 && (
                  <div>
                    <p className="text-xs text-dark-muted mb-1">Preferred Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {taskRequiredSkills
                        .filter(s => s.importance === 'preferred')
                        .map((skill) => (
                          <span 
                            key={skill.skill_id}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full"
                          >
                            {skill.skill.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg 
                         text-white placeholder-dark-muted focus:border-neon-green focus:outline-none"
              />
            </div>
            
            {taskRequiredSkills.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyMatches}
                  onChange={(e) => setShowOnlyMatches(e.target.checked)}
                  className="w-4 h-4 rounded bg-dark-card border-dark-border text-neon-green 
                           focus:ring-neon-green focus:ring-offset-0"
                />
                <span className="text-sm text-dark-muted">
                  Show only members with matching skills
                </span>
              </label>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredMembers.map((member) => {
              const matchInfo = getSkillMatchInfo(member);
              const isSelected = selectedMembers.includes(member.user_id);
              const isExisting = existingAssignees.includes(member.user_id);

              return (
                <div
                  key={member.user_id}
                  onClick={() => {
                    if (isExisting) return;
                    if (multiSelect) {
                      setSelectedMembers(prev => 
                        isSelected 
                          ? prev.filter(id => id !== member.user_id)
                          : [...prev, member.user_id]
                      );
                    } else {
                      setSelectedMembers(isSelected ? [] : [member.user_id]);
                    }
                  }}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    isExisting
                      ? "bg-dark-bg border-dark-border opacity-50 cursor-default"
                      : isSelected
                      ? "bg-neon-green/10 border-neon-green cursor-pointer"
                      : matchInfo.hasAllRequired
                      ? "bg-dark-card border-green-500/30 hover:border-green-500/50 cursor-pointer"
                      : "bg-dark-card border-dark-border hover:border-dark-muted cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-dark-bg rounded-full flex items-center justify-center">
                      {member.user.avatar_url ? (
                        <img 
                          src={member.user.avatar_url} 
                          alt={member.user.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5 text-dark-muted" />
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-white">
                          {member.user.full_name || 'Unknown'}
                          {isExisting && <span className="text-xs text-dark-muted ml-2">(Already assigned)</span>}
                        </h3>
                        
                        {/* Skill Match Badges */}
                        {member.requiredSkillMatches.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 rounded-full">
                            <CheckCircle className="h-3 w-3 text-red-400" />
                            <span className="text-xs text-red-400">
                              {member.requiredSkillMatches.length} required
                            </span>
                          </div>
                        )}
                        
                        {member.preferredSkillMatches.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 rounded-full">
                            <Sparkles className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-blue-400">
                              {member.preferredSkillMatches.length} preferred
                            </span>
                          </div>
                        )}
                        
                        {matchInfo.hasAllRequired && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400">Perfect match</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-sm text-dark-muted">
                        <span>{member.role}</span>
                        {member.skills.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>
                              {member.skills.slice(0, 3).map(skill => {
                                const isRequired = member.requiredSkillMatches.includes(skill);
                                const isPreferred = member.preferredSkillMatches.includes(skill);
                                if (isRequired || isPreferred) {
                                  return (
                                    <span 
                                      key={skill} 
                                      className={cn(
                                        "font-medium",
                                        isRequired ? "text-red-400" : "text-blue-400"
                                      )}
                                    >
                                      {skill}
                                    </span>
                                  );
                                }
                                return skill;
                              }).reduce((prev, curr, i) => 
                                i === 0 ? [curr] : [...prev, ', ', curr], [] as React.ReactNode[]
                              )}
                            </span>
                            {member.skills.length > 3 && (
                              <span> +{member.skills.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isExisting ? (
                      <CheckCircle className="h-5 w-5 text-dark-muted" />
                    ) : isSelected ? (
                      <CheckCircle className="h-5 w-5 text-neon-green" />
                    ) : null}
                  </div>
                </div>
              );
            })}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-dark-muted mx-auto mb-2" />
                <p className="text-dark-muted">No members found</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-dark-border">
          <div className="text-sm text-dark-muted">
            {selectedMembers.length > 0 ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-neon-green" />
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
              </span>
            ) : multiSelect ? (
              <span className="text-xs">Select multiple members to assign</span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-dark-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <NeonButton
              onClick={handleAssign}
              disabled={selectedMembers.length === 0 || assigning}
              loading={assigning}
            >
              Assign {selectedMembers.length > 1 ? `${selectedMembers.length} Members` : 'Task'}
            </NeonButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}