'use client';

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface InlinePriorityEditorProps {
  projectId: string;
  currentPriority?: string;
  onUpdate: (newPriority: string) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
  { value: 'high', label: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10', dot: 'bg-orange-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' },
  { value: 'low', label: 'Low', color: 'text-gray-400', bg: 'bg-gray-400/10', dot: 'bg-gray-400' }
];

export function InlinePriorityEditor({ projectId, currentPriority, onUpdate }: InlinePriorityEditorProps) {
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
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-2 h-2 rounded-full bg-gray-600 hover:ring-2 hover:ring-gray-400/50 hover:ring-offset-2 hover:ring-offset-dark-bg transition-all"
      />
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
          "w-2 h-2 rounded-full transition-all",
          currentOption.dot,
          "hover:ring-2 hover:ring-offset-2 hover:ring-offset-dark-bg",
          currentPriority === 'critical' && "hover:ring-red-400/50",
          currentPriority === 'high' && "hover:ring-orange-400/50",
          currentPriority === 'medium' && "hover:ring-yellow-400/50",
          currentPriority === 'low' && "hover:ring-gray-400/50"
        )}
      />

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
                  "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                  currentPriority === option.value ? option.color : "text-gray-400",
                  updating && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", option.dot)} />
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