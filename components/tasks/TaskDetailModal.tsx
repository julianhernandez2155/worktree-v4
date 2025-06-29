'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  X, 
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  FileText,
  Flag,
  Edit3,
  Save,
  Plus,
  Square,
  CheckSquare,
  Trash2,
  Users,
  Check,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskSkillRequirements } from '@/components/tasks/TaskSkillRequirements';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
}

interface Assignee {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  skills: string[];
  is_primary: boolean;
  assigned_at: string;
}

interface Task {
  id: string;
  task_name: string;
  task_description: string;
  skills_used: string[];
  status: string;
  due_date?: string | null;
  priority?: string;
  assigned_at?: string | null;
  assignee_notes?: string | null;
  estimated_hours?: number | null;
  hours_worked?: number | null;
  contributor_id: string | null;
  project_id: string;
  subtasks?: Subtask[];
}

interface TaskDetailModalProps {
  taskId: string;
  orgSlug: string;
  onClose: () => void;
  onUpdate?: () => void;
}

export function TaskDetailModal({ taskId, orgSlug, onClose, onUpdate }: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<any>(null);
  const [assignee, setAssignee] = useState<any>(null);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [saving, setSaving] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      // Load task details
      const { data: taskData, error: taskError } = await supabase
        .from('contributions')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      // Ensure subtasks is an array
      const taskWithSubtasks = {
        ...taskData,
        subtasks: taskData.subtasks || []
      };
      setTask(taskWithSubtasks);
      setEditedTask(taskWithSubtasks);

      // Load project details
      const { data: projectData } = await supabase
        .from('internal_projects')
        .select('*, organization:organizations(*)')
        .eq('id', taskData.project_id)
        .single();

      setProject(projectData);

      // Load assignee details if assigned (legacy single assignee)
      if (taskData.contributor_id) {
        const { data: assigneeData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', taskData.contributor_id)
          .single();

        setAssignee(assigneeData);
      }

      // Load all assignees from task_assignees table
      const { data: assigneesData } = await supabase
        .from('task_assignees')
        .select(`
          assignee_id,
          is_primary,
          assigned_at
        `)
        .eq('task_id', taskId)
        .order('is_primary', { ascending: false })
        .order('assigned_at');
      
      // Load assignee profiles separately if we have assignees
      let assigneeProfiles: any = {};
      if (assigneesData && assigneesData.length > 0) {
        const assigneeIds = assigneesData.map(a => a.assignee_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', assigneeIds);
        
        if (profilesData) {
          assigneeProfiles = profilesData.reduce((acc: any, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }

      if (assigneesData) {
        const formattedAssignees = assigneesData.map(a => {
          const profile = assigneeProfiles[a.assignee_id] || {};
          return {
            id: a.assignee_id,
            full_name: profile.full_name || 'Unknown',
            username: profile.username,
            avatar_url: profile.avatar_url,
            skills: [], // Skills are now in member_skills table
            is_primary: a.is_primary,
            assigned_at: a.assigned_at
          };
        });
        setAssignees(formattedAssignees);
      }
    } catch (error) {
      console.error('Error loading task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!task) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('contributions')
        .update({
          due_date: editedTask.due_date,
          priority: editedTask.priority,
          estimated_hours: editedTask.estimated_hours,
          assignee_notes: editedTask.assignee_notes,
          subtasks: editedTask.subtasks
        })
        .eq('id', task.id);

      if (error) throw error;

      await loadTaskDetails();
      setEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!task || !newSubtask.trim()) return;

    const newSubtaskItem: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtask.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtaskItem];
    
    try {
      const { error } = await supabase
        .from('contributions')
        .update({ subtasks: updatedSubtasks })
        .eq('id', task.id);

      if (error) throw error;

      setTask({ ...task, subtasks: updatedSubtasks });
      setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
      setNewSubtask('');
      setAddingSubtask(false);
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!task) return;

    const updatedSubtasks = (task.subtasks || []).map(st => 
      st.id === subtaskId 
        ? { 
            ...st, 
            completed: !st.completed,
            completed_at: !st.completed ? new Date().toISOString() : null
          }
        : st
    );

    try {
      const { error } = await supabase
        .from('contributions')
        .update({ subtasks: updatedSubtasks })
        .eq('id', task.id);

      if (error) throw error;

      setTask({ ...task, subtasks: updatedSubtasks });
      setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;

    const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);

    try {
      const { error } = await supabase
        .from('contributions')
        .update({ subtasks: updatedSubtasks })
        .eq('id', task.id);

      if (error) throw error;

      setTask({ ...task, subtasks: updatedSubtasks });
      setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;

    try {
      setCompleting(true);

      const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
      const updateData: any = { 
        status: newStatus 
      };

      // If marking as completed, set completed_at
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('contributions')
        .update(updateData)
        .eq('id', task.id);

      if (error) throw error;

      await loadTaskDetails();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    try {
      setDeleting(true);

      // Delete task assignees first (due to foreign key)
      await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', task.id);

      // Delete task required skills
      await supabase
        .from('task_required_skills')
        .delete()
        .eq('task_id', task.id);

      // Delete the task
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDaysUntilDue = () => {
    if (!task?.due_date) return null;
    const due = new Date(task.due_date);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = () => {
    const days = getDaysUntilDue();
    if (days === null) return 'text-gray-400';
    if (days < 0) return 'text-red-400';
    if (days === 0) return 'text-orange-400';
    if (days <= 3) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (loading) return <LoadingSpinner />;
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-dark-border">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(task.status)}
              <h2 className="text-2xl font-bold text-white">{task.task_name}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-dark-muted">
              <span>{project?.name}</span>
              <span>•</span>
              <span>{project?.organization?.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-dark-muted" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              {/* Due Date */}
              <div>
                <label className="text-sm text-dark-muted mb-1 block">Due Date</label>
                {editing ? (
                  <input
                    type="date"
                    value={editedTask.due_date || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white"
                  />
                ) : (
                  <div className={cn("flex items-center gap-2", getDueDateColor())}>
                    <Calendar className="h-4 w-4" />
                    {task.due_date ? (
                      <>
                        {new Date(task.due_date).toLocaleDateString()}
                        {getDaysUntilDue() !== null && (
                          <span className="text-xs">
                            ({getDaysUntilDue() < 0 ? 'Overdue' : 
                              getDaysUntilDue() === 0 ? 'Due today' : 
                              `${getDaysUntilDue()} days`})
                          </span>
                        )}
                      </>
                    ) : (
                      'No due date'
                    )}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm text-dark-muted mb-1 block">Priority</label>
                {editing ? (
                  <select
                    value={editedTask.priority || 'medium'}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm", getPriorityColor(task.priority || 'medium'))}>
                    <Flag className="h-3 w-3" />
                    {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                  </div>
                )}
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="text-sm text-dark-muted mb-1 block">Estimated Hours</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.5"
                    value={editedTask.estimated_hours || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, estimated_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="h-4 w-4 text-dark-muted" />
                    {task.estimated_hours ? `${task.estimated_hours} hours` : 'Not estimated'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Assignees */}
              <div>
                <label className="text-sm text-dark-muted mb-1 block">Assigned To</label>
                {assignees.length > 0 ? (
                  <div className="space-y-2">
                    {assignees.map((assignee) => (
                      <div key={assignee.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-dark-card rounded-full flex items-center justify-center">
                          {assignee.avatar_url ? (
                            <img 
                              src={assignee.avatar_url} 
                              alt={assignee.full_name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <User className="h-4 w-4 text-dark-muted" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="text-white">
                            {assignee.full_name || assignee.username || 'Unknown'}
                            {assignee.is_primary && (
                              <span className="text-xs text-neon-green ml-2">(Primary)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                    {assignees.length > 1 && (
                      <div className="text-xs text-dark-muted mt-1">
                        <Users className="h-3 w-3 inline mr-1" />
                        {assignees.length} people assigned
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-dark-muted" />
                    <span className="text-dark-muted">Unassigned</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-dark-muted mb-1 block">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="text-white capitalize">{task.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Hours Worked */}
              {task.hours_worked && (
                <div>
                  <label className="text-sm text-dark-muted mb-1 block">Hours Worked</label>
                  <div className="text-white">{task.hours_worked} hours</div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-gray-300">{task.task_description}</p>
          </div>

          {/* Skills Required */}
          <div className="mb-6">
            <TaskSkillRequirements
              taskId={task.id}
              isEditing={false}
            />
          </div>

          {/* Subtasks */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Subtasks</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-muted">
                  {task.subtasks?.filter(st => st.completed).length || 0}/{task.subtasks?.length || 0} completed
                </span>
                {!addingSubtask && (
                  <button
                    onClick={() => setAddingSubtask(true)}
                    className="p-1 hover:bg-dark-card rounded transition-colors"
                  >
                    <Plus className="h-4 w-4 text-dark-muted" />
                  </button>
                )}
              </div>
            </div>

            {/* Subtask List */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {task.subtasks.map((subtask) => (
                  <div 
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 bg-dark-card rounded-lg group"
                  >
                    <button
                      onClick={() => handleToggleSubtask(subtask.id)}
                      className="flex-shrink-0"
                    >
                      {subtask.completed ? (
                        <CheckSquare className="h-5 w-5 text-neon-green" />
                      ) : (
                        <Square className="h-5 w-5 text-dark-muted hover:text-white" />
                      )}
                    </button>
                    <span className={cn(
                      "flex-1 text-sm",
                      subtask.completed ? "text-dark-muted line-through" : "text-white"
                    )}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-bg rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Form */}
            {addingSubtask && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                  placeholder="Add a subtask..."
                  autoFocus
                  className="flex-1 px-3 py-2 bg-dark-card border border-dark-border rounded-lg 
                           text-white placeholder-dark-muted focus:border-neon-green focus:outline-none"
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-3 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setAddingSubtask(false);
                    setNewSubtask('');
                  }}
                  className="px-3 py-2 text-dark-muted hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-4">
                <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-neon-green to-green-500 transition-all duration-300"
                    style={{ 
                      width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
            {editing ? (
              <textarea
                value={editedTask.assignee_notes || ''}
                onChange={(e) => setEditedTask({ ...editedTask, assignee_notes: e.target.value })}
                placeholder="Add any notes about this task..."
                rows={4}
                className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted resize-none"
              />
            ) : (
              <p className="text-gray-300">
                {task.assignee_notes || <span className="text-dark-muted italic">No notes added</span>}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-dark-border">
          <div className="flex items-center gap-3">
            {/* Delete button on the left */}
            {!editing && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2"
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-400">Are you sure?</span>
                <button
                  onClick={handleDeleteTask}
                  disabled={deleting}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-dark-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            {/* Timestamp */}
            {!showDeleteConfirm && (
              <div className="text-sm text-dark-muted">
                {task.assigned_at && (
                  <span>Assigned {new Date(task.assigned_at).toLocaleDateString()}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditedTask(task);
                  }}
                  className="px-4 py-2 text-dark-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <NeonButton
                  onClick={handleSave}
                  loading={saving}
                  icon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </NeonButton>
              </>
            ) : (
              <>
                {/* Complete/Reopen button */}
                <NeonButton
                  onClick={handleCompleteTask}
                  loading={completing}
                  variant={task.status === 'completed' ? 'secondary' : 'primary'}
                  icon={task.status === 'completed' ? 
                    <RotateCcw className="h-4 w-4" /> : 
                    <Check className="h-4 w-4" />
                  }
                >
                  {task.status === 'completed' ? 'Reopen' : 'Complete'}
                </NeonButton>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-dark-muted hover:text-white transition-colors"
                >
                  Close
                </button>
                <NeonButton
                  onClick={() => setEditing(true)}
                  variant="secondary"
                  icon={<Edit3 className="h-4 w-4" />}
                >
                  Edit Task
                </NeonButton>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}