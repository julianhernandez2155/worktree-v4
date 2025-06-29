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

interface Project {
  id: string;
  name: string;
  public_description: string;
  organization_id: string;
  organization: {
    name: string;
    logo_url?: string;
    verified: boolean;
  };
  required_commitment_hours?: number;
  application_deadline?: string;
  max_applicants?: number;
  application_count: number;
  is_saved?: boolean;
  has_applied?: boolean;
  application_status?: string;
  match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  required_skills?: string[];
  preferred_skills?: string[];
}

export function DiscoverFeed() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    sortBy: 'recommended' as 'recommended' | 'newest' | 'deadline',
    minMatch: 0,
    maxHours: null as number | null,
    hasDeadlineSoon: false
  });
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'perfect' | 'growth' | 'new'>('all');
  const [applyingToProject, setApplyingToProject] = useState<string | null>(null);
  const [viewingProject, setViewingProject] = useState<string | null>(null);
  
  const supabase = createClient();
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    setPage(0);
    setProjects([]);
    loadProjects(0, true);
  }, [debouncedSearch, selectedFilters, selectedCategory]);


  const loadProjects = async (pageNum = page, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const ITEMS_PER_PAGE = 20;
      
      // If user is logged in and sorting by recommended, use the RPC function
      if (user && selectedFilters.sortBy === 'recommended') {
        const { data: recommendedProjects, error } = await supabase.rpc('get_recommended_projects', {
          p_user_id: user.id,
          p_limit: ITEMS_PER_PAGE,
          p_offset: pageNum * ITEMS_PER_PAGE
        });

        if (error) {throw error;}

        // Transform the RPC response to match our expected format
        const projectsWithOrg = recommendedProjects?.map((p: any) => ({
          id: p.project_id,
          name: p.project_name,
          organization_id: p.organization_id,
          organization: {
            name: p.organization_name,
            logo_url: p.organization_logo,
            verified: true
          },
          application_deadline: p.application_deadline,
          is_saved: p.is_saved,
          has_applied: p.has_applied,
          match_score: p.match_score,
          matched_skills: p.matched_skills,
          missing_skills: p.missing_skills,
          required_skills: p.required_skills,
          preferred_skills: p.preferred_skills
        })) || [];

        // Get full project details for the recommended projects
        if (projectsWithOrg.length > 0) {
          const projectIds = projectsWithOrg.map((p: any) => p.id);
          const { data: fullProjects } = await supabase
            .from('internal_projects')
            .select('*')
            .in('id', projectIds);

          // Merge full project data with recommendation data
          const mergedProjects = projectsWithOrg.map((recProject: any) => {
            const fullProject = fullProjects?.find(p => p.id === recProject.id);
            return {
              ...fullProject,
              ...recProject,
              organization: recProject.organization
            };
          });

          // Apply search filter if needed
          let filtered = mergedProjects;
          if (debouncedSearch) {
            filtered = filtered.filter((p: any) => 
              p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              p.public_description?.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
          }

          setHasMore(filtered.length === ITEMS_PER_PAGE);
          
          if (isInitialLoad) {
            setProjects(filtered);
          } else {
            setProjects(prev => [...prev, ...filtered]);
          }
          
          setPage(pageNum);
          return;
        }
      }

      // Fall back to regular query for non-authenticated users or other sort options
      let query = supabase
        .from('internal_projects')
        .select(`
          *,
          organization:organizations!organization_id(
            name,
            logo_url,
            verified
          )
        `)
        .eq('is_public', true)
        .eq('status', 'active');

      // Apply search filter
      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,public_description.ilike.%${debouncedSearch}%`);
      }

      // Apply deadline filter
      if (selectedFilters.hasDeadlineSoon) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        query = query.lte('application_deadline', sevenDaysFromNow.toISOString());
      }

      // Apply hours filter
      if (selectedFilters.maxHours) {
        query = query.lte('required_commitment_hours', selectedFilters.maxHours);
      }

      // Apply sorting
      switch (selectedFilters.sortBy) {
        case 'newest':
          query = query.order('published_at', { ascending: false });
          break;
        case 'deadline':
          query = query.order('application_deadline', { ascending: true, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Add pagination
      query = query.range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      const { data: projectsData, error } = await query;

      if (error) {throw error;}

      // If user is logged in, get their saved and applied status
      if (user && projectsData) {
        const projectIds = projectsData.map(p => p.id);
        
        // Get saved projects
        const { data: savedData } = await supabase
          .from('saved_projects')
          .select('project_id')
          .eq('user_id', user.id)
          .in('project_id', projectIds);

        // Get applications with status
        const { data: applicationsData } = await supabase
          .from('project_applications')
          .select('project_id, status')
          .eq('applicant_id', user.id)
          .in('project_id', projectIds);

        const savedProjectIds = new Set(savedData?.map(s => s.project_id) || []);
        
        // Create a map of project applications with their status
        const applicationsByProject = new Map(
          applicationsData?.map(a => [a.project_id, a.status]) || []
        );

        // Get skill data for each project
        const projectsWithSkills = await Promise.all(projectsData.map(async (project) => {
          // Get required and preferred skills for this project
          const { data: taskSkills } = await supabase
            .from('task_required_skills')
            .select(`
              skill_id,
              importance,
              skills!skill_id(name, category)
            `)
            .in('task_id', 
              await supabase
                .from('contributions')
                .select('id')
                .eq('project_id', project.id)
                .then(res => res.data?.map(c => c.id) || [])
            );

          const requiredSkills = taskSkills?.filter(ts => ts.importance === 'required').map((ts: any) => ts.skills?.name).filter(Boolean) || [];
          const preferredSkills = taskSkills?.filter(ts => ts.importance === 'preferred').map((ts: any) => ts.skills?.name).filter(Boolean) || [];

          // Calculate skill match if user is logged in
          let matchScore = 0;
          let matchedSkills: string[] = [];
          let missingSkills: string[] = [];

          if (user) {
            const { data: userSkills } = await supabase
              .from('member_skills')
              .select('skills!skill_id(name)')
              .eq('user_id', user.id);

            const userSkillNames = userSkills?.map((us: any) => us.skills?.name).filter(Boolean) || [];
            
            matchedSkills = requiredSkills.filter(skill => userSkillNames.includes(skill));
            missingSkills = requiredSkills.filter(skill => !userSkillNames.includes(skill));
            
            // Calculate match score
            if (requiredSkills.length > 0) {
              const requiredMatch = (matchedSkills.length / requiredSkills.length) * 70;
              const preferredMatch = preferredSkills.filter(skill => userSkillNames.includes(skill)).length / Math.max(preferredSkills.length, 1) * 30;
              matchScore = Math.round(requiredMatch + preferredMatch);
            } else {
              matchScore = 85; // Default high score if no skills required
            }
          }

          const isNew = project.application_count < 3;
          const hasRecentActivity = Math.random() > 0.7; // Simulate for demo
          
          // Generate inspiring taglines based on project type
          const taglines: { [key: string]: string } = {
            'Spring Formal': 'Design an unforgettable night for 500+ students',
            'Website Redesign': 'Transform how thousands experience our digital presence',
            'Mentorship Program': 'Guide the next generation of campus leaders',
            'Sustainability Initiative': 'Lead the charge for a greener campus',
            'Mobile App': 'Build the app every student will use daily'
          };
          
          const matchingTagline = Object.entries(taglines).find(([key]) => 
            project.name.toLowerCase().includes(key.toLowerCase())
          );
          
          return {
            ...project,
            is_saved: savedProjectIds.has(project.id),
            has_applied: applicationsByProject.has(project.id),
            application_status: applicationsByProject.get(project.id),
            match_score: matchScore,
            matched_skills: matchedSkills,
            missing_skills: missingSkills,
            required_skills: requiredSkills,
            preferred_skills: preferredSkills,
            recent_activity: hasRecentActivity ? 
              (isNew ? "New today" : "2 students viewing now") : null,
            tagline: matchingTagline ? matchingTagline[1] : null,
            interested_count: Math.floor(Math.random() * 20) + 3,
            skills_to_gain: ['Leadership', 'Project Management', 'Communication', 'Problem Solving'].slice(0, Math.floor(Math.random() * 3) + 2)
          };
        }));

        // Sort by match score if recommended
        if (selectedFilters.sortBy === 'recommended') {
          projectsWithSkills.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        }

        // Apply category filter
        let filtered = projectsWithSkills;
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(p => {
            const score = p.match_score || 0;
            const isNew = p.application_count < 3;
            
            switch (selectedCategory) {
              case 'perfect':
                return score >= 85;
              case 'growth':
                return score >= 60 && score < 85;
              case 'new':
                return isNew;
              default:
                return true;
            }
          });
        }
        
        // Apply minimum match filter
        filtered = filtered.filter(
          p => !selectedFilters.minMatch || (p.match_score || 0) >= selectedFilters.minMatch
        );

        setHasMore(filtered.length === ITEMS_PER_PAGE);
        
        if (isInitialLoad) {
          setProjects(filtered);
        } else {
          setProjects(prev => [...prev, ...filtered]);
        }
        
        setPage(pageNum);
      } else {
        const newProjects = projectsData || [];
        setHasMore(newProjects.length === ITEMS_PER_PAGE);
        
        if (isInitialLoad) {
          setProjects(newProjects);
        } else {
          setProjects(prev => [...prev, ...newProjects]);
        }
        
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadProjects(page + 1);
    }
  };

  const toggleSaveProject = async (projectId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      const project = projects.find(p => p.id === projectId);
      if (!project) {return;}

      if (project.is_saved) {
        await supabase
          .from('saved_projects')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', projectId);
      } else {
        await supabase
          .from('saved_projects')
          .insert({
            user_id: user.id,
            project_id: projectId
          });
      }

      // Update local state
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, is_saved: !p.is_saved } : p
      ));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Discover Opportunities</h1>
        <p className="text-dark-muted">Find your next campus project</p>
      </div>

      {/* Live Stats */}
      <div className="flex gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2 text-neon-green">
          <div className="h-2 w-2 bg-neon-green rounded-full animate-pulse" />
          <span>12 students exploring now</span>
        </div>
        <div className="text-dark-muted">
          • {projects.length} active opportunities
        </div>
        <div className="text-dark-muted">
          • 3 new today
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-muted" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <Bell className="h-5 w-5 text-dark-muted hover:text-white transition-colors" />
          </button>
        </div>

        {/* Smart Filters */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-4 py-2 rounded-full font-medium transition-all text-sm",
              selectedCategory === 'all'
                ? "bg-neon-green text-dark-bg"
                : "bg-dark-card text-dark-muted hover:text-white border border-dark-border"
            )}
          >
            For You
          </button>
          <button
            onClick={() => {
              setSelectedFilters({ ...selectedFilters, maxHours: selectedFilters.maxHours === 5 ? null : 5 });
              setSelectedCategory('all');
            }}
            className={cn(
              "px-4 py-2 rounded-full font-medium transition-all text-sm flex items-center gap-2",
              selectedFilters.maxHours === 5
                ? "bg-neon-green text-dark-bg"
                : "bg-dark-card text-dark-muted hover:text-white border border-dark-border"
            )}
          >
            <Clock className="h-3 w-3" />
            Low Commitment
          </button>
          <button
            onClick={() => {
              setSelectedFilters({ ...selectedFilters, hasDeadlineSoon: !selectedFilters.hasDeadlineSoon });
              setSelectedCategory('all');
            }}
            className={cn(
              "px-4 py-2 rounded-full font-medium transition-all text-sm flex items-center gap-2",
              selectedFilters.hasDeadlineSoon
                ? "bg-neon-green text-dark-bg"
                : "bg-dark-card text-dark-muted hover:text-white border border-dark-border"
            )}
          >
            <Zap className="h-3 w-3" />
            Starting Soon
          </button>
          <button
            onClick={() => setSelectedCategory('new')}
            className={cn(
              "px-4 py-2 rounded-full font-medium transition-all text-sm flex items-center gap-2",
              selectedCategory === 'new'
                ? "bg-neon-green text-dark-bg"
                : "bg-dark-card text-dark-muted hover:text-white border border-dark-border"
            )}
          >
            <Sparkles className="h-3 w-3" />
            Just Posted
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : projects.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Search className="h-12 w-12 text-dark-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
          <p className="text-dark-muted">
            Try adjusting your filters or search terms
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setViewingProject(project.id)}
              className="cursor-pointer"
            >
              <ProjectDiscoverCard
                project={project}
                onSave={() => toggleSaveProject(project.id)}
                onApply={() => setApplyingToProject(project.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && projects.length > 0 && (
        <div className="mt-8 text-center">
          <NeonButton 
            variant="secondary" 
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading more...
              </div>
            ) : (
              'Load More Projects'
            )}
          </NeonButton>
        </div>
      )}

      {/* Application Modal */}
      {applyingToProject && (
        <ProjectApplicationModal
          projectId={applyingToProject}
          onClose={() => setApplyingToProject(null)}
          onSuccess={() => {
            setApplyingToProject(null);
            loadProjects();
          }}
        />
      )}

      {/* Project Detail Modal */}
      {viewingProject && (
        <ProjectDetailModal
          projectId={viewingProject}
          onClose={() => setViewingProject(null)}
          onApply={() => {
            setViewingProject(null);
            setApplyingToProject(viewingProject);
          }}
        />
      )}
    </div>
  );
}