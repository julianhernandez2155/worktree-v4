import React from 'react';
import { LucideIcon, Search, Database, AlertCircle, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeonButton } from './NeonButton';

interface EmptyStateProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    container: 'py-8 px-4',
    iconContainer: 'w-12 h-12',
    icon: 'w-6 h-6',
    title: 'text-lg',
    description: 'text-sm',
  },
  md: {
    container: 'py-12 px-6',
    iconContainer: 'w-16 h-16',
    icon: 'w-8 h-8',
    title: 'text-xl',
    description: 'text-base',
  },
  lg: {
    container: 'py-16 px-8',
    iconContainer: 'w-20 h-20',
    icon: 'w-10 h-10',
    title: 'text-2xl',
    description: 'text-lg',
  },
};

/**
 * Reusable Empty State Component
 * Displays a consistent empty state UI across the application
 */
export function EmptyState({
  icon: Icon,
  iconClassName,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      styles.container,
      className
    )}>
      {Icon && (
        <div className={cn(
          'rounded-full bg-dark-surface flex items-center justify-center mb-4',
          styles.iconContainer
        )}>
          <Icon className={cn(
            'text-gray-600',
            styles.icon,
            iconClassName
          )} />
        </div>
      )}
      
      <h3 className={cn(
        'font-semibold text-white mb-2',
        styles.title
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          'text-gray-400 max-w-md mb-6',
          styles.description
        )}>
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <NeonButton
              onClick={action.onClick}
              icon={action.icon}
              size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
            >
              {action.label}
            </NeonButton>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={cn(
                'text-gray-400 hover:text-white transition-colors',
                size === 'sm' && 'text-sm',
                size === 'lg' && 'text-lg'
              )}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
interface PresetEmptyStateProps extends Omit<EmptyStateProps, 'icon' | 'title' | 'description'> {
  type: 'no-results' | 'no-data' | 'error' | 'no-permissions' | 'coming-soon';
  customTitle?: string;
  customDescription?: string;
}

const presetIcons = {
  'no-results': Search,
  'no-data': Database,
  'error': AlertCircle,
  'no-permissions': Lock,
  'coming-soon': Sparkles,
};

const presetData = {
  'no-results': {
    title: 'No results found',
    description: 'Try adjusting your filters or search terms',
  },
  'no-data': {
    title: 'No data yet',
    description: 'Get started by creating your first item',
  },
  'error': {
    title: 'Something went wrong',
    description: 'Please try again or contact support if the problem persists',
  },
  'no-permissions': {
    title: 'Access denied',
    description: "You don't have permission to view this content",
  },
  'coming-soon': {
    title: 'Coming soon',
    description: 'This feature is under development and will be available soon',
  },
};

export function PresetEmptyState({
  type,
  customTitle,
  customDescription,
  ...props
}: PresetEmptyStateProps) {
  const preset = presetData[type];
  const Icon = presetIcons[type];
  
  return (
    <EmptyState
      icon={Icon}
      title={customTitle || preset.title}
      description={customDescription || preset.description}
      {...props}
    />
  );
}