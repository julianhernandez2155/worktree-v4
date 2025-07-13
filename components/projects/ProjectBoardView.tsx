'use client';

import { useState } from 'react';
import { 
  Circle,
  CheckCircle2,
  Clock,
  Pause,
  Archive,
  MoreVertical,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { PriorityIcon, PRIORITY_CONFIG } from '@/components/ui/PriorityIcon';

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

interface ProjectBoardViewProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
  loading: boolean;
  onProjectUpdate?: () => void;
}

const BOARD_COLUMNS = [
  { 
    id: 'planning', 
    title: 'Planning', 
    icon: Circle, 
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20'
  },
  { 
    id: 'active', 
    title: 'Active', 
    icon: CheckCircle2, 
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    borderColor: 'border-green-400/20'
  },
  { 
    id: 'on_hold', 
    title: 'On Hold', 
    icon: Pause, 
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20'
  },
  { 
    id: 'completed', 
    title: 'Completed', 
    icon: CheckCircle2, 
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    borderColor: 'border-gray-400/20'
  }
];

// Priority configuration now comes from PriorityIcon component

export function ProjectBoardView({
  projects,
  onProjectClick,
  selectedProjectId,
  loading,
  onProjectUpdate
}: ProjectBoardViewProps) {
  const [draggedProject, setDraggedProject] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', className: 'text-red-400' };
    if (diffDays === 0) return { text: 'Today', className: 'text-yellow-400' };
    if (diffDays === 1) return { text: 'Tomorrow', className: 'text-yellow-400' };
    if (diffDays <= 7) return { text: `${diffDays}d`, className: 'text-green-400' };
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), className: 'text-gray-400' };
  };

  const renderProjectCard = (project: Project) => {
    const dueDate = formatDueDate(project.due_date);
    const progress = project.task_stats?.total > 0 
      ? (project.task_stats.completed / project.task_stats.total * 100) 
      : 0;

    return (
      <motion.div
        key={project.id}
        layoutId={project.id}
        draggable
        onDragStart={() => setDraggedProject(project.id)}
        onDragEnd={() => setDraggedProject(null)}
        onClick={() => onProjectClick(project.id)}
        className={cn(
          "relative bg-dark-card border border-dark-border rounded-lg cursor-pointer overflow-hidden",
          "hover:border-gray-600 transition-colors",
          selectedProjectId === project.id && "border-neon-green/50",
          draggedProject === project.id && "opacity-50"
        )}
      >
        {/* Priority color strip */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-2 transition-all",
            project.priority === 'critical' && "bg-red-400",
            project.priority === 'high' && "bg-orange-400",
            project.priority === 'medium' && "bg-yellow-400",
            project.priority === 'low' && "bg-gray-400"
          )}
        />
        
        {/* Content wrapper */}
        <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {project.priority && (
                <PriorityIcon priority={project.priority as any} size="sm" />
              )}
              <h4 className="font-medium text-white text-sm line-clamp-1">{project.name}</h4>
            </div>
            {project.description && (
              <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle menu
            }}
            className="p-1 hover:bg-dark-surface rounded transition-colors"
          >
            <MoreVertical className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        {/* Team Badge */}
        {project.team && (
          <div 
            className="inline-flex px-2 py-1 rounded text-xs font-medium mb-3"
            style={{ 
              backgroundColor: `${project.team.color}20`,
              color: project.team.color 
            }}
          >
            {project.team.name}
          </div>
        )}

        {/* Progress */}
        {project.task_stats && project.task_stats.total > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">
                {project.task_stats.completed}/{project.task_stats.total} tasks
              </span>
              <span className="text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-dark-surface rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-green to-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Members */}
            {project.members && project.members.length > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <Users className="w-3 h-3" />
                <span>{project.members.length}</span>
              </div>
            )}
            
            {/* Skill Gaps */}
            {project.task_stats?.skill_gaps > 0 && (
              <div className="flex items-center gap-1 text-yellow-400">
                <AlertCircle className="w-3 h-3" />
                <span>{project.task_stats.skill_gaps}</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className={dueDate.className}>{dueDate.text}</span>
            </div>
          )}
        </div>

        {/* Lead Avatar */}
        {project.lead && (
          <div className="mt-3 pt-3 border-t border-dark-border flex items-center gap-2">
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
            <span className="text-xs text-gray-400">{project.lead.full_name}</span>
          </div>
        )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-x-auto custom-scrollbar">
      <div className="flex gap-4 p-4 min-w-max h-full">
        {BOARD_COLUMNS.map(column => {
          const Icon = column.icon;
          const columnProjects = getProjectsByStatus(column.id);

          return (
            <div
              key={column.id}
              className="w-80 flex flex-col"
            >
              {/* Column Header */}
              <div className={cn(
                "mb-4 p-3 rounded-lg border",
                column.bg,
                column.borderColor
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", column.color)} />
                    <h3 className={cn("font-medium", column.color)}>
                      {column.title}
                    </h3>
                  </div>
                  <span className={cn("text-sm", column.color)}>
                    {columnProjects.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div
                className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  // Handle drop logic here
                  if (draggedProject) {
                    // Update project status
                    console.log(`Move project ${draggedProject} to ${column.id}`);
                  }
                }}
              >
                {columnProjects.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No projects
                  </div>
                ) : (
                  columnProjects.map(renderProjectCard)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}