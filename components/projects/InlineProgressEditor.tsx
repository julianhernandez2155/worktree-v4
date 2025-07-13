'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface InlineProgressEditorProps {
  projectId: string;
  taskStats?: {
    total: number;
    completed: number;
    assigned: number;
    skill_gaps: number;
  };
  onUpdate: () => void;
}

export function InlineProgressEditor({ 
  projectId, 
  taskStats,
  onUpdate 
}: InlineProgressEditorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  if (!taskStats || taskStats.total === 0) {
    return (
      <div className="text-xs text-gray-500">No tasks</div>
    );
  }

  const progress = (taskStats.completed / taskStats.total) * 100;

  const updateProgress = async (delta: number) => {
    if (isUpdating) return;
    
    const newCompleted = Math.max(0, Math.min(taskStats.total, taskStats.completed + delta));
    if (newCompleted === taskStats.completed) return;

    setIsUpdating(true);
    try {
      // In a real app, this would update the actual tasks
      // For now, we'll just update the stats
      const { error } = await supabase
        .from('internal_projects')
        .update({ 
          task_stats: {
            ...taskStats,
            completed: newCompleted
          }
        })
        .eq('id', projectId);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      style={{ width: 100 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500">
          {taskStats.completed}/{taskStats.total}
        </span>
        <span className="text-gray-400">{Math.round(progress)}%</span>
      </div>
      
      <div className="relative">
        <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-neon-green to-green-500"
            initial={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        
        {/* Hover Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-1 -right-1 flex items-center gap-0.5 z-10"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateProgress(-1);
                }}
                disabled={isUpdating || taskStats.completed === 0}
                className={cn(
                  "p-0.5 bg-dark-card border border-dark-border rounded",
                  "hover:border-red-400 hover:text-red-400",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all"
                )}
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateProgress(1);
                }}
                disabled={isUpdating || taskStats.completed === taskStats.total}
                className={cn(
                  "p-0.5 bg-dark-card border border-dark-border rounded",
                  "hover:border-green-400 hover:text-green-400",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all"
                )}
              >
                <Plus className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}