'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { ContextualPrompt, SkillWithLevel } from '@/lib/types/onboarding';
import { 
  Sparkles,
  Plus,
  X,
  ChevronRight,
  Target,
  Briefcase,
  TrendingUp
} from 'lucide-react';

interface ContextualSkillPromptProps {
  prompt: ContextualPrompt;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function ContextualSkillPrompt({ 
  prompt, 
  onComplete, 
  onDismiss 
}: ContextualSkillPromptProps) {
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<SkillWithLevel[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const supabase = createClient();

  // Extract skills from prompt data
  const suggestedSkills = prompt.data?.skills || [];
  const organizationName = prompt.data?.organizationName || 'your organization';

  const skillLevels = [
    { value: 'beginner', label: 'Learning', icon: '🌱' },
    { value: 'intermediate', label: 'Comfortable', icon: '🎯' },
    { value: 'advanced', label: 'Expert', icon: '🚀' }
  ];

  const handleAddSkill = (skillName: string, level: string = 'intermediate') => {
    const newSkill: SkillWithLevel = {
      skillId: '', // Will be assigned by backend
      skillName,
      level: level as any,
      experience: 'personal'
    };
    
    setSelectedSkills([...selectedSkills, newSkill]);
  };

  const handleRemoveSkill = (index: number) => {
    setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedSkills.length === 0) return;
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Add skills to user profile
      for (const skill of selectedSkills) {
        // First get or create the skill
        let { data: existingSkill } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skill.skillName)
          .single();

        if (!existingSkill) {
          const { data: newSkill } = await supabase
            .from('skills')
            .insert({ 
              name: skill.skillName, 
              category: 'general' 
            })
            .select('id')
            .single();
          existingSkill = newSkill;
        }

        if (existingSkill) {
          // Add to user skills
          await supabase
            .from('user_skills')
            .upsert({
              user_id: user.id,
              skill_id: existingSkill.id,
              level: skill.level
            });

          // Track skill progression
          await supabase
            .from('skill_progression')
            .upsert({
              user_id: user.id,
              skill_id: existingSkill.id,
              initial_level: skill.level,
              current_level: skill.level
            });
        }
      }

      // Update profile completeness
      await supabase.rpc('update_profile_completeness', { user_id: user.id });

      // Track prompt completion
      await supabase
        .from('contextual_prompts')
        .update({
          shown_to_users: prompt.data?.shown_to_users + 1,
          completed_by_users: prompt.data?.completed_by_users + 1
        })
        .eq('id', prompt.id);

      setShow(false);
      onComplete?.();
    } catch (error) {
      console.error('Error adding skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md w-full z-50 animate-slide-up">
      <GlassCard className="relative overflow-hidden">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-neon-green/20 via-neon-blue/20 to-neon-purple/20 opacity-50" />
        
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h3 className="font-semibold">{prompt.title}</h3>
                <p className="text-sm text-gray-400">{prompt.message}</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Suggested skills */}
          {suggestedSkills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">
                Skills {organizationName} needs:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map((skill: string) => {
                  const isAdded = selectedSkills.some(s => s.skillName === skill);
                  
                  return (
                    <button
                      key={skill}
                      onClick={() => !isAdded && handleAddSkill(skill)}
                      disabled={isAdded}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        isAdded
                          ? 'bg-neon-green/20 text-neon-green cursor-default'
                          : 'bg-dark-surface hover:bg-dark-border text-gray-300'
                      }`}
                    >
                      {isAdded ? '✓ ' : '+ '}{skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom skill input */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add another skill..."
                className="input-field flex-1 text-sm"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customSkill.trim()) {
                    handleAddSkill(customSkill.trim());
                    setCustomSkill('');
                  }
                }}
              />
              <NeonButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (customSkill.trim()) {
                    handleAddSkill(customSkill.trim());
                    setCustomSkill('');
                  }
                }}
                disabled={!customSkill.trim()}
                icon={<Plus />}
              >
                Add
              </NeonButton>
            </div>
          </div>

          {/* Selected skills with levels */}
          {selectedSkills.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-400">Your skills:</p>
              {selectedSkills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-dark-surface rounded-lg">
                  <span className="text-sm font-medium">{skill.skillName}</span>
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-transparent text-xs border border-dark-border rounded px-2 py-1"
                      value={skill.level}
                      onChange={(e) => {
                        const updated = [...selectedSkills];
                        if (updated[index]) {
                          updated[index].level = e.target.value as any;
                        }
                        setSelectedSkills(updated);
                      }}
                    >
                      {skillLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.icon} {level.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
            >
              Not now
            </NeonButton>
            <NeonButton
              fullWidth
              size="sm"
              onClick={handleSubmit}
              loading={loading}
              disabled={selectedSkills.length === 0}
              icon={<ChevronRight />}
              iconPosition="right"
            >
              {prompt.actionText || 'Add Skills'}
            </NeonButton>
          </div>

          {/* Value prop */}
          <p className="text-xs text-gray-400 text-center mt-3">
            Adding skills helps you get matched to relevant projects
          </p>
        </div>
      </GlassCard>
    </div>
  );
}