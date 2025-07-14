'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  CheckSquare,
  Activity,
  Paperclip,
  Plus,
  MoreVertical,
  Users,
  Clock,
  AlertCircle,
  Flag,
  User,
  Circle,
  CheckCircle2,
  Pause,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { NeonButton } from '@/components/ui/NeonButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TaskKanbanBoardV2 } from './TaskKanbanBoardV2';
import { InlineStatusEditor } from './InlineStatusEditor';
import { InlinePriorityEditor } from './InlinePriorityEditor';
import { TaskModal } from '@/components/tasks/TaskModal';

interface ProjectFullPageProps {
  orgSlug: string;
  projectId: string;
}

type TabType = 'tasks' | 'overview' | 'activity' | 'files';

const statusConfig = {
  planning: { label: 'Planning', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-400/10' },
  on_hold: { label: 'On Hold', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  completed: { label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  archived: { label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-500/10' }
};

export function ProjectFullPage({ orgSlug, projectId }: ProjectFullPageProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('internal_projects')
        .select(`
          *,
          organization:organizations!inner(name, slug),
          team:organization_teams(id, name, color),
          lead:profiles!internal_projects_lead_id_fkey(id, full_name, avatar_url),
          members:task_assignees(
            user:profiles!inner(id, full_name, avatar_url)
          ),
          contributions(
            id,
            title,
            description,
            status,
            priority,
            due_date,
            created_at,
            subtasks,
            task_assignees(
              user:profiles!inner(id, full_name, avatar_url)
            ),
            task_required_skills(
              skill:skills!inner(id, name)
            )
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Process members to flatten the structure
      const uniqueMembers = new Map();
      projectData.members?.forEach((m: any) => {
        if (m.user) {
          uniqueMembers.set(m.user.id, m.user);
        }
      });
      projectData.members = Array.from(uniqueMembers.values());

      // Calculate task stats
      const tasks = projectData.contributions || [];
      const taskStats = {
        total: tasks.length,
        completed: tasks.filter((t: any) => t.status === 'completed' || t.status === 'verified').length,
        in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
        pending: tasks.filter((t: any) => t.status === 'pending').length
      };
      projectData.task_stats = taskStats;

      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectUpdate = () => {
    fetchProject();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Project not found</p>
      </div>
    );
  }

  const progress = project.task_stats?.total > 0 
    ? (project.task_stats.completed / project.task_stats.total * 100) 
    : 0;

  const tabs = [
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare, count: project.task_stats?.total },
    { id: 'overview' as TabType, label: 'Overview', icon: Activity },
    { id: 'activity' as TabType, label: 'Activity', icon: Clock },
    { id: 'files' as TabType, label: 'Files', icon: Paperclip }
  ];

  return (
    <div className="h-screen flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface border-b border-dark-border">
        <div className="p-6">
          {/* Navigation and Title */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.push(`/dashboard/org/${orgSlug}/projects`)}
                className="p-2 hover:bg-dark-card rounded-lg transition-colors mt-1"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>{project.organization.name}</span>
                  <ChevronRight className="w-4 h-4" />
                  <span>Projects</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
                <h1 className="text-3xl font-semibold text-white mb-2">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-400 max-w-3xl">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NeonButton
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddTaskModal(true)}
              >
                Add Task
              </NeonButton>
              <button
                className="p-2 hover:bg-dark-card rounded-lg transition-colors"
                onClick={() => {
                  // TODO: Open project settings
                }}
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Key Properties */}
          <div className="flex items-center gap-6 flex-wrap text-sm">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Status:</span>
              <InlineStatusEditor
                projectId={project.id}
                currentStatus={project.status}
                onUpdate={handleProjectUpdate}
              />
            </div>
            
            {/* Priority */}
            {project.priority && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Priority:</span>
                <InlinePriorityEditor
                  projectId={project.id}
                  currentPriority={project.priority}
                  onUpdate={handleProjectUpdate}
                  size="md"
                />
              </div>
            )}
            
            {/* Lead */}
            {project.lead && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Lead:</span>
                <div className="flex items-center gap-2">
                  {project.lead.avatar_url ? (
                    <img 
                      src={project.lead.avatar_url} 
                      alt={project.lead.full_name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                      {project.lead.full_name[0]}
                    </div>
                  )}
                  <span className="text-white">{project.lead.full_name}</span>
                </div>
              </div>
            )}
            
            {/* Team */}
            {project.team && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Team:</span>
                <div 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${project.team.color}20`,
                    color: project.team.color 
                  }}
                >
                  {project.team.name}
                </div>
              </div>
            )}
            
            {/* Due Date */}
            {project.due_date && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Due:</span>
                <span className={cn(
                  "text-white",
                  new Date(project.due_date) < new Date() && "text-red-400"
                )}>
                  {new Date(project.due_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {/* Progress */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Progress:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-dark-card rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-neon-green to-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-white text-xs">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex items-center">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id 
                      ? "text-white border-neon-green" 
                      : "text-gray-400 border-transparent hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-dark-card rounded text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tasks' && (
          <TaskKanbanBoardV2 
            projectId={projectId}
            tasks={project.contributions || []}
            onUpdate={handleProjectUpdate}
            organizationId={project.organization?.id}
            orgSlug={orgSlug}
          />
        )}

        {activeTab === 'overview' && (
          <div className="p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Project Charter */}
              <div className="bg-dark-card rounded-lg p-6">
                <h2 className="text-lg font-medium text-white mb-4">Project Charter</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {project.description || 'No detailed description available.'}
                  </p>
                </div>
              </div>

              {/* Goals & Milestones */}
              <div className="bg-dark-card rounded-lg p-6">
                <h2 className="text-lg font-medium text-white mb-4">Goals & Milestones</h2>
                <p className="text-gray-400">Coming soon...</p>
              </div>

              {/* Resources */}
              <div className="bg-dark-card rounded-lg p-6">
                <h2 className="text-lg font-medium text-white mb-4">Resources</h2>
                <p className="text-gray-400">Coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-6">
            <p className="text-gray-400">Activity feed coming soon...</p>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="p-6">
            <p className="text-gray-400">File attachments coming soon...</p>
          </div>
        )}
      </div>
      
      {/* Task Modal */}
      {showAddTaskModal && project && (
        <TaskModal
          open={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onSuccess={() => {
            setShowAddTaskModal(false);
            handleProjectUpdate();
          }}
          projectId={projectId}
          organizationId={project.organization_id}
        />
      )}
    </div>
  );
}