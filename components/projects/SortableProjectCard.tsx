'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, 
  Calendar, 
  Users as UsersIcon, 
  AlertTriangle,
  Circle,
  CheckCircle2,
  Pause,
  Archive as ArchiveIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardLightTrace } from './CardLightTrace';
import { PriorityIcon, PRIORITY_CONFIG } from '@/components/ui/PriorityIcon';

interface SortableProjectCardProps {
  project: any;
  onClick?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
  isAnimating?: boolean;
}

// Status badge component with animation
function AnimatedStatusBadge({ status, isAnimating }: { status: string; isAnimating: boolean }) {
  const statusConfig = {
    planning: { icon: Circle, label: 'Planning', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    active: { icon: CheckCircle2, label: 'Active', color: 'text-green-400', bg: 'bg-green-400/10' },
    on_hold: { icon: Pause, label: 'On Hold', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    completed: { icon: CheckCircle2, label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-400/10' },
    archived: { icon: ArchiveIcon, label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-500/10' }
  }[status] || statusConfig.planning;

  const Icon = statusConfig.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={isAnimating ? { rotateY: -90, scale: 0.8 } : false}
        animate={{ rotateY: 0, scale: 1 }}
        exit={{ rotateY: 90, scale: 0.8 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all",
          statusConfig.bg,
          statusConfig.color,
          isAnimating && status === 'completed' && "animate-completion-glow"
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Icon className="w-3.5 h-3.5" />
        {statusConfig.label}
      </motion.div>
    </AnimatePresence>
  );
}

export function SortableProjectCard({ 
  project, 
  onClick, 
  isSelected, 
  isDragging = false,
  isAnimating = false 
}: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ 
    id: project.id,
    disabled: isDragging
  });

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
      return { text: 'Today', color: 'text-yellow-400' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days`, color: 'text-green-400' };
    } else {
      return { text: date.toLocaleDateString(), color: 'text-gray-400' };
    }
  };

  const progressPercentage = project.task_stats 
    ? Math.round((project.task_stats.completed / project.task_stats.total) * 100) || 0
    : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-project-id={project.id}
      className={cn(
        "group relative bg-dark-surface rounded-lg border border-dark-border cursor-pointer transition-all overflow-hidden",
        "hover:border-gray-600 hover:shadow-lg",
        isSelected && "ring-2 ring-neon-green border-neon-green",
        isSortableDragging && "shadow-2xl",
        isAnimating && "ring-2 ring-neon-green/50 animate-pulse-once"
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
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
      
      {/* Content wrapper with padding to account for color strip */}
      <div className="p-4 pl-5">
      {/* Light trace effect for completed status */}
      {isAnimating && project.status === 'completed' && (
        <CardLightTrace isActive={true} variant="double" duration={2.5} />
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-white line-clamp-1 flex-1 mr-2">
          {project.name}
        </h3>
        <div className="flex items-center gap-2">
          {/* Priority indicator */}
          {project.priority && (
            <PriorityIcon priority={project.priority} size="sm" />
          )}
          {/* More menu */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement more menu
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-card rounded transition-all"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {project.description}
        </p>
      )}

      {/* Status Badge */}
      <div className="mb-3">
        <AnimatedStatusBadge status={project.status} isAnimating={isAnimating} />
      </div>

      {/* Team badge */}
      {project.team && (
        <div className="mb-3">
          <span 
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white"
            style={{ backgroundColor: project.team.color + '20' }}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: project.team.color }}
            />
            {project.team.name}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {project.task_stats && project.task_stats.total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-dark-card rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-neon-green to-green-500"
            />
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          {/* Member count */}
          {project.members && project.members.length > 0 && (
            <div className="flex items-center gap-1">
              <UsersIcon className="w-3.5 h-3.5" />
              <span>{project.members.length}</span>
            </div>
          )}
          
          {/* Skill gaps */}
          {project.task_stats?.skill_gaps > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{project.task_stats.skill_gaps}</span>
            </div>
          )}
        </div>

        {/* Due date */}
        {project.due_date && (
          <div className={cn("flex items-center gap-1", formatDueDate(project.due_date).color)}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDueDate(project.due_date).text}</span>
          </div>
        )}
      </div>

      {/* Lead avatar */}
      {project.lead && (
        <div className="mt-3 pt-3 border-t border-dark-border flex items-center gap-2">
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
          <span className="text-xs text-gray-400 line-clamp-1">
            {project.lead.full_name}
          </span>
        </div>
      )}
      </div>
    </div>
  );
}