'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDebounce, useVirtualList } from '@/lib/hooks/usePerformance';
import { ProjectCard } from './ProjectCard.optimized';
import { FilterPills } from './revolutionary/FilterPills';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sparkles } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  organization: {
    name: string;
    slug: string;
    verified?: boolean;
  };
  public_description?: string;
  commitment_level?: string;
  is_saved?: boolean;
  has_applied?: boolean;
  match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  skills_to_develop?: string[];
}

/**
 * Optimized Discover Feed Component
 * Implements virtualization, memoization, and efficient re-rendering
 */
export const DiscoverFeed = memo(() => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('for-you');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  
  const supabase = createClient();
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load user skills once
  useEffect(() => {
    loadUserSkills();
  }, []);

  // Load projects when filter changes
  useEffect(() => {
    loadProjects();
  }, [selectedFilter]);

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedSearch) {
      searchProjects();
    } else if (selectedFilter !== 'for-you') {
      loadProjects();
    }
  }, [debouncedSearch]);

  // Memoized function to load user skills
  const loadUserSkills = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('member_skills')
        .select('skills!member_skills_skill_id_fkey(name)')
        .eq('user_id', user.id);

      const skills = data?.map(item => item.skills.name) || [];
      setUserSkills(skills);
    } catch (error) {
      console.error('Error loading user skills:', error);
    }
  }, [supabase]);

  // Memoized function to calculate match score
  const calculateMatchScore = useCallback((
    projectSkills: string[], 
    userSkillList: string[]
  ): number => {
    if (!projectSkills.length || !userSkillList.length) return 0;
    
    const matchedCount = projectSkills.filter(skill => 
      userSkillList.includes(skill)
    ).length;
    
    return Math.round((matchedCount / projectSkills.length) * 100);
  }, []);

  // Memoized function to load projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load projects based on filter
      let query = supabase
        .from('internal_projects')
        .select(`
          id,
          name,
          public_description,
          commitment_level,
          organizations!internal_projects_organization_id_fkey(
            name,
            slug,
            verified
          )
        `)
        .eq('is_public', true)
        .eq('status', 'active');

      if (selectedFilter === 'trending') {
        query = query.order('application_count', { ascending: false });
      } else if (selectedFilter === 'closing-soon') {
        query = query.order('application_deadline', { ascending: true });
      }

      const { data: projectsData, error } = await query.limit(50);
      if (error) throw error;

      // Process projects with skills
      const processedProjects = await processProjectsWithSkills(
        projectsData || [], 
        userSkills
      );

      // Apply filter-specific sorting
      let sortedProjects = [...processedProjects];
      if (selectedFilter === 'for-you') {
        sortedProjects = sortedProjects
          .filter(p => (p.match_score || 0) >= 50)
          .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
          .slice(0, 4);
      }

      setProjects(sortedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, userSkills, supabase, calculateMatchScore]);

  // Memoized function to process projects with skills
  const processProjectsWithSkills = useCallback(async (
    projectsList: any[], 
    userSkillList: string[]
  ): Promise<Project[]> => {
    // Batch load all task skills
    const projectIds = projectsList.map(p => p.id);
    const { data: taskSkills } = await supabase
      .from('contributions')
      .select(`
        project_id,
        task_required_skills!contributions_id_fkey(
          skills!task_required_skills_skill_id_fkey(name)
        )
      `)
      .in('project_id', projectIds);

    // Create skill map
    const skillsByProject = taskSkills?.reduce((acc, task) => {
      if (!acc[task.project_id]) {
        acc[task.project_id] = new Set();
      }
      task.task_required_skills?.forEach((trs: any) => {
        if (trs.skills?.name) {
          acc[task.project_id].add(trs.skills.name);
        }
      });
      return acc;
    }, {} as Record<string, Set<string>>) || {};

    // Process each project
    return projectsList.map(project => {
      const projectSkills = Array.from(skillsByProject[project.id] || []);
      const matchedSkills = projectSkills.filter(skill => userSkillList.includes(skill));
      const missingSkills = projectSkills.filter(skill => !userSkillList.includes(skill));
      const matchScore = calculateMatchScore(projectSkills, userSkillList);

      return {
        id: project.id,
        name: project.name,
        organization: project.organizations,
        public_description: project.public_description,
        commitment_level: project.commitment_level,
        match_score: matchScore,
        matched_skills: matchedSkills,
        missing_skills: missingSkills,
        skills_to_develop: missingSkills.slice(0, 3),
      };
    });
  }, [supabase, calculateMatchScore]);

  // Memoized search function
  const searchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('internal_projects')
        .select(`
          id,
          name,
          public_description,
          commitment_level,
          organizations!internal_projects_organization_id_fkey(
            name,
            slug,
            verified
          )
        `)
        .eq('is_public', true)
        .ilike('name', `%${debouncedSearch}%`)
        .limit(20);

      if (error) throw error;

      const processedProjects = await processProjectsWithSkills(
        data || [], 
        userSkills
      );
      setProjects(processedProjects);
    } catch (error) {
      console.error('Error searching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, userSkills, supabase, processProjectsWithSkills]);

  // Memoized save handler
  const handleSaveProject = useCallback(async (projectId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      if (project.is_saved) {
        // Unsave
        await supabase
          .from('saved_projects')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', projectId);
      } else {
        // Save
        await supabase
          .from('saved_projects')
          .insert({ user_id: user.id, project_id: projectId });
      }

      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, is_saved: !p.is_saved } : p
      ));
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }, [projects, supabase]);

  // Memoized apply handler
  const handleApplyProject = useCallback(async (projectId: string) => {
    // Implementation for apply functionality
    console.log('Apply to project:', projectId);
  }, []);

  // Filtered projects based on search
  const displayedProjects = useMemo(() => {
    if (!debouncedSearch) return projects;
    
    const query = debouncedSearch.toLowerCase();
    return projects.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.organization.name.toLowerCase().includes(query) ||
      project.public_description?.toLowerCase().includes(query)
    );
  }, [projects, debouncedSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Discover Projects
        </h1>
        <p className="text-gray-400">
          Find the perfect opportunity to grow your skills
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg
                   text-white placeholder-gray-500 focus:outline-none focus:ring-2
                   focus:ring-neon-green/50 transition-all"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex justify-center mb-8">
        <FilterPills
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          showPerfectMatch={true}
        />
      </div>

      {/* Projects Grid */}
      {displayedProjects.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={selectedFilter === 'for-you' ? "No perfect matches found" : "No projects found"}
          description={
            selectedFilter === 'for-you'
              ? "We couldn't find projects that match your skills perfectly. Try exploring all projects!"
              : "Try adjusting your search or filters"
          }
          action={selectedFilter === 'for-you' ? {
            label: "Browse All Projects",
            onClick: () => setSelectedFilter('all')
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              delay={index * 0.05}
              onSave={handleSaveProject}
              onApply={handleApplyProject}
            />
          ))}
        </div>
      )}
    </div>
  );
});

DiscoverFeed.displayName = 'DiscoverFeed';