'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Shield, TrendingUp, Users, CheckCircle2, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface SkillsVisualizationProps {
  memberSkills: any[];
  contributions: any[];
}

const SKILL_CATEGORIES = [
  { id: 'all', label: 'All Skills', color: 'gray' },
  { id: 'Programming', label: 'Programming', color: 'blue' },
  { id: 'Framework', label: 'Frameworks', color: 'purple' },
  { id: 'Skill', label: 'Professional', color: 'green' },
  { id: 'Soft Skill', label: 'Soft Skills', color: 'yellow' },
  { id: 'Technology', label: 'Technology', color: 'red' },
];

export function SkillsVisualization({ memberSkills, contributions }: SkillsVisualizationProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState<any>(null);

  // Filter skills by category
  const filteredSkills = memberSkills.filter(ms => 
    selectedCategory === 'all' || ms.skills.category === selectedCategory
  );

  // Calculate skill usage from contributions
  const skillUsage = contributions.reduce((acc, item) => {
    if (item.contributions.task_required_skills) {
      item.contributions.task_required_skills.forEach((skillReq: any) => {
        const skillId = skillReq.skills.id;
        if (!acc[skillId]) {
          acc[skillId] = { count: 0, projects: [] };
        }
        acc[skillId].count++;
        acc[skillId].projects.push({
          name: item.contributions.title,
          date: item.completed_at || item.assigned_at,
          organization: item.contributions.internal_projects?.organizations?.name
        });
      });
    }
    return acc;
  }, {} as Record<string, { count: number; projects: any[] }>);

  // Sort skills by verification and endorsements
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;
    return (b.endorsement_count || 0) - (a.endorsement_count || 0);
  });

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-neon-green';
      case 'advanced': return 'text-blue-400';
      case 'intermediate': return 'text-yellow-400';
      case 'beginner': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getProficiencyLabel = (level: string) => {
    return level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Beginner';
  };

  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="p-4 text-center">
            <Award className="w-8 h-8 text-neon-green mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{memberSkills.length}</div>
            <div className="text-sm text-gray-400">Total Skills</div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="p-4 text-center">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {memberSkills.filter(s => s.verified).length}
            </div>
            <div className="text-sm text-gray-400">Verified</div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="p-4 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {memberSkills.reduce((sum, s) => sum + (s.endorsement_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Endorsements</div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {Object.keys(skillUsage).length}
            </div>
            <div className="text-sm text-gray-400">Skills Used</div>
          </div>
        </GlassCard>
      </div>

      {/* Category Filter */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Skills by Category</h2>
          <div className="flex flex-wrap gap-2">
            {SKILL_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all",
                  selectedCategory === category.id
                    ? "bg-neon-green text-black font-medium"
                    : "bg-dark-surface text-gray-300 hover:text-white"
                )}
              >
                {category.label}
                <span className="ml-2 text-sm opacity-70">
                  ({memberSkills.filter(s => category.id === 'all' || s.skills.category === category.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Skills Grid */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Your Skills</h2>
          
          {sortedSkills.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No skills in this category yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedSkills.map((memberSkill) => {
                const skill = memberSkill.skills;
                const usage = skillUsage[skill.id];
                
                return (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedSkill(memberSkill)}
                    className={cn(
                      "p-4 bg-dark-surface rounded-lg cursor-pointer transition-all",
                      "hover:bg-dark-card hover:shadow-lg",
                      memberSkill.verified && "ring-1 ring-neon-green/30"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-white flex items-center gap-2">
                          {skill.name}
                          {memberSkill.verified && (
                            <CheckCircle2 className="w-4 h-4 text-neon-green" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">{skill.category}</p>
                      </div>
                      
                      <span className={cn(
                        "text-xs font-medium",
                        getProficiencyColor(memberSkill.proficiency_level)
                      )}>
                        {getProficiencyLabel(memberSkill.proficiency_level)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {memberSkill.endorsement_count > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          {memberSkill.endorsement_count} endorsement{memberSkill.endorsement_count > 1 ? 's' : ''}
                        </div>
                      )}
                      
                      {usage && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Award className="w-4 h-4" />
                          Used in {usage.count} project{usage.count > 1 ? 's' : ''}
                        </div>
                      )}

                      {memberSkill.verified && memberSkill.verified_at && (
                        <div className="text-xs text-gray-500">
                          Verified {new Date(memberSkill.verified_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Proficiency bar */}
                    <div className="mt-3">
                      <div className="h-1 bg-dark-bg rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all",
                            memberSkill.proficiency_level === 'expert' && "w-full bg-neon-green",
                            memberSkill.proficiency_level === 'advanced' && "w-3/4 bg-blue-400",
                            memberSkill.proficiency_level === 'intermediate' && "w-1/2 bg-yellow-400",
                            (!memberSkill.proficiency_level || memberSkill.proficiency_level === 'beginner') && "w-1/4 bg-gray-400"
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Add Skills CTA */}
      <GlassCard>
        <div className="p-6 text-center">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Add More Skills</h3>
          <p className="text-sm text-gray-400 mb-4">
            Complete projects and tasks to automatically verify your skills
          </p>
          <button className="px-6 py-2 bg-neon-green text-black font-medium rounded-lg hover:bg-neon-green/90 transition-colors">
            Browse Projects
          </button>
        </div>
      </GlassCard>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedSkill(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <GlassCard>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {selectedSkill.skills.name}
                      {selectedSkill.verified && (
                        <CheckCircle2 className="w-6 h-6 text-neon-green" />
                      )}
                    </h2>
                    <p className="text-gray-400">{selectedSkill.skills.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSkill(null)}
                    className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Proficiency Level</h3>
                    <div className={cn(
                      "text-lg font-medium",
                      getProficiencyColor(selectedSkill.proficiency_level)
                    )}>
                      {getProficiencyLabel(selectedSkill.proficiency_level)}
                    </div>
                  </div>

                  {selectedSkill.verified && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Verification</h3>
                      <div className="text-sm text-gray-300">
                        Verified on {new Date(selectedSkill.verified_at).toLocaleDateString()}
                        {selectedSkill.verified_by && (
                          <span className="block text-gray-500">
                            by Task Completion
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSkill.endorsement_count > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Endorsements</h3>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span className="text-lg font-medium text-white">
                          {selectedSkill.endorsement_count}
                        </span>
                      </div>
                    </div>
                  )}

                  {skillUsage[selectedSkill.skills.id] && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Projects Used</h3>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="text-lg font-medium text-white">
                          {skillUsage[selectedSkill.skills.id].count}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {skillUsage[selectedSkill.skills.id] && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Where You've Used This Skill</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {skillUsage[selectedSkill.skills.id].projects.map((project: any, index: number) => (
                        <div key={index} className="p-3 bg-dark-surface rounded-lg">
                          <div className="font-medium text-white">{project.name}</div>
                          <div className="text-sm text-gray-400">
                            {project.organization} • {new Date(project.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}