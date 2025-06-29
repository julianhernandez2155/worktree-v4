'use client';

import { motion } from 'framer-motion';
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
}

const filters = [
  { id: 'all', label: 'All', icon: Zap },
  { id: 'perfect-match', label: 'Perfect Match', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'closing-soon', label: 'Closing Soon', icon: Clock },
  { id: 'remote', label: 'Remote', icon: Globe },
];

export function FilterPills({ selectedFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isSelected = selectedFilter === filter.id;
        
        return (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium",
              "border transition-all duration-200",
              "flex items-center gap-2 whitespace-nowrap",
              isSelected
                ? "bg-neon-green text-dark-bg border-neon-green"
                : "bg-dark-card text-white border-dark-border hover:border-neon-green/50"
            )}
          >
            <motion.div
              animate={isSelected ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
            <span>{filter.label}</span>
            
            {/* Animated indicator */}
            {isSelected && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-neon-green rounded-full -z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}