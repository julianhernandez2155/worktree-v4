'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar,
  Users as UsersIcon,
  AlertTriangle,
  CheckSquare,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { AnimatePresence, motion } from 'framer-motion';

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

interface SortableTaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

export function SortableTaskCard({ task, onClick, onEdit, onDelete, isDragging = false }: SortableTaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ 
    id: task.id,
    disabled: isDragging
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  // Calculate subtask progress
  const subtaskProgress = task.subtasks && task.subtasks.length > 0
    ? (task.subtasks.filter((st: any) => st.completed).length / task.subtasks.length) * 100
    : null;

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue', color: 'text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Today', color: 'text-yellow-400' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days`, color: 'text-green-400' };
    } else {
      return { 
        text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        color: 'text-gray-400' 
      };
    }
  };

  const dueDate = task.due_date ? formatDueDate(task.due_date) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-dark-surface rounded-lg border p-4 cursor-pointer transition-all relative overflow-hidden",
        "hover:shadow-lg",
        task.priority === 'urgent' ? "border-red-500/50 bg-red-950/20" : "border-dark-border hover:border-gray-600",
        isSortableDragging && "shadow-2xl"
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Urgent indicator strip */}
      {task.priority === 'urgent' && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-red-600" />
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 mr-2">
          {task.priority === 'urgent' && (
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded mb-1">
              <AlertTriangle className="w-3 h-3" />
              URGENT
            </div>
          )}
          <h3 className="font-medium text-white line-clamp-2">
            {task.task_name || task.title || 'Untitled Task'}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {task.priority && (
            <PriorityIcon 
              priority={task.priority === 'urgent' ? 'critical' : task.priority as any} 
              size="sm" 
            />
          )}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-card rounded transition-all"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  
                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-1 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl z-40 py-1"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onClick?.();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Task
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        // TODO: Implement duplicate task
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        // TODO: Implement mark as complete
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </button>
                    
                    <div className="border-t border-dark-border my-1" />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete?.();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Description */}
      {(task.task_description || task.description) && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {task.task_description || task.description}
        </p>
      )}

      {/* Skills */}
      {task.task_required_skills && task.task_required_skills.length > 0 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <Tag className="w-3 h-3 text-gray-500" />
          {task.task_required_skills.slice(0, 3).map((ts: any, idx: number) => {
            // Handle both data structures: ts.skill and ts directly
            const skill = ts.skill || ts;
            if (!skill || !skill.name) return null;
            
            return (
              <span 
                key={skill.id || idx}
                className="px-2 py-0.5 bg-dark-card rounded text-xs text-gray-400"
              >
                {skill.name}
              </span>
            );
          })}
          {task.task_required_skills.length > 3 && (
            <span className="text-xs text-gray-500">
              +{task.task_required_skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Subtasks Progress */}
      {subtaskProgress !== null && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <div className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              <span>
                {task.subtasks.filter((st: any) => st.completed).length}/{task.subtasks.length} subtasks
              </span>
            </div>
            <span>{Math.round(subtaskProgress)}%</span>
          </div>
          <div className="w-full h-1 bg-dark-card rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-green to-green-500"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        {/* Assignees */}
        {task.task_assignees && task.task_assignees.length > 0 && (
          <div className="flex items-center -space-x-2">
            {task.task_assignees.slice(0, 3).map((ta: any, idx: number) => {
              // Handle both data structures: ta.user and ta directly
              const assignee = ta.user || ta;
              if (!assignee) return null;
              
              return (
                <div key={assignee.id || idx} className="relative" style={{ zIndex: 3 - idx }}>
                  {assignee.avatar_url ? (
                    <img 
                      src={assignee.avatar_url} 
                      alt={assignee.full_name || assignee.name || 'User'}
                      className="w-6 h-6 rounded-full ring-2 ring-dark-surface"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-600 ring-2 ring-dark-surface flex items-center justify-center text-xs text-white">
                      {(assignee.full_name || assignee.name || 'U')[0]}
                    </div>
                  )}
                </div>
              );
            })}
            {task.task_assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-dark-card ring-2 ring-dark-surface flex items-center justify-center text-xs text-gray-400 relative z-0">
                +{task.task_assignees.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Due Date */}
        {dueDate && (
          <div className={cn("flex items-center gap-1", dueDate.color)}>
            <Calendar className="w-3 h-3" />
            <span>{dueDate.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}