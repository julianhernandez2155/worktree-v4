'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOptimizedProjects, useForYouProjects } from '@/lib/hooks/useOptimizedProjects';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

interface OptimizedDiscoverFeedProps {
  userId: string | null;
  mode: 'for-you' | 'all';
  onModeChange: (mode: 'for-you' | 'all') => void;
}

/**
 * Optimized DiscoverFeed Component
 * This example shows how to use the new optimized hooks that eliminate N+1 queries
 */
export function OptimizedDiscoverFeed({ userId, mode, onModeChange }: OptimizedDiscoverFeedProps) {
  const [search, setSearch] = useState('');
  const [maxHours, setMaxHours] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Use the appropriate hook based on mode
  const forYouHook = useForYouProjects(mode === 'for-you' ? userId : null);
  const allProjectsHook = useOptimizedProjects({
    userId,
    search,
    maxHours,
    enabled: mode === 'all'
  });

  const { 
    projects, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh, 
    toggleSave 
  } = mode === 'for-you' ? forYouHook : allProjectsHook;

  // Infinite scroll
  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: hasMore && !loading && mode === 'all'
  });

  if (error) {
    return (
      <EmptyState
        type="error"
        action={{
          label: 'Try Again',
          onClick: refresh
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters (only for 'all' mode) */}
      {mode === 'all' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border 
                       rounded-lg text-white placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-neon-green/50"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-dark-surface rounded-lg border border-dark-border"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Hours per Week
                  </label>
                  <select
                    value={maxHours || ''}
                    onChange={(e) => setMaxHours(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border 
                             rounded-lg text-white focus:outline-none focus:ring-2 
                             focus:ring-neon-green/50"
                  >
                    <option value="">Any commitment</option>
                    <option value="5">Up to 5 hours</option>
                    <option value="10">Up to 10 hours</option>
                    <option value="20">Up to 20 hours</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && projects.length === 0 && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={mode === 'for-you' ? "No perfect matches found" : "No projects found"}
          description={
            mode === 'for-you'
              ? "We couldn't find projects that match your skills perfectly. Try exploring all projects!"
              : "Try adjusting your search or filters"
          }
          action={mode === 'for-you' ? {
            label: "Browse All Projects",
            onClick: () => onModeChange('all')
          } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={{
                  id: project.project_id,
                  name: project.project_name,
                  description: project.public_description,
                  organization: {
                    id: project.organization_id,
                    name: project.organization_name,
                    slug: project.organization_slug,
                    logo_url: project.organization_logo,
                    verified: project.organization_verified
                  },
                  required_commitment_hours: project.required_commitment_hours,
                  application_deadline: project.application_deadline,
                  application_count: project.application_count,
                  created_at: project.created_at,
                  // Skills data
                  skills: {
                    required: project.required_skills,
                    preferred: project.preferred_skills,
                    matched: project.matched_skills,
                    missing: project.missing_skills
                  },
                  // User-specific data
                  match_score: project.match_score,
                  is_saved: project.is_saved,
                  has_applied: project.has_applied,
                  application_status: project.application_status
                }}
                currentUser={userId ? { id: userId } : null}
                onToggleSave={() => toggleSave(project.project_id)}
                showMatchScore={mode === 'for-you'}
              />
            ))}
          </div>

          {/* Load More Trigger */}
          {mode === 'all' && hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {loading ? <LoadingSpinner /> : <div className="h-10" />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Migration Notes:
 * 
 * 1. The main performance improvement comes from using the RPC function
 *    'get_projects_with_skills_and_status' which fetches all data in a single query
 * 
 * 2. Key differences from the original:
 *    - No more separate queries for skills, saved status, or applications
 *    - Match score calculation happens in the database
 *    - Skill matching (matched/missing) is computed server-side
 * 
 * 3. Benefits:
 *    - Reduces queries from ~100+ (with N+1) to just 1 per page
 *    - Faster initial load time
 *    - Less client-side computation
 *    - Better performance on mobile devices
 * 
 * 4. The toggleSave function now includes optimistic updates for better UX
 */