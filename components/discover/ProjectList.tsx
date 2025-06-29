'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { Project } from './DiscoverPage';

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  userName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectProject: (project: Project) => void;
  onSaveProject: (projectId: string) => void;
  onPassProject: (projectId: string) => void;
}

export function ProjectList({
  projects,
  selectedProject,
  userName,
  searchQuery,
  onSearchChange,
  onSelectProject,
  onSaveProject,
  onPassProject
}: ProjectListProps) {
  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.organization.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.required_skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-xl font-semibold text-white mb-1">
          For You
        </h1>
        <p className="text-sm text-dark-muted">
          {userName ? `Hi ${userName}! ` : ''}
          {filteredProjects.length} {filteredProjects.length === 1 ? 'opportunity' : 'opportunities'} to review
        </p>
        
        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
          <input
            type="text"
            placeholder="Search by project, organization, or skill..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-lg 
                     text-white placeholder-dark-muted focus:border-neon-green/50 focus:outline-none
                     transition-colors text-sm"
          />
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-dark-muted" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No matches found</h3>
            <p className="text-sm text-dark-muted text-center">
              {searchQuery 
                ? "Try adjusting your search terms"
                : "Check back later for new opportunities"}
            </p>
          </div>
        ) : (
          <div className="py-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onClick={() => onSelectProject(project)}
                onSave={() => onSaveProject(project.id)}
                onPass={() => onPassProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredProjects.length > 0 && (
        <div className="p-4 border-t border-dark-border text-center">
          <p className="text-xs text-dark-muted">
            {filteredProjects.filter(p => (p.match_score || 0) >= 80).length} great matches • 
            {filteredProjects.filter(p => p.is_saved).length} saved
          </p>
        </div>
      )}
    </div>
  );
}