import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from './useDebounce';

export interface OptimizedProject {
  project_id: string;
  project_name: string;
  public_description: string;
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  organization_logo: string | null;
  organization_verified: boolean;
  required_commitment_hours: number;
  application_deadline: string | null;
  application_count: number;
  is_saved: boolean;
  has_applied: boolean;
  application_status: string | null;
  required_skills: string[];
  preferred_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  match_score: number;
  created_at: string;
}

interface UseOptimizedProjectsOptions {
  userId?: string | null;
  limit?: number;
  search?: string;
  maxHours?: number | null;
  deadlineSoon?: boolean;
  orgId?: string | null;
  enabled?: boolean;
}

interface UseOptimizedProjectsReturn {
  projects: OptimizedProject[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  toggleSave: (projectId: string) => Promise<void>;
}

export function useOptimizedProjects({
  userId = null,
  limit = 20,
  search = '',
  maxHours = null,
  deadlineSoon = false,
  orgId = null,
  enabled = true
}: UseOptimizedProjectsOptions = {}): UseOptimizedProjectsReturn {
  const [projects, setProjects] = useState<OptimizedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const supabase = createClient();
  const debouncedSearch = useDebounce(search, 300);

  const fetchProjects = useCallback(async (reset = false) => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      
      const { data, error: fetchError } = await supabase.rpc(
        'get_projects_with_skills_and_status',
        {
          p_user_id: userId,
          p_limit: limit,
          p_offset: currentOffset,
          p_search: debouncedSearch || null,
          p_max_hours: maxHours,
          p_deadline_soon: deadlineSoon,
          p_org_id: orgId
        }
      );

      if (fetchError) throw fetchError;

      const newProjects = data as OptimizedProject[];
      
      if (reset) {
        setProjects(newProjects);
        setOffset(limit);
      } else {
        setProjects(prev => [...prev, ...newProjects]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore(newProjects.length === limit);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, offset, userId, limit, debouncedSearch, maxHours, deadlineSoon, orgId]);

  // Initial fetch and refetch on parameter changes
  useEffect(() => {
    fetchProjects(true);
  }, [userId, debouncedSearch, maxHours, deadlineSoon, orgId, enabled]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchProjects(false);
    }
  }, [loading, hasMore, fetchProjects]);

  const refresh = useCallback(() => {
    fetchProjects(true);
  }, [fetchProjects]);

  const toggleSave = useCallback(async (projectId: string) => {
    if (!userId) return;

    try {
      const project = projects.find(p => p.project_id === projectId);
      if (!project) return;

      if (project.is_saved) {
        // Unsave
        const { error } = await supabase
          .from('saved_projects')
          .delete()
          .eq('user_id', userId)
          .eq('project_id', projectId);

        if (error) throw error;
      } else {
        // Save
        const { error } = await supabase
          .from('saved_projects')
          .insert({
            user_id: userId,
            project_id: projectId
          });

        if (error) throw error;
      }

      // Update local state optimistically
      setProjects(prev =>
        prev.map(p =>
          p.project_id === projectId
            ? { ...p, is_saved: !p.is_saved }
            : p
        )
      );
    } catch (err) {
      console.error('Error toggling save:', err);
      // Optionally refresh to get the correct state
      refresh();
    }
  }, [userId, projects, refresh]);

  return {
    projects,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    toggleSave
  };
}

// Hook for "For You" page with high match scores
export function useForYouProjects(userId: string | null) {
  const { projects, ...rest } = useOptimizedProjects({
    userId,
    limit: 4,
    enabled: !!userId
  });

  // Filter for high match scores
  const forYouProjects = projects.filter(p => p.match_score >= 50);

  return {
    projects: forYouProjects,
    ...rest
  };
}

// Hook for saved projects
export function useSavedProjects(userId: string | null) {
  const [savedProjects, setSavedProjects] = useState<OptimizedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setSavedProjects([]);
      setLoading(false);
      return;
    }

    const fetchSavedProjects = async () => {
      try {
        setLoading(true);
        
        // First get saved project IDs
        const { data: savedData, error: savedError } = await supabase
          .from('saved_projects')
          .select('project_id')
          .eq('user_id', userId);

        if (savedError) throw savedError;

        if (!savedData || savedData.length === 0) {
          setSavedProjects([]);
          return;
        }

        const projectIds = savedData.map(s => s.project_id);

        // Then fetch full project details
        const { data, error: fetchError } = await supabase.rpc(
          'get_projects_with_skills_and_status',
          {
            p_user_id: userId,
            p_limit: 100 // Get all saved projects
          }
        );

        if (fetchError) throw fetchError;

        const allProjects = data as OptimizedProject[];
        const saved = allProjects.filter(p => projectIds.includes(p.project_id));
        
        setSavedProjects(saved);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching saved projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProjects();
  }, [userId]);

  return { projects: savedProjects, loading, error };
}