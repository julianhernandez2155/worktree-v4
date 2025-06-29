'use client';

import Image from 'next/image';
import { 
  Building, 
  Calendar, 
  Clock, 
  MapPin,
  Bookmark,
  X,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project } from './DiscoverPage';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
  onSave: () => void;
  onPass: () => void;
}

export function ProjectCard({
  project,
  isSelected,
  onClick,
  onSave,
  onPass
}: ProjectCardProps) {
  // Calculate days until deadline
  const daysLeft = project.application_deadline ? (() => {
    const deadline = new Date(project.application_deadline);
    const now = new Date();
    const days = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  })() : null;

  // Format deadline
  const formatDeadline = () => {
    if (!project.application_deadline) return 'Rolling basis';
    
    const deadline = new Date(project.application_deadline);
    const formatted = deadline.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (daysLeft === 0) return `Due today`;
    if (daysLeft === 1) return `Due tomorrow`;
    if (daysLeft && daysLeft < 0) return `Closed`;
    if (daysLeft && daysLeft <= 7) return `${formatted} (${daysLeft} days)`;
    return formatted;
  };

  const deadlineColor = () => {
    if (!daysLeft) return 'text-dark-muted';
    if (daysLeft <= 0) return 'text-red-400';
    if (daysLeft <= 3) return 'text-orange-400';
    if (daysLeft <= 7) return 'text-yellow-400';
    return 'text-dark-muted';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "mx-4 mb-3 rounded-xl cursor-pointer transition-all duration-200",
        "bg-dark-card border border-dark-border",
        "hover:border-dark-border/80 hover:shadow-lg hover:shadow-black/20",
        isSelected && "border-neon-green/50 shadow-lg shadow-neon-green/10"
      )}
    >
      {/* Card Content */}
      <div className="p-5">
        {/* Organization Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0">
            {project.organization.logo_url ? (
              <Image
                src={project.organization.logo_url}
                alt={project.organization.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 bg-dark-bg rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-dark-muted" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm text-dark-muted">{project.organization.name}</p>
              {project.organization.verified && (
                <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
              )}
            </div>
            <h3 className="font-semibold text-white text-base mt-1 line-clamp-2">
              {project.name}
            </h3>
          </div>

          {/* Match Score Badge */}
          {project.match_score && project.match_score >= 70 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-neon-green/10 rounded-full">
              <Sparkles className="h-3 w-3 text-neon-green" />
              <span className="text-xs font-medium text-neon-green">
                {project.match_score}%
              </span>
            </div>
          )}
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className={cn("h-4 w-4", deadlineColor())} />
            <span className={deadlineColor()}>
              {formatDeadline()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-dark-muted">
            <Clock className="h-4 w-4" />
            <span>{project.required_commitment_hours || '10-15'}h/week</span>
          </div>
          
          <div className="flex items-center gap-2 text-dark-muted col-span-2">
            <MapPin className="h-4 w-4" />
            <span>{project.is_remote ? 'Remote' : project.location || 'On-site'}</span>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-4">
          <p className="text-xs text-dark-muted mb-2">Skills Needed</p>
          <div className="flex flex-wrap gap-1.5">
            {project.required_skills?.slice(0, 4).map((skill, idx) => {
              const isMatched = project.matched_skills?.includes(skill);
              return (
                <span
                  key={idx}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium",
                    isMatched
                      ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                      : "bg-dark-bg text-dark-text border border-dark-border"
                  )}
                >
                  {skill}
                </span>
              );
            })}
            {project.required_skills && project.required_skills.length > 4 && (
              <span className="px-2.5 py-1 text-xs text-dark-muted">
                +{project.required_skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-medium transition-all",
              project.is_saved
                ? "bg-white/10 text-white"
                : "bg-transparent text-dark-muted hover:text-white border border-dark-border hover:bg-dark-bg"
            )}
          >
            <Bookmark className={cn("h-4 w-4", project.is_saved && "fill-current")} />
            {project.is_saved ? 'Saved' : 'Save'}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPass();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                     bg-transparent text-dark-muted hover:text-white 
                     border border-dark-border hover:bg-dark-bg
                     text-sm font-medium transition-all"
          >
            <X className="h-4 w-4" />
            Pass
          </button>
        </div>
      </div>
    </div>
  );
}