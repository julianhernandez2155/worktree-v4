'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { AssignTaskModal } from '@/components/tasks/AssignTaskModal';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { NaturalLanguageTaskInput } from '@/components/tasks/NaturalLanguageTaskInput';
import { 
  ArrowLeft,
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Flag,
  User,
  Plus,
  Edit,
  Globe,
  Lock,
  ChevronRight,
  ListChecks,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProjectDetailProps {
  orgSlug: string;
  projectId: string;
}

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
  is_primary: boolean;
}

interface Task {
  id: string;
  task_name: string;
  task_description: string;
  skills_used: string[];
  status: string;
  due_date?: string | null;
  priority?: string;
  contributor_id: string | null;
  contributor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    skills: string[];
  };
  estimated_hours?: number | null;
  hours_worked?: number | null;
  subtasks?: Subtask[];
  assignees?: Assignee[];
}

export function ProjectDetail({ orgSlug, projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [assigningTask, setAssigningTask] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showNLInput, setShowNLInput] = useState(false);
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  const loadProjectDetails = async () => {
    try {
      // Load project details
      const { data: projectData, error: projectError } = await supabase
        .from('internal_projects')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Load tasks with assignee details
      const { data: tasksData, error: tasksError } = await supabase
        .from('contributions')
        .select(`
          *,
          contributor:profiles!contributor_id(
            id,
            full_name,
            avatar_url,
            skills
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;
      
      // Load assignees for all tasks
      const taskIds = tasksData?.map(t => t.id) || [];
      const { data: assigneesData } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          assignee_id,
          is_primary,
          assigned_at,
          assignee:profiles!assignee_id (
            id,
            full_name,
            username,
            avatar_url,
            skills
          )
        `)
        .in('task_id', taskIds)
        .order('is_primary', { ascending: false })
        .order('assigned_at');

      // Group assignees by task
      const assigneesByTask = assigneesData?.reduce((acc: any, item) => {
        if (!acc[item.task_id]) acc[item.task_id] = [];
        acc[item.task_id].push({
          id: item.assignee.id,
          full_name: item.assignee.full_name,
          username: item.assignee.username,
          avatar_url: item.assignee.avatar_url,
          is_primary: item.is_primary
        });
        return acc;
      }, {}) || {};

      // Merge assignees into tasks
      const tasksWithAssignees = tasksData?.map(task => ({
        ...task,
        assignees: assigneesByTask[task.id] || []
      })) || [];

      setTasks(tasksWithAssignees);

      // Load organization members for NL input
      if (projectData?.organization_id) {
        const { data: membersData } = await supabase
          .from('organization_members')
          .select(`
            user:profiles!user_id(
              full_name
            )
          `)
          .eq('organization_id', projectData.organization_id);

        if (membersData) {
          const names = membersData
            .map(m => m.user?.full_name)
            .filter(Boolean) as string[];
          setMemberNames(names);
        }
      }
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
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
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-400' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-400' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-blue-400' };
    return { text: `${diffDays} days`, color: 'text-gray-400' };
  };

  const taskStats = {
    total: tasks.length,
    assigned: tasks.filter(t => t.assignees && t.assignees.length > 0).length,
    completed: tasks.filter(t => t.status === 'completed' || t.status === 'verified').length,
    overdue: tasks.filter(t => {
      if (!t.due_date || t.status === 'completed' || t.status === 'verified') return false;
      return new Date(t.due_date) < new Date();
    }).length
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/dashboard/org/${orgSlug}/projects`)}
          className="p-2 hover:bg-dark-card rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-dark-muted" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm flex items-center gap-2",
              project.visibility === 'internal' 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-purple-500/20 text-purple-400"
            )}>
              {project.visibility === 'internal' ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Globe className="h-3 w-3" />
              )}
              {project.visibility}
            </div>
          </div>
          <p className="text-dark-muted mt-1">{project.description}</p>
        </div>
        <NeonButton variant="secondary" icon={<Edit className="h-4 w-4" />}>
          Edit Project
        </NeonButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-muted">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{taskStats.total}</p>
            </div>
            <div className="p-2 bg-dark-card rounded-lg">
              <CheckCircle className="h-5 w-5 text-neon-green" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-muted">Assigned</p>
              <p className="text-2xl font-bold text-white">{taskStats.assigned}/{taskStats.total}</p>
            </div>
            <div className="p-2 bg-dark-card rounded-lg">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-muted">Completed</p>
              <p className="text-2xl font-bold text-white">{taskStats.completed}</p>
            </div>
            <div className="p-2 bg-dark-card rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-muted">Overdue</p>
              <p className="text-2xl font-bold text-white">{taskStats.overdue}</p>
            </div>
            <div className="p-2 bg-dark-card rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tasks List */}
      <GlassCard>
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Tasks</h2>
            <div className="flex items-center gap-2">
              <NeonButton 
                size="sm" 
                variant="secondary"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={() => setShowNLInput(!showNLInput)}
              >
                AI Create
              </NeonButton>
              <NeonButton 
                size="sm" 
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddTask(true)}
              >
                Add Task
              </NeonButton>
            </div>
          </div>
          
          {/* Natural Language Input */}
          {showNLInput && (
            <div className="mt-4">
              <NaturalLanguageTaskInput
                projectId={projectId}
                orgSlug={orgSlug}
                memberNames={memberNames}
                onTaskCreated={() => {
                  loadProjectDetails();
                  setShowNLInput(false);
                }}
              />
            </div>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-dark-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
            <p className="text-dark-muted mb-6">
              Add your first task to start organizing work
            </p>
            <NeonButton
              onClick={() => setShowAddTask(true)}
              icon={<Plus className="h-4 w-4" />}
              variant="secondary"
            >
              Add First Task
            </NeonButton>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {tasks.map((task) => {
            const dueDateStatus = getDueDateStatus(task.due_date);
            
            return (
              <div 
                key={task.id} 
                className="p-4 hover:bg-dark-card/50 transition-colors cursor-pointer"
                onClick={() => setSelectedTask(task.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="mt-1">
                    {getStatusIcon(task.status)}
                  </div>

                  {/* Task Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-1">{task.task_name}</h3>
                    <p className="text-sm text-dark-muted line-clamp-2 mb-2">
                      {task.task_description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm">
                      {/* Priority */}
                      {task.priority && (
                        <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full", getPriorityColor(task.priority))}>
                          <Flag className="h-3 w-3" />
                          {task.priority}
                        </div>
                      )}

                      {/* Due Date */}
                      {dueDateStatus && (
                        <div className={cn("flex items-center gap-1", dueDateStatus.color)}>
                          <Calendar className="h-3 w-3" />
                          {dueDateStatus.text}
                        </div>
                      )}

                      {/* Estimated Hours */}
                      {task.estimated_hours && (
                        <div className="flex items-center gap-1 text-dark-muted">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours}h
                        </div>
                      )}

                      {/* Subtasks Progress */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1 text-dark-muted">
                          <ListChecks className="h-3 w-3" />
                          {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                        </div>
                      )}

                      {/* Skills */}
                      {task.skills_used.length > 0 && (
                        <div className="flex items-center gap-2">
                          {task.skills_used.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-dark-bg text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {task.skills_used.length > 3 && (
                            <span className="text-dark-muted text-xs">
                              +{task.skills_used.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignees */}
                  <div className="flex items-center gap-3">
                    {task.assignees && task.assignees.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <div 
                              key={assignee.id}
                              className="w-8 h-8 bg-dark-card rounded-full flex items-center justify-center border-2 border-dark-bg"
                              title={assignee.full_name}
                            >
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
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="w-8 h-8 bg-dark-card rounded-full flex items-center justify-center border-2 border-dark-bg">
                              <span className="text-xs text-dark-muted">+{task.assignees.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-white">
                          {task.assignees.length === 1 
                            ? task.assignees[0].full_name 
                            : `${task.assignees.length} assigned`}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssigningTask(task.id);
                          }}
                          className="p-1 hover:bg-dark-card rounded transition-colors"
                          title="Add more assignees"
                        >
                          <UserPlus className="h-4 w-4 text-dark-muted" />
                        </button>
                      </div>
                    ) : (
                      <NeonButton
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningTask(task.id);
                        }}
                      >
                        Assign
                      </NeonButton>
                    )}
                    <ChevronRight className="h-4 w-4 text-dark-muted" />
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </GlassCard>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask}
          orgSlug={orgSlug}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadProjectDetails}
        />
      )}

      {/* Assign Task Modal */}
      {assigningTask && (
        <AssignTaskModal
          taskId={assigningTask}
          orgSlug={orgSlug}
          onClose={() => setAssigningTask(null)}
          onAssigned={loadProjectDetails}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          projectId={projectId}
          orgSlug={orgSlug}
          onClose={() => setShowAddTask(false)}
          onTaskAdded={loadProjectDetails}
        />
      )}
    </div>
  );
}