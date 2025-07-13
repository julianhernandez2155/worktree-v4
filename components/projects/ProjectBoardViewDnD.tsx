'use client';

import { useState, useEffect, useMemo } from 'react';
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
  defaultDropAnimationSideEffects,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  MeasuringStrategy
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Circle, 
  CheckCircle2, 
  Clock, 
  Pause, 
  Archive,
  MoreVertical,
  Calendar,
  Users as UsersIcon,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { SortableProjectCard } from './SortableProjectCard';
import { DroppableColumn } from './DroppableColumn';
import { CelebrationAnimation } from './CelebrationAnimation';
import toast from 'react-hot-toast';

// Types
interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  team?: { id: string; name: string; color: string };
  lead?: { id: string; full_name: string; avatar_url?: string };
  due_date?: string;
  completed_at?: string;
  task_stats?: {
    total: number;
    completed: number;
    skill_gaps: number;
  };
  members?: any[];
}

interface ProjectBoardViewDnDProps {
  projects: Project[];
  loading?: boolean;
  onProjectClick?: (projectId: string) => void;
  selectedProjectId?: string | null;
  onProjectUpdate?: (project: Project) => void;
}

// Status column configuration
const STATUS_COLUMNS = [
  {
    value: 'planning',
    label: 'Planning',
    icon: Circle,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    description: 'Projects in ideation'
  },
  {
    value: 'active',
    label: 'Active',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
    description: 'Currently in progress'
  },
  {
    value: 'on_hold',
    label: 'On Hold',
    icon: Pause,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    description: 'Temporarily paused'
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    borderColor: 'border-gray-400/20',
    description: 'Successfully finished'
  }
];

// Animation configurations
const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

// Measuring configuration for better performance
const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

export function ProjectBoardViewDnD({ 
  projects, 
  loading, 
  onProjectClick,
  selectedProjectId,
  onProjectUpdate
}: ProjectBoardViewDnDProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [projectsByStatus, setProjectsByStatus] = useState<Record<string, Project[]>>({});
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState<Record<string, boolean>>({});
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [celebrationPosition, setCelebrationPosition] = useState<{ x: number; y: number } | undefined>();
  
  const supabase = createClient();
  
  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group and filter projects
  const { displayProjects, archivedCounts } = useMemo(() => {
    const grouped: Record<string, Project[]> = {
      planning: [],
      active: [],
      on_hold: [],
      completed: []
    };
    
    const archived: Record<string, number> = {
      completed: 0
    };
    
    const archiveThresholdDays = 14;
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - archiveThresholdDays * 24 * 60 * 60 * 1000);
    
    projects.forEach(project => {
      const status = project.status || 'planning';
      
      // For now, skip auto-archiving since we don't have completed_at field
      // In production, you'd track this with updated_at when status changes to completed
      // or add a completed_at field to the database
      
      if (grouped[status]) {
        grouped[status].push(project);
      }
    });
    
    return { displayProjects: grouped, archivedCounts: archived };
  }, [projects, showArchived]);

  // Set initial state
  useEffect(() => {
    setProjectsByStatus(displayProjects);
  }, [displayProjects]);

  // Find the active project being dragged
  const activeProject = useMemo(
    () => projects.find(p => p.id === activeId),
    [activeId, projects]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeProject) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const newStatus = over.data.current?.status || over.id;
    const oldStatus = activeProject.status;
    
    if (oldStatus === newStatus) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    // Add to animating cards set
    setAnimatingCards(prev => new Set(prev).add(activeProject.id));
    
    // Only animate if actually dragging (not on initial load)
    const shouldCelebrate = newStatus === 'completed' && oldStatus !== 'completed';

    // Create updated project
    const updatedProject = { 
      ...activeProject, 
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // Optimistic update - immediately update local state
    setProjectsByStatus(prev => {
      const updated = { ...prev };
      // Remove from old status
      updated[oldStatus] = updated[oldStatus].filter(p => p.id !== activeProject.id);
      // Add to new status (check if it doesn't already exist)
      if (!updated[newStatus]) {
        updated[newStatus] = [];
      }
      if (!updated[newStatus].some(p => p.id === updatedProject.id)) {
        updated[newStatus] = [...updated[newStatus], updatedProject];
      }
      return updated;
    });

    // Notify parent component of the change (for updating its local state)
    onProjectUpdate?.(updatedProject);

    try {
      const { error } = await supabase
        .from('internal_projects')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeProject.id);

      if (error) throw error;
      
      // Trigger celebration if moved to completed
      if (shouldCelebrate) {
        // Get the position of the dropped card
        const droppedElement = document.querySelector(`[data-project-id="${activeProject.id}"]`);
        if (droppedElement) {
          const rect = droppedElement.getBoundingClientRect();
          setCelebrationPosition({ 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          });
        }
        setCelebrationTrigger(true);
        
        // Reset celebration after animation
        setTimeout(() => {
          setCelebrationTrigger(false);
          setCelebrationPosition(undefined);
        }, 3000);
      }
      
      // Show success toast
      toast.success(`Moved to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('_', ' ')}`, {
        duration: 2000,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
        },
      });
      
    } catch (error) {
      console.error('Failed to update project status:', error);
      
      // Show error toast
      toast.error('Failed to update project status. Reverting changes.', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #ff4444',
        },
      });
      
      // Revert on error - restore original state
      setProjectsByStatus(prev => {
        const reverted = { ...prev };
        // Remove from new status
        reverted[newStatus] = reverted[newStatus].filter(p => p.id !== activeProject.id);
        // Add back to old status (check if it doesn't already exist)
        if (!reverted[oldStatus]) {
          reverted[oldStatus] = [];
        }
        if (!reverted[oldStatus].some(p => p.id === activeProject.id)) {
          reverted[oldStatus] = [...reverted[oldStatus], activeProject];
        }
        return reverted;
      });
      
      // Notify parent to revert
      onProjectUpdate?.(activeProject);
    } finally {
      // Remove from animating cards after animation completes
      setTimeout(() => {
        setAnimatingCards(prev => {
          const next = new Set(prev);
          next.delete(activeProject.id);
          return next;
        });
      }, 500);
    }

    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-4">
        {STATUS_COLUMNS.map(column => (
          <div key={column.value} className="w-80 h-96 bg-dark-card rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={measuring}
    >
      <div className="flex gap-4 p-4 overflow-x-auto min-h-[calc(100vh-200px)]">
        {STATUS_COLUMNS.map(column => (
          <DroppableColumn
            key={column.value}
            column={column}
            projects={projectsByStatus[column.value] || []}
            isOver={overId === column.value}
            onProjectClick={onProjectClick}
            selectedProjectId={selectedProjectId}
            animatingCards={animatingCards}
            archivedCount={archivedCounts[column.value] || 0}
            showArchived={showArchived[column.value] || false}
            onToggleArchived={() => {
              setShowArchived(prev => ({
                ...prev,
                [column.value]: !prev[column.value]
              }));
            }}
          />
        ))}
      </div>
      
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId && activeProject ? (
          <div
            style={{
              cursor: 'grabbing',
              transform: 'rotate(3deg) scale(1.05)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            className="opacity-90"
          >
            <SortableProjectCard
              project={activeProject}
              isDragging={true}
              onClick={() => {}}
              isSelected={false}
              isAnimating={false}
            />
          </div>
        ) : null}
      </DragOverlay>
      
      {/* Celebration Animation */}
      <CelebrationAnimation
        trigger={celebrationTrigger}
        position={celebrationPosition}
        onComplete={() => {
          setCelebrationTrigger(false);
          setCelebrationPosition(undefined);
        }}
      />
    </DndContext>
  );
}