'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Building, 
  Calendar, 
  Clock, 
  MapPin,
  Bookmark,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Heart,
  Share2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountdownTimer } from './CountdownTimer';
import { SkillBadge } from './SkillBadge';
import { MatchIndicator } from './MatchIndicator';
import { ActivityBadge } from './ActivityBadge';

interface ProjectCardProps {
  project: any;
  index: number;
  delay?: number;
}

export function ProjectCard({ project, index, delay = 0 }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Calculate card size based on match score
  const cardSize = project.match_score >= 80 ? 'large' : 
                   project.match_score >= 60 ? 'medium' : 'small';
  
  const sizeClasses = {
    large: 'md:col-span-2 md:row-span-2',
    medium: 'md:col-span-1 md:row-span-2',
    small: 'md:col-span-1 md:row-span-1'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative group cursor-pointer",
        sizeClasses[cardSize]
      )}
    >
      {/* Background with gradient and pattern */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-20 transition-opacity group-hover:opacity-30",
        `bg-gradient-to-br ${project.visual_theme?.gradient}`
      )} />
      
      <div className={cn(
        "relative h-full bg-dark-card/80 backdrop-blur-sm rounded-2xl",
        "border border-dark-border hover:border-neon-green/50",
        "transition-all duration-300 overflow-hidden"
      )}>
        {/* Animated border on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={false}
          animate={isHovered ? {
            boxShadow: [
              "0 0 0 0 rgba(0, 255, 136, 0)",
              "0 0 20px 2px rgba(0, 255, 136, 0.3)",
              "0 0 0 0 rgba(0, 255, 136, 0)"
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Perfect Match Badge */}
        {project.match_score >= 70 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 z-10"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-neon-green rounded-full blur-xl"
              />
              <div className="relative bg-neon-green text-dark-bg px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Perfect for you!
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="p-6 h-full flex flex-col">
          {/* Organization Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {project.organization.logo_url ? (
                  <Image
                    src={project.organization.logo_url}
                    alt={project.organization.name}
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                ) : (
                  <div className="w-10 h-10 bg-dark-bg rounded-xl flex items-center justify-center">
                    <Building className="h-5 w-5 text-dark-muted" />
                  </div>
                )}
              </motion.div>
              
              <div>
                <p className="text-sm text-dark-muted">{project.organization.name}</p>
                {project.organization.verified && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-xs text-blue-400">Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Heart className={cn(
                  "h-4 w-4",
                  isLiked ? "fill-red-500 text-red-500" : "text-white"
                )} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Share2 className="h-4 w-4 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Project Title */}
          <h3 className="font-semibold text-white text-base mb-3 line-clamp-2 flex-grow">
            {project.name}
          </h3>

          {/* Activity Badge */}
          {project.recent_activity && (
            <ActivityBadge activity={project.recent_activity} />
          )}

          {/* Match Indicator */}
          <MatchIndicator score={project.match_score || 0} />

          {/* Key Info with Icons */}
          <div className="space-y-2 my-4 text-sm">
            {project.application_deadline && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-dark-muted">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline</span>
                </div>
                <CountdownTimer deadline={project.application_deadline} />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-dark-muted">
                <Clock className="h-4 w-4" />
                <span>Commitment</span>
              </div>
              <span className="text-white">{project.required_commitment_hours || '10-15'}h/week</span>
            </div>

            {project.is_remote && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-xs">Remote friendly</span>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="mb-4">
            <p className="text-xs text-dark-muted mb-2">Skills you'll develop</p>
            <div className="flex flex-wrap gap-1">
              {project.skills_to_develop?.slice(0, 3).map((skill: string, idx: number) => (
                <SkillBadge 
                  key={idx} 
                  skill={skill} 
                  isNew={true}
                  delay={idx * 0.1}
                />
              ))}
              {project.skills_to_develop?.length > 3 && (
                <span className="text-xs text-dark-muted px-2 py-1">
                  +{project.skills_to_develop.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* AI Recommendation */}
          {project.ai_reason && (
            <div className="p-3 bg-dark-bg/50 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-neon-green flex-shrink-0 mt-0.5" />
                <p className="text-xs text-dark-text">
                  {project.ai_reason}
                </p>
              </div>
            </div>
          )}

          {/* Similar Students */}
          {project.similar_students && (
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {project.similar_students.slice(0, 3).map((student: any, idx: number) => (
                  <motion.div
                    key={student.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + idx * 0.1 }}
                    className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 
                             rounded-full border-2 border-dark-card"
                  />
                ))}
                <div className="w-6 h-6 bg-dark-bg rounded-full border-2 border-dark-card
                         flex items-center justify-center">
                  <span className="text-xs text-dark-muted">+{project.application_count}</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ x: 5 }}
                className="text-neon-green text-sm flex items-center gap-1"
              >
                View Details
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Trending Indicator */}
        {project.trending_score > 80 && (
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 
                     text-white text-xs px-3 py-1 rounded-br-xl rounded-tl-xl"
          >
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}