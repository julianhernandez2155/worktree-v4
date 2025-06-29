'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MemberSkill, Skill } from '@/types/skills';
import { SkillSelector } from '@/components/skills/SkillSelector';
import { NeonButton } from '@/components/ui/NeonButton';
import { CheckCircle, Plus, Award, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberSkillsProps {
  userId: string;
  isOwnProfile?: boolean;
  className?: string;
}

export function MemberSkills({ userId, isOwnProfile = false, className }: MemberSkillsProps) {
  const [memberSkills, setMemberSkills] = useState<MemberSkill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    loadMemberSkills();
  }, [userId]);

  const loadMemberSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('member_skills')
        .select(`
          *,
          skill:skills!skill_id(*)
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      setMemberSkills(data || []);
      setSelectedSkillIds(data?.map(ms => ms.skill_id) || []);
    } catch (error) {
      console.error('Error loading member skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSkills = async () => {
    setSaving(true);
    try {
      // Get current skill IDs
      const currentSkillIds = memberSkills.map(ms => ms.skill_id);
      
      // Find skills to add and remove
      const skillsToAdd = selectedSkillIds.filter(id => !currentSkillIds.includes(id));
      const skillsToRemove = currentSkillIds.filter(id => !selectedSkillIds.includes(id));

      // Remove skills
      if (skillsToRemove.length > 0) {
        const { error } = await supabase
          .from('member_skills')
          .delete()
          .eq('user_id', userId)
          .in('skill_id', skillsToRemove);

        if (error) throw error;
      }

      // Add new skills
      if (skillsToAdd.length > 0) {
        const { error } = await supabase
          .from('member_skills')
          .insert(
            skillsToAdd.map(skillId => ({
              user_id: userId,
              skill_id: skillId,
              source: 'self_reported'
            }))
          );

        if (error) throw error;
      }

      // Reload skills
      await loadMemberSkills();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving skills:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Technical': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Creative': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Business': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Leadership': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Communication': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Operations': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const groupedSkills = memberSkills.reduce((acc, ms) => {
    if (!ms.skill) return acc;
    const category = ms.skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ms);
    return acc;
  }, {} as Record<string, MemberSkill[]>);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-neon-green" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Skills</h3>
        {isOwnProfile && !isEditing && (
          <NeonButton
            size="sm"
            variant="secondary"
            onClick={() => setIsEditing(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Skills
          </NeonButton>
        )}
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <div className="space-y-4">
          <SkillSelector
            selectedSkills={selectedSkillIds}
            onSkillsChange={setSelectedSkillIds}
            placeholder="Search and add skills..."
            maxSkills={20}
          />
          <div className="flex gap-2">
            <NeonButton
              size="sm"
              onClick={handleSaveSkills}
              loading={saving}
            >
              Save Skills
            </NeonButton>
            <NeonButton
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedSkillIds(memberSkills.map(ms => ms.skill_id));
                setIsEditing(false);
              }}
              disabled={saving}
            >
              Cancel
            </NeonButton>
          </div>
        </div>
      ) : (
        /* Display Mode */
        <div className="space-y-4">
          {Object.keys(groupedSkills).length > 0 ? (
            Object.entries(groupedSkills).map(([category, skills]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-dark-muted mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map(ms => (
                    <div
                      key={ms.skill_id}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                        "border transition-all duration-200",
                        getCategoryColor(category)
                      )}
                    >
                      {ms.source === 'task_verified' && (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      {ms.endorsed_by_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" />
                          <span className="text-xs">{ms.endorsed_by_count}</span>
                        </div>
                      )}
                      <span>{ms.skill?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-dark-muted">
              {isOwnProfile ? (
                <div className="space-y-2">
                  <p>You haven't added any skills yet</p>
                  <NeonButton
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add Your First Skill
                  </NeonButton>
                </div>
              ) : (
                <p>No skills added yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {!isEditing && memberSkills.some(ms => ms.source === 'task_verified' || ms.endorsed_by_count > 0) && (
        <div className="flex flex-wrap gap-4 text-xs text-dark-muted pt-2 border-t border-dark-border">
          {memberSkills.some(ms => ms.source === 'task_verified') && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              <span>Verified through completed tasks</span>
            </div>
          )}
          {memberSkills.some(ms => ms.endorsed_by_count > 0) && (
            <div className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-yellow-400" />
              <span>Endorsed by teammates</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}