'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/lib/contexts/SidebarContext';
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
  ExternalLink,
  FileText,
  Lightbulb,
  User,
  CalendarDays,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Minimize2,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { InlineStatusEditor } from './InlineStatusEditor';
import { InlinePriorityEditor } from './InlinePriorityEditor';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import { createClient } from '@/lib/supabase/client';

interface ProjectDetailPaneProps {
  project: any;
  onClose: () => void;
  onUpdate: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

type TabType = 'overview' | 'tasks' | 'team' | 'activity' | 'files';

const statusConfig = {
  planning: { label: 'Planning', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-400/10' },
  on_hold: { label: 'On Hold', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  completed: { label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  archived: { label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-500/10' }
};

export function ProjectDetailPane({ 
  project, 
  onClose, 
  onUpdate, 
  isExpanded = false,
  onToggleExpand 
}: ProjectDetailPaneProps) {
  const [activeTab, setActiveTab] = useState<TabType>(isExpanded ? 'tasks' : 'overview');
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const { sidebarOpen } = useSidebar();
  const supabase = createClient();
  
  // Change to tasks tab when expanding
  useEffect(() => {
    if (isExpanded) {
      setActiveTab('tasks');
    }
  }, [isExpanded]);

  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.planning;
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
        const validIndex = currentTabIndex === -1 ? 0 : currentTabIndex;
        const nextIndex = (validIndex + 1) % tabOrder.length;
        setActiveTab(tabOrder[nextIndex] as TabType);
      },
      description: 'Next tab'
    },
    {
      key: '[',
      handler: () => {
        const validIndex = currentTabIndex === -1 ? 0 : currentTabIndex;
        const prevIndex = validIndex === 0 ? tabOrder.length - 1 : validIndex - 1;
        setActiveTab(tabOrder[prevIndex] as TabType);
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
      animate={{ 
        x: 0,
        width: isExpanded ? `calc(100vw - ${sidebarOpen ? '18rem' : '5rem'})` : '600px', // 18rem = w-72, 5rem = w-20
        left: isExpanded ? (sidebarOpen ? '18rem' : '5rem') : 'auto'
      }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      className={cn(
        "fixed right-0 top-16 h-[calc(100vh-4rem)] bg-dark-surface flex flex-col z-40",
        !isExpanded && "border-l border-dark-border/50 rounded-l-xl overflow-hidden"
      )}
      style={{
        boxShadow: isExpanded ? 'none' : '-8px 0 24px -4px rgba(0, 0, 0, 0.3), -4px 0 12px -2px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Header - Condensed for expanded view, full for panel view */}
      <div 
        className={cn(
          "border-b border-dark-border group relative",
          isExpanded ? "p-3" : "p-6",
          onToggleExpand && !isExpanded && "cursor-pointer hover:bg-dark-card hover:brightness-110 hover:ring-2 hover:ring-neon-green/30 hover:ring-inset transition-all",
          !isExpanded && "rounded-tl-xl" // Match the panel's rounded corner
        )}
        onClick={!isExpanded ? onToggleExpand : undefined}
      >
        {isExpanded ? (
          /* Condensed single-line header for expanded view */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Project name with icon */}
              <h2 className="text-xl font-semibold text-white truncate">
                {project.name}
              </h2>
              
              {/* Status bar with all properties */}
              <div className="flex items-center gap-3 text-sm">
                {/* Status */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <InlineStatusEditor
                    projectId={project.id}
                    currentStatus={project.status}
                    onUpdate={onUpdate}
                  />
                </div>
                
                {/* Priority */}
                {project.priority && (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <InlinePriorityEditor
                      projectId={project.id}
                      currentPriority={project.priority}
                      onUpdate={onUpdate}
                      size="sm"
                    />
                  </div>
                )}
                
                {/* Lead */}
                <div className="flex items-center gap-1.5">
                  {project.lead ? (
                    <>
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
                      <span className="text-gray-300">{project.lead.full_name}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-dark-card border border-dashed border-gray-600 flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                      </div>
                      <span className="text-gray-500">No lead</span>
                    </>
                  )}
                </div>
                
                {/* Due date */}
                {project.due_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className={cn(
                      "text-gray-300",
                      new Date(project.due_date) < new Date() && "text-red-400"
                    )}>
                      {new Date(project.due_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                className="p-1.5 hover:bg-dark-card rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement edit
                }}
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                className="p-1.5 hover:bg-dark-card rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              <button
                className="p-1.5 hover:bg-dark-card rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ) : (
          /* Full header for panel view */
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Title & Description */}
              <h2 className="text-2xl font-semibold text-white mb-2">{project.name}</h2>
              {project.description && (
                <p className="text-gray-400 mb-4">
                  {project.description}
                </p>
              )}
            
            {/* Key Properties Row */}
            <div className="flex items-center gap-6 flex-wrap text-sm">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status:</span>
                <InlineStatusEditor
                  projectId={project.id}
                  currentStatus={project.status}
                  onUpdate={onUpdate}
                />
              </div>
              
              {/* Priority */}
              {project.priority && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Priority:</span>
                  <InlinePriorityEditor
                    projectId={project.id}
                    currentPriority={project.priority}
                    onUpdate={onUpdate}
                    size="md"
                  />
                </div>
              )}
              
              {/* Lead - Show with empty state */}
              {(
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Lead:</span>
                  {project.lead ? (
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
                      <span className="text-white">{project.lead.full_name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-dark-card border border-dashed border-gray-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-gray-400">Not assigned</span>
                    </div>
                  )}
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
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Expand/Collapse indicator - only shows on hover */}
            {onToggleExpand && (
              <div className={cn(
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "p-2 rounded-lg bg-dark-card/50"
              )}>
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4 text-gray-400" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
            <button
              data-action="edit-project"
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement edit
              }}
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-border">
        <div className={cn("flex items-center", isExpanded ? "px-3" : "px-6")}>
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
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="p-6">
            {/* Progress Bar at the top */}
            {project.task_stats && project.task_stats.total > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    {project.task_stats.completed} of {project.task_stats.total} tasks completed
                  </span>
                  <span className="text-white font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-neon-green to-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-[1fr,0.5fr] gap-6">
              {/* Left Column - What's Happening */}
              <div className="space-y-6">
                {/* Upcoming Deadlines */}
                <div className="bg-dark-card rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Upcoming Deadlines
                  </h3>
                  {project.contributions && project.contributions.length > 0 ? (
                    <div className="space-y-2">
                      {project.contributions
                        .filter((task: any) => task.due_date && task.status !== 'completed')
                        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                        .slice(0, 3)
                        .map((task: any) => {
                          const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          const isOverdue = daysUntilDue < 0;
                          return (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm text-white font-medium truncate">{task.title}</p>
                                <p className="text-xs text-gray-500">{task.task_assignees?.length || 0} assignees</p>
                              </div>
                              <div className={cn(
                                "text-xs font-medium px-2 py-1 rounded",
                                isOverdue ? "text-red-400 bg-red-400/10" : 
                                daysUntilDue === 0 ? "text-yellow-400 bg-yellow-400/10" : 
                                "text-green-400 bg-green-400/10"
                              )}>
                                {isOverdue ? "Overdue" : daysUntilDue === 0 ? "Today" : `${daysUntilDue} days`}
                              </div>
                            </div>
                          );
                        })}
                      {project.contributions.filter((t: any) => t.due_date && t.status !== 'completed').length === 0 && (
                        <p className="text-sm text-gray-500">No upcoming deadlines</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No tasks created yet</p>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-dark-card rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {/* Placeholder for activity items */}
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">Task "Design Mockups" completed</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">New member joined the project</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">Project status changed to Active</p>
                        <p className="text-xs text-gray-500">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Labels */}
                {project.labels && project.labels.length > 0 && (
                  <div className="bg-dark-card rounded-lg p-4">
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      Labels
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {project.labels.map((label: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Context & Resources */}
              <div className="space-y-6">
                {/* Project Team */}
                <div className="bg-dark-card rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Project Team
                  </h3>
                  <div className="space-y-2">
                    {project.lead && (
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-surface transition-colors">
                        {project.lead.avatar_url ? (
                          <img 
                            src={project.lead.avatar_url} 
                            alt={project.lead.full_name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                            {project.lead.full_name[0]}
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm text-white">{project.lead.full_name}</p>
                          <p className="text-xs text-gray-500">Lead</p>
                        </div>
                      </button>
                    )}
                    {project.members?.slice(0, 3).map((member: any) => (
                      <button key={member.id} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-surface transition-colors">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.full_name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                            {member.full_name[0]}
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm text-white">{member.full_name}</p>
                          <p className="text-xs text-gray-500">Member</p>
                        </div>
                      </button>
                    ))}
                    {project.members?.length > 3 && (
                      <button className="w-full p-2 text-center text-sm text-gray-400 hover:text-white transition-colors">
                        View all {project.members.length} members
                      </button>
                    )}
                  </div>
                </div>

                {/* Skill Gaps Alert */}
                {project.task_stats?.skill_gaps > 0 && (
                  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-400">Skill Gaps Detected</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {project.task_stats.skill_gaps} tasks need team members with additional skills
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Details */}
                <div className="bg-dark-card rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Timeline</span>
                      <span className="text-gray-300 capitalize">{project.timeline?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Created</span>
                      <span className="text-gray-300">
                        {new Date(project.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Visibility</span>
                      <span className="text-gray-300 capitalize">{project.visibility}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TaskKanbanBoard 
            projectId={project.id}
            tasks={project.contributions || []}
            onUpdate={onUpdate}
          />
        )}

        {activeTab === 'team' && (
          <div className="p-6 space-y-4">
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
    </motion.div>
  );
}