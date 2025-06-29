'use client';

import { X, CheckCircle, Circle, TrendingUp, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';

interface SkillMatchBreakdownProps {
  projectName: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  onClose: () => void;
}

export function SkillMatchBreakdown({
  projectName,
  matchScore,
  matchedSkills,
  missingSkills,
  onClose
}: SkillMatchBreakdownProps) {
  const getMatchMessage = () => {
    if (matchScore >= 90) return "You're an excellent match for this project!";
    if (matchScore >= 75) return "You're a strong candidate for this project";
    if (matchScore >= 60) return "You have good foundational skills for this project";
    return "This project will help you develop new skills";
  };

  const getMatchColor = () => {
    if (matchScore >= 90) return "text-neon-green";
    if (matchScore >= 75) return "text-blue-400";
    if (matchScore >= 60) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Why You're a {matchScore}% Match
              </h2>
              <p className="text-dark-muted">
                {projectName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-dark-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Match Summary */}
          <div className="mb-8 p-4 bg-dark-bg rounded-lg border border-dark-border">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg", 
                matchScore >= 90 ? "bg-neon-green/20" : 
                matchScore >= 75 ? "bg-blue-400/20" : 
                "bg-yellow-400/20"
              )}>
                <TrendingUp className={cn("h-6 w-6", getMatchColor())} />
              </div>
              <div>
                <p className={cn("text-lg font-semibold", getMatchColor())}>
                  {getMatchMessage()}
                </p>
                <p className="text-sm text-dark-muted">
                  Based on your skills and experience
                </p>
              </div>
            </div>
          </div>

          {/* Skills You Have */}
          {matchedSkills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-neon-green" />
                Skills You Already Have ({matchedSkills.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {matchedSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg border border-neon-green/20"
                  >
                    <CheckCircle className="h-4 w-4 text-neon-green flex-shrink-0" />
                    <span className="text-white">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills You'll Gain */}
          {missingSkills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Circle className="h-5 w-5 text-blue-400" />
                New Skills You'll Gain ({missingSkills.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {missingSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg border border-blue-400/20"
                  >
                    <Circle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-white">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Sprout's Take</h4>
                <p className="text-sm text-dark-muted">
                  {matchScore >= 75 ? (
                    <>This project aligns perfectly with your career trajectory. 
                    The {missingSkills.length > 0 ? `${missingSkills.length} new skills` : 'experience'} you'll 
                    gain will be valuable for future opportunities in tech.</>
                  ) : (
                    <>This is a great growth opportunity. While you'll need to learn 
                    {missingSkills.length} new skills, your existing foundation in 
                    {matchedSkills.slice(0, 2).join(' and ')} will help you succeed.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dark-border">
          <div className="flex gap-3">
            <NeonButton variant="secondary" onClick={onClose} className="flex-1">
              Close
            </NeonButton>
            <NeonButton className="flex-1">
              Apply Now
            </NeonButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}