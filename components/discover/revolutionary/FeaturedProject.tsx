'use client';

import { motion } from 'framer-motion';
import { 
  Building, 
  Sparkles,
  Clock,
  MapPin,
  ArrowRight,
  Star
} from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { CountdownTimer } from './CountdownTimer';

interface FeaturedProjectProps {
  project: any;
}

export function FeaturedProject({ project }: FeaturedProjectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-8 glass-elevated"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-blue-500/5" />
      
      {/* Content */}
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Left side - Project info */}
          <div className="flex-1">
            {/* Featured badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 
                       text-white rounded-full text-sm font-bold mb-4"
            >
              <Star className="h-4 w-4 fill-current" />
              Featured Opportunity
            </motion.div>

            {/* Organization */}
            <div className="flex items-center gap-3 mb-4">
              {project.organization.logo_url ? (
                <Image
                  src={project.organization.logo_url}
                  alt={project.organization.name}
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
              ) : (
                <div className="w-12 h-12 bg-dark-bg rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-dark-muted" />
                </div>
              )}
              <div>
                <p className="text-white font-medium">{project.organization.name}</p>
                {project.organization.verified && (
                  <p className="text-xs text-blue-400">✓ Verified Organization</p>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {project.name}
            </h2>

            {/* Match score */}
            {project.match_score >= 70 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded-full">
                  <Sparkles className="h-4 w-4 text-neon-green" />
                  <span className="text-neon-green font-semibold">{project.match_score}% Match</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-300">Perfect for your skills!</span>
              </div>
            )}

            {/* Key details */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-4 w-4 text-dark-muted" />
                <span>{project.required_commitment_hours || '10-15'}h/week</span>
              </div>
              
              {project.is_remote && (
                <div className="flex items-center gap-2 text-green-400">
                  <MapPin className="h-4 w-4" />
                  <span>Remote</span>
                </div>
              )}
              
              {project.application_deadline && (
                <div className="flex items-center gap-2">
                  <span className="text-dark-muted">Deadline:</span>
                  <CountdownTimer deadline={project.application_deadline} />
                </div>
              )}
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-dark-bg rounded-xl font-bold
                       flex items-center gap-2 hover:gap-3 transition-all"
            >
              View Details
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Right side - Visual element */}
          <div className="relative hidden md:block">
            <div className="w-48 h-48 bg-gradient-to-br from-neon-green/10 to-blue-500/10 
                       rounded-2xl border border-dark-border flex items-center justify-center">
              <Sparkles className="h-16 w-16 text-neon-green/30" />
              
              {/* Skill badges - static positioning */}
              {project.skills_to_develop?.slice(0, 3).map((skill: string, idx: number) => (
                <div
                  key={skill}
                  className={cn(
                    "absolute px-3 py-1.5 bg-dark-surface",
                    "border border-dark-border rounded-full text-xs text-gray-400",
                    idx === 0 && "top-2 -left-2",
                    idx === 1 && "-bottom-2 -right-2",
                    idx === 2 && "top-1/2 -right-4"
                  )}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}