'use client';

import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: any;
  index: number;
  delay?: number;
}

export function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(project.is_saved || false);
  
  // Determine match level
  const matchLevel = project.match_score >= 85 ? 'perfect' :
                    project.match_score >= 70 ? 'great' :
                    project.match_score >= 50 ? 'good' : 'fair';
  
  const matchConfig = {
    perfect: { label: 'Perfect Match', color: 'text-neon-green', bg: 'bg-neon-green/10', icon: Sparkles },
    great: { label: 'Great Match', color: 'text-green-400', bg: 'bg-green-400/10' },
    good: { label: 'Good Match', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    fair: { label: 'Fair Match', color: 'text-gray-400', bg: 'bg-gray-400/10' }
  };

  const match = matchConfig[matchLevel];

  // Calculate days until deadline
  const daysUntilDeadline = project.application_deadline ? 
    Math.ceil((new Date(project.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0;

  // Convert hours to commitment level
  const getCommitmentLevel = (hours?: number) => {
    if (!hours) return null;
    if (hours <= 5) return { label: 'Low commitment', color: 'text-green-400' };
    if (hours <= 10) return { label: 'Medium commitment', color: 'text-yellow-400' };
    if (hours <= 20) return { label: 'High commitment', color: 'text-orange-400' };
    return { label: 'Intensive', color: 'text-red-400' };
  };

  const commitmentLevel = getCommitmentLevel(project.required_commitment_hours);

  return (
    <GlassCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.3, 
        delay,
        type: "spring",
        stiffness: 120
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      className="relative h-full flex flex-col cursor-pointer group"
      hover
      glow={matchLevel === 'perfect' ? 'green' : 'none'}
    >
      {/* Organization Header - Compact and Clickable */}
      <div className="flex items-center gap-2 mb-3">
        <Link
          href={`/dashboard/org/${project.organization.slug || project.organization.name.toLowerCase().replace(/\s+/g, '-')}/profile`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {project.organization.logo_url ? (
            <Image
              src={project.organization.logo_url}
              alt={project.organization.name}
              width={24}
              height={24}
              className="rounded flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {project.organization.name.charAt(0)}
            </div>
          )}
          
          <span className="text-xs text-gray-400 hover:text-white flex items-center gap-1 truncate transition-colors">
            {project.organization.name}
            {project.organization.verified && (
              <CheckCircle2 className="h-3 w-3 text-blue-400 flex-shrink-0" />
            )}
          </span>
        </Link>

        {/* Bookmark button - top right */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          className="ml-auto"
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-neon-green fill-current" />
          ) : (
            <Bookmark className="h-4 w-4 text-gray-500 hover:text-white transition-colors" />
          )}
        </motion.button>
      </div>

      {/* Project Title - Extra large and prominent */}
      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
        {project.name}
      </h3>

      {/* Description - Clear and concise */}
      <p className="text-sm text-gray-300 mb-4 line-clamp-3 flex-1">
        {project.public_description || project.description}
      </p>

      {/* Skills Section - Reorganized */}
      <div className="space-y-3 mb-4">
        {/* Skills Needed */}
        {((project.required_skills && project.required_skills.length > 0) || 
          (project.preferred_skills && project.preferred_skills.length > 0)) && (
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
              Skills Needed
            </p>
            <div className="flex flex-wrap gap-1.5">
              {/* Show matched required skills first in green */}
              {project.matched_skills && project.matched_skills.slice(0, 2).map((skill: string) => (
                <span 
                  key={skill}
                  className="px-2 py-0.5 bg-neon-green/10 text-neon-green text-xs rounded-full border border-neon-green/20"
                >
                  {skill} ✓
                </span>
              ))}
              {/* Show missing required skills in gray */}
              {project.missing_skills && project.missing_skills.slice(0, 2).map((skill: string) => (
                <span 
                  key={skill}
                  className="px-2 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded-full border border-gray-600/30"
                >
                  {skill}
                </span>
              ))}
              {/* Show count if more skills */}
              {((project.matched_skills?.length || 0) + (project.missing_skills?.length || 0)) > 4 && (
                <span className="px-2 py-0.5 bg-dark-surface text-gray-400 text-xs rounded-full">
                  +{(project.matched_skills?.length || 0) + (project.missing_skills?.length || 0) - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Skill Growth Opportunities - Placeholder for AI-generated skills */}
        {project.skills_to_develop && project.skills_to_develop.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
              Skill Growth Opportunities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.skills_to_develop.slice(0, 3).map((skill: string) => (
                <span 
                  key={skill}
                  className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20"
                >
                  {skill}
                </span>
              ))}
              {project.skills_to_develop.length > 3 && (
                <span className="px-2 py-0.5 bg-dark-surface text-gray-400 text-xs rounded-full">
                  +{project.skills_to_develop.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dark-border">
        {/* Match Badge */}
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1",
          match.bg, match.color
        )}>
          {match.icon && <match.icon className="h-3 w-3" />}
          {match.label}
        </span>

        {/* Time & Location */}
        <div className="flex items-center gap-3 text-xs">
          {commitmentLevel && (
            <span className={cn("flex items-center gap-1", commitmentLevel.color)}>
              <Clock className="h-3 w-3" />
              {commitmentLevel.label}
            </span>
          )}
          
          {isUrgent && (
            <span className="flex items-center gap-1 text-orange-400">
              <Calendar className="h-3 w-3" />
              {daysUntilDeadline}d left
            </span>
          )}
          
          {project.is_remote && (
            <span className="flex items-center gap-1 text-gray-400">
              <MapPin className="h-3 w-3" />
              Remote
            </span>
          )}
        </div>

        {/* Apply hint on hover */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </motion.div>
      </div>
    </GlassCard>
  );
}