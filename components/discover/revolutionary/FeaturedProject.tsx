'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Building, 
  Sparkles,
  Clock,
  MapPin,
  ArrowRight,
  Star
} from 'lucide-react';
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
      className="relative overflow-hidden rounded-3xl mb-8"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, #00FF88 0%, #00D9FF 100%)',
            'linear-gradient(135deg, #00D9FF 0%, #9B59FF 100%)',
            'linear-gradient(135deg, #9B59FF 0%, #00FF88 100%)',
            'linear-gradient(135deg, #00FF88 0%, #00D9FF 100%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Content */}
      <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 md:p-12">
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
                <div className="flex items-center gap-1 px-3 py-1.5 bg-neon-green/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-neon-green" />
                  <span className="text-neon-green font-bold">{project.match_score}% Match</span>
                </div>
                <span className="text-dark-muted">•</span>
                <span className="text-white">Perfect for your skills!</span>
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
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-64 h-64 bg-gradient-to-br from-neon-green/20 to-blue-500/20 
                       rounded-3xl backdrop-blur-sm border border-white/10"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-24 w-24 text-white/20" />
              </div>
              
              {/* Floating skill badges */}
              {project.skills_to_develop?.slice(0, 3).map((skill: string, idx: number) => (
                <motion.div
                  key={skill}
                  animate={{
                    y: [0, -10, 0],
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 3,
                    delay: idx * 0.5,
                    repeat: Infinity
                  }}
                  className={cn(
                    "absolute px-3 py-1.5 bg-dark-card/80 backdrop-blur-sm",
                    "border border-white/20 rounded-full text-xs text-white",
                    idx === 0 && "top-4 left-4",
                    idx === 1 && "bottom-4 right-4",
                    idx === 2 && "top-1/2 right-4"
                  )}
                >
                  {skill}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}