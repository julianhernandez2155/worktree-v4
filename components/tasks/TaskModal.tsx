'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Box,
  Flag,
  User,
  Users,
  Calendar,
  CalendarClock,
  Tag,
  Clock,
  Plus,
  ChevronDown,
  CheckCircle2,
  Circle,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { DatePicker } from '@/components/ui/DatePicker';
import toast from 'react-hot-toast';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  task?: any; // Existing task for editing
  organizationId: string;
}

// Priority bar icon component - signal strength style
const PriorityIcon = ({ level, color }: { level: number; color: string }) => {
  const bars = [
    { height: 'h-1', threshold: 1 },  // shortest bar
    { height: 'h-2', threshold: 2 },  // medium bar
    { height: 'h-3', threshold: 3 },  // tallest bar
  ];
  
  return (
    <div className="flex items-end gap-0.5">
      {bars.map((bar, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-sm transition-colors",
            bar.height,
            level >= bar.threshold ? color.replace('text-', 'bg-') : 'bg-gray-700'
          )}
        />
      ))}
    </div>
  );
};

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent', color: 'text-red-400', level: 3 },
  { value: 'high', label: 'High', color: 'text-orange-400', level: 3 },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', level: 2 },
  { value: 'low', label: 'Low', color: 'text-gray-400', level: 1 },
  { value: null, label: 'No priority', color: 'text-gray-500', level: 0 }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'To Do', color: 'text-gray-400', icon: Circle },
  { value: 'in_progress', label: 'In Progress', color: 'text-blue-400', icon: Circle },
  { value: 'completed', label: 'In Review', color: 'text-yellow-400', icon: CheckCircle2 },
  { value: 'verified', label: 'Done', color: 'text-green-400', icon: CheckCircle2 }
];

export function TaskModal({ 
  open, 
  onClose, 
  onSuccess, 
  projectId, 
  task,
  organizationId 
}: TaskModalProps) {
  const [creating, setCreating] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedPriority, setSelectedPriority] = useState<string | null>('medium');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [allOrgMembers, setAllOrgMembers] = useState<any[]>([]);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const assigneesDropdownRef = useRef<HTMLDivElement>(null);
  const dueDateRef = useRef<HTMLDivElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const assigneeSearchRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const isEditing = !!task;

  useEffect(() => {
    // Focus on name input when modal opens
    if (open) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
      if (assigneesDropdownRef.current && !assigneesDropdownRef.current.contains(event.target as Node)) {
        setShowAssigneesDropdown(false);
        setAssigneeSearchQuery(''); // Reset search when closing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load organization members
  useEffect(() => {
    if (open && organizationId) {
      loadOrgMembers();
    }
  }, [open, organizationId]);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setTaskName(task.task_name || task.title || '');
      setTaskDescription(task.task_description || task.description || '');
      setSelectedStatus(task.status || 'pending');
      setSelectedPriority(task.priority || 'medium');
      setDueDate(task.due_date || '');
      setEstimatedHours(task.estimated_hours?.toString() || '');
      setSubtasks(task.subtasks || []);
      // Handle both data structures: ta.user_id or ta.user.id
      setSelectedAssignees(task.task_assignees?.map((ta: any) => ta.user_id || ta.user?.id) || []);
      if (task.subtasks?.length > 0) {
        setShowSubtasks(true);
      }
    } else {
      // Reset form for new task
      setTaskName('');
      setTaskDescription('');
      setSelectedStatus('pending');
      setSelectedPriority('medium');
      setDueDate('');
      setEstimatedHours('');
      setSubtasks([]);
      setSelectedAssignees([]);
      setShowSubtasks(false);
    }
  }, [task]);

  const loadOrgMembers = async () => {
    try {
      // Load all organization members for search
      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select('user:profiles(id, full_name, avatar_url)')
        .eq('organization_id', organizationId);
      
      const allMembers = orgMembers?.map(m => m.user).filter(Boolean) || [];
      setAllOrgMembers(allMembers);
      
      // If editing a task, ensure all current assignees are in the members list
      if (task && task.task_assignees) {
        const currentAssignees = task.task_assignees
          .map((ta: any) => ta.user)
          .filter(Boolean);
        
        // Add any assignees that might not be in the org members list
        const memberIds = new Set(allMembers.map(m => m.id));
        currentAssignees.forEach((assignee: any) => {
          if (!memberIds.has(assignee.id)) {
            allMembers.push(assignee);
          }
        });
      }
      
      // Get all tasks for this project to find team members
      const { data: tasks } = await supabase
        .from('contributions')
        .select('id')
        .eq('project_id', projectId);
      
      if (!tasks || tasks.length === 0) {
        // If no tasks yet, team is empty
        setTeamMembers([]);
        return;
      }
      
      // Get all task assignees for this project's tasks
      const taskIds = tasks.map(t => t.id);
      const { data: assignees } = await supabase
        .from('task_assignees')
        .select('assignee_id, user:profiles!assignee_id(id, full_name, avatar_url)')
        .in('task_id', taskIds);
      
      // Get unique team members
      const uniqueMembers = new Map();
      if (assignees && assignees.length > 0) {
        assignees.forEach(a => {
          if (a.user) {
            uniqueMembers.set(a.user.id, a.user);
          }
        });
      }
      
      // Also get the project lead if there is one
      const { data: project } = await supabase
        .from('internal_projects')
        .select('lead_id, lead:profiles!lead_id(id, full_name, avatar_url)')
        .eq('id', projectId)
        .single();
      
      if (project?.lead && !uniqueMembers.has(project.lead.id)) {
        uniqueMembers.set(project.lead.id, project.lead);
      }
      
      // If editing a task, ensure current assignees are included in team members
      if (task && task.task_assignees) {
        task.task_assignees.forEach((ta: any) => {
          if (ta.user && !uniqueMembers.has(ta.user.id)) {
            uniqueMembers.set(ta.user.id, ta.user);
          }
        });
      }
      
      setTeamMembers(Array.from(uniqueMembers.values()));
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask = {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false
      };
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
      // Keep the subtasks section open and focus back on the input
      setTimeout(() => subtaskInputRef.current?.focus(), 50);
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleCreate = async () => {
    if (!taskName.trim()) {
      toast.error('Task name is required');
      return;
    }

    try {
      setCreating(true);

      if (isEditing) {
        // Update existing task
        const { error: taskError } = await supabase
          .from('contributions')
          .update({
            task_name: taskName.trim(),
            task_description: taskDescription.trim() || null,
            status: selectedStatus,
            priority: selectedPriority,
            due_date: dueDate || null,
            estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
            subtasks: subtasks.length > 0 ? subtasks : null
          })
          .eq('id', task.id);

        if (taskError) throw taskError;

        // Update assignees
        const { error: deleteError } = await supabase
          .from('task_assignees')
          .delete()
          .eq('task_id', task.id);

        if (deleteError) throw deleteError;

        if (selectedAssignees.length > 0) {
          const assigneeData = selectedAssignees.map(userId => ({
            task_id: task.id,
            assignee_id: userId,
            assigned_at: new Date().toISOString()
          }));

          const { error: assignError } = await supabase
            .from('task_assignees')
            .insert(assigneeData);

          if (assignError) throw assignError;
        }

        toast.success('Task updated successfully');
      } else {
        // Create new task
        const { data: newTask, error: taskError } = await supabase
          .from('contributions')
          .insert({
            project_id: projectId,
            task_name: taskName.trim(),
            task_description: taskDescription.trim() || null,
            status: selectedStatus,
            priority: selectedPriority,
            due_date: dueDate || null,
            estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
            subtasks: subtasks.length > 0 ? subtasks : null
          })
          .select()
          .single();

        if (taskError) throw taskError;

        // Add assignees
        if (selectedAssignees.length > 0) {
          const assigneeData = selectedAssignees.map(userId => ({
            task_id: newTask.id,
            assignee_id: userId,
            assigned_at: new Date().toISOString()
          }));

          const { error: assignError } = await supabase
            .from('task_assignees')
            .insert(assigneeData);

          if (assignError) throw assignError;
        }

        toast.success('Task created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving task:', error);
      toast.error(error.message || 'Failed to save task');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;

    try {
      setCreating(true);
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast.success('Task deleted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    } finally {
      setCreating(false);
    }
  };

  const getStatusOption = (value: string) => STATUS_OPTIONS.find(s => s.value === value);
  const getPriorityOption = (value: string | null) => PRIORITY_OPTIONS.find(p => p.value === value);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-dark-card rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
            <h2 className="text-lg font-medium">{isEditing ? 'Edit task' : 'New task'}</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-dark-surface rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Task Icon and Name */}
            <div className="flex items-start gap-4">
              <button className="w-12 h-12 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity" style={{ backgroundColor: 'lch(18 5.53 276.78)' }}>
                <Box className="w-6 h-6 text-gray-400" />
              </button>
              <div className="flex-1">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Task name"
                  className="w-full text-2xl font-medium bg-transparent border-none outline-none text-white placeholder-gray-500 focus:placeholder-gray-600 focus:ring-0"
                />
              </div>
            </div>

            {/* Property Pills */}
            <div className="flex flex-wrap gap-2">
              {/* Status */}
              <div className="relative" ref={statusDropdownRef}>
                <button 
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showStatusDropdown 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  {(() => {
                    const statusOption = getStatusOption(selectedStatus);
                    const Icon = statusOption?.icon || Circle;
                    return (
                      <>
                        <Icon className={cn("w-4 h-4", statusOption?.color)} />
                        <span className={cn("text-sm", statusOption?.color)}>
                          {statusOption?.label}
                        </span>
                      </>
                    );
                  })()}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedStatus(option.value);
                          setShowStatusDropdown(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                          selectedStatus === option.value && "bg-dark-surface"
                        )}
                      >
                        {(() => {
                          const Icon = option.icon;
                          return <Icon className={cn("w-4 h-4", option.color)} />;
                        })()}
                        <span className={option.color}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="relative" ref={priorityDropdownRef}>
                <button 
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showPriorityDropdown 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  {(() => {
                    const priorityOption = getPriorityOption(selectedPriority);
                    return (
                      <>
                        <PriorityIcon 
                          level={priorityOption?.level || 0} 
                          color={priorityOption?.color || 'text-gray-500'} 
                        />
                        <span className={cn("text-sm", priorityOption?.color || 'text-gray-500')}>
                          {priorityOption?.label || 'No priority'}
                        </span>
                      </>
                    );
                  })()}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                {showPriorityDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl">
                    {PRIORITY_OPTIONS.map((option) => (
                      <button
                        key={option.value || 'none'}
                        onClick={() => {
                          setSelectedPriority(option.value);
                          setShowPriorityDropdown(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                          selectedPriority === option.value && "bg-dark-surface"
                        )}
                      >
                        <PriorityIcon level={option.level} color={option.color} />
                        <span className={option.color}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignees */}
              <div className="relative" ref={assigneesDropdownRef}>
                <button 
                  onClick={() => {
                    setShowAssigneesDropdown(!showAssigneesDropdown);
                    if (!showAssigneesDropdown) {
                      setTimeout(() => assigneeSearchRef.current?.focus(), 100);
                    }
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showAssigneesDropdown 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  {selectedAssignees.length > 0 ? (
                    <>
                      <div className="flex -space-x-2">
                        {selectedAssignees.slice(0, 3).map((assigneeId) => {
                          const assignee = teamMembers.find(m => m.id === assigneeId);
                          if (!assignee) return null;
                          return (
                            <div key={assigneeId} className="relative">
                              {assignee.avatar_url ? (
                                <img 
                                  src={assignee.avatar_url} 
                                  alt={assignee.full_name}
                                  className="w-5 h-5 rounded-full ring-2"
                                  style={{ '--tw-ring-color': 'lch(18 5.53 276.78)' } as React.CSSProperties}
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-600 ring-2 flex items-center justify-center text-xs text-white"
                                  style={{ '--tw-ring-color': 'lch(18 5.53 276.78)' } as React.CSSProperties}>
                                  {assignee.full_name[0]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {selectedAssignees.length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-gray-600 ring-2 flex items-center justify-center text-xs text-white"
                            style={{ '--tw-ring-color': 'lch(18 5.53 276.78)' } as React.CSSProperties}>
                            +{selectedAssignees.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-300">
                        {selectedAssignees.length} {selectedAssignees.length === 1 ? 'assignee' : 'assignees'}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Assignee</span>
                    </>
                  )}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                {showAssigneesDropdown && (
                  <div className="absolute z-10 mt-1 w-80 bg-dark-card border border-dark-border rounded-lg shadow-xl">
                    {/* Search Bar */}
                    <div className="p-3 border-b border-dark-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          ref={assigneeSearchRef}
                          type="text"
                          value={assigneeSearchQuery}
                          onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                          placeholder="Search team members..."
                          className="w-full pl-9 pr-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {/* Filter members based on search */}
                      {(() => {
                        const searchLower = assigneeSearchQuery.toLowerCase();
                        
                        // If searching, show all org members; otherwise show team members
                        const membersToShow = assigneeSearchQuery 
                          ? allOrgMembers.filter(member => 
                              member && member.full_name && member.full_name.toLowerCase().includes(searchLower)
                            )
                          : teamMembers;
                        
                        // For search results, separate team members from others
                        const teamMemberIds = new Set(teamMembers.map(tm => tm.id));
                        const searchTeamMembers = assigneeSearchQuery 
                          ? membersToShow.filter(m => teamMemberIds.has(m.id))
                          : teamMembers;
                        const searchOtherMembers = assigneeSearchQuery 
                          ? membersToShow.filter(m => !teamMemberIds.has(m.id))
                          : [];
                        
                        return (
                          <>
                            {(searchTeamMembers.length > 0 || searchOtherMembers.length > 0 || (!assigneeSearchQuery && teamMembers.length > 0)) ? (
                              <>
                                {/* Team Members Header */}
                                {!assigneeSearchQuery && (
                                  <div className="px-3 py-2 text-xs text-gray-500 font-medium uppercase">
                                    Project Team Members
                                  </div>
                                )}
                                {assigneeSearchQuery && searchTeamMembers.length > 0 && (
                                  <div className="px-3 py-2 text-xs text-gray-500 font-medium uppercase">
                                    Team Members
                                  </div>
                                )}
                                
                                {/* Team Members List */}
                                {searchTeamMembers.map((member) => (
                                  <button
                                    key={member.id}
                                    onClick={() => {
                                      if (selectedAssignees.includes(member.id)) {
                                        setSelectedAssignees(selectedAssignees.filter(id => id !== member.id));
                                      } else {
                                        setSelectedAssignees([...selectedAssignees, member.id]);
                                      }
                                    }}
                                    className={cn(
                                      "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                                      selectedAssignees.includes(member.id) && "bg-dark-surface"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-4 h-4 rounded border flex items-center justify-center",
                                      selectedAssignees.includes(member.id) 
                                        ? "bg-neon-green border-neon-green" 
                                        : "border-gray-600"
                                    )}>
                                      {selectedAssignees.includes(member.id) && (
                                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
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
                                        {member.full_name[0]}
                                      </div>
                                    )}
                                    <span className="text-gray-300">{member.full_name}</span>
                                  </button>
                                ))}
                                
                                {/* Other Organization Members (when searching) */}
                                {assigneeSearchQuery && searchOtherMembers.length > 0 && (
                                  <>
                                    <div className="px-3 py-2 text-xs text-gray-500 font-medium uppercase border-t border-dark-border">
                                      Other Organization Members
                                    </div>
                                    {searchOtherMembers.map((member) => (
                                      <button
                                        key={member.id}
                                        onClick={() => {
                                          if (selectedAssignees.includes(member.id)) {
                                            setSelectedAssignees(selectedAssignees.filter(id => id !== member.id));
                                          } else {
                                            setSelectedAssignees([...selectedAssignees, member.id]);
                                          }
                                        }}
                                        className={cn(
                                          "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                                          selectedAssignees.includes(member.id) && "bg-dark-surface"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-4 h-4 rounded border flex items-center justify-center",
                                          selectedAssignees.includes(member.id) 
                                            ? "bg-neon-green border-neon-green" 
                                            : "border-gray-600"
                                        )}>
                                          {selectedAssignees.includes(member.id) && (
                                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
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
                                            {member.full_name[0]}
                                          </div>
                                        )}
                                        <span className="text-gray-300">{member.full_name}</span>
                                      </button>
                                    ))}
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {/* No results or no team members */}
                                <div className="px-3 py-8 text-center text-sm text-gray-500">
                                  {assigneeSearchQuery ? (
                                    <>No members found matching "{assigneeSearchQuery}"</>
                                  ) : teamMembers.length === 0 ? (
                                    <>No team members yet. Search to add people from your organization.</>
                                  ) : (
                                    <>No members found</>
                                  )}
                                </div>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="relative" ref={dueDateRef}>
                <button 
                  onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showDueDatePicker 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  <CalendarClock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {dueDate ? new Date(dueDate).toLocaleDateString() : 'Due date'}
                  </span>
                </button>
                
                {showDueDatePicker && (
                  <DatePicker
                    value={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                      setShowDueDatePicker(false);
                    }}
                    onClose={() => setShowDueDatePicker(false)}
                  />
                )}
              </div>

            </div>

            {/* Divider */}
            <div className="border-t border-dark-border" />

            {/* Description */}
            <div>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add a description..."
                className="w-full min-h-[120px] bg-transparent border-none outline-none text-gray-300 placeholder-gray-600 resize-none focus:ring-0"
              />
            </div>

            {/* Subtasks Section */}
            <div className="border-t border-dark-border pt-6">
              <motion.div
                className="bg-dark-surface rounded-lg"
                animate={{ 
                  height: showSubtasks ? 'auto' : 'auto'
                }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <button 
                  onClick={() => {
                    setShowSubtasks(!showSubtasks);
                    if (!showSubtasks) {
                      setTimeout(() => subtaskInputRef.current?.focus(), 100);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-dark-surface/80 transition-colors"
                >
                  <span className="text-gray-300 font-medium">
                    Subtasks {subtasks.length > 0 && `(${subtasks.length})`}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-white">
                    <Plus className="w-4 h-4" />
                    Add subtask
                  </span>
                </button>
                
                <AnimatePresence initial={false}>
                  {showSubtasks && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                      className="overflow-visible"
                    >
                      <motion.div 
                        className="px-3 pb-3 space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {/* Existing subtasks */}
                        {subtasks.map((subtask, index) => (
                          <motion.div
                            key={subtask.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <button
                              onClick={() => handleToggleSubtask(subtask.id)}
                              className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                subtask.completed 
                                  ? "bg-neon-green border-neon-green" 
                                  : "border-gray-600 hover:border-gray-400"
                              )}
                            >
                              {subtask.completed && (
                                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <input
                              type="text"
                              value={subtask.title}
                              readOnly
                              className={cn(
                                "flex-1 bg-transparent text-sm text-white placeholder-gray-600 border-0 outline-none focus:outline-none focus:ring-0 cursor-default",
                                subtask.completed && "line-through opacity-50"
                              )}
                            />
                            <button
                              onClick={() => handleRemoveSubtask(subtask.id)}
                              className="p-1.5 hover:bg-dark-card rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                            </button>
                          </motion.div>
                        ))}
                        
                        {/* New subtask input */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-4 h-4 rounded border-2 border-gray-600" />
                          <input
                            ref={subtaskInputRef}
                            type="text"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                                e.preventDefault();
                                handleAddSubtask();
                              }
                            }}
                            placeholder="Subtask name"
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 border-0 outline-none focus:outline-none focus:ring-0"
                          />
                          <div className="w-5 h-5" /> {/* Spacer for alignment */}
                        </motion.div>
                        
                        {/* Add another subtask button */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => {
                              if (newSubtaskTitle.trim()) {
                                handleAddSubtask();
                              }
                              setTimeout(() => subtaskInputRef.current?.focus(), 50);
                            }}
                            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add subtask
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border bg-dark-card">
            {isEditing && (
              <button
                onClick={handleDelete}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                disabled={creating}
              >
                Delete task
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <NeonButton
                onClick={handleCreate}
                disabled={!taskName.trim() || creating}
                loading={creating}
                size="sm"
              >
                {isEditing ? 'Update task' : 'Create task'}
              </NeonButton>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}