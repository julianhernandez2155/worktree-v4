'use client';

import { useState, useCallback } from 'react';
import { 
  ChevronRight,
  Circle,
  Users,
  Calendar,
  AlertCircle,
  Hash,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Pause,
  Archive,
  Check,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { InlineStatusEditor } from './InlineStatusEditor';
import { InlinePriorityEditor } from './InlinePriorityEditor';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority?: string;
  timeline: string;
  due_date?: string;
  team?: {
    id: string;
    name: string;
    color: string;
  };
  lead?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  task_stats?: {
    total: number;
    completed: number;
    assigned: number;
    skill_gaps: number;
  };
  members?: any[];
}

interface ProjectListViewProps {
  projects: Project[];
  groupedProjects: Record<string, Project[]>;
  groupBy: string;
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
  loading: boolean;
  onProjectUpdate?: () => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  showCheckboxes?: boolean;
}

const statusConfig = {
  planning: { icon: Circle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  active: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  on_hold: { icon: Pause, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  completed: { icon: CheckCircle2, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  archived: { icon: Archive, color: 'text-gray-500', bg: 'bg-gray-500/10' }
};

const priorityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
  high: { color: 'text-orange-400', bg: 'bg-orange-400/10', dot: 'bg-orange-400' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' },
  low: { color: 'text-gray-400', bg: 'bg-gray-400/10', dot: 'bg-gray-400' }
};

export function ProjectListView({
  projects,
  groupedProjects,
  groupBy,
  onProjectClick,
  selectedProjectId,
  loading,
  onProjectUpdate,
  onSelectionChange,
  showCheckboxes = false
}: ProjectListViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Object.keys(groupedProjects))
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleProjectSelection = useCallback((projectId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    
    setSelectedProjects(newSelection);
    onSelectionChange?.(newSelection);
  }, [selectedProjects, onSelectionChange]);

  const toggleAllProjects = useCallback(() => {
    const allProjectIds = projects.map(p => p.id);
    const newSelection = selectedProjects.size === projects.length 
      ? new Set<string>()
      : new Set(allProjectIds);
    
    setSelectedProjects(newSelection);
    onSelectionChange?.(newSelection);
  }, [projects, selectedProjects, onSelectionChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', className: 'text-red-400' };
    if (diffDays === 0) return { text: 'Today', className: 'text-yellow-400' };
    if (diffDays === 1) return { text: 'Tomorrow', className: 'text-yellow-400' };
    if (diffDays <= 7) return { text: `${diffDays} days`, className: 'text-green-400' };
    if (diffDays <= 30) return { text: `${Math.ceil(diffDays / 7)} weeks`, className: 'text-gray-400' };
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), className: 'text-gray-400' };
  };

  const renderProjectRow = (project: Project) => {
    const StatusIcon = statusConfig[project.status as keyof typeof statusConfig]?.icon || Circle;
    const statusColors = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.planning;
    const priorityColors = priorityConfig[project.priority as keyof typeof priorityConfig];
    const dueDate = formatDueDate(project.due_date);
    const progress = project.task_stats ? 
      (project.task_stats.completed / project.task_stats.total * 100) : 0;
    
    // Check if project is at risk
    const isOverdue = dueDate && dueDate.className === 'text-red-400';
    const hasSkillGaps = project.task_stats?.skill_gaps > 0;
    const isAtRisk = isOverdue || hasSkillGaps;

    return (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={() => onProjectClick(project.id)}
        data-project-id={project.id}
        className={cn(
          "group relative px-4 py-3 border-b border-dark-border hover:bg-dark-card/50 cursor-pointer transition-colors",
          selectedProjectId === project.id && "bg-dark-card",
          isOverdue && "bg-red-900/10 hover:bg-red-900/20"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          {showCheckboxes && (
            <button
              onClick={(e) => toggleProjectSelection(project.id, e)}
              className={cn(
                "w-5 h-5 rounded border flex items-center justify-center transition-all",
                selectedProjects.has(project.id)
                  ? "bg-neon-green border-neon-green"
                  : "border-dark-border hover:border-gray-500"
              )}
            >
              {selectedProjects.has(project.id) && (
                <Check className="w-3 h-3 text-black" />
              )}
            </button>
          )}

          {/* Status - Now with inline editing, with pulsing animation for at-risk */}
          <div className={cn("relative", isAtRisk && "animate-pulse")}>
            <InlineStatusEditor
              projectId={project.id}
              currentStatus={project.status}
              onUpdate={() => onProjectUpdate?.()}
            />
          </div>

          {/* Priority - Now with inline editing */}
          <InlinePriorityEditor
            projectId={project.id}
            currentPriority={project.priority}
            onUpdate={() => onProjectUpdate?.()}
          />

          {/* Project Name, Progress & Team Avatars */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-medium text-white truncate">{project.name}</h3>
              
              {/* Icon badges for warnings */}
              <div className="flex items-center gap-2">
                {project.task_stats?.skill_gaps > 0 && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-400/10 rounded-full">
                    <Lightbulb className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">{project.task_stats.skill_gaps}</span>
                  </div>
                )}
                {isOverdue && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-400/10 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  </div>
                )}
              </div>

              {/* Avatar stack - Lead + up to 2 members */}
              <div className="flex items-center -space-x-2 ml-auto">
                {project.lead && (
                  <div className="relative z-10">
                    {project.lead.avatar_url ? (
                      <img 
                        src={project.lead.avatar_url} 
                        alt={project.lead.full_name}
                        className="w-5 h-5 rounded-full ring-2 ring-dark-surface"
                        title={`Lead: ${project.lead.full_name}`}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-600 ring-2 ring-dark-surface flex items-center justify-center text-[10px] text-white">
                        {project.lead.full_name[0]}
                      </div>
                    )}
                  </div>
                )}
                {project.members?.slice(0, 2).map((member, idx) => (
                  <div key={member.id} className="relative" style={{ zIndex: 9 - idx }}>
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.full_name}
                        className="w-5 h-5 rounded-full ring-2 ring-dark-surface"
                        title={member.full_name}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-600 ring-2 ring-dark-surface flex items-center justify-center text-[10px] text-white">
                        {member.full_name[0]}
                      </div>
                    )}
                  </div>
                ))}
                {project.members?.length > 2 && (
                  <div className="relative z-0 w-5 h-5 rounded-full bg-dark-card ring-2 ring-dark-surface flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">+{project.members.length - 2}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Integrated progress bar */}
            {project.task_stats && project.task_stats.total > 0 && (
              <div className="mt-1">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-gray-500">
                    {project.task_stats.completed}/{project.task_stats.total} tasks
                  </span>
                  <span className="text-gray-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-0.5 bg-dark-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-neon-green to-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

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

          {/* Due Date */}
          {dueDate && (
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className={dueDate.className}>{dueDate.text}</span>
            </div>
          )}

          {/* Quick Actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle quick actions
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-surface rounded transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </motion.div>
    );
  };

  if (groupBy === 'none') {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="border-t border-dark-border">
          <AnimatePresence>
            {projects.map(renderProjectRow)}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {Object.entries(groupedProjects).map(([groupName, groupProjects]) => (
        <div key={groupName} className="mb-4">
          <button
            onClick={() => toggleGroup(groupName)}
            className="w-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight 
              className={cn(
                "w-4 h-4 transition-transform",
                expandedGroups.has(groupName) && "rotate-90"
              )}
            />
            <span>{groupName}</span>
            <span className="text-gray-500">({groupProjects.length})</span>
          </button>
          
          <AnimatePresence>
            {expandedGroups.has(groupName) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-dark-border overflow-hidden"
              >
                {groupProjects.map(renderProjectRow)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}