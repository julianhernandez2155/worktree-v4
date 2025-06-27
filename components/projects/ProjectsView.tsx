'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { 
  Plus, 
  FolderOpen, 
  Users, 
  Lock,
  Globe,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  description: string;
  timeline: 'this_week' | 'this_month' | 'this_semester';
  status: 'active' | 'completed' | 'archived';
  visibility: 'internal' | 'public';
  created_at: string;
  created_by: string;
  organization_id: string;
  tasks?: Task[];
  assigned_members?: number;
  skill_matches?: number;
}

interface Task {
  id: string;
  task_name: string;
  task_description: string;
  skills_used: string[];
  status: 'pending' | 'in_progress' | 'completed';
  contributor_id?: string;
  contributor?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ProjectsViewProps {
  orgSlug: string;
}

export function ProjectsView({ orgSlug }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'internal' | 'public'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadProjects();
  }, [orgSlug]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      // First get the organization ID
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org) return;

      // Load projects with task counts
      const { data: projectsData, error } = await supabase
        .from('internal_projects')
        .select(`
          *,
          contributions:contributions(
            id,
            task_name,
            task_description,
            skills_used,
            status,
            contributor_id,
            contributor:profiles!contributor_id(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('organization_id', org.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats for each project
      const projectsWithStats = (projectsData || []).map(project => {
        const tasks = project.contributions || [];
        const assignedTasks = tasks.filter((t: any) => t.contributor_id).length;
        
        return {
          ...project,
          tasks,
          assigned_members: assignedTasks,
          skill_matches: tasks.length // This could be more sophisticated
        };
      });

      setProjects(projectsWithStats);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.visibility === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: projects.length,
    internal: projects.filter(p => p.visibility === 'internal').length,
    public: projects.filter(p => p.visibility === 'public').length,
    active: projects.filter(p => p.status === 'active').length
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-dark-muted mt-1">
            Create internal projects and match with skilled members
          </p>
        </div>
        <NeonButton
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Create Project
        </NeonButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-green/10">
              <FolderOpen className="h-5 w-5 text-neon-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-dark-muted">Total Projects</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Lock className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.internal}</p>
              <p className="text-sm text-dark-muted">Internal</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Globe className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.public}</p>
              <p className="text-sm text-dark-muted">Public</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-sm text-dark-muted">Active</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg 
                     text-white placeholder-dark-muted focus:border-neon-green focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-dark-muted" />
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              filter === 'all' 
                ? "bg-neon-green/20 text-neon-green" 
                : "text-dark-muted hover:text-white"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('internal')}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              filter === 'internal' 
                ? "bg-neon-green/20 text-neon-green" 
                : "text-dark-muted hover:text-white"
            )}
          >
            Internal
          </button>
          <button
            onClick={() => setFilter('public')}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              filter === 'public' 
                ? "bg-neon-green/20 text-neon-green" 
                : "text-dark-muted hover:text-white"
            )}
          >
            Public
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FolderOpen className="h-12 w-12 text-dark-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-dark-muted mb-6">
            Create your first internal project to start matching with skilled members
          </p>
          <NeonButton
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="h-4 w-4" />}
            variant="secondary"
          >
            Create First Project
          </NeonButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              orgSlug={orgSlug}
              onUpdate={loadProjects}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          orgSlug={orgSlug}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}