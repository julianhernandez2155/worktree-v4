'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  CalendarPlus,
  Users as UsersIcon,
  UserPlus, 
  AlertCircle,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardLightTrace } from './CardLightTrace';
import { DatePicker } from '@/components/ui/DatePicker';
import { createClient } from '@/lib/supabase/client';
import { Search, Check } from 'lucide-react';

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

interface SortableTaskCardV2Props {
  task: Task;
  onClick?: () => void;
  onSetDueDate?: (taskId: string, date: string) => void;
  onAssignTask?: (taskId: string, assigneeIds: string[]) => void;
  organizationId?: string;
  isSelected?: boolean;
  isDragging?: boolean;
  isAnimating?: boolean;
}


export function SortableTaskCardV2({ 
  task, 
  onClick,
  onSetDueDate,
  onAssignTask,
  organizationId, 
  isSelected, 
  isDragging = false,
  isAnimating = false 
}: SortableTaskCardV2Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const assigneeButtonRef = useRef<HTMLButtonElement>(null);
  const supabase = createClient();
  
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

  // Load organization members when dropdown opens
  useEffect(() => {
    if (showAssigneeDropdown && organizationId && orgMembers.length === 0) {
      loadOrgMembers();
    }
  }, [showAssigneeDropdown, organizationId]);

  // Initialize selected assignees from task data
  useEffect(() => {
    if (task.task_assignees) {
      const assigneeIds = task.task_assignees.map(ta => ta.user?.id).filter(Boolean);
      setSelectedAssignees(assigneeIds);
    }
  }, [task.task_assignees]);

  const loadOrgMembers = async () => {
    try {
      const { data: members } = await supabase
        .from('organization_members')
        .select('user:profiles(id, full_name, avatar_url)')
        .eq('organization_id', organizationId);
      
      if (members) {
        const userProfiles = members.map(m => m.user).filter(Boolean);
        setOrgMembers(userProfiles);
      }
    } catch (error) {
      console.error('Error loading organization members:', error);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  // Due date formatting
  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue', color: 'text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-yellow-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-green-400' };
    } else {
      return { text: `Due ${date.toLocaleDateString()}`, color: 'text-gray-400' };
    }
  };

  // Calculate subtask progress
  const subtaskProgress = task.subtasks && task.subtasks.length > 0 
    ? {
        completed: task.subtasks.filter((subtask: any) => subtask.completed).length,
        total: task.subtasks.length
      }
    : null;

  const progressPercentage = subtaskProgress 
    ? Math.round((subtaskProgress.completed / subtaskProgress.total) * 100) || 0
    : 0;

  // Check if task is overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-task-id={task.id}
      className={cn(
        "group relative bg-dark-surface rounded-lg border cursor-pointer transition-all",
        isOverdue 
          ? "border-red-500 bg-red-950/20 hover:border-red-400 hover:shadow-red-500/20 shadow-red-500/10" 
          : "border-dark-border hover:border-gray-600",
        "hover:shadow-lg",
        isSelected && "ring-2 ring-neon-green border-neon-green",
        isSortableDragging && "shadow-2xl",
        isAnimating && "ring-2 ring-neon-green/50 animate-pulse-once",
        isOverdue && !isDragging && "animate-subtle-pulse"
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Priority color strip with tooltip */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-2 transition-all group/priority hover:w-3 cursor-help rounded-l-lg",
          isOverdue ? "bg-red-500 hover:shadow-red-500/50" :
          task.priority === 'urgent' ? "bg-red-400 hover:shadow-red-400/50" :
          task.priority === 'high' ? "bg-orange-400 hover:shadow-orange-400/50" :
          task.priority === 'medium' ? "bg-yellow-400 hover:shadow-yellow-400/50" :
          task.priority === 'low' ? "bg-green-400 hover:shadow-green-400/50" : 
          "bg-gray-600 hover:shadow-gray-600/50",
          "hover:shadow-lg"
        )}
      >
        {/* Tooltip on hover */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover/priority:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {isOverdue ? 'Overdue - Urgent' :
             task.priority === 'urgent' ? 'Urgent Priority' :
             task.priority === 'high' ? 'High Priority' :
             task.priority === 'medium' ? 'Medium Priority' :
             task.priority === 'low' ? 'Low Priority' : 
             'No Priority'}
          </div>
        </div>
      </div>
      
      {/* Content wrapper with padding to account for color strip */}
      <div className="p-4 pl-5 group-hover/priority:pl-6 transition-all">
        {/* Light trace effect for completed status */}
        {isAnimating && (task.status === 'completed' || task.status === 'verified') && (
          <CardLightTrace isActive={true} variant="double" duration={2.5} />
        )}
        
        {/* Top row: Title and due date */}
        <div className="flex items-start justify-between gap-2 mb-3 relative">
          <h3 className="font-medium text-white text-sm flex-1">
            {task.title || (task as any).task_name || 'Untitled Task'}
          </h3>
          
          {/* Due date indicator */}
          {task.due_date ? (
            <div className={cn(
              "flex items-center gap-1 text-xs flex-shrink-0",
              isOverdue ? "text-red-400 font-medium" : formatDueDate(task.due_date).color
            )}>
              <Calendar className="w-3 h-3" />
              <span>{isOverdue ? 'Overdue' : formatDueDate(task.due_date).text}</span>
            </div>
          ) : onSetDueDate ? (
            <button
              ref={dateButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                console.log('Calendar button clicked, showDatePicker:', !showDatePicker);
                setShowDatePicker(!showDatePicker);
              }}
              className="p-1 -m-1 hover:bg-dark-card rounded transition-colors group"
              title="Set due date"
            >
              <CalendarPlus className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
            </button>
          ) : null}
          
          {/* Date picker dropdown */}
          {showDatePicker && onSetDueDate && (
            <div className="absolute top-full right-0 mt-1 z-50">
              <div onClick={(e) => e.stopPropagation()}>
                <DatePicker
                  value=""
                  onChange={(date) => {
                    if (date) {
                      onSetDueDate(task.id, date);
                    }
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Description (truncated to 2 lines) */}
        {(task.description || (task as any).task_description) && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
            {task.description || (task as any).task_description}
          </p>
        )}

        {/* Skills (optional middle section) */}
        {task.task_required_skills && task.task_required_skills.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {task.task_required_skills.slice(0, 2).map((skillReq, index) => (
                <span 
                  key={index}
                  className="px-1.5 py-0.5 bg-dark-card text-gray-400 rounded text-xs"
                >
                  {skillReq.skill.name}
                </span>
              ))}
              {task.task_required_skills.length > 2 && (
                <span className="px-1.5 py-0.5 bg-dark-card text-gray-500 rounded text-xs">
                  +{task.task_required_skills.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom row: Assignees (left) and Subtasks (right) */}
        <div className="flex items-center justify-between mt-3">
          {/* Assignees */}
          <div className="flex items-center gap-1.5">
            {task.task_assignees && task.task_assignees.length > 0 ? (
              <>
                <div className="flex items-center -space-x-1">
                  {task.task_assignees.slice(0, 3).map((assignee, index) => (
                    <div 
                      key={index} 
                      className="w-5 h-5 rounded-full bg-gray-600 border border-dark-surface flex items-center justify-center text-[10px] text-white"
                    >
                      {assignee.user?.avatar_url ? (
                        <img 
                          src={assignee.user.avatar_url} 
                          alt={assignee.user.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        assignee.user?.full_name?.[0] || '?'
                      )}
                    </div>
                  ))}
                  {task.task_assignees.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-gray-700 border border-dark-surface flex items-center justify-center text-[10px] text-gray-300">
                      +{task.task_assignees.length - 3}
                    </div>
                  )}
                </div>
              </>
            ) : onAssignTask ? (
              <div className="relative">
                <button
                  ref={assigneeButtonRef}
                  className="flex items-center gap-1.5 p-1 -m-1 rounded hover:bg-dark-card transition-colors group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAssigneeDropdown(!showAssigneeDropdown);
                  }}
                  title="Assign task"
                >
                  <UserPlus className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Unassigned</span>
                </button>
                
                {/* Assignee dropdown */}
                {showAssigneeDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 max-h-64 bg-dark-card border border-dark-border rounded-lg shadow-xl z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Search bar */}
                    <div className="p-3 border-b border-dark-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={assigneeSearch}
                          onChange={(e) => setAssigneeSearch(e.target.value)}
                          placeholder="Search members..."
                          className="w-full pl-9 pr-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    {/* Members list */}
                    <div className="max-h-48 overflow-y-auto">
                      {orgMembers
                        .filter(member => 
                          member.full_name?.toLowerCase().includes(assigneeSearch.toLowerCase())
                        )
                        .map(member => (
                          <button
                            key={member.id}
                            onClick={() => {
                              const newAssignees = selectedAssignees.includes(member.id)
                                ? selectedAssignees.filter(id => id !== member.id)
                                : [...selectedAssignees, member.id];
                              setSelectedAssignees(newAssignees);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2"
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center",
                              selectedAssignees.includes(member.id) 
                                ? "bg-neon-green border-neon-green" 
                                : "border-gray-600"
                            )}>
                              {selectedAssignees.includes(member.id) && (
                                <Check className="w-3 h-3 text-black" />
                              )}
                            </div>
                            {member.avatar_url ? (
                              <img 
                                src={member.avatar_url} 
                                alt={member.full_name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                                {member.full_name?.[0]}
                              </div>
                            )}
                            <span className="text-gray-300">{member.full_name}</span>
                          </button>
                        ))}
                    </div>
                    
                    {/* Apply button */}
                    {selectedAssignees.length > 0 && (
                      <div className="p-3 border-t border-dark-border">
                        <button
                          onClick={() => {
                            onAssignTask(task.id, selectedAssignees);
                            setShowAssigneeDropdown(false);
                          }}
                          className="w-full py-2 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green rounded-lg transition-colors text-sm font-medium"
                        >
                          Assign {selectedAssignees.length} {selectedAssignees.length === 1 ? 'person' : 'people'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <UsersIcon className="w-3 h-3" />
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {subtaskProgress ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <CheckSquare className="w-3 h-3" />
                <span>{subtaskProgress.completed}/{subtaskProgress.total}</span>
              </div>
              <div className="w-16 h-1.5 bg-dark-card rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-neon-green to-green-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CheckSquare className="w-3 h-3" />
              <span>No subtasks</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}