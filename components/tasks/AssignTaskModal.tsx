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
    skills: string[];
  };
  role: string;
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
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [existingAssignees, setExistingAssignees] = useState<string[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [taskId, orgSlug]);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, members]);

  const loadData = async () => {
    try {
      // Load task details
      const { data: taskData } = await supabase
        .from('contributions')
        .select('*')
        .eq('id', taskId)
        .single();

      setTask(taskData);

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
            avatar_url,
            skills
          )
        `)
        .eq('organization_id', org.id);

      // Remove task load call - not implemented yet

      setMembers(membersData || []);
      setFilteredMembers(membersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (!searchQuery) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter(member => {
      const nameMatch = member.user.full_name?.toLowerCase().includes(query);
      const skillMatch = member.user.skills?.some(skill => 
        skill.toLowerCase().includes(query)
      );
      return nameMatch || skillMatch;
    });

    // Sort by skill match relevance
    if (task?.skills_used) {
      filtered.sort((a, b) => {
        const aMatches = a.user.skills?.filter(s => 
          task.skills_used.includes(s)
        ).length || 0;
        const bMatches = b.user.skills?.filter(s => 
          task.skills_used.includes(s)
        ).length || 0;
        return bMatches - aMatches;
      });
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

  const getSkillMatchScore = (member: Member) => {
    if (!task?.skills_used || !member.user.skills) return 0;
    const matches = member.user.skills.filter(skill => 
      task.skills_used.includes(skill)
    ).length;
    return (matches / task.skills_used.length) * 100;
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
          {task?.skills_used?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-dark-muted mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {task.skills_used.map((skill: string) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 bg-neon-green/20 text-neon-green text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
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

          {/* Members List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredMembers.map((member) => {
              const matchScore = getSkillMatchScore(member);
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">
                          {member.user.full_name || 'Unknown'}
                          {isExisting && <span className="text-xs text-dark-muted ml-2">(Already assigned)</span>}
                        </h3>
                        {matchScore > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                            <Sparkles className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400">
                              {Math.round(matchScore)}% match
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-dark-muted">
                        <span>{member.role}</span>
                        {member.user.skills?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{member.user.skills.slice(0, 3).join(', ')}</span>
                            {member.user.skills.length > 3 && (
                              <span>+{member.user.skills.length - 3} more</span>
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