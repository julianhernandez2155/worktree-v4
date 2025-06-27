'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles, Zap, TrendingUp, Target, Rocket } from 'lucide-react';

export type MatchQuality = 'perfect' | 'strong' | 'good' | 'stretch' | 'reach';

interface MatchQualityIndicatorProps {
  quality: MatchQuality;
  score?: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showScore?: boolean;
  animated?: boolean;
  className?: string;
}

const matchConfig = {
  perfect: {
    label: 'Perfect Match',
    icon: Sparkles,
    color: 'text-match-perfect',
    bg: 'bg-match-perfect/10',
    border: 'border-match-perfect/30',
    glow: 'shadow-glow',
    description: 'Ideal for your skills and experience',
  },
  strong: {
    label: 'Strong Match',
    icon: Zap,
    color: 'text-match-strong',
    bg: 'bg-match-strong/10',
    border: 'border-match-strong/30',
    glow: 'shadow-glow-blue',
    description: 'Great fit with minor gaps',
  },
  good: {
    label: 'Good Match',
    icon: Target,
    color: 'text-match-good',
    bg: 'bg-match-good/10',
    border: 'border-match-good/30',
    glow: 'shadow-[0_0_10px_rgba(255,217,61,0.3)]',
    description: 'Solid opportunity to grow',
  },
  stretch: {
    label: 'Stretch Goal',
    icon: TrendingUp,
    color: 'text-match-stretch',
    bg: 'bg-match-stretch/10',
    border: 'border-match-stretch/30',
    glow: 'shadow-[0_0_10px_rgba(255,107,107,0.3)]',
    description: 'Challenge yourself',
  },
  reach: {
    label: 'Reach Goal',
    icon: Rocket,
    color: 'text-match-reach',
    bg: 'bg-match-reach/10',
    border: 'border-match-reach/30',
    glow: 'shadow-glow-purple',
    description: 'Ambitious but possible',
  },
};

const sizeStyles = {
  sm: {
    badge: 'px-2 py-0.5 text-xs gap-1',
    icon: 'w-3 h-3',
  },
  md: {
    badge: 'px-3 py-1 text-sm gap-1.5',
    icon: 'w-4 h-4',
  },
  lg: {
    badge: 'px-4 py-1.5 text-base gap-2',
    icon: 'w-5 h-5',
  },
};

export function MatchQualityIndicator({ 
  quality, 
  score,
  size = 'md', 
  showLabel = true,
  showScore = false,
  animated = true,
  className 
}: MatchQualityIndicatorProps) {
  const config = matchConfig[quality];
  const Icon = config.icon;
  const sizeConfig = sizeStyles[size];
  
  const baseStyles = cn(
    'inline-flex items-center rounded-full font-medium border transition-all duration-200',
    config.color,
    config.bg,
    config.border,
    sizeConfig.badge,
    'hover:' + config.glow,
    className
  );

  const content = (
    <>
      <Icon className={cn(sizeConfig.icon, 'flex-shrink-0')} />
      {showLabel && <span>{config.label}</span>}
      {showScore && score !== undefined && (
        <span className="opacity-70">({score}%)</span>
      )}
    </>
  );

  if (animated) {
    return (
      <motion.div
        className={baseStyles}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {content}
      </motion.div>
    );
  }

  return <div className={baseStyles}>{content}</div>;
}

// Visual match score display
interface MatchScoreDisplayProps {
  score: number; // 0-100
  quality: MatchQuality;
  showDetails?: boolean;
  className?: string;
}

export function MatchScoreDisplay({ score, quality, showDetails = false, className }: MatchScoreDisplayProps) {
  const config = matchConfig[quality];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex flex-col items-center gap-2', className)}>
      <div className="relative">
        <svg className="w-32 h-32 -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-dark-elevated"
          />
          {/* Progress circle */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={config.color}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            strokeDasharray={circumference}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={cn('text-3xl font-bold', config.color)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}%
          </motion.div>
          <div className="text-xs text-gray-400">Match</div>
        </div>
      </div>
      
      {showDetails && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className={cn('font-medium', config.color)}>{config.label}</div>
          <div className="text-xs text-gray-400 mt-1">{config.description}</div>
        </motion.div>
      )}
    </div>
  );
}