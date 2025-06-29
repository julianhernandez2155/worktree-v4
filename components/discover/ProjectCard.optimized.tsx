'use client';

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock,
  MapPin,
  Star,
  Bookmark,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    organization: {
      name: string;
      slug: string;
      verified?: boolean;
    };
    public_description?: string;
    required_commitment_hours?: number;
    commitment_level?: string;
    is_remote?: boolean;
    location?: string;
    application_deadline?: string;
    max_applicants?: number;
    application_count?: number;
    is_saved?: boolean;
    has_applied?: boolean;
    match_score?: number;
    matched_skills?: string[];
    missing_skills?: string[];
    skills_to_develop?: string[];
    visual_theme?: {
      gradient: string;
    };
  };
  index?: number;
  onSave?: (projectId: string) => void;
  onApply?: (projectId: string) => void;
  delay?: number;
}

/**
 * Optimized Project Card Component
 * Uses React.memo to prevent unnecessary re-renders
 */
export const ProjectCard = memo<ProjectCardProps>(({ 
  project, 
  index = 0,
  onSave,
  onApply,
  delay = 0
}) => {
  // Memoize click handlers to prevent recreation
  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(project.id);
  }, [project.id, onSave]);

  const handleApplyClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApply?.(project.id);
  }, [project.id, onApply]);

  // Calculate deadline status once
  const deadlineStatus = (() => {
    if (!project.application_deadline) return null;
    const daysLeft = Math.ceil(
      (new Date(project.application_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return { text: 'Closed', urgent: true };
    if (daysLeft === 0) return { text: 'Last day', urgent: true };
    if (daysLeft <= 3) return { text: `${daysLeft} days left`, urgent: true };
    return { text: `${daysLeft} days left`, urgent: false };
  })();

  // Calculate spots left once
  const spotsLeft = project.max_applicants 
    ? Math.max(0, project.max_applicants - (project.application_count || 0))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group h-full"
    >
      <Link href={`/dashboard/projects/${project.id}`}>
        <div className={cn(
          "relative h-full bg-dark-card border border-dark-border rounded-xl",
          "hover:border-neon-green/50 transition-all duration-300",
          "hover:shadow-[0_0_30px_rgba(0,255,136,0.15)]",
          "overflow-hidden"
        )}>
          {/* Visual Theme Background */}
          {project.visual_theme && (
            <div 
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                `bg-gradient-to-br ${project.visual_theme.gradient}`
              )}
            />
          )}

          {/* Content */}
          <div className="relative p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                  {project.name}
                </h3>
                <Link 
                  href={`/dashboard/org/${project.organization.slug}`}
                  className="text-sm text-gray-400 hover:text-neon-green transition-colors inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {project.organization.name}
                  {project.organization.verified && (
                    <Shield className="w-3 h-3 text-blue-400" />
                  )}
                </Link>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveClick}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  project.is_saved 
                    ? "bg-neon-green/20 text-neon-green" 
                    : "bg-dark-surface text-gray-400 hover:text-white"
                )}
                aria-label={project.is_saved ? "Unsave project" : "Save project"}
              >
                <Bookmark className={cn("w-5 h-5", project.is_saved && "fill-current")} />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
              {project.public_description || "No description available"}
            </p>

            {/* Skills Section */}
            <div className="space-y-3 mb-4">
              {/* Skills Needed */}
              {project.matched_skills && project.matched_skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Skills Needed:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.matched_skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.missing_skills && project.missing_skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-dark-surface text-gray-400 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {((project.matched_skills?.length || 0) + (project.missing_skills?.length || 0)) > 5 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{(project.matched_skills?.length || 0) + (project.missing_skills?.length || 0) - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Skills to Develop */}
              {project.skills_to_develop && project.skills_to_develop.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Skill Growth Opportunities:</p>
                  <div className="flex items-center gap-1 text-xs text-purple-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{project.skills_to_develop.slice(0, 2).join(', ')}</span>
                    {project.skills_to_develop.length > 2 && (
                      <span>+{project.skills_to_develop.length - 2} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
              {project.commitment_level && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {project.commitment_level}
                </span>
              )}
              {project.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {project.is_remote ? 'Remote' : project.location}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-border">
              {/* Status Badges */}
              <div className="flex items-center gap-2">
                {deadlineStatus && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    deadlineStatus.urgent
                      ? "bg-red-500/20 text-red-400"
                      : "bg-dark-surface text-gray-400"
                  )}>
                    {deadlineStatus.text}
                  </span>
                )}
                {spotsLeft !== null && spotsLeft <= 5 && (
                  <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                    {spotsLeft === 0 ? 'Full' : `${spotsLeft} spots`}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleApplyClick}
                disabled={project.has_applied}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  project.has_applied
                    ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                    : "bg-neon-green text-black hover:bg-neon-green/90"
                )}
              >
                {project.has_applied ? 'Applied' : 'Apply'}
                {!project.has_applied && <ArrowRight className="w-3 h-3" />}
              </button>
            </div>

            {/* Match Score Badge */}
            {project.match_score && project.match_score > 70 && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-neon-green/20 rounded-full">
                  <Zap className="w-3 h-3 text-neon-green" />
                  <span className="text-xs text-neon-green font-medium">
                    {Math.round(project.match_score)}% match
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific props change
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.is_saved === nextProps.project.is_saved &&
    prevProps.project.has_applied === nextProps.project.has_applied &&
    prevProps.project.application_count === nextProps.project.application_count &&
    prevProps.index === nextProps.index
  );
});

ProjectCard.displayName = 'ProjectCard';