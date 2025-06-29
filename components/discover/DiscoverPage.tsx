'use client';

import { useState, useEffect } from 'react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';

import { ProjectDetail } from './ProjectDetail';
import { ProjectList } from './ProjectList';


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
  skills_to_develop?: string[];
  preferred_start_date?: string;
  is_remote?: boolean;
  location?: string;
}

export function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    loadUserAndProjects();
  }, []);

  const loadUserAndProjects = async () => {
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

        // Load recommended projects
        await loadProjects(user.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (userId: string) => {
    try {
      // Use manual recommendation calculation for now
      const { getRecommendedProjectsManual } = await import('@/lib/utils/projectRecommendations');
      const recommendedProjects = await getRecommendedProjectsManual(userId);
      
      setProjects(recommendedProjects);
      if (recommendedProjects.length > 0) {
        setSelectedProject(recommendedProjects[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleSaveProject = async (projectId: string) => {
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
      
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, is_saved: !selectedProject.is_saved });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handlePassProject = (projectId: string) => {
    // Remove from list for this session
    const filteredProjects = projects.filter(p => p.id !== projectId);
    setProjects(filteredProjects);
    
    // Select next project if this was selected
    if (selectedProject?.id === projectId && filteredProjects.length > 0) {
      setSelectedProject(filteredProjects[0] || null);
    } else if (filteredProjects.length === 0) {
      setSelectedProject(null);
    }
  };

  const handleApplyToProject = async (projectId: string) => {
    // This will open the application modal
    // For now, just mark as applied
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      // Create application record
      await supabase
        .from('project_applications')
        .insert({
          project_id: projectId,
          applicant_id: user.id,
          status: 'pending'
        });

      // Update local state
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, has_applied: true } : p
      ));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, has_applied: true });
      }
    } catch (error) {
      console.error('Error applying to project:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-dark-bg overflow-hidden">
      {/* Left Sidebar - Project List */}
      <div className="w-[500px] border-r border-dark-border bg-dark-surface/50">
        <ProjectList
          projects={projects}
          selectedProject={selectedProject}
          userName={userName}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectProject={setSelectedProject}
          onSaveProject={handleSaveProject}
          onPassProject={handlePassProject}
        />
      </div>

      {/* Right Panel - Project Details */}
      <div className="flex-1 bg-dark-bg">
        <ProjectDetail
          project={selectedProject}
          projects={projects}
          onSaveProject={handleSaveProject}
          onPassProject={handlePassProject}
          onApplyProject={handleApplyToProject}
          onNavigate={(direction) => {
            if (!selectedProject) {return;}
            
            const currentIndex = projects.findIndex(p => p.id === selectedProject.id);
            let newIndex;
            
            if (direction === 'prev') {
              newIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
            } else {
              newIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
            }
            
            setSelectedProject(projects[newIndex] || null);
          }}
        />
      </div>
    </div>
  );
}