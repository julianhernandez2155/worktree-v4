import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-dark-surface flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-600" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-neon-green text-black font-medium rounded-lg 
                   hover:bg-neon-green/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}