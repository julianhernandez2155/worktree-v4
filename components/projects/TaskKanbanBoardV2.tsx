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
  MeasuringStrategy,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Circle, 
  Clock,
  Eye,
  CheckCircle2, 
  Plus
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { DroppableColumn } from './DroppableColumn';
import { CelebrationAnimation } from './CelebrationAnimation';
import { SortableTaskCardV2 } from './SortableTaskCardV2';
import { TaskModal } from '@/components/tasks/TaskModal';
import toast from 'react-hot-toast';

// Types
interface Task {
  id: string;
  title?: string;
  task_name?: string; // Alternative field name from ProjectsHub
  description?: string;
  task_description?: string; // Alternative field name from ProjectsHub
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  due_date?: string;
  created_at: string;
  subtasks?: any[];
  task_assignees?: {
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  }[];
  task_required_skills?: {
    skill: {
      id: string;
      name: string;
    };
  }[];
}

interface TaskKanbanBoardV2Props {
  projectId: string;
  tasks: Task[];
  onUpdate?: () => void;
  organizationId?: string;
  orgSlug?: string;
  selectedMemberId?: string | null;
  visibleColumns?: string[];
  selectedPriority?: string | null;
}

// Task status column configuration - matches database constraint
const TASK_STATUS_COLUMNS = [
  {
    value: 'pending',
    label: 'To Do',
    icon: Circle,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    description: 'Tasks ready to start'
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    description: 'Currently being worked on'
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
    description: 'Completed tasks'
  },
  {
    value: 'verified',
    label: 'Verified',
    icon: CheckCircle2,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
    description: 'Verified completed tasks'
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

// Priority order for sorting within columns
const PRIORITY_ORDER = {
  'urgent': 4,
  'high': 3,
  'medium': 2,
  'low': 1
};

export function TaskKanbanBoardV2({ 
  projectId,
  tasks, 
  onUpdate,
  organizationId,
  orgSlug,
  selectedMemberId = null,
  visibleColumns = ['pending', 'in_progress', 'completed', 'verified'],
  selectedPriority = null
}: TaskKanbanBoardV2Props) {
  // Debug logging to see what tasks data looks like
  console.log('TaskKanbanBoardV2 received tasks:', tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, Task[]>>({});
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [celebrationPosition, setCelebrationPosition] = useState<{ x: number; y: number } | undefined>();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
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

  // Group and sort tasks by status with priority ordering
  const displayTasks = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      pending: [],
      in_progress: [],
      completed: [],
      verified: []
    };
    
    // Filter tasks based on selected filters
    let filteredTasks = tasks;
    
    // Filter by member if selected
    if (selectedMemberId) {
      filteredTasks = filteredTasks.filter(task => 
        task.task_assignees?.some(assignee => 
          assignee.user?.id === selectedMemberId
        )
      );
    }
    
    // Filter by priority if selected
    if (selectedPriority) {
      filteredTasks = filteredTasks.filter(task => 
        task.priority === selectedPriority
      );
    }
    
    filteredTasks.forEach(task => {
      const status = task.status;
      if (grouped[status]) {
        grouped[status].push(task);
      }
    });
    
    // Sort each column by overdue status and priority
    Object.keys(grouped).forEach(status => {
      grouped[status].sort((a, b) => {
        // Check if tasks are overdue
        const aOverdue = a.due_date && new Date(a.due_date) < new Date();
        const bOverdue = b.due_date && new Date(b.due_date) < new Date();
        
        // Overdue tasks always come first
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        
        // If both overdue or both not overdue, sort by priority
        const aPriority = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 0;
        const bPriority = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 0;
        return bPriority - aPriority; // Higher priority first
      });
    });
    
    return grouped;
  }, [tasks, selectedMemberId, selectedPriority]);

  // Set initial state
  useEffect(() => {
    setTasksByStatus(displayTasks);
  }, [displayTasks]);

  // Find the active task being dragged
  const activeTask = useMemo(
    () => tasks.find(t => t.id === activeId),
    [activeId, tasks]
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
    
    if (!over || !activeTask) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const newStatus = over.data.current?.status || over.id;
    const oldStatus = activeTask.status;
    
    if (oldStatus === newStatus) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    // Add to animating cards set
    setAnimatingCards(prev => new Set(prev).add(activeTask.id));
    
    // Check if we should celebrate (moved to completed)
    const shouldCelebrate = newStatus === 'completed' && oldStatus !== 'completed';

    // Create updated task - use the exact status from the column
    const updatedTask = { 
      ...activeTask, 
      status: newStatus as Task['status']
    };

    // Optimistic update - immediately update local state
    setTasksByStatus(prev => {
      const updated = { ...prev };
      // Remove from old status
      updated[oldStatus] = updated[oldStatus].filter(t => t.id !== activeTask.id);
      // Add to new status (check if it doesn't already exist)
      if (!updated[newStatus]) {
        updated[newStatus] = [];
      }
      if (!updated[newStatus].some(t => t.id === updatedTask.id)) {
        // Insert in priority order (with overdue tasks first)
        updated[newStatus] = [...updated[newStatus], updatedTask].sort((a, b) => {
          const aOverdue = a.due_date && new Date(a.due_date) < new Date();
          const bOverdue = b.due_date && new Date(b.due_date) < new Date();
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          
          const aPriority = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 0;
          const bPriority = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 0;
          return bPriority - aPriority;
        });
      }
      return updated;
    });

    try {
      const { error } = await supabase
        .from('contributions')
        .update({ 
          status: newStatus
        })
        .eq('id', activeTask.id);

      if (error) throw error;
      
      // Trigger celebration if moved to completed
      if (shouldCelebrate) {
        // Get the position of the dropped card
        const droppedElement = document.querySelector(`[data-task-id="${activeTask.id}"]`);
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
      const statusLabels = {
        'pending': 'To Do',
        'in_progress': 'In Progress', 
        'completed': 'Completed',
        'verified': 'Verified'
      };
      
      toast.success(`Moved to ${statusLabels[newStatus as keyof typeof statusLabels]}`, {
        duration: 2000,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
        },
      });
      
      // Notify parent of update
      onUpdate?.();
      
    } catch (error) {
      console.error('Failed to update task status:', error);
      
      // Show error toast
      toast.error('Failed to update task status. Reverting changes.', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #ff4444',
        },
      });
      
      // Revert on error - restore original state
      setTasksByStatus(prev => {
        const reverted = { ...prev };
        // Remove from new status
        reverted[newStatus] = reverted[newStatus].filter(t => t.id !== activeTask.id);
        // Add back to old status (check if it doesn't already exist)
        if (!reverted[oldStatus]) {
          reverted[oldStatus] = [];
        }
        if (!reverted[oldStatus].some(t => t.id === activeTask.id)) {
          reverted[oldStatus] = [...reverted[oldStatus], activeTask].sort((a, b) => {
            const aOverdue = a.due_date && new Date(a.due_date) < new Date();
            const bOverdue = b.due_date && new Date(b.due_date) < new Date();
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            
            const aPriority = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 0;
            const bPriority = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 0;
            return bPriority - aPriority;
          });
        }
        return reverted;
      });
    } finally {
      // Remove from animating cards after animation completes
      setTimeout(() => {
        setAnimatingCards(prev => {
          const next = new Set(prev);
          next.delete(activeTask.id);
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

  const handleSetDueDate = async (taskId: string, date: string) => {
    try {
      const { error } = await supabase
        .from('contributions')
        .update({ due_date: date })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Due date set', {
        duration: 2000,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
        },
      });

      onUpdate?.();
    } catch (error) {
      console.error('Failed to set due date:', error);
      toast.error('Failed to set due date', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #ff4444',
        },
      });
    }
  };

  const handleAssignTask = async (taskId: string, assigneeIds: string[]) => {
    try {
      // First, get current user for assigned_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing assignees
      await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', taskId);

      // Add new assignees
      if (assigneeIds.length > 0) {
        const assigneeData = assigneeIds.map((assigneeId, index) => ({
          task_id: taskId,
          assignee_id: assigneeId,
          assigned_by: user.id,
          is_primary: index === 0,
          assigned_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('task_assignees')
          .insert(assigneeData);

        if (error) throw error;
      }

      toast.success(`Assigned ${assigneeIds.length} ${assigneeIds.length === 1 ? 'person' : 'people'}`, {
        duration: 2000,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
        },
      });

      onUpdate?.();
    } catch (error) {
      console.error('Failed to assign task:', error);
      toast.error('Failed to assign task', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #ff4444',
        },
      });
    }
  };

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
      <div className="flex gap-4 overflow-x-auto">
        {TASK_STATUS_COLUMNS
          .filter(column => visibleColumns.includes(column.value))
          .map(column => (
            <TaskColumn
              key={column.value}
              column={column}
              tasks={tasksByStatus[column.value] || []}
              isOver={overId === column.value}
              animatingCards={animatingCards}
              projectId={projectId}
              onAddTask={() => {
                setSelectedTask(null);
                setShowTaskModal(true);
              }}
              onTaskClick={(taskId) => {
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                  setSelectedTask(task);
                  setShowTaskModal(true);
                }
              }}
              onSetDueDate={handleSetDueDate}
              onAssignTask={handleAssignTask}
              organizationId={organizationId}
            />
          ))}
      </div>
      
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId && activeTask ? (
          <div
            style={{
              cursor: 'grabbing',
              transform: 'rotate(3deg) scale(1.05)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            className="opacity-90"
          >
            <SortableTaskCardV2
              task={activeTask}
              isDragging={true}
              isAnimating={false}
              onClick={() => {}} // No-op during drag
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
      
      {/* Task Modal - for both create and edit */}
      {showTaskModal && organizationId && (
        <TaskModal
          open={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
            onUpdate?.();
          }}
          projectId={projectId}
          organizationId={organizationId}
          task={selectedTask}
        />
      )}
    </DndContext>
  );
}

// Task Column Component (adapted from DroppableColumn)
function TaskColumn({ 
  column, 
  tasks, 
  isOver,
  animatingCards,
  projectId,
  onAddTask,
  onTaskClick,
  onSetDueDate,
  onAssignTask,
  organizationId
}: {
  column: typeof TASK_STATUS_COLUMNS[0];
  tasks: Task[];
  isOver: boolean;
  animatingCards: Set<string>;
  projectId: string;
  onAddTask: () => void;
  onTaskClick: (taskId: string) => void;
  onSetDueDate: (taskId: string, date: string) => void;
  onAssignTask: (taskId: string, assigneeIds: string[]) => void;
  organizationId?: string;
}) {
  const { setNodeRef } = useDroppable({
    id: column.value,
    data: { status: column.value }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-80 bg-dark-card rounded-lg border transition-all duration-200",
        isOver 
          ? `${column.borderColor} ${column.bg} ring-2 ring-opacity-50 ring-offset-2 ring-offset-dark-bg transform scale-[1.02]`
          : "border-dark-border hover:border-gray-600"
      )}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <column.icon className={cn("w-4 h-4", column.color)} />
            <h3 className="font-medium text-white">{column.label}</h3>
            <span className="text-xs text-gray-500 bg-dark-surface px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{column.description}</p>
        
        {/* Add Task Button - only in To Do column */}
        {column.value === 'pending' && (
          <button
            onClick={onAddTask}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 hover:border-neon-green/50 rounded-lg transition-all group"
          >
            <Plus className="w-4 h-4 text-neon-green group-hover:scale-110 transition-transform" />
            <span className="text-neon-green font-medium text-sm">Add Task</span>
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="p-2 space-y-2">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SortableTaskCardV2
                  task={task}
                  isDragging={false}
                  isAnimating={animatingCards.has(task.id)}
                  onClick={() => onTaskClick(task.id)}
                  onSetDueDate={onSetDueDate}
                  onAssignTask={onAssignTask}
                  organizationId={organizationId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
}


