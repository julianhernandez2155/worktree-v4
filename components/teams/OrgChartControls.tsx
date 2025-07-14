'use client';

import { useState } from 'react';
import { 
  Edit3, 
  Eye, 
  Download, 
  Plus,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';

interface OrgChartControlsProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onAddPosition: () => void;
  onExport: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  hasChanges?: boolean;
  canEdit: boolean;
}

export function OrgChartControls({
  isEditing,
  onToggleEdit,
  onAddPosition,
  onExport,
  onSave,
  onCancel,
  hasChanges = false,
  canEdit
}: OrgChartControlsProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {canEdit && (
          <>
            {!isEditing ? (
              <button
                onClick={onToggleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-dark-card text-gray-400 hover:text-white border border-dark-border hover:border-gray-600 rounded-lg transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Chart</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onAddPosition}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green hover:bg-neon-green/30 border border-neon-green/30 hover:border-neon-green/50 rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Position</span>
                </button>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={onSave}
                    disabled={!hasChanges}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                      hasChanges
                        ? "bg-neon-green text-dark-bg hover:bg-neon-green/90"
                        : "bg-dark-card text-gray-600 border border-dark-border cursor-not-allowed"
                    )}
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                  
                  <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-card text-gray-400 hover:text-white border border-dark-border hover:border-gray-600 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-dark-card text-gray-400 hover:text-white border border-dark-border hover:border-gray-600 rounded-lg transition-all"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export</span>
        </button>
      </div>
    </div>
  );
}