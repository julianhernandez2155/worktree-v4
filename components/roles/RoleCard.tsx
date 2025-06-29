'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Target,
  TrendingUp,
  ChevronRight,
  Users
} from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';


interface RoleCardProps {
  role: {
    id: string;
    title: string;
    description: string;
    required_skills: string[];
    current_holder?: {
      id: string;
      full_name: string;
      avatar_url?: string;
      year_of_study?: string;
    };
    term_end_date?: string;
  };
  status: 'stable' | 'at-risk' | 'vacant';
  candidates: Array<{
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    match_score: number;
    ready: boolean;
  }>;
  onClick: () => void;
}

export function RoleCard({ role, status, candidates, onClick }: RoleCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'stable':
        return 'border-neon-green/50 bg-neon-green/5';
      case 'at-risk':
        return 'border-yellow-500/50 bg-yellow-500/5';
      case 'vacant':
        return 'border-neon-coral/50 bg-neon-coral/5';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'stable':
        return <CheckCircle className="w-5 h-5 text-neon-green" />;
      case 'at-risk':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'vacant':
        return <Target className="w-5 h-5 text-neon-coral" />;
    }
  };

  const getStatusText = () => {
    if (status === 'vacant') {return 'Vacant';}
    if (status === 'at-risk' && role.term_end_date) {
      const endDate = new Date(role.term_end_date);
      const monthsLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
      return `${monthsLeft} months left`;
    }
    return 'Stable';
  };

  const readyCandidates = candidates.filter(c => c.ready);

  return (
    <GlassCard 
      className={cn(
        "cursor-pointer border-2 transition-all hover:shadow-dark-lg",
        getStatusColor()
      )}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">{role.title}</h3>
            <p className="text-sm text-gray-400">{role.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={cn(
              "text-sm font-medium",
              status === 'stable' && "text-neon-green",
              status === 'at-risk' && "text-yellow-500",
              status === 'vacant' && "text-neon-coral"
            )}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Current Holder or Vacant Message */}
        {role.current_holder ? (
          <div className="flex items-center gap-3 mb-4 p-3 bg-dark-surface rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center font-semibold">
              {role.current_holder.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-medium">{role.current_holder.full_name}</p>
              <p className="text-sm text-gray-400">{role.current_holder.year_of_study}</p>
            </div>
            {role.term_end_date && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Term ends</p>
                <p className="text-sm font-medium">
                  {new Date(role.term_end_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 p-3 bg-neon-coral/10 border border-neon-coral/30 rounded-lg">
            <p className="text-sm text-neon-coral">
              This role is currently vacant and needs to be filled
            </p>
          </div>
        )}

        {/* Required Skills */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {role.required_skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-dark-surface rounded text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Succession Status */}
        <div className="pt-4 border-t border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              {readyCandidates.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neon-green" />
                  <span className="text-sm">
                    <span className="font-medium text-neon-green">{readyCandidates.length}</span>
                    {' '}ready candidate{readyCandidates.length !== 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500">
                    No ready successors
                  </span>
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Candidate Preview */}
          {candidates.length > 0 && (
            <div className="mt-3 flex -space-x-2">
              {candidates.slice(0, 4).map((candidate, index) => (
                <div
                  key={candidate.user.id}
                  className={cn(
                    "w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs font-semibold border-2 border-dark-bg",
                    candidate.ready && "ring-2 ring-neon-green"
                  )}
                  style={{ zIndex: 4 - index }}
                  title={`${candidate.user.full_name} - ${Math.round(candidate.match_score)}% match`}
                >
                  {candidate.user.full_name.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
              {candidates.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-dark-surface flex items-center justify-center text-xs text-gray-400 border-2 border-dark-bg">
                  +{candidates.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}