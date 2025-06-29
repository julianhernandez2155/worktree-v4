'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { createClient } from '@/lib/supabase/client';
import { ProjectCard } from './revolutionary/ProjectCard';
import { FilterPills } from './revolutionary/FilterPills';
import { ParticleBackground } from './revolutionary/ParticleBackground';
import { FeaturedProject } from './revolutionary/FeaturedProject';
import { LoadingSkeleton } from './revolutionary/LoadingSkeleton';
import { PullToRefresh } from './revolutionary/PullToRefresh';
import { 
  Sparkles, 
  TrendingUp,
  Users,
  Clock,
  Zap,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Generate unique visual themes for cards
const visualThemes = [
  { gradient: 'from-neon-green/20 via-green-500/10 to-transparent', pattern: 'dots' },
  { gradient: 'from-purple-500/20 via-purple-600/10 to-transparent', pattern: 'grid' },
  { gradient: 'from-blue-500/20 via-blue-600/10 to-transparent', pattern: 'waves' },
  { gradient: 'from-orange-500/20 via-orange-600/10 to-transparent', pattern: 'circles' },
  { gradient: 'from-pink-500/20 via-pink-600/10 to-transparent', pattern: 'zigzag' },
];

export function RevolutionaryDiscover() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);
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
    if (inView && !loadingMore && hasMore) {
      loadMoreProjects();
    }
  }, [inView, loadingMore, hasMore]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Get user info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        }

        // Load projects
        await loadProjects(user.id, 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (userId: string, pageNum: number) => {
    try {
      const { getRecommendedProjectsManual } = await import('@/lib/utils/projectRecommendations');
      const recommendedProjects = await getRecommendedProjectsManual(userId);
      
      // Enrich projects with visual themes and fake activity
      const enrichedProjects = recommendedProjects.map((project, index) => ({
        ...project,
        visual_theme: visualThemes[index % visualThemes.length],
        recent_activity: generateRecentActivity(),
        ai_reason: generateAIReason(project),
        similar_students: generateSimilarStudents(),
        trending_score: Math.random() * 100,
      }));

      if (pageNum === 0) {
        setProjects(enrichedProjects);
        setFilteredProjects(enrichedProjects);
      } else {
        setProjects(prev => [...prev, ...enrichedProjects]);
        setFilteredProjects(prev => [...prev, ...enrichedProjects]);
      }

      setHasMore(enrichedProjects.length >= 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadMoreProjects = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadProjects(user.id, page + 1);
    }
    setLoadingMore(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);
    
    if (filter === 'all') {
      setFilteredProjects(projects);
    } else if (filter === 'perfect-match') {
      setFilteredProjects(projects.filter(p => (p.match_score || 0) >= 70));
    } else if (filter === 'trending') {
      setFilteredProjects([...projects].sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)));
    } else if (filter === 'closing-soon') {
      setFilteredProjects(projects.filter(p => {
        if (!p.application_deadline) return false;
        const daysLeft = Math.ceil((new Date(p.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 7 && daysLeft >= 0;
      }));
    } else if (filter === 'remote') {
      setFilteredProjects(projects.filter(p => p.is_remote));
    }
  };

  // Get featured project (highest match score)
  const featuredProject = filteredProjects.reduce((prev, current) => 
    (current.match_score || 0) > (prev?.match_score || 0) ? current : prev
  , null as Project | null);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div ref={containerRef} className="relative z-10">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Discover 
                    <span className="text-neon-green ml-2">
                      <Sparkles className="inline h-6 w-6 animate-pulse" />
                    </span>
                  </h1>
                  <p className="text-sm text-dark-muted mt-1">
                    {userName ? `Welcome back, ${userName}!` : 'Find your next opportunity'}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-dark-card border border-dark-border rounded-xl 
                           hover:border-neon-green/50 transition-colors"
                >
                  <Filter className="h-5 w-5 text-white" />
                </motion.button>
              </div>

              {/* Filter Pills */}
              <FilterPills 
                selectedFilter={selectedFilter}
                onFilterChange={handleFilter}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Featured Project */}
            {featuredProject && selectedFilter === 'all' && (
              <FeaturedProject project={featuredProject} />
            )}

            {/* Masonry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              <AnimatePresence>
                {filteredProjects.map((project, index) => (
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
            {hasMore && (
              <div ref={loadMoreRef} className="mt-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-3 text-white">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-5 w-5 text-neon-green" />
                    </motion.div>
                    <span className="text-sm">Loading more opportunities...</span>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 text-dark-muted" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No matches found
                </h3>
                <p className="text-dark-muted">
                  Try adjusting your filters or check back later
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

function generateAIReason(project: Project) {
  const reasons = [
    `Your experience with ${project.matched_skills?.[0] || 'similar projects'} makes you perfect for this`,
    'Sprout AI thinks this will boost your portfolio',
    'Great stepping stone to your career goals',
    'Students like you loved this opportunity',
    'Perfect timing for your schedule',
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateSimilarStudents() {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `student-${i}`,
    name: ['Alex Chen', 'Sarah Kim', 'Mike Johnson', 'Emma Davis'][i],
    avatar_url: null,
  }));
}