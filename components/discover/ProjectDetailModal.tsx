'use client';

import { 
  X, 
  Clock, 
  Calendar,
  Users,
  MapPin,
  CheckCircle,
  Building,
  Bookmark,
  BookmarkCheck,
  Share2,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ProjectDetailModalProps {
  projectId: string;
  onClose: () => void;
  onApply: () => void;
}

export function ProjectDetailModal({ 
  projectId, 
  onClose, 
  onApply 
}: ProjectDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [viewStartTime] = useState(Date.now());
  
  const supabase = createClient();

  useEffect(() => {
    loadProjectDetails();
    trackView();

    // Track view duration on unmount
    return () => {
      const duration = Math.round((Date.now() - viewStartTime) / 1000);
      updateViewDuration(duration);
    };
  }, [projectId]);

  const loadProjectDetails = async () => {
    try {
      const { data: projectData } = await supabase
        .from('internal_projects')
        .select(`
          *,
          organization:organizations!organization_id(
            name,
            logo_url,
            verified,
            description
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectData) {
        // Get skills data
        const { data: taskData } = await supabase
          .from('contributions')
          .select(`
            id,
            name,
            description,
            task_required_skills!task_id(
              importance,
              skills!skill_id(name, category)
            )
          `)
          .eq('project_id', projectId);

        // Aggregate skills across all tasks
        const allSkills = taskData?.flatMap(task => 
          task.task_required_skills?.map(trs => ({
            name: trs.skills?.name,
            category: trs.skills?.category,
            importance: trs.importance
          }))
        ) || [];

        const requiredSkills = [...new Set(allSkills.filter(s => s.importance === 'required').map(s => s.name))];
        const preferredSkills = [...new Set(allSkills.filter(s => s.importance === 'preferred').map(s => s.name))];

        // Check if user has saved/applied
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: savedData } = await supabase
            .from('saved_projects')
            .select('project_id')
            .eq('user_id', user.id)
            .eq('project_id', projectId)
            .single();

          const { data: applicationData } = await supabase
            .from('project_applications')
            .select('status')
            .eq('applicant_id', user.id)
            .eq('project_id', projectId)
            .single();

          projectData.is_saved = !!savedData;
          projectData.has_applied = !!applicationData;
          projectData.application_status = applicationData?.status;
        }

        setProject({
          ...projectData,
          tasks: taskData,
          required_skills: requiredSkills,
          preferred_skills: preferredSkills
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      await supabase.from('project_views').insert({
        project_id: projectId,
        viewer_id: user.id,
        referrer: 'discover_feed'
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const updateViewDuration = async (duration: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      // Update the most recent view with duration
      const { data: recentView } = await supabase
        .from('project_views')
        .select('id')
        .eq('project_id', projectId)
        .eq('viewer_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(1)
        .single();

      if (recentView) {
        await supabase
          .from('project_views')
          .update({ view_duration_seconds: duration })
          .eq('id', recentView.id);
      }
    } catch (error) {
      console.error('Error updating view duration:', error);
    }
  };

  const toggleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

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

      setProject({ ...project, is_saved: !project.is_saved });
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {return null;}

  const deadlineInfo = project.application_deadline ? (() => {
    const deadline = new Date(project.application_deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {return { text: 'Deadline passed', urgent: true };}
    if (daysLeft === 0) {return { text: 'Ends today', urgent: true };}
    if (daysLeft === 1) {return { text: 'Ends tomorrow', urgent: true };}
    if (daysLeft <= 7) {return { text: `${daysLeft} days left`, urgent: true };}
    return { text: deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), urgent: false };
  })() : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {project.organization.logo_url ? (
                <Image
                  src={project.organization.logo_url}
                  alt={project.organization.name}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-dark-card rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-dark-muted" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-dark-muted">{project.organization.name}</span>
                  {project.organization.verified && (
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {project.name}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSave}
                className="p-2 hover:bg-dark-card rounded-lg transition-colors"
              >
                {project.is_saved ? (
                  <BookmarkCheck className="h-5 w-5 text-neon-green" />
                ) : (
                  <Bookmark className="h-5 w-5 text-dark-muted hover:text-white" />
                )}
              </button>
              <button
                onClick={() => {
                  // Share functionality
                  navigator.share?.({
                    title: project.name,
                    text: project.public_description,
                    url: window.location.href
                  });
                }}
                className="p-2 hover:bg-dark-card rounded-lg transition-colors"
              >
                <Share2 className="h-5 w-5 text-dark-muted hover:text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-card rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-dark-muted" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark-bg p-4 rounded-lg">
              <div className="flex items-center gap-2 text-dark-muted mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Time</span>
              </div>
              <p className="text-white font-medium">
                {project.required_commitment_hours || 5}h/week
              </p>
            </div>
            <div className="bg-dark-bg p-4 rounded-lg">
              <div className="flex items-center gap-2 text-dark-muted mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Deadline</span>
              </div>
              <p className={cn(
                "font-medium",
                deadlineInfo?.urgent ? "text-orange-400" : "text-white"
              )}>
                {deadlineInfo?.text || 'Rolling'}
              </p>
            </div>
            <div className="bg-dark-bg p-4 rounded-lg">
              <div className="flex items-center gap-2 text-dark-muted mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Spots</span>
              </div>
              <p className="text-white font-medium">
                {project.max_applicants 
                  ? `${Math.max(0, project.max_applicants - project.application_count)} left`
                  : 'Open'}
              </p>
            </div>
            <div className="bg-dark-bg p-4 rounded-lg">
              <div className="flex items-center gap-2 text-dark-muted mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Location</span>
              </div>
              <p className="text-white font-medium">
                Remote OK
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">About this opportunity</h3>
            <p className="text-dark-text whitespace-pre-wrap">
              {project.public_description || project.description}
            </p>
          </div>

          {/* Requirements */}
          {project.application_requirements && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">What we're looking for</h3>
              <p className="text-dark-text whitespace-pre-wrap">
                {project.application_requirements}
              </p>
            </div>
          )}

          {/* Skills */}
          {(project.required_skills?.length > 0 || project.preferred_skills?.length > 0) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
              
              {project.required_skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-dark-muted mb-2">Required</p>
                  <div className="flex flex-wrap gap-2">
                    {project.required_skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-neon-green/20 text-neon-green rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {project.preferred_skills?.length > 0 && (
                <div>
                  <p className="text-sm text-dark-muted mb-2">Nice to have</p>
                  <div className="flex flex-wrap gap-2">
                    {project.preferred_skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-dark-bg text-white rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tasks Preview */}
          {project.tasks?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">What you'll work on</h3>
              <div className="space-y-3">
                {project.tasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="bg-dark-bg p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-1">{task.name}</h4>
                    <p className="text-dark-muted text-sm">{task.description}</p>
                  </div>
                ))}
                {project.tasks.length > 3 && (
                  <p className="text-dark-muted text-sm">
                    + {project.tasks.length - 3} more tasks
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dark-border">
          <div className="flex gap-3">
            <NeonButton 
              variant="secondary" 
              onClick={onClose}
              className="px-6"
            >
              Close
            </NeonButton>
            {project.has_applied ? (
              <div className={cn(
                "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium",
                project.application_status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                project.application_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                project.application_status === 'reviewing' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              )}>
                {project.application_status === 'accepted' ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Accepted!</span>
                  </>
                ) : project.application_status === 'rejected' ? (
                  <>
                    <X className="h-5 w-5" />
                    <span>Not Selected</span>
                  </>
                ) : project.application_status === 'reviewing' ? (
                  <>
                    <Clock className="h-5 w-5" />
                    <span>Under Review</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Application Submitted</span>
                  </>
                )}
              </div>
            ) : (
              <NeonButton 
                onClick={onApply}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={deadlineInfo?.text === 'Deadline passed' || project.max_applicants && project.application_count >= project.max_applicants}
              >
                Express Interest
                <ChevronRight className="h-4 w-4" />
              </NeonButton>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}