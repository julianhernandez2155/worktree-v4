'use client';

import { cn } from '@/lib/utils';

interface PriorityIconProps {
  priority: 'critical' | 'high' | 'medium' | 'low' | null | undefined;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Priority configuration
export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-400', level: 3 },
  high: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-400', level: 3 },
  medium: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-400', level: 2 },
  low: { label: 'Low', color: 'text-gray-400', bgColor: 'bg-gray-400', level: 1 },
  none: { label: 'No priority', color: 'text-gray-500', bgColor: 'bg-gray-500', level: 0 }
};

export function PriorityIcon({ priority, className, size = 'md' }: PriorityIconProps) {
  const config = priority ? PRIORITY_CONFIG[priority] : PRIORITY_CONFIG.none;
  const level = config?.level || 0;
  
  // Size configurations
  const sizeConfig = {
    sm: { container: 'gap-0.5', bar: 'w-0.5', heights: ['h-1', 'h-1.5', 'h-2'] },
    md: { container: 'gap-0.5', bar: 'w-1', heights: ['h-1', 'h-2', 'h-3'] },
    lg: { container: 'gap-1', bar: 'w-1.5', heights: ['h-2', 'h-3', 'h-4'] }
  };
  
  const { container, bar, heights } = sizeConfig[size];
  
  const bars = [
    { height: heights[0], threshold: 1 },
    { height: heights[1], threshold: 2 },
    { height: heights[2], threshold: 3 },
  ];
  
  return (
    <div className={cn("flex items-end", container, className)}>
      {bars.map((barItem, index) => (
        <div
          key={index}
          className={cn(
            bar,
            barItem.height,
            "rounded-sm transition-colors",
            level >= barItem.threshold 
              ? config.bgColor
              : 'bg-gray-700'
          )}
        />
      ))}
    </div>
  );
}

// For places that need the priority options list
export const PRIORITY_OPTIONS = [
  { value: 'critical', ...PRIORITY_CONFIG.critical },
  { value: 'high', ...PRIORITY_CONFIG.high },
  { value: 'medium', ...PRIORITY_CONFIG.medium },
  { value: 'low', ...PRIORITY_CONFIG.low },
  { value: null, ...PRIORITY_CONFIG.none }
];