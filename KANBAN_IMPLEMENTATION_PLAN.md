# Kanban Board Implementation Plan

## 1. Setting Up dnd-kit for Fluid Drag-and-Drop

First, install the required packages:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## 2. Enhanced ProjectBoardView with dnd-kit

Here's the implementation strategy for the fluid drag-and-drop experience:

```typescript
// components/projects/ProjectBoardViewEnhanced.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

// Animation configuration for smooth transitions
const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

// Custom drag overlay styles
const dragOverlayStyles = {
  cursor: 'grabbing',
  transform: 'rotate(3deg) scale(1.05)',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  transition: 'transform 200ms ease, box-shadow 200ms ease',
};

export function ProjectBoardViewEnhanced({ projects, onProjectUpdate }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [projectsByStatus, setProjectsByStatus] = useState<Record<string, Project[]>>({});
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags
      },
    })
  );

  // Group projects by status
  useEffect(() => {
    const grouped = projects.reduce((acc, project) => {
      const status = project.status || 'planning';
      if (!acc[status]) acc[status] = [];
      acc[status].push(project);
      return acc;
    }, {} as Record<string, Project[]>);
    setProjectsByStatus(grouped);
  }, [projects]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeProject = projects.find(p => p.id === active.id);
    if (!activeProject) return;

    const newStatus = over.data.current?.status || over.id;
    
    // Optimistic update
    const updatedProject = { ...activeProject, status: newStatus };
    onProjectUpdate(updatedProject);

    // Animate status badge change
    animateStatusChange(active.id as string, newStatus);

    // API call to update the backend
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('internal_projects')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', active.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update project status:', error);
      // Revert optimistic update on error
      onProjectUpdate(activeProject);
    }

    setActiveId(null);
    setOverId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map(column => (
          <DroppableColumn
            key={column.value}
            column={column}
            projects={projectsByStatus[column.value] || []}
            isOver={overId === column.value}
          />
        ))}
      </div>
      
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? (
          <ProjectCardDragOverlay
            project={projects.find(p => p.id === activeId)}
            style={dragOverlayStyles}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

## 3. Status Badge Animation

Here's the implementation for the status badge flip animation:

```typescript
// components/projects/AnimatedStatusBadge.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedStatusBadgeProps {
  status: string;
  isAnimating?: boolean;
}

export function AnimatedStatusBadge({ status, isAnimating }: AnimatedStatusBadgeProps) {
  const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
  if (!statusConfig) return null;

  const Icon = statusConfig.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={isAnimating ? { rotateY: -90, scale: 0.8 } : false}
        animate={{ rotateY: 0, scale: 1 }}
        exit={{ rotateY: 90, scale: 0.8 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
          statusConfig.bg,
          statusConfig.color,
          isAnimating && status === 'completed' && "animate-pulse-once"
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Icon className="w-3.5 h-3.5" />
        {statusConfig.label}
      </motion.div>
    </AnimatePresence>
  );
}

// CSS for the one-time pulse animation
const pulseOnceAnimation = `
  @keyframes pulse-once {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
  
  .animate-pulse-once {
    animation: pulse-once 0.5s ease-in-out;
  }
`;
```

## 4. Smart Automations Implementation

### A. Automatic Status Updates

The drag-and-drop handler above already includes the automatic status update. Here's the enhanced version with error handling and optimistic updates:

```typescript
// lib/hooks/useProjectStatusUpdate.ts
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useProjectStatusUpdate() {
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const updateProjectStatus = async (
    projectId: string, 
    newStatus: string,
    optimisticUpdate?: () => void
  ) => {
    setUpdating(projectId);
    
    // Perform optimistic update immediately
    optimisticUpdate?.();

    try {
      const { error } = await supabase
        .from('internal_projects')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          // Set completed_at when moving to completed status
          ...(newStatus === 'completed' && {
            completed_at: new Date().toISOString()
          })
        })
        .eq('id', projectId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('project_activities')
        .insert({
          project_id: projectId,
          type: 'status_change',
          metadata: { 
            from_status: 'previous_status', 
            to_status: newStatus 
          }
        });

      toast({
        title: "Project updated",
        description: `Status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update project status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update
      throw error;
    } finally {
      setUpdating(null);
    }
  };

  return { updateProjectStatus, updating };
}
```

### B. Auto-Archive Implementation

For the auto-archive feature, I recommend a hybrid approach:

```typescript
// components/projects/CompletedColumnEnhanced.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, ChevronDown, ChevronUp } from 'lucide-react';

interface CompletedColumnProps {
  projects: Project[];
  archiveThresholdDays?: number;
}

export function CompletedColumnEnhanced({ 
  projects, 
  archiveThresholdDays = 14 
}: CompletedColumnProps) {
  const [showArchived, setShowArchived] = useState(false);
  
  // Separate recent and archived projects
  const { recentProjects, archivedProjects } = useMemo(() => {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - archiveThresholdDays * 24 * 60 * 60 * 1000);
    
    return projects.reduce((acc, project) => {
      if (project.completed_at && new Date(project.completed_at) < thresholdDate) {
        acc.archivedProjects.push(project);
      } else {
        acc.recentProjects.push(project);
      }
      return acc;
    }, { recentProjects: [], archivedProjects: [] });
  }, [projects, archiveThresholdDays]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2">
        {recentProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      
      {archivedProjects.length > 0 && (
        <div className="mt-4 border-t border-dark-border pt-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              {showArchived ? 'Hide' : 'Show'} archived ({archivedProjects.length})
            </span>
            {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {showArchived && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                {archivedProjects.map(project => (
                  <motion.div
                    key={project.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProjectCard project={project} isArchived />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
```

### Backend Cron Job (Optional Enhancement)

For a more robust solution, you can add a Supabase Edge Function that runs daily:

```sql
-- Supabase SQL function to auto-archive old completed projects
CREATE OR REPLACE FUNCTION auto_archive_completed_projects()
RETURNS void AS $$
BEGIN
  UPDATE internal_projects
  SET 
    is_archived = true,
    archived_at = NOW()
  WHERE 
    status = 'completed' 
    AND completed_at < NOW() - INTERVAL '14 days'
    AND (is_archived IS NULL OR is_archived = false);
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run daily at 2 AM
SELECT cron.schedule(
  'auto-archive-projects',
  '0 2 * * *',
  'SELECT auto_archive_completed_projects();'
);
```

## 5. Additional Enhancements

### Smooth Card Spacing Animation

```typescript
// components/projects/DroppableColumn.tsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';

export function DroppableColumn({ column, projects, isOver }) {
  const { setNodeRef } = useDroppable({
    id: column.value,
    data: { status: column.value }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-80 flex-shrink-0 bg-dark-card rounded-lg transition-all duration-200",
        isOver && "ring-2 ring-neon-green ring-opacity-50 bg-dark-surface"
      )}
    >
      <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <AnimatePresence>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                layout: { type: "spring", stiffness: 300, damping: 30 },
                delay: index * 0.05
              }}
            >
              <SortableProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </SortableContext>
      
      {/* Drop indicator */}
      {isOver && projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="m-2 p-4 border-2 border-dashed border-neon-green rounded-lg text-center text-gray-400"
        >
          Drop here
        </motion.div>
      )}
    </div>
  );
}
```

## Summary

This implementation provides:

1. **Fluid Drag-and-Drop**: Using dnd-kit for smooth, accessible drag-and-drop with visual feedback
2. **Smart Animations**: Status badge flips, card lifting, and smooth repositioning
3. **Automatic Updates**: Optimistic UI updates with background API calls
4. **Intelligent Archiving**: Hybrid approach with frontend filtering and optional backend automation
5. **Delightful Interactions**: Hover states, drop zones, and micro-animations throughout

The result is a Kanban board that feels alive and intelligent, reducing manual work while providing a satisfying user experience.