'use client';

import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Flag,
  Filter,
  ChevronRight,
  ListChecks
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { TaskDetailModal } from './TaskDetailModal';


interface MyTasksViewProps {
  orgSlug: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
}

interface TaskWithProject {
  id: string;
  task_name: string;
  task_description: string;
  skills_used: string[];
  status: string;
  due_date: string | null;
  priority: string;
  estimated_hours: number | null;
  hours_worked: number | null;
  project_name: string;
  organization_name: string;
  organization_slug: string;
  urgency_status: string;
  subtasks?: Subtask[];
}

export function MyTasksView({ orgSlug }: MyTasksViewProps) {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'week'>('all');
  const supabase = createClient();

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      // Load tasks from the my_tasks view
      const { data: tasksData, error } = await supabase
        .from('my_tasks')
        .select('*')
        .eq('assignee_id', user.id)
        .not('status', 'in', '["completed", "verified"]')
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) {throw error;}
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'text-red-400';
      case 'due_today': return 'text-orange-400';
      case 'due_tomorrow': return 'text-yellow-400';
      case 'due_this_week': return 'text-blue-400';
      default: return 'text-gray-400';
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

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'overdue':
        return task.urgency_status === 'overdue';
      case 'today':
        return task.urgency_status === 'due_today';
      case 'week':
        return ['due_today', 'due_tomorrow', 'due_this_week'].includes(task.urgency_status);
      default:
        return true;
    }
  });

  const stats = {
    total: tasks.length,
    overdue: tasks.filter(t => t.urgency_status === 'overdue').length,
    dueToday: tasks.filter(t => t.urgency_status === 'due_today').length,
    dueThisWeek: tasks.filter(t => ['due_today', 'due_tomorrow', 'due_this_week'].includes(t.urgency_status)).length,
    totalHours: tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
  };

  if (loading) {return <LoadingSpinner />;}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Tasks</h1>
        <p className="text-dark-muted mt-1">
          Track your assignments across all projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-muted">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-2 bg-dark-card rounded-lg">
              <CheckCircle className="h-5 w-5 text-neon-green" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-muted">Overdue</p>
              <p className="text-2xl font-bold text-white">{stats.overdue}</p>
            </div>
            <div className="p-2 bg-dark-card rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-muted">Due Today</p>
              <p className="text-2xl font-bold text-white">{stats.dueToday}</p>
            </div>
            <div className="p-2 bg-dark-card rounded-lg">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-muted">Total Hours</p>
              <p className="text-2xl font-bold text-white">{stats.totalHours.toFixed(1)}</p>
            </div>
            <div className="p-2 bg-dark-card rounded-lg">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-dark-muted" />
        {[
          { value: 'all', label: 'All Tasks' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'today', label: 'Due Today' },
          { value: 'week', label: 'This Week' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              filter === option.value 
                ? "bg-neon-green/20 text-neon-green" 
                : "text-dark-muted hover:text-white"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <GlassCard>
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-dark-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-dark-muted">
              {filter === 'all' 
                ? "You don't have any active tasks assigned"
                : `No ${filter === 'overdue' ? 'overdue' : filter === 'today' ? 'tasks due today' : 'tasks due this week'}`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {filteredTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task.id)}
                className="p-4 hover:bg-dark-card/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="mt-1">
                    {getStatusIcon(task.status)}
                  </div>

                  {/* Task Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-white">{task.task_name}</h3>
                      <ChevronRight className="h-4 w-4 text-dark-muted mt-0.5" />
                    </div>
                    
                    <p className="text-sm text-dark-muted line-clamp-2 mb-2">
                      {task.task_description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm">
                      {/* Organization & Project */}
                      <div className="text-dark-muted">
                        {task.organization_name} • {task.project_name}
                      </div>

                      {/* Priority */}
                      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full", getPriorityColor(task.priority || 'medium'))}>
                        <Flag className="h-3 w-3" />
                        {task.priority || 'medium'}
                      </div>

                      {/* Due Date */}
                      {task.due_date && (
                        <div className={cn("flex items-center gap-1", getUrgencyColor(task.urgency_status))}>
                          <Calendar className="h-3 w-3" />
                          {task.urgency_status === 'overdue' && 'Overdue'}
                          {task.urgency_status === 'due_today' && 'Due today'}
                          {task.urgency_status === 'due_tomorrow' && 'Due tomorrow'}
                          {task.urgency_status === 'due_this_week' && new Date(task.due_date).toLocaleDateString()}
                          {task.urgency_status === 'upcoming' && new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}

                      {/* Estimated Hours */}
                      {task.estimated_hours && (
                        <div className="flex items-center gap-1 text-dark-muted">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours}h
                        </div>
                      )}

                      {/* Subtasks */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1 text-dark-muted">
                          <ListChecks className="h-3 w-3" />
                          {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask}
          orgSlug={orgSlug}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            loadMyTasks();
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}