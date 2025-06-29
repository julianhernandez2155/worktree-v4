'use client';

import { 
  X, 
  Clock, 
  Calendar, 
  FileText,
  Link,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ProjectApplicationModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProjectApplicationModal({ 
  projectId, 
  onClose, 
  onSuccess 
}: ProjectApplicationModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolioUrls: [''],
    availabilityHours: '',
    expectedStartDate: ''
  });
  const [estimatedTime] = useState(2); // minutes
  
  const supabase = createClient();

  useEffect(() => {
    loadProjectAndProfile();
  }, [projectId]);

  const loadProjectAndProfile = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      // Load project details
      const { data: projectData } = await supabase
        .from('internal_projects')
        .select(`
          *,
          organization:organizations!organization_id(
            name,
            logo_url,
            verified
          )
        `)
        .eq('id', projectId)
        .single();

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProject(projectData);
      setUserProfile(profileData);

      // Pre-fill some data
      if (projectData?.required_commitment_hours) {
        setFormData(prev => ({
          ...prev,
          availabilityHours: projectData.required_commitment_hours.toString()
        }));
      }
      if (projectData?.preferred_start_date) {
        setFormData(prev => ({
          ...prev,
          expectedStartDate: new Date(projectData.preferred_start_date).toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      // Calculate skill match score
      const { data: matchData } = await supabase.rpc('calculate_skill_match_score', {
        p_user_id: user.id,
        p_project_id: projectId
      });

      // Create application
      const { error } = await supabase
        .from('project_applications')
        .insert({
          project_id: projectId,
          applicant_id: user.id,
          cover_letter: formData.coverLetter,
          portfolio_urls: formData.portfolioUrls.filter(url => url.trim()),
          availability_hours_per_week: parseInt(formData.availabilityHours),
          expected_start_date: formData.expectedStartDate || null,
          skill_match_score: matchData?.match_score || 0,
          matched_skills: matchData?.matched_required_skills || [],
          missing_skills: matchData?.missing_required_skills || []
        });

      if (error) {throw error;}

      // Track view
      await supabase.from('project_views').insert({
        project_id: projectId,
        viewer_id: user.id,
        referrer: 'application_modal'
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addPortfolioUrl = () => {
    setFormData(prev => ({
      ...prev,
      portfolioUrls: [...prev.portfolioUrls, '']
    }));
  };

  const updatePortfolioUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolioUrls: prev.portfolioUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const removePortfolioUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolioUrls: prev.portfolioUrls.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project || !userProfile) {return null;}

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Express Interest
              </h2>
              <p className="text-dark-muted">
                {project.name} • {project.organization.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-dark-muted" />
            </button>
          </div>
        </div>

        {/* AI Assistant Banner */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">
                Sprout's Take
              </p>
              <p className="text-sm text-dark-muted">
                Perfect next step! Builds on your skills to learn new ones.
                Essential for Product Designer roles at tech companies.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {/* Time Commitment */}
          <div className="mb-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold text-white mb-4">Time Commitment</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-dark-muted" />
                <div>
                  <p className="text-sm text-dark-muted">Per week</p>
                  <p className="text-white font-medium">{project.required_commitment_hours || 5}h</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-dark-muted" />
                <div>
                  <p className="text-sm text-dark-muted">Duration</p>
                  <p className="text-white font-medium">4 weeks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-dark-muted" />
                <div>
                  <p className="text-sm text-dark-muted">Start</p>
                  <p className="text-white font-medium">
                    {project.preferred_start_date 
                      ? new Date(project.preferred_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Flexible'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Why does this excite you? (Optional but helps you stand out)
            </label>
            <textarea
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              rows={3}
              placeholder="I'm excited about this opportunity because..."
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors resize-none"
            />
          </div>

          {/* Portfolio Links */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Portfolio / Work Samples
            </label>
            <p className="text-sm text-dark-muted mb-3">
              Share links to relevant work, GitHub repos, or portfolios
            </p>
            {formData.portfolioUrls.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updatePortfolioUrl(index, e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors"
                  />
                </div>
                {formData.portfolioUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePortfolioUrl(index)}
                    className="p-2 hover:bg-dark-card rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-dark-muted" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPortfolioUrl}
              className="text-sm text-neon-green hover:underline"
            >
              + Add another link
            </button>
          </div>

          {/* Availability */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Hours available per week *
              </label>
              <input
                type="number"
                value={formData.availabilityHours}
                onChange={(e) => setFormData({ ...formData, availabilityHours: e.target.value })}
                min={project.required_commitment_hours || 1}
                required
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Expected start date
              </label>
              <input
                type="date"
                value={formData.expectedStartDate}
                onChange={(e) => setFormData({ ...formData, expectedStartDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors"
              />
            </div>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center gap-2 text-sm text-dark-muted">
            <Clock className="h-4 w-4" />
            <span>Quick and easy • Takes about {estimatedTime} minutes</span>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-dark-border">
          <div className="flex gap-3">
            <NeonButton 
              variant="secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </NeonButton>
            <NeonButton 
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Submitting...
                </>
              ) : (
                <>
                  Send Interest
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </NeonButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}