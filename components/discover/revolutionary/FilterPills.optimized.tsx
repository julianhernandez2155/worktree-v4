import React, { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface FilterPillsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  showPerfectMatch?: boolean;
  className?: string;
}

interface FilterOption {
  id: string;
  label: string;
  description?: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'for-you', label: 'For You', description: 'Perfectly matched to your skills' },
  { id: 'all', label: 'All Projects' },
  { id: 'trending', label: 'Trending', description: 'Most popular right now' },
  { id: 'closing-soon', label: 'Closing Soon', description: 'Apply before it\'s too late' },
  { id: 'remote', label: 'Remote', description: 'Work from anywhere' },
];

/**
 * Optimized Filter Pills Component
 * Memoized to prevent unnecessary re-renders
 */
export const FilterPills = memo<FilterPillsProps>(({
  selectedFilter,
  onFilterChange,
  showPerfectMatch = true,
  className,
}) => {
  // Memoize click handler
  const handleFilterClick = useCallback((filterId: string) => {
    if (filterId !== selectedFilter) {
      onFilterChange(filterId);
    }
  }, [selectedFilter, onFilterChange]);

  // Filter options based on showPerfectMatch
  const displayedOptions = showPerfectMatch 
    ? FILTER_OPTIONS 
    : FILTER_OPTIONS.filter(opt => opt.id !== 'for-you');

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayedOptions.map((option) => (
        <FilterPill
          key={option.id}
          option={option}
          isSelected={selectedFilter === option.id}
          onClick={handleFilterClick}
        />
      ))}
    </div>
  );
});

FilterPills.displayName = 'FilterPills';

// Separate component for individual pills to optimize re-renders
interface FilterPillProps {
  option: FilterOption;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const FilterPill = memo<FilterPillProps>(({ option, isSelected, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(option.id);
  }, [onClick, option.id]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
        'hover:scale-105 active:scale-95',
        isSelected
          ? 'bg-neon-green text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]'
          : 'bg-dark-surface text-gray-400 hover:text-white hover:bg-dark-card',
        option.description && 'group relative'
      )}
      aria-pressed={isSelected}
      aria-label={option.description ? `${option.label}: ${option.description}` : option.label}
    >
      <span>{option.label}</span>
      
      {/* Tooltip for options with descriptions */}
      {option.description && !isSelected && (
        <span className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1',
          'bg-dark-card text-gray-300 text-xs rounded-lg whitespace-nowrap',
          'opacity-0 group-hover:opacity-100 pointer-events-none',
          'transition-opacity duration-200',
          'before:content-[""] before:absolute before:top-full before:left-1/2',
          'before:-translate-x-1/2 before:border-4 before:border-transparent',
          'before:border-t-dark-card'
        )}>
          {option.description}
        </span>
      )}
    </button>
  );
});

FilterPill.displayName = 'FilterPill';