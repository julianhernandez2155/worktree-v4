'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  TrendingUp,
  Clock,
  MapPin,
  Users,
  Zap
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { AmbientOrbs } from './revolutionary/AmbientOrbs';
import { FilterPills } from './revolutionary/FilterPills';
import { LoadingSkeleton } from './revolutionary/LoadingSkeleton';
import { ProjectCard } from './revolutionary/ProjectCard';
import { PullToRefresh } from './revolutionary/PullToRefresh';

export interface Project {
  id: string;
  name: string;
  public_description: string;
  organization_id: string;
  organization: {
    id: string;
    name: string;
    logo_url?: string;
    verified: boolean;
    description?: string;
    member_count?: number;
  };
  required_commitment_hours?: number;
  application_deadline?: string;
  max_applicants?: number;
  application_count: number;
  is_saved?: boolean;
  has_applied?: boolean;
  match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  required_skills?: string[];
  skills_to_develop?: string[];
  is_remote?: boolean;
  location?: string;
  recent_activity?: {
    type: 'new_members' | 'milestone' | 'deadline_soon';
    message: string;
    timestamp: string;
  };
  ai_reason?: string;
  similar_students?: {
    id: string;
    name: string;
    avatar_url?: string;
  }[];
  trending_score?: number;
  visual_theme?: {
    gradient: string;
    pattern?: string;
    icon?: string;
  };
}

// Visual themes for cards
const visualThemes = [
  { gradient: 'from-neon-green/20 via-green-500/10 to-transparent', pattern: 'dots' },
  { gradient: 'from-purple-500/20 via-purple-600/10 to-transparent', pattern: 'grid' },
  { gradient: 'from-blue-500/20 via-blue-600/10 to-transparent', pattern: 'waves' },
  { gradient: 'from-orange-500/20 via-orange-600/10 to-transparent', pattern: 'circles' },
  { gradient: 'from-pink-500/20 via-pink-600/10 to-transparent', pattern: 'zigzag' },
];

export function AllProjectsPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]); // Store all projects
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]); // Projects currently shown
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]); // Filtered results
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20); // Number of projects to display
  const [refreshing, setRefreshing] = useState(false);
  
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (inView && !loadingMore && displayCount < filteredProjects.length && !searchQuery) {
      loadMore();
    }
  }, [inView, loadingMore, displayCount, filteredProjects.length, searchQuery]);

  // Handle search with debounce
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        // Reset to original filtered projects
        applyFilter(selectedFilter);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, allProjects]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Get user info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load all projects using recommendation function
        const { getRecommendedProjectsManual } = await import('@/lib/utils/projectRecommendations');
        const projects = await getRecommendedProjectsManual(user.id);
        
        // Enrich all projects with visual themes
        const enrichedProjects = projects.map((project, index) => ({
          ...project,
          visual_theme: visualThemes[index % visualThemes.length],
          recent_activity: generateRecentActivity(),
          trending_score: Math.random() * 100,
        }));
        
        setAllProjects(enrichedProjects);
        setFilteredProjects(enrichedProjects);
        setDisplayedProjects(enrichedProjects.slice(0, displayCount));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    const newDisplayCount = displayCount + 20;
    setDisplayCount(newDisplayCount);
    setDisplayedProjects(filteredProjects.slice(0, newDisplayCount));
    setLoadingMore(false);
  };


  const handleRefresh = async () => {
    setRefreshing(true);
    setDisplayCount(20);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const searchResults = allProjects.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.public_description?.toLowerCase().includes(query) ||
      project.organization?.name?.toLowerCase().includes(query)
    );
    setFilteredProjects(searchResults);
    setDisplayedProjects(searchResults.slice(0, displayCount));
  };

  const applyFilter = (filter: string) => {
    let filtered = [...allProjects];
    
    if (filter === 'trending') {
      filtered.sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0));
    } else if (filter === 'closing-soon') {
      filtered = filtered.filter(p => {
        if (!p.application_deadline) return false;
        const daysLeft = Math.ceil((new Date(p.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 7 && daysLeft >= 0;
      });
    } else if (filter === 'remote') {
      filtered = filtered.filter(p => p.is_remote);
    }
    
    setFilteredProjects(filtered);
    setDisplayedProjects(filtered.slice(0, displayCount));
  };

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);
    setSearchQuery(''); // Clear search when changing filters
    setDisplayCount(20); // Reset display count
    applyFilter(filter);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Ambient Orbs Background */}
      <AmbientOrbs />
      
      {/* Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div ref={containerRef} className="relative z-10">
          {/* Header */}
          <div className="sticky top-0 z-20 glass-surface border-b border-dark-border">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    All Projects
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Browse {allProjects.length} available opportunities
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, organizations..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border 
                           rounded-lg text-white placeholder-gray-500 focus:outline-none 
                           focus:border-neon-green/50 transition-colors"
                />
              </div>

              {/* Filter Pills */}
              <FilterPills 
                selectedFilter={selectedFilter}
                onFilterChange={handleFilter}
                showPerfectMatch={false}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Results count */}
            {searchQuery && (
              <div className="mb-6 text-sm text-gray-400">
                Found {filteredProjects.length} projects matching "{searchQuery}"
              </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {displayedProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    delay={index * 0.05}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Load More */}
            {displayCount < filteredProjects.length && !searchQuery && (
              <div ref={loadMoreRef} className="mt-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-3 text-white">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-5 w-5 text-neon-green" />
                    </motion.div>
                    <span className="text-sm">Loading more projects...</span>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {displayedProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-dark-muted" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No projects found
                </h3>
                <p className="text-dark-muted">
                  {searchQuery 
                    ? `No results for "${searchQuery}"`
                    : 'Try adjusting your filters or check back later'
                  }
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </PullToRefresh>
    </div>
  );
}

// Helper functions
function generateRecentActivity() {
  const activities = [
    { type: 'new_members', message: '3 students started this week' },
    { type: 'milestone', message: 'Just hit 90% completion!' },
    { type: 'deadline_soon', message: 'Applications close soon' },
    { type: 'new_members', message: '5 new members this month' },
  ];
  
  return activities[Math.floor(Math.random() * activities.length)] as any;
}