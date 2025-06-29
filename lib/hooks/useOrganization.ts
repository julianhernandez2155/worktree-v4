import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationMember = Database['public']['Tables']['organization_members']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface OrganizationWithMembers extends Organization {
  members?: OrganizationMember[];
  member_count?: number;
  project_count?: number;
  skills_count?: number;
}

export function useOrganization(slug: string) {
  const [organization, setOrganization] = useState<OrganizationWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (!slug) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    const fetchOrganization = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch organization with counts
        const { data, error: orgError } = await supabase
          .from('organizations')
          .select(`
            *,
            organization_members!inner (
              count
            ),
            internal_projects!inner (
              count
            )
          `)
          .eq('slug', slug)
          .single();

        if (orgError) throw orgError;

        // Get unique skills count
        const { data: skillsData, error: skillsError } = await supabase
          .rpc('count_distinct', {
            table_name: 'member_skills',
            column_name: 'skill_id',
            filter_column: 'user_id',
            filter_values: await supabase
              .from('organization_members')
              .select('user_id')
              .eq('organization_id', data.id)
              .then(res => res.data?.map(m => m.user_id) || [])
          });

        if (skillsError) console.error('Error fetching skills count:', skillsError);

        setOrganization({
          ...data,
          member_count: data.organization_members?.[0]?.count || 0,
          project_count: data.internal_projects?.[0]?.count || 0,
          skills_count: skillsData || 0
        });
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching organization:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [slug]);

  return { organization, loading, error };
}

// Optimized hook for organization members with skills
export function useOrganizationMembers(orgId: string | null, search = '') {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (!orgId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase.rpc(
          'get_organization_members_with_skills',
          {
            p_org_id: orgId,
            p_search: search || null
          }
        );

        if (fetchError) throw fetchError;

        setMembers(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [orgId, search]);

  return { members, loading, error };
}

// Hook for organization projects
export function useOrganizationProjects(orgId: string | null, includeInternal = false) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (!orgId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('internal_projects')
          .select(`
            *,
            contributions!inner (
              count
            )
          `)
          .eq('organization_id', orgId)
          .eq('status', 'active');

        if (!includeInternal) {
          query = query.eq('is_public', true);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Get skills for each project using the optimized function
        const projectsWithSkills = await Promise.all(
          (data || []).map(async (project) => {
            const { data: tasksData } = await supabase.rpc(
              'get_project_tasks_with_details',
              { p_project_id: project.id }
            );

            const allRequiredSkills = new Set<string>();
            const allPreferredSkills = new Set<string>();

            tasksData?.forEach(task => {
              task.required_skills?.forEach(skill => allRequiredSkills.add(skill));
              task.preferred_skills?.forEach(skill => allPreferredSkills.add(skill));
            });

            return {
              ...project,
              task_count: project.contributions?.[0]?.count || 0,
              required_skills: Array.from(allRequiredSkills),
              preferred_skills: Array.from(allPreferredSkills)
            };
          })
        );

        setProjects(projectsWithSkills);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [orgId, includeInternal]);

  return { projects, loading, error };
}

// Hook to check if user is admin of organization
export function useIsOrgAdmin(orgId: string | null, userId: string | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    if (!orgId || !userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', orgId)
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(['admin', 'president', 'vice_president'].includes(data.role));
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [orgId, userId]);

  return { isAdmin, loading };
}