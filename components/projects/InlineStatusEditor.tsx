'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Check,
  Circle,
  CheckCircle2,
  Clock,
  Pause,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface InlineStatusEditorProps {
  projectId: string;
  currentStatus: string;
  onUpdate: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', icon: Circle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { value: 'active', label: 'Active', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  { value: 'on_hold', label: 'On Hold', icon: Pause, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  { value: 'archived', label: 'Archived', icon: Archive, color: 'text-gray-500', bg: 'bg-gray-500/10' }
];

export function InlineStatusEditor({ projectId, currentStatus, onUpdate }: InlineStatusEditorProps) {
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

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('internal_projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      onUpdate(newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find(s => s.value === currentStatus) || STATUS_OPTIONS[0];
  const StatusIcon = currentOption.icon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={updating}
        className={cn(
          "p-1.5 rounded transition-all",
          currentOption.bg,
          "hover:ring-2 hover:ring-offset-2 hover:ring-offset-dark-bg",
          currentStatus === 'active' && "hover:ring-green-400/50",
          currentStatus === 'planning' && "hover:ring-blue-400/50",
          currentStatus === 'on_hold' && "hover:ring-yellow-400/50",
          currentStatus === 'completed' && "hover:ring-gray-400/50",
          currentStatus === 'archived' && "hover:ring-gray-500/50"
        )}
      >
        <StatusIcon className={cn("w-4 h-4", currentOption.color)} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full mt-1 left-0 w-36 bg-dark-card border border-dark-border rounded-lg shadow-xl z-20 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            {STATUS_OPTIONS.map(option => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={updating}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                    currentStatus === option.value ? "text-white" : "text-gray-400",
                    updating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn("p-1 rounded", option.bg)}>
                    <OptionIcon className={cn("w-3 h-3", option.color)} />
                  </div>
                  <span>{option.label}</span>
                  {currentStatus === option.value && (
                    <Check className="w-3 h-3 ml-auto" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}