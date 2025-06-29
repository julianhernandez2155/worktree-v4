'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { AmbientOrbs } from './revolutionary/AmbientOrbs';
import { FeaturedProject } from './revolutionary/FeaturedProject';
import { LoadingSkeleton } from './revolutionary/LoadingSkeleton';
import { ProjectCard } from './revolutionary/ProjectCard';
import { SproutEmptyState } from './SproutEmptyState';

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
];

export function ForYouPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    loadCuratedProjects();
  }, []);

  const loadCuratedProjects = async () => {
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

        // Load only top matches (50%+ match score)
        const { getRecommendedProjectsManual } = await import('@/lib/utils/projectRecommendations');
        const allProjects = await getRecommendedProjectsManual(user.id);
        
        // Filter for good matches and limit to 4
        const goodMatches = allProjects
          .filter(project => (project.match_score || 0) >= 50)
          .slice(0, 4);
        
        // Enrich with visual themes and metadata
        const enrichedProjects = goodMatches.map((project, index) => ({
          ...project,
          visual_theme: visualThemes[index % visualThemes.length],
          recent_activity: generateRecentActivity(),
          ai_reason: generateAIReason(project),
          similar_students: generateSimilarStudents(),
          trending_score: Math.random() * 100,
        }));

        setProjects(enrichedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get featured project (highest match score)
  const featuredProject = projects.reduce((prev, current) => 
    (current.match_score || 0) > (prev?.match_score || 0) ? current : prev
  , null as Project | null);

  // Get best matches (excluding featured)
  const bestMatches = projects.filter(p => p.id !== featuredProject?.id);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Ambient Orbs Background */}
      <AmbientOrbs />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="glass-surface border-b border-dark-border">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  For You
                  <Sparkles className="h-5 w-5 text-neon-green" />
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {userName ? `Welcome back, ${userName}! Here are today's best opportunities for you.` : 'Your personalized opportunities'}
                </p>
              </div>
              
              {/* Curated badge */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg">
                <span className="text-xs text-gray-500">Curated by</span>
                <span className="text-xs font-semibold text-neon-green">🌱 Sprout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {projects.length === 0 ? (
            <SproutEmptyState />
          ) : (
            <>
              {/* Featured Project */}
              {featuredProject && (
                <FeaturedProject project={featuredProject} />
              )}

              {/* Best Matches Section */}
              {bestMatches.length > 0 && (
                <div className="mt-12">
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-white">Your Best Matches</h2>
                    <div className="flex-1 h-px bg-dark-border" />
                  </div>

                  {/* 3-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {bestMatches.map((project, index) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          index={index}
                          delay={index * 0.1}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function generateRecentActivity() {
  const activities = [
    { type: 'new_members', message: '3 students started this week' },
    { type: 'milestone', message: 'Just hit 90% completion!' },
    { type: 'deadline_soon', message: 'Applications close soon' },
  ];
  
  return activities[Math.floor(Math.random() * activities.length)] as any;
}

function generateAIReason(project: Project) {
  const reasons = [
    `Your experience with ${project.matched_skills?.[0] || 'similar projects'} makes you perfect for this`,
    'This will help you develop the exact skills employers want',
    'Great stepping stone to your career goals',
    'Students like you loved this opportunity',
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateSimilarStudents() {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `student-${i}`,
    name: ['Alex Chen', 'Sarah Kim', 'Mike Johnson'][i],
    avatar_url: null,
  }));
}