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
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Circle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { SortableTaskCard } from './SortableTaskCard';
import { DroppableTaskColumn } from './DroppableTaskColumn';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title?: string; // For compatibility
  task_name?: string; // From database
  description?: string;
  task_description?: string; // From database
  status: string;
  priority?: string;
  due_date?: string;
  subtasks?: any[];
  task_assignees?: any[];
  task_required_skills?: any[];
  created_at: string;
}

interface TaskKanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onUpdate: () => void;
}

const TASK_COLUMNS = [
  { 
    id: 'pending', 
    title: 'To Do', 
    icon: Circle,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    borderColor: 'border-gray-400/20'
  },
  { 
    id: 'in_progress', 
    title: 'In Progress', 
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20'
  },
  { 
    id: 'completed', 
    title: 'In Review', 
    icon: CheckCircle2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20'
  },
  { 
    id: 'verified', 
    title: 'Done', 
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    borderColor: 'border-green-400/20'
  }
];

export function TaskKanbanBoard({ projectId, tasks, onUpdate }: TaskKanbanBoardProps) {
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, Task[]>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const supabase = createClient();

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Group tasks by status
    const grouped = tasks.reduce((acc, task) => {
      const status = task.status || 'pending';
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    // Ensure all columns exist
    TASK_COLUMNS.forEach(column => {
      if (!grouped[column.id]) {
        grouped[column.id] = [];
      }
    });

    setTasksByStatus(grouped);
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeTask) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const oldStatus = activeTask.status;

    // Check if status actually changed
    if (oldStatus === newStatus) {
      setActiveTask(null);
      return;
    }

    // Optimistic update
    const updatedTask = { ...activeTask, status: newStatus };
    
    setTasksByStatus(prev => {
      const updated = { ...prev };
      
      // Remove from old status
      updated[oldStatus] = updated[oldStatus].filter(t => t.id !== taskId);
      
      // Add to new status
      if (!updated[newStatus]) updated[newStatus] = [];
      updated[newStatus] = [...updated[newStatus], updatedTask];
      
      return updated;
    });

    // Update database
    try {
      const { error } = await supabase
        .from('contributions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Show success message for significant status changes
      if (newStatus === 'verified' && oldStatus !== 'verified') {
        toast.success('Task completed! 🎉');
      }

      onUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      
      // Revert optimistic update
      setTasksByStatus(prev => {
        const updated = { ...prev };
        updated[newStatus] = updated[newStatus].filter(t => t.id !== taskId);
        updated[oldStatus] = [...updated[oldStatus], activeTask];
        return updated;
      });
    }

    setActiveTask(null);
  };

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns(prev => {
      const updated = new Set(prev);
      if (updated.has(columnId)) {
        updated.delete(columnId);
      } else {
        updated.add(columnId);
      }
      return updated;
    });
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full min-w-max">
          {TASK_COLUMNS.map(column => {
            const Icon = column.icon;
            const tasks = tasksByStatus[column.id] || [];
            const isCollapsed = collapsedColumns.has(column.id);

            return (
              <div
                key={column.id}
                className={cn(
                  "flex flex-col bg-dark-card rounded-lg border transition-all",
                  column.borderColor,
                  isCollapsed ? "w-12" : "w-80"
                )}
              >
                {/* Column Header */}
                <div 
                  className={cn(
                    "p-4 border-b flex items-center justify-between cursor-pointer select-none",
                    column.borderColor,
                    "hover:bg-dark-surface/50 transition-colors"
                  )}
                  onClick={() => toggleColumnCollapse(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", column.color)} />
                    {!isCollapsed && (
                      <>
                        <h3 className="font-medium text-white">{column.title}</h3>
                        <span className="text-xs text-gray-500 bg-dark-surface px-1.5 py-0.5 rounded">
                          {tasks.length}
                        </span>
                      </>
                    )}
                  </div>
                  {!isCollapsed && (
                    <button className="p-1 hover:bg-dark-surface rounded">
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Column Content */}
                {!isCollapsed && (
                  <DroppableTaskColumn id={column.id} className="flex-1 overflow-y-auto p-2">
                    {/* Add Task button at the top of To Do column */}
                    {column.id === 'pending' && (
                      <button 
                        className={cn(
                          "w-full mb-3 px-4 py-2.5 rounded-lg",
                          "bg-neon-green/10 border border-neon-green/30",
                          "hover:bg-neon-green/20 hover:border-neon-green/50",
                          "transition-all duration-200",
                          "flex items-center justify-center gap-2 group"
                        )}
                        onClick={() => {
                          // TODO: Open add task modal
                        }}
                      >
                        <Plus className="w-4 h-4 text-neon-green group-hover:text-white transition-colors" />
                        <span className="text-sm font-medium text-neon-green group-hover:text-white transition-colors">
                          Add Task
                        </span>
                      </button>
                    )}
                    
                    <SortableContext
                      items={tasks.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence mode="popLayout">
                        {tasks.map(task => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-2"
                          >
                            <SortableTaskCard
                              task={task}
                              onClick={() => {
                                // TODO: Open task detail modal
                              }}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SortableContext>

                  </DroppableTaskColumn>
                )}
              </div>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 rotate-3">
              <SortableTaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}