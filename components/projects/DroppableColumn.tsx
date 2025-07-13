'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortableProjectCard } from './SortableProjectCard';

interface DroppableColumnProps {
  column: {
    value: string;
    label: string;
    icon: any;
    color: string;
    bg: string;
    borderColor: string;
    description: string;
  };
  projects: any[];
  isOver: boolean;
  onProjectClick?: (projectId: string) => void;
  selectedProjectId?: string | null;
  animatingCards: Set<string>;
  archivedCount?: number;
  showArchived?: boolean;
  onToggleArchived?: () => void;
}

export function DroppableColumn({
  column,
  projects,
  isOver,
  onProjectClick,
  selectedProjectId,
  animatingCards,
  archivedCount = 0,
  showArchived = false,
  onToggleArchived
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.value,
    data: {
      status: column.value
    }
  });

  const Icon = column.icon;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-80 flex-shrink-0 bg-dark-card rounded-lg transition-all duration-200 flex flex-col",
        isOver && "ring-2 ring-neon-green ring-opacity-50 bg-dark-surface scale-[1.02]"
      )}
    >
      {/* Column Header */}
      <div className={cn("p-4 border-b", column.borderColor)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded", column.bg)}>
              <Icon className={cn("w-4 h-4", column.color)} />
            </div>
            <h3 className="font-medium text-white">{column.label}</h3>
          </div>
          <span className="text-sm text-gray-400">
            {projects.length}
          </span>
        </div>
        <p className="text-xs text-gray-500">{column.description}</p>
      </div>

      {/* Projects Container */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        <SortableContext 
          items={projects.map(p => p.id)} 
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {projects.length === 0 && !isOver ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center text-gray-500 text-sm"
              >
                No projects in {column.label.toLowerCase()}
              </motion.div>
            ) : (
              projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      delay: animatingCards.has(project.id) ? 0 : index * 0.05
                    }
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { 
                      type: "spring", 
                      stiffness: 350, 
                      damping: 25 
                    }
                  }}
                >
                  <SortableProjectCard
                    project={project}
                    onClick={() => onProjectClick?.(project.id)}
                    isSelected={selectedProjectId === project.id}
                    isAnimating={animatingCards.has(project.id)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </SortableContext>

        {/* Drop indicator for empty columns */}
        {isOver && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 border-2 border-dashed border-neon-green/50 rounded-lg text-center"
          >
            <p className="text-sm text-neon-green">Drop project here</p>
          </motion.div>
        )}
      </div>

      {/* Archived Projects Toggle (for completed column) */}
      {column.value === 'completed' && archivedCount > 0 && (
        <div className="border-t border-dark-border">
          <button
            onClick={onToggleArchived}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-dark-surface/50 transition-all"
          >
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              {showArchived ? 'Hide' : 'Show'} archived ({archivedCount})
            </span>
            {showArchived ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}