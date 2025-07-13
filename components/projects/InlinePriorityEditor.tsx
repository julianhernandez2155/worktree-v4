'use client';

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { PriorityIcon, PRIORITY_OPTIONS as PRIORITY_CONFIG } from '@/components/ui/PriorityIcon';

interface InlinePriorityEditorProps {
  projectId: string;
  currentPriority?: string;
  onUpdate: (newPriority: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

// Map the imported options to match the expected format
const PRIORITY_OPTIONS = PRIORITY_CONFIG.filter(opt => opt.value !== null).map(opt => ({
  value: opt.value,
  label: opt.label,
  color: opt.color,
  bg: `${opt.bgColor}/10`
}));

export function InlinePriorityEditor({ projectId, currentPriority, onUpdate, size = 'sm' }: InlinePriorityEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handlePriorityChange = async (newPriority: string) => {
    if (newPriority === currentPriority) {
      setIsOpen(false);
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('internal_projects')
        .update({ priority: newPriority })
        .eq('id', projectId);

      if (error) throw error;

      onUpdate(newPriority);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setUpdating(false);
    }
  };

  const currentOption = PRIORITY_OPTIONS.find(p => p.value === currentPriority);

  if (!currentPriority || !currentOption) {
    return (
      <div ref={dropdownRef} className="relative flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1 rounded transition-all hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-neon-green/50"
        >
          <PriorityIcon priority={null} size={size} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full mt-1 left-0 w-32 bg-dark-card border border-dark-border rounded-lg shadow-xl z-20 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {PRIORITY_OPTIONS.map(option => (
                <button
                  key={option.value || 'none'}
                  onClick={() => handlePriorityChange(option.value)}
                  disabled={updating}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-3",
                    currentPriority === option.value ? option.color : "text-gray-400",
                    updating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <PriorityIcon priority={option.value as any} size={size} />
                  <span>{option.label}</span>
                  {currentPriority === option.value && (
                    <Check className="w-3 h-3 ml-auto" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative flex items-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={updating}
        className={cn(
          "p-1 rounded transition-all",
          "hover:bg-dark-surface",
          "focus:outline-none focus:ring-2 focus:ring-neon-green/50"
        )}
      >
        <PriorityIcon priority={currentPriority as any} size={size} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full mt-1 left-0 w-32 bg-dark-card border border-dark-border rounded-lg shadow-xl z-20 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            {PRIORITY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handlePriorityChange(option.value)}
                disabled={updating}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-3",
                  currentPriority === option.value ? option.color : "text-gray-400",
                  updating && "opacity-50 cursor-not-allowed"
                )}
              >
                <PriorityIcon priority={option.value as any} size="sm" />
                <span>{option.label}</span>
                {currentPriority === option.value && (
                  <Check className="w-3 h-3 ml-auto" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}