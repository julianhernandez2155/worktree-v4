'use client';

import { useState } from 'react';
import { 
  X, 
  MoreVertical,
  Users,
  Calendar,
  Tag,
  Clock,
  CheckSquare,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Activity,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

interface ProjectDetailPaneProps {
  project: any;
  onClose: () => void;
  onUpdate: () => void;
}

type TabType = 'overview' | 'tasks' | 'team' | 'activity' | 'files';

const statusConfig = {
  planning: { label: 'Planning', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-400/10' },
  on_hold: { label: 'On Hold', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  completed: { label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  archived: { label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-500/10' }
};

const priorityConfig = {
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  low: { label: 'Low', color: 'text-gray-400', bg: 'bg-gray-400/10' }
};

export function ProjectDetailPane({ project, onClose, onUpdate }: ProjectDetailPaneProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showMenu, setShowMenu] = useState(false);

  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.planning;
  const priority = priorityConfig[project.priority as keyof typeof priorityConfig];
  const progress = project.task_stats?.total > 0 
    ? (project.task_stats.completed / project.task_stats.total * 100) 
    : 0;

  // Tab navigation with keyboard
  const tabOrder: TabType[] = ['overview', 'tasks', 'team', 'activity', 'files'];
  const currentTabIndex = tabOrder.indexOf(activeTab);

  useKeyboardShortcuts([
    {
      key: 'Escape',
      handler: onClose,
      description: 'Close detail pane'
    },
    {
      key: ']',
      handler: () => {
        const nextIndex = (currentTabIndex + 1) % tabOrder.length;
        setActiveTab(tabOrder[nextIndex]);
      },
      description: 'Next tab'
    },
    {
      key: '[',
      handler: () => {
        const prevIndex = currentTabIndex === 0 ? tabOrder.length - 1 : currentTabIndex - 1;
        setActiveTab(tabOrder[prevIndex]);
      },
      description: 'Previous tab'
    },
    {
      key: 'e',
      handler: () => {
        // Trigger edit action
        const editButton = document.querySelector('[data-action="edit-project"]') as HTMLButtonElement;
        editButton?.click();
      },
      description: 'Edit project'
    }
  ]);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Activity },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare, count: project.task_stats?.total },
    { id: 'team' as TabType, label: 'Team', icon: Users, count: project.members?.length },
    { id: 'activity' as TabType, label: 'Activity', icon: MessageSquare },
    { id: 'files' as TabType, label: 'Files', icon: Paperclip }
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="absolute right-0 top-0 w-[600px] h-full bg-dark-surface border-l border-dark-border flex flex-col z-10"
    >
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">{project.name}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status */}
              <div className={cn("px-2 py-1 rounded text-xs font-medium", status.bg, status.color)}>
                {status.label}
              </div>
              
              {/* Priority */}
              {priority && (
                <div className={cn("px-2 py-1 rounded text-xs font-medium", priority.bg, priority.color)}>
                  {priority.label}
                </div>
              )}
              
              {/* Team */}
              {project.team && (
                <div 
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${project.team.color}20`,
                    color: project.team.color 
                  }}
                >
                  {project.team.name}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Progress</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-dark-card rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-green to-green-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 mb-1">Tasks</div>
            <div className="text-sm font-medium">
              {project.task_stats?.completed || 0}/{project.task_stats?.total || 0}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 mb-1">Skill Gaps</div>
            <div className="flex items-center gap-1">
              {project.task_stats?.skill_gaps > 0 ? (
                <>
                  <AlertCircle className="w-3 h-3 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    {project.task_stats.skill_gaps}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-green-400">None</span>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 mb-1">Due Date</div>
            <div className="text-sm font-medium">
              {project.due_date ? 
                new Date(project.due_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) : 
                'Not set'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-border">
        <div className="flex items-center px-6">
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

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
              <p className="text-gray-300">
                {project.description || 'No description provided.'}
              </p>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Details</h3>
              <div className="space-y-3">
                {/* Lead */}
                {project.lead && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Lead</span>
                    <div className="flex items-center gap-2">
                      {project.lead.avatar_url ? (
                        <img 
                          src={project.lead.avatar_url} 
                          alt={project.lead.full_name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                          {project.lead.full_name[0]}
                        </div>
                      )}
                      <span className="text-sm">{project.lead.full_name}</span>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Timeline</span>
                  <span className="text-sm capitalize">{project.timeline?.replace('_', ' ')}</span>
                </div>

                {/* Created */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm">
                    {new Date(project.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Visibility */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Visibility</span>
                  <span className="text-sm capitalize">{project.visibility}</span>
                </div>
              </div>
            </div>

            {/* Labels */}
            {project.labels && project.labels.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Labels</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {project.labels.map((label: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-dark-card rounded text-xs text-gray-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 space-y-2">
              <NeonButton
                className="w-full justify-center"
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => {
                  // Navigate to full project page
                  window.location.href = `/dashboard/org/${project.organization_id}/projects/${project.id}`;
                }}
              >
                View Full Project
              </NeonButton>
              
              <button 
                data-action="edit-project"
                className="w-full px-4 py-2 bg-dark-card text-gray-400 rounded-lg hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Project
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <p className="text-gray-400">Tasks view coming soon...</p>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            {project.members?.map((member: any) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-dark-card rounded-lg">
                {member.avatar_url ? (
                  <img 
                    src={member.avatar_url} 
                    alt={member.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                    {member.full_name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium">{member.full_name}</div>
                  <div className="text-xs text-gray-500">Member</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <p className="text-gray-400">Activity feed coming soon...</p>
          </div>
        )}

        {activeTab === 'files' && (
          <div>
            <p className="text-gray-400">File attachments coming soon...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}