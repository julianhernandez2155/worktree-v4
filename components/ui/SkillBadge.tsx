import React, { memo } from 'react';
import { CheckCircle2, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: string;
  variant?: 'default' | 'matched' | 'missing' | 'verified' | 'growth' | undefined;
  size?: 'xs' | 'sm' | 'md' | undefined;
  showIcon?: boolean | undefined;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
}

const variantStyles = {
  default: 'bg-dark-surface text-gray-300',
  matched: 'bg-neon-green/20 text-neon-green',
  missing: 'bg-gray-500/20 text-gray-400',
  verified: 'bg-blue-500/20 text-blue-400',
  growth: 'bg-purple-500/20 text-purple-400',
};

const sizeStyles = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-3 py-1.5 text-base',
};

const variantIcons = {
  verified: CheckCircle2,
  growth: TrendingUp,
  matched: Star,
};

/**
 * Reusable Skill Badge Component
 * Displays skills with consistent styling across the app
 */
export const SkillBadge = memo<SkillBadgeProps>(({
  skill,
  variant = 'default',
  size = 'sm',
  showIcon = false,
  className,
  onClick,
}) => {
  const Icon = variantIcons[variant as keyof typeof variantIcons];
  const isClickable = !!onClick;

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        isClickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {showIcon && Icon && (
        <Icon className={cn(
          size === 'xs' && 'w-3 h-3',
          size === 'sm' && 'w-3.5 h-3.5',
          size === 'md' && 'w-4 h-4'
        )} />
      )}
      {skill}
    </span>
  );
});

SkillBadge.displayName = 'SkillBadge';

// Skill List Component for displaying multiple skills
interface SkillListProps {
  skills: string[];
  variant?: SkillBadgeProps['variant'] | undefined;
  size?: SkillBadgeProps['size'] | undefined;
  maxDisplay?: number | undefined;
  showIcon?: boolean | undefined;
  className?: string | undefined;
  onSkillClick?: ((skill: string) => void) | undefined;
}

export function SkillList({
  skills,
  variant,
  size = 'sm',
  maxDisplay = 5,
  showIcon = false,
  className,
  onSkillClick,
}: SkillListProps) {
  const displayedSkills = skills.slice(0, maxDisplay);
  const remainingCount = skills.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayedSkills.map((skill) => (
        <SkillBadge
          key={skill}
          skill={skill}
          variant={variant}
          size={size}
          showIcon={showIcon}
          onClick={onSkillClick ? () => onSkillClick(skill) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span className={cn(
          'inline-flex items-center text-gray-500',
          sizeStyles[size]
        )}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// Mixed Skill List for showing matched and missing skills
interface MixedSkillListProps {
  matchedSkills?: string[] | undefined;
  missingSkills?: string[] | undefined;
  verifiedSkills?: string[] | undefined;
  growthSkills?: string[] | undefined;
  size?: SkillBadgeProps['size'] | undefined;
  maxDisplay?: number | undefined;
  className?: string | undefined;
}

export function MixedSkillList({
  matchedSkills = [],
  missingSkills = [],
  verifiedSkills = [],
  growthSkills = [],
  size = 'sm',
  maxDisplay = 5,
  className,
}: MixedSkillListProps) {
  // Calculate how many of each type to show
  const totalSkills = matchedSkills.length + missingSkills.length + 
                     verifiedSkills.length + growthSkills.length;
  
  if (totalSkills === 0) return null;

  // Priority order: verified > matched > growth > missing
  const skillsToShow: Array<{ skill: string; variant: SkillBadgeProps['variant'] }> = [];
  
  verifiedSkills.forEach(skill => 
    skillsToShow.push({ skill, variant: 'verified' })
  );
  matchedSkills.forEach(skill => 
    skillsToShow.push({ skill, variant: 'matched' })
  );
  growthSkills.forEach(skill => 
    skillsToShow.push({ skill, variant: 'growth' })
  );
  missingSkills.forEach(skill => 
    skillsToShow.push({ skill, variant: 'missing' })
  );

  const displayedSkills = skillsToShow.slice(0, maxDisplay);
  const remainingCount = skillsToShow.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayedSkills.map(({ skill, variant }, index) => (
        <SkillBadge
          key={`${skill}-${index}`}
          skill={skill}
          variant={variant}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <span className={cn(
          'inline-flex items-center text-gray-500',
          sizeStyles[size]
        )}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}