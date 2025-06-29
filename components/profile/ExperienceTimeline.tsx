'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Award, Users, CheckCircle2, Circle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface ExperienceTimelineProps {
  contributions: any[];
  organizations: any[];
}

export function ExperienceTimeline({ contributions, organizations }: ExperienceTimelineProps) {
  // Group contributions by month
  const groupedByMonth = contributions.reduce((acc, item) => {
    const date = new Date(item.assigned_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        items: []
      };
    }
    
    acc[monthKey].items.push(item);
    return acc;
  }, {} as Record<string, { month: string; items: any[] }>);

  const sortedMonths = Object.entries(groupedByMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([_, data]) => data);

  return (
    <div className="space-y-8">
      {/* Current Roles */}
      {organizations && organizations.length > 0 && (
        <GlassCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Current Roles
            </h2>
            <div className="space-y-3">
              {organizations.map((membership: any) => (
                <div key={membership.organization_id} className="flex items-center gap-4 p-4 bg-dark-surface rounded-lg">
                  <Image
                    src={membership.organizations.logo_url || '/placeholder-org.png'}
                    alt={membership.organizations.name}
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{membership.role}</h3>
                    <Link
                      href={`/dashboard/org/${membership.organizations.slug}`}
                      className="text-sm text-gray-400 hover:text-neon-green transition-colors"
                    >
                      {membership.organizations.name}
                    </Link>
                  </div>
                  <div className="text-sm text-gray-400">
                    Since {new Date(membership.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Timeline */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neon-green" />
            Experience Timeline
          </h2>

          {sortedMonths.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No contributions yet. Start working on projects to build your experience!
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-dark-border" />

              {sortedMonths.map((monthData, _monthIndex) => (
                <div key={monthData.month} className="mb-8">
                  {/* Month header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative z-10 w-8 h-8 bg-dark-card border-2 border-neon-green rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-neon-green" />
                    </div>
                    <h3 className="text-lg font-medium text-white">{monthData.month}</h3>
                    <span className="text-sm text-gray-400">
                      {monthData.items.length} contribution{monthData.items.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Month items */}
                  <div className="ml-12 space-y-4">
                    {monthData.items.map((item, itemIndex) => {
                      const contribution = item.contributions;
                      const project = contribution.internal_projects;
                      const organization = project?.organizations;
                      const isCompleted = item.completed_at !== null;

                      return (
                        <motion.div
                          key={contribution.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: itemIndex * 0.1 }}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            isCompleted 
                              ? "bg-dark-surface border-dark-border" 
                              : "bg-dark-surface/50 border-yellow-500/30"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-neon-green" />
                                ) : (
                                  <Circle className="w-5 h-5 text-yellow-500" />
                                )}
                                <h4 className="font-medium text-white">{contribution.title}</h4>
                              </div>
                              
                              {contribution.description && (
                                <p className="text-sm text-gray-400 mb-2">{contribution.description}</p>
                              )}

                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                                {organization && (
                                  <Link
                                    href={`/dashboard/org/${organization.slug}`}
                                    className="flex items-center gap-1 hover:text-neon-green transition-colors"
                                  >
                                    <Image
                                      src={organization.logo_url || '/placeholder-org.png'}
                                      alt={organization.name}
                                      width={16}
                                      height={16}
                                      className="rounded"
                                    />
                                    {organization.name}
                                  </Link>
                                )}
                                
                                {project && (
                                  <span className="flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    {project.name}
                                  </span>
                                )}
                                
                                {contribution.points && (
                                  <span className="flex items-center gap-1">
                                    <Award className="w-3 h-3 text-yellow-500" />
                                    {contribution.points} points
                                  </span>
                                )}
                                
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {isCompleted 
                                    ? `Completed ${new Date(item.completed_at).toLocaleDateString()}`
                                    : contribution.due_date 
                                      ? `Due ${new Date(contribution.due_date).toLocaleDateString()}`
                                      : 'In progress'
                                  }
                                </span>
                              </div>

                              {/* Skills used */}
                              {contribution.task_required_skills && contribution.task_required_skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {contribution.task_required_skills.map((skillReq: any) => (
                                    <span
                                      key={skillReq.skills.id}
                                      className={cn(
                                        "px-2 py-1 text-xs rounded",
                                        skillReq.required
                                          ? "bg-neon-green/20 text-neon-green"
                                          : "bg-purple-500/20 text-purple-400"
                                      )}
                                    >
                                      {skillReq.skills.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Status badge */}
                            <div className={cn(
                              "px-3 py-1 rounded text-xs font-medium",
                              isCompleted
                                ? "bg-neon-green/20 text-neon-green"
                                : "bg-yellow-500/20 text-yellow-500"
                            )}>
                              {isCompleted ? 'Completed' : 'In Progress'}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}