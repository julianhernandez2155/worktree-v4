'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TaskRequiredSkill, Skill } from '@/types/skills';
import { SkillSelector } from '@/components/skills/SkillSelector';
import { Briefcase, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskSkillRequirementsProps {
  taskId?: string;
  initialSkills?: { skillId: string; importance: 'required' | 'preferred' }[];
  onChange?: (skills: { skillId: string; importance: 'required' | 'preferred' }[]) => void;
  isEditing?: boolean;
  className?: string;
}

export function TaskSkillRequirements({
  taskId,
  initialSkills = [],
  onChange,
  isEditing = true,
  className
}: TaskSkillRequirementsProps) {
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [taskSkills, setTaskSkills] = useState<TaskRequiredSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // Load all skills for display
  useEffect(() => {
    loadAllSkills();
  }, []);

  // Load task skills if taskId provided
  useEffect(() => {
    if (taskId && !isEditing) {
      loadTaskSkills();
    }
  }, [taskId, isEditing]);

  // Initialize from props
  useEffect(() => {
    if (initialSkills.length > 0) {
      const required = initialSkills
        .filter(s => s.importance === 'required')
        .map(s => s.skillId);
      const preferred = initialSkills
        .filter(s => s.importance === 'preferred')
        .map(s => s.skillId);
      
      setRequiredSkills(required);
      setPreferredSkills(preferred);
    }
  }, [initialSkills]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange && isEditing) {
      const skills = [
        ...requiredSkills.map(skillId => ({ skillId, importance: 'required' as const })),
        ...preferredSkills.map(skillId => ({ skillId, importance: 'preferred' as const }))
      ];
      onChange(skills);
    }
  }, [requiredSkills, preferredSkills, onChange, isEditing]);

  const loadAllSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAllSkills(data || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const loadTaskSkills = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_required_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('task_id', taskId);

      if (error) throw error;

      setTaskSkills(data || []);
      
      // Separate into required and preferred
      const required = data?.filter(ts => ts.importance === 'required').map(ts => ts.skill_id) || [];
      const preferred = data?.filter(ts => ts.importance === 'preferred').map(ts => ts.skill_id) || [];
      
      setRequiredSkills(required);
      setPreferredSkills(preferred);
    } catch (error) {
      console.error('Error loading task skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequiredSkillsChange = (skills: string[]) => {
    // Remove from preferred if adding to required
    const newPreferred = preferredSkills.filter(id => !skills.includes(id));
    setPreferredSkills(newPreferred);
    setRequiredSkills(skills);
  };

  const handlePreferredSkillsChange = (skills: string[]) => {
    // Remove from required if adding to preferred
    const newRequired = requiredSkills.filter(id => !skills.includes(id));
    setRequiredSkills(newRequired);
    setPreferredSkills(skills);
  };

  const getSkillById = (skillId: string) => {
    return allSkills.find(s => s.id === skillId);
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

  if (!isEditing && taskSkills.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {isEditing ? (
        <>
          {/* Required Skills */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Briefcase className="h-4 w-4 text-red-400" />
              Required Skills
            </label>
            <SkillSelector
              selectedSkills={requiredSkills}
              onSkillsChange={handleRequiredSkillsChange}
              placeholder="Add required skills..."
              maxSkills={10}
            />
          </div>

          {/* Preferred Skills */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              Preferred Skills
            </label>
            <SkillSelector
              selectedSkills={preferredSkills}
              onSkillsChange={handlePreferredSkillsChange}
              placeholder="Add preferred skills (nice to have)..."
              maxSkills={10}
            />
          </div>
        </>
      ) : (
        /* Display Mode */
        <div className="space-y-3">
          {/* Required Skills Display */}
          {taskSkills.filter(ts => ts.importance === 'required').length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-dark-muted mb-2">
                <Briefcase className="h-3.5 w-3.5 text-red-400" />
                Required Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {taskSkills
                  .filter(ts => ts.importance === 'required')
                  .map(ts => {
                    const skill = ts.skill;
                    if (!skill) return null;
                    return (
                      <span
                        key={ts.skill_id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs 
                                 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full"
                      >
                        <span className={getCategoryColor(skill.category)}>●</span>
                        {skill.name}
                      </span>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Preferred Skills Display */}
          {taskSkills.filter(ts => ts.importance === 'preferred').length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-dark-muted mb-2">
                <Star className="h-3.5 w-3.5 text-yellow-400" />
                Preferred Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {taskSkills
                  .filter(ts => ts.importance === 'preferred')
                  .map(ts => {
                    const skill = ts.skill;
                    if (!skill) return null;
                    return (
                      <span
                        key={ts.skill_id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs 
                                 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full"
                      >
                        <span className={getCategoryColor(skill.category)}>●</span>
                        {skill.name}
                      </span>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}