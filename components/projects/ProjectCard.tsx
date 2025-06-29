'use client';

import { 
  Clock, 
  Users, 
  Lock, 
  Globe, 
  MoreVertical,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ListChecks
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    timeline: 'this_week' | 'this_month' | 'this_semester';
    status: 'active' | 'completed' | 'archived';
    visibility: 'internal' | 'public';
    created_at: string;
    tasks?: any[];
    assigned_members?: number;
    skill_matches?: number;
  };
  orgSlug: string;
  onUpdate: () => void;
}

export function ProjectCard({ project, orgSlug, onUpdate }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const timelineConfig = {
    this_week: { label: 'This Week', color: 'text-red-400' },
    this_month: { label: 'This Month', color: 'text-yellow-400' },
    this_semester: { label: 'This Semester', color: 'text-green-400' }
  };

  const totalTasks = project.tasks?.length || 0;
  const assignedTasks = project.tasks?.filter((t: any) => t.contributor_id).length || 0;
  const completedTasks = project.tasks?.filter((t: any) => t.status === 'completed').length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate total subtasks across all tasks
  const totalSubtasks = project.tasks?.reduce((sum: number, task: any) => 
    sum + (task.subtasks?.length || 0), 0) || 0;
  const completedSubtasks = project.tasks?.reduce((sum: number, task: any) => 
    sum + (task.subtasks?.filter((st: any) => st.completed).length || 0), 0) || 0;

  const needsAttention = project.visibility === 'internal' && 
                         totalTasks > 0 && 
                         assignedTasks < totalTasks;

  return (
    <GlassCard className="p-6 hover:border-neon-green/50 transition-colors relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded hover:bg-dark-card transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-dark-muted" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-start gap-3 mb-2">
          <div className={cn(
            "p-2 rounded-lg",
            project.visibility === 'internal' ? "bg-blue-500/10" : "bg-purple-500/10"
          )}>
            {project.visibility === 'internal' ? (
              <Lock className="h-5 w-5 text-blue-400" />
            ) : (
              <Globe className="h-5 w-5 text-purple-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white line-clamp-1">{project.name}</h3>
            <p className="text-sm text-dark-muted line-clamp-2 mt-1">
              {project.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3 text-dark-muted" />
          <span className={timelineConfig[project.timeline].color}>
            {timelineConfig[project.timeline].label}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-dark-muted">Progress</span>
          <span className="text-white">{completedTasks}/{totalTasks} tasks</span>
        </div>
        <div className="h-2 bg-dark-card rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-green to-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-dark-muted text-sm mb-1">
            <Users className="h-3 w-3" />
            <span>Assigned</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {assignedTasks}/{totalTasks}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-dark-muted text-sm mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Skill Matches</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {project.skill_matches || 0}
          </p>
        </div>
      </div>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-4 p-3 bg-dark-bg rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2 text-dark-muted">
              <ListChecks className="h-4 w-4" />
              <span>Subtasks</span>
            </div>
            <span className="text-white">{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="h-1.5 bg-dark-card rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-purple to-purple-500 transition-all duration-300"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {needsAttention && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400">
              {totalTasks - assignedTasks} tasks need assignment
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <NeonButton
          size="sm"
          className="flex-1"
          icon={<ChevronRight className="h-4 w-4" />}
          onClick={() => router.push(`/dashboard/org/${orgSlug}/projects/${project.id}`)}
        >
          View Details
        </NeonButton>
        {project.visibility === 'internal' && totalTasks > assignedTasks && (
          <button className="px-3 py-1.5 text-sm bg-yellow-500/10 text-yellow-400 rounded-md hover:bg-yellow-500/20 transition-colors">
            Make Public
          </button>
        )}
      </div>
    </GlassCard>
  );
}