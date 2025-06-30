'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  GroupIcon,
  ChevronDown,
  Check,
  Layers,
  Tag,
  AlertTriangle,
  Calendar,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

type GroupBy = 'none' | 'status' | 'team' | 'priority' | 'timeline';

interface GroupByDropdownProps {
  value: GroupBy;
  onChange: (value: GroupBy) => void;
}

const GROUP_OPTIONS = [
  { value: 'none' as GroupBy, label: 'No grouping', icon: Layers },
  { value: 'status' as GroupBy, label: 'Status', icon: Tag },
  { value: 'team' as GroupBy, label: 'Team', icon: Users },
  { value: 'priority' as GroupBy, label: 'Priority', icon: AlertTriangle },
  { value: 'timeline' as GroupBy, label: 'Timeline', icon: Calendar }
];

export function GroupByDropdown({ value, onChange }: GroupByDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = GROUP_OPTIONS.find(opt => opt.value === value);
  const Icon = selectedOption?.icon || GroupIcon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm transition-colors flex items-center gap-2",
          value !== 'none' ? "text-white border-neon-green/30" : "text-gray-400 hover:text-white"
        )}
      >
        <Icon className="w-4 h-4" />
        {value === 'none' ? 'Group by' : `Grouped by ${selectedOption?.label}`}
        <ChevronDown className={cn(
          "w-3 h-3 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-1 right-0 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10 py-1"
          >
            {GROUP_OPTIONS.map(option => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between",
                    value === option.value ? "text-white" : "text-gray-400"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <OptionIcon className="w-4 h-4" />
                    {option.label}
                  </div>
                  {value === option.value && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}