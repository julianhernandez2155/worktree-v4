'use client';

import { useState } from 'react';
import { 
  X,
  Trash2,
  Archive,
  CheckCircle2,
  Clock,
  Pause,
  Tag,
  Users,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface BulkActionsBarProps {
  selectedCount: number;
  onClose: () => void;
  onActionComplete: () => void;
  selectedProjectIds: Set<string>;
}

export function BulkActionsBar({ 
  selectedCount, 
  onClose, 
  onActionComplete,
  selectedProjectIds 
}: BulkActionsBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedProjectIds.size === 0) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('internal_projects')
        .update({ status: newStatus })
        .in('id', Array.from(selectedProjectIds));

      if (error) throw error;

      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Error updating projects:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCount} project(s)?`)) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('internal_projects')
        .delete()
        .in('id', Array.from(selectedProjectIds));

      if (error) throw error;

      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Error deleting projects:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-dark-surface border border-dark-border rounded-xl shadow-2xl p-4 z-40"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neon-green/20 rounded-lg flex items-center justify-center">
                <span className="text-neon-green font-medium text-sm">{selectedCount}</span>
              </div>
              <span className="text-white font-medium">
                {selectedCount === 1 ? 'project' : 'projects'} selected
              </span>
            </div>

            <div className="h-8 w-px bg-dark-border" />

            {/* Status Actions */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-1">Set status:</span>
              <button
                onClick={() => handleBulkStatusChange('active')}
                disabled={isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "bg-green-400/10 text-green-400 hover:bg-green-400/20",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                title="Set to Active"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBulkStatusChange('on_hold')}
                disabled={isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                title="Set to On Hold"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBulkStatusChange('completed')}
                disabled={isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "bg-gray-400/10 text-gray-400 hover:bg-gray-400/20",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                title="Set to Completed"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBulkStatusChange('archived')}
                disabled={isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>

            <div className="h-8 w-px bg-dark-border" />

            {/* Other Actions */}
            <div className="flex items-center gap-2">
              <button
                disabled={isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "bg-dark-card text-gray-400 hover:text-white hover:bg-dark-card/70",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                title="Assign Team (Coming Soon)"
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                disabled={isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "bg-dark-card text-gray-400 hover:text-white hover:bg-dark-card/70",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                title="Add Labels (Coming Soon)"
              >
                <Tag className="w-4 h-4" />
              </button>
              <button
                data-bulk-delete
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "bg-red-500/10 text-red-400 hover:bg-red-500/20",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="h-8 w-px bg-dark-border" />

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}