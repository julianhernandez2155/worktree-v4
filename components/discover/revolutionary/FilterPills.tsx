'use client';

import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Globe,
  Zap
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface FilterPillsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  showPerfectMatch?: boolean;
}

const filters = [
  { id: 'all', label: 'All', icon: Zap },
  { id: 'perfect-match', label: 'Perfect Match', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'closing-soon', label: 'Closing Soon', icon: Clock },
  { id: 'remote', label: 'Remote', icon: Globe },
];

export function FilterPills({ selectedFilter, onFilterChange, showPerfectMatch = true }: FilterPillsProps) {
  const displayFilters = showPerfectMatch 
    ? filters 
    : filters.filter(f => f.id !== 'perfect-match');
    
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {displayFilters.map((filter) => {
        const Icon = filter.icon;
        const isSelected = selectedFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium",
              "transition-all duration-200",
              "flex items-center gap-2 whitespace-nowrap",
              isSelected
                ? "bg-dark-card text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-card/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}