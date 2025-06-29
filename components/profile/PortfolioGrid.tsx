'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Award, Users, ExternalLink, Eye, Star, GitBranch } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface PortfolioGridProps {
  contributions: any[];
  showPinned?: boolean;
  showAll?: boolean;
}

export function PortfolioGrid({ contributions, showPinned = false, showAll = false }: PortfolioGridProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Filter completed contributions with projects
  const portfolioItems = contributions.filter(item => 
    item.completed_at && item.contributions.internal_projects
  );

  // For the overview page, we might want to show only pinned items
  // For now, we'll show the most recent completed items
  const displayItems = showAll ? portfolioItems : portfolioItems.slice(0, showPinned ? 3 : 6);

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No completed projects yet. Start contributing to build your portfolio!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((item, index) => {
          const contribution = item.contributions;
          const project = contribution.internal_projects;
          const organization = project.organizations;
          
          return (
            <motion.div
              key={contribution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedProject(item)}
              className="cursor-pointer group"
            >
              <GlassCard className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Project image or org logo */}
                <div className="relative h-48 bg-gradient-to-br from-dark-surface to-dark-bg overflow-hidden">
                  {project.image_url ? (
                    <Image
                      src={project.image_url}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={organization?.logo_url || '/placeholder-org.png'}
                        alt={organization?.name || 'Organization'}
                        width={80}
                        height={80}
                        className="opacity-20"
                      />
                    </div>
                  )}
                  
                  {/* Overlay with quick stats */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Eye className="w-4 h-4" />
                        View Details
                      </div>
                      {contribution.points && (
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Award className="w-4 h-4" />
                          {contribution.points}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {contribution.title}
                  </h3>
                  
                  {contribution.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {contribution.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {/* Organization and project */}
                    <div className="flex items-center gap-2 text-sm">
                      <Image
                        src={organization?.logo_url || '/placeholder-org.png'}
                        alt={organization?.name || 'Organization'}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                      <span className="text-gray-300">{organization?.name}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{project.name}</span>
                    </div>

                    {/* Completion date */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      Completed {new Date(item.completed_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>

                    {/* Skills used */}
                    {contribution.task_required_skills && contribution.task_required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {contribution.task_required_skills.slice(0, 3).map((skillReq: any) => (
                          <span
                            key={skillReq.skills.id}
                            className="px-2 py-1 bg-dark-surface text-xs text-gray-300 rounded"
                          >
                            {skillReq.skills.name}
                          </span>
                        ))}
                        {contribution.task_required_skills.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{contribution.task_required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            <GlassCard className="h-full flex flex-col">
              {/* Header */}
              <div className="relative h-64 bg-gradient-to-br from-dark-surface to-dark-bg overflow-hidden flex-shrink-0">
                {selectedProject.contributions.internal_projects.image_url ? (
                  <Image
                    src={selectedProject.contributions.internal_projects.image_url}
                    alt={selectedProject.contributions.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={selectedProject.contributions.internal_projects.organizations?.logo_url || '/placeholder-org.png'}
                      alt={selectedProject.contributions.internal_projects.organizations?.name || 'Organization'}
                      width={120}
                      height={120}
                      className="opacity-20"
                    />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5 rotate-45" />
                </button>

                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedProject.contributions.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Image
                        src={selectedProject.contributions.internal_projects.organizations?.logo_url || '/placeholder-org.png'}
                        alt={selectedProject.contributions.internal_projects.organizations?.name || 'Organization'}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                      {selectedProject.contributions.internal_projects.organizations?.name}
                    </div>
                    <span className="text-gray-500">•</span>
                    <span>{selectedProject.contributions.internal_projects.name}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Description */}
                  {selectedProject.contributions.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {selectedProject.contributions.description}
                      </p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Timeline</h3>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-400">Started:</span>
                        <span className="ml-2 text-gray-300">
                          {new Date(selectedProject.assigned_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Completed:</span>
                        <span className="ml-2 text-gray-300">
                          {new Date(selectedProject.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {Math.ceil((new Date(selectedProject.completed_at).getTime() - new Date(selectedProject.assigned_at).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedProject.contributions.task_required_skills && selectedProject.contributions.task_required_skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Skills Demonstrated</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.contributions.task_required_skills.map((skillReq: any) => (
                          <span
                            key={skillReq.skills.id}
                            className={cn(
                              "px-3 py-1 rounded text-sm",
                              skillReq.required
                                ? "bg-neon-green/20 text-neon-green"
                                : "bg-purple-500/20 text-purple-400"
                            )}
                          >
                            {skillReq.skills.name}
                            {skillReq.required && <Star className="inline w-3 h-3 ml-1" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Points and recognition */}
                  {selectedProject.contributions.points && (
                    <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-500 font-medium">
                        Earned {selectedProject.contributions.points} points for this contribution
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </>
  );
}