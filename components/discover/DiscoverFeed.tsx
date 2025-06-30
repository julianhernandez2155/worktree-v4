'use client';

import { 
  Search, 
  Clock,
  Sparkles,
  Bell,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NeonButton } from '@/components/ui/NeonButton';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { ProjectApplicationModal } from './ProjectApplicationModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ProjectDiscoverCard } from './ProjectDiscoverCard';

export function DiscoverFeed() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'for-you' | 'low-commitment' | 'deadline-soon'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const supabase = createClient();
  const debouncedSearch = useDebounce(searchTerm, 300);
  const LIMIT = 20;

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  // Fetch projects using the optimized RPC function
  const fetchProjects = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }

      const currentOffset = reset ? 0 : offset;

      // Use the new RPC function that fetches everything in one query!
      const { data, error } = await supabase.rpc('get_projects_with_skills_and_status', {
        p_user_id: currentUser?.id || null,
        p_limit: LIMIT,
        p_offset: currentOffset,
        p_search: debouncedSearch || null,
        p_max_hours: selectedFilter === 'low-commitment' ? 5 : null,
        p_deadline_soon: selectedFilter === 'deadline-soon'
      });

      if (error) throw error;

      // Transform the data to match the existing component interface
      const transformedProjects = (data || []).map((p: any) => ({
        id: p.project_id,
        name: p.project_name,
        public_description: p.public_description,
        organization_id: p.organization_id,
        organization: {
          name: p.organization_name,
          slug: p.organization_slug,
          logo_url: p.organization_logo,
          verified: p.organization_verified
        },
        required_commitment_hours: p.required_commitment_hours,
        application_deadline: p.application_deadline,
        application_count: p.application_count,
        is_saved: p.is_saved,
        has_applied: p.has_applied,
        application_status: p.application_status,
        match_score: p.match_score,
        matched_skills: p.matched_skills,
        missing_skills: p.missing_skills,
        required_skills: p.required_skills,
        preferred_skills: p.preferred_skills,
        created_at: p.created_at
      }));

      // Filter for "for-you" mode (high match scores)
      const filteredProjects = selectedFilter === 'for-you' 
        ? transformedProjects.filter((p: any) => p.match_score >= 50)
        : transformedProjects;

      if (reset) {
        setProjects(filteredProjects);
      } else {
        setProjects(prev => [...prev, ...filteredProjects]);
      }

      setOffset(currentOffset + LIMIT);
      setHasMore(data?.length === LIMIT);

    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    fetchProjects(true);
  }, [currentUser, selectedFilter, debouncedSearch]);

  // Handle save toggle with optimistic update
  const handleToggleSave = async (projectId: string) => {
    if (!currentUser) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Optimistic update
    setProjects(prev => 
      prev.map(p => 
        p.id === projectId 
          ? { ...p, is_saved: !p.is_saved }
          : p
      )
    );

    try {
      if (project.is_saved) {
        await supabase
          .from('saved_projects')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('project_id', projectId);
      } else {
        await supabase
          .from('saved_projects')
          .insert({
            user_id: currentUser.id,
            project_id: projectId
          });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      // Revert on error
      setProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, is_saved: project.is_saved }
            : p
        )
      );
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProjects(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All Projects', icon: Zap },
    { id: 'for-you', label: 'For You', icon: Sparkles },
    { id: 'low-commitment', label: 'Low Commitment', icon: Clock },
    { id: 'deadline-soon', label: 'Deadline Soon', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-muted" />
        <input
          type="text"
          placeholder="Search projects by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg 
                   text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 
                   transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap",
              selectedFilter === filter.id
                ? "bg-neon-green/20 border-neon-green text-neon-green"
                : "bg-dark-surface border-dark-border text-dark-muted hover:text-white"
            )}
          >
            <filter.icon className="h-4 w-4" />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading && projects.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Sparkles className="h-12 w-12 text-dark-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
          <p className="text-dark-muted">
            {searchTerm 
              ? "Try adjusting your search terms"
              : selectedFilter === 'for-you'
              ? "We couldn't find projects matching your skills. Try browsing all projects!"
              : "Check back later for new opportunities"}
          </p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectDiscoverCard
                key={project.id}
                project={project}
                currentUser={currentUser}
                onToggleSave={handleToggleSave}
                onViewDetails={() => {
                  setSelectedProject(project);
                  setShowDetailModal(true);
                }}
                onApply={() => {
                  setSelectedProject(project);
                  setShowApplicationModal(true);
                }}
                showPerfectMatch={selectedFilter === 'for-you'}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <NeonButton
                onClick={handleLoadMore}
                disabled={loadingMore}
                loading={loadingMore}
                variant="secondary"
              >
                Load More Projects
              </NeonButton>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedProject && (
        <>
          <ProjectDetailModal
            project={selectedProject}
            open={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            onApply={() => {
              setShowDetailModal(false);
              setShowApplicationModal(true);
            }}
          />
          
          <ProjectApplicationModal
            project={selectedProject}
            open={showApplicationModal}
            onClose={() => {
              setShowApplicationModal(false);
              setSelectedProject(null);
            }}
            onSuccess={() => {
              setShowApplicationModal(false);
              setSelectedProject(null);
              fetchProjects(true); // Refresh to update application status
            }}
          />
        </>
      )}
    </div>
  );
}