'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const difficultyConfig = {
  beginner: {
    label: 'Beginner',
    color: 'text-difficulty-beginner',
    bg: 'bg-difficulty-beginner/20',
    border: 'border-difficulty-beginner/50',
    glow: 'shadow-glow-sm',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'text-difficulty-intermediate',
    bg: 'bg-difficulty-intermediate/20',
    border: 'border-difficulty-intermediate/50',
    glow: 'shadow-[0_0_10px_rgba(255,217,61,0.3)]',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-difficulty-advanced',
    bg: 'bg-difficulty-advanced/20',
    border: 'border-difficulty-advanced/50',
    glow: 'shadow-[0_0_10px_rgba(255,107,107,0.3)]',
  },
  expert: {
    label: 'Expert',
    color: 'text-difficulty-expert',
    bg: 'bg-difficulty-expert/20',
    border: 'border-difficulty-expert/50',
    glow: 'shadow-glow-purple',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function DifficultyBadge({ 
  level, 
  size = 'md', 
  showLabel = true, 
  animated = true,
  className 
}: DifficultyBadgeProps) {
  const config = difficultyConfig[level];
  
  const baseStyles = cn(
    'inline-flex items-center gap-1.5 rounded-full font-medium border transition-all duration-200',
    config.color,
    config.bg,
    config.border,
    sizeStyles[size],
    'hover:' + config.glow,
    className
  );

  const content = (
    <>
      <span className={cn(
        'inline-block rounded-full',
        size === 'sm' && 'w-1.5 h-1.5',
        size === 'md' && 'w-2 h-2',
        size === 'lg' && 'w-2.5 h-2.5',
        level === 'beginner' && 'bg-difficulty-beginner',
        level === 'intermediate' && 'bg-difficulty-intermediate',
        level === 'advanced' && 'bg-difficulty-advanced',
        level === 'expert' && 'bg-difficulty-expert'
      )} />
      {showLabel && config.label}
    </>
  );

  if (animated) {
    return (
      <motion.span
        className={baseStyles}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {content}
      </motion.span>
    );
  }

  return <span className={baseStyles}>{content}</span>;
}

// Difficulty indicator with progress bars
interface DifficultyIndicatorProps {
  level: DifficultyLevel;
  className?: string;
}

export function DifficultyIndicator({ level, className }: DifficultyIndicatorProps) {
  const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = levels.indexOf(level);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {levels.map((l, index) => {
        const config = difficultyConfig[l];
        const isActive = index <= currentIndex;
        
        return (
          <motion.div
            key={l}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === 0 && 'w-3',
              index === 1 && 'w-4',
              index === 2 && 'w-5',
              index === 3 && 'w-6',
              isActive ? cn('opacity-100', 
                l === 'beginner' && 'bg-difficulty-beginner',
                l === 'intermediate' && 'bg-difficulty-intermediate',
                l === 'advanced' && 'bg-difficulty-advanced',
                l === 'expert' && 'bg-difficulty-expert'
              ) : 'bg-dark-elevated opacity-30'
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isActive ? 1 : 0.3 }}
            transition={{ delay: index * 0.1 }}
          />
        );
      })}
    </div>
  );
}