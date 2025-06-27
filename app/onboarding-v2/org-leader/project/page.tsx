'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { QuickProject } from '@/lib/types/onboarding';
import { 
  Rocket,
  Calendar,
  Code,
  Palette,
  Megaphone,
  FileText,
  Users,
  TrendingUp,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';

export default function OrgProjectSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('org');
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<QuickProject>({
    name: '',
    timeline: 'this_month',
    topNeeds: []
  });
  const supabase = createClient();

  const timelines = [
    { value: 'this_week', label: 'This Week', icon: '🔥' },
    { value: 'this_month', label: 'This Month', icon: '📅' },
    { value: 'this_semester', label: 'This Semester', icon: '📚' }
  ];

  const skillCategories = [
    { 
      category: 'Technical',
      icon: Code,
      skills: ['Web Development', 'Data Analysis', 'App Development', 'Database Design']
    },
    { 
      category: 'Creative',
      icon: Palette,
      skills: ['Graphic Design', 'Video Editing', 'Photography', 'Content Writing']
    },
    { 
      category: 'Marketing',
      icon: Megaphone,
      skills: ['Social Media', 'Email Campaigns', 'SEO', 'Brand Strategy']
    },
    { 
      category: 'Operations',
      icon: FileText,
      skills: ['Event Planning', 'Project Management', 'Budget Management', 'Documentation']
    }
  ];

  const handleSkillToggle = (skill: string) => {
    if (formData.topNeeds.includes(skill)) {
      setFormData({
        ...formData,
        topNeeds: formData.topNeeds.filter(s => s !== skill)
      });
    } else if (formData.topNeeds.length < 3) {
      setFormData({
        ...formData,
        topNeeds: [...formData.topNeeds, skill]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create the internal project
      const { data: project, error: projectError } = await supabase
        .from('internal_projects')
        .insert({
          organization_id: orgId,
          name: formData.name,
          timeline: formData.timeline,
          created_by: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Track skill needs for the organization
      for (const skillName of formData.topNeeds) {
        // First get or create the skill
        let { data: skill } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skillName)
          .single();

        if (!skill) {
          const { data: newSkill } = await supabase
            .from('skills')
            .insert({ 
              name: skillName, 
              category: 'general' 
            })
            .select('id')
            .single();
          skill = newSkill;
        }

        if (skill) {
          // Track this as an organization skill need
          await supabase
            .from('organization_skill_needs')
            .upsert({
              organization_id: orgId,
              skill_id: skill.id,
              need_type: 'project_based',
              current_gap_level: 3 // Medium priority
            });
        }
      }

      // Update onboarding progress
      await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: { 
            path_selected: true,
            org_setup: true,
            first_project: true
          },
          completion_percentage: 60
        })
        .eq('user_id', user.id);

      // Navigate to invitation wizard
      router.push(`/onboarding-v2/org-leader/invite?org=${orgId}&project=${project.id}`);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-neon-blue" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Your First Project</h1>
          <p className="text-gray-400">Let's see Worktree in action with a real project</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g., Spring Fundraiser Campaign"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Timeline
              </label>
              <div className="grid grid-cols-3 gap-3">
                {timelines.map((timeline) => (
                  <button
                    key={timeline.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, timeline: timeline.value as any })}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      formData.timeline === timeline.value
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-dark-border hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{timeline.icon}</div>
                    <p className="text-sm font-medium">{timeline.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Needed */}
            <div>
              <label className="block text-sm font-medium mb-1">
                What skills do you need? (Choose up to 3)
              </label>
              <p className="text-xs text-gray-400 mb-4">
                We'll check if your members have these skills first
              </p>
              
              <div className="space-y-4">
                {skillCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.category}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">
                          {category.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {category.skills.map((skill) => {
                          const isSelected = formData.topNeeds.includes(skill);
                          const isDisabled = !isSelected && formData.topNeeds.length >= 3;
                          
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillToggle(skill)}
                              disabled={isDisabled}
                              className={`p-3 rounded-lg border text-sm transition-all ${
                                isSelected
                                  ? 'border-neon-blue bg-neon-blue/10 text-white'
                                  : isDisabled
                                  ? 'border-dark-border text-gray-600 cursor-not-allowed'
                                  : 'border-dark-border text-gray-400 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{skill}</span>
                                {isSelected && (
                                  <X className="w-4 h-4 ml-2" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {formData.topNeeds.length > 0 && (
                <div className="mt-4 p-3 bg-dark-surface rounded-lg">
                  <p className="text-sm text-gray-400">
                    Selected skills ({formData.topNeeds.length}/3):
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.topNeeds.map((skill) => (
                      <span key={skill} className="text-sm text-neon-blue">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NeonButton
              type="submit"
              fullWidth
              loading={loading}
              disabled={formData.topNeeds.length === 0}
              icon={<ChevronRight />}
              iconPosition="right"
            >
              Continue to Team Building
            </NeonButton>
          </form>
        </GlassCard>

        <p className="text-center text-sm text-gray-400 mt-4">
          Next: Invite your team and see who has these skills
        </p>
      </div>
    </div>
  );
}