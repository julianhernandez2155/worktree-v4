'use client';

import { 
  X, 
  User,
  Mail,
  Clock,
  Calendar,
  FileText,
  Link,
  Award,
  CheckCircle,
  XCircle,
  MessageSquare,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';

interface ApplicationReviewModalProps {
  application: {
    id: string;
    applicant_id: string;
    status: string;
    cover_letter: string;
    portfolio_urls: string[];
    availability_hours_per_week: number;
    expected_start_date: string;
    skill_match_score: number;
    applied_at: string;
    applicant: {
      id: string;
      full_name: string;
      email: string;
      avatar_url?: string;
      major?: string;
      year_of_study?: string;
    };
    matched_skills?: string[];
    missing_skills?: string[];
  };
  projectName: string;
  onClose: () => void;
  onStatusUpdate: (applicationId: string, status: string) => void;
}

export function ApplicationReviewModal({ 
  application, 
  projectName,
  onClose, 
  onStatusUpdate 
}: ApplicationReviewModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [_reviewNotes, _setReviewNotes] = useState('');

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    await onStatusUpdate(application.id, newStatus);
    setIsUpdating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Application Review
              </h2>
              <p className="text-dark-muted">
                {projectName}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Applicant Info */}
          <div className="flex items-start gap-4 mb-6">
            {application.applicant.avatar_url ? (
              <img 
                src={application.applicant.avatar_url} 
                alt={application.applicant.full_name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-dark-muted" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">
                {application.applicant.full_name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-dark-muted">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {application.applicant.email}
                </span>
                {application.applicant.major && (
                  <span>{application.applicant.major}</span>
                )}
                {application.applicant.year_of_study && (
                  <span>{application.applicant.year_of_study}</span>
                )}
              </div>
            </div>
            
            {/* Match Score */}
            {application.skill_match_score > 0 && (
              <div className={cn(
                "px-4 py-2 rounded-lg text-center",
                application.skill_match_score >= 80 ? "bg-neon-green/20" : 
                application.skill_match_score >= 60 ? "bg-blue-400/20" : 
                "bg-yellow-400/20"
              )}>
                <Award className={cn(
                  "h-8 w-8 mx-auto mb-1",
                  application.skill_match_score >= 80 ? "text-neon-green" : 
                  application.skill_match_score >= 60 ? "text-blue-400" : 
                  "text-yellow-400"
                )} />
                <p className={cn(
                  "text-2xl font-bold",
                  application.skill_match_score >= 80 ? "text-neon-green" : 
                  application.skill_match_score >= 60 ? "text-blue-400" : 
                  "text-yellow-400"
                )}>
                  {Math.round(application.skill_match_score)}%
                </p>
                <p className="text-xs text-dark-muted">Match</p>
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Sprout's Analysis</h4>
                <p className="text-sm text-dark-muted">
                  {application.skill_match_score >= 80 
                    ? "Excellent candidate! Strong skill alignment and availability matches project needs perfectly."
                    : application.skill_match_score >= 60
                    ? "Good candidate with solid foundational skills. May need some onboarding for specific requirements."
                    : "Enthusiastic candidate who could grow into the role. Consider if you have capacity for mentoring."}
                </p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-dark-bg rounded-lg">
              <div className="flex items-center gap-2 text-dark-muted mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Availability</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {application.availability_hours_per_week} hours/week
              </p>
            </div>
            
            <div className="p-4 bg-dark-bg rounded-lg">
              <div className="flex items-center gap-2 text-dark-muted mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Can Start</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {application.expected_start_date 
                  ? new Date(application.expected_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Immediately'}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="mb-6">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Cover Letter
            </h4>
            <div className="p-4 bg-dark-bg rounded-lg">
              <p className="text-white whitespace-pre-wrap">
                {application.cover_letter}
              </p>
            </div>
          </div>

          {/* Portfolio Links */}
          {application.portfolio_urls && application.portfolio_urls.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Link className="h-4 w-4" />
                Portfolio & Work Samples
              </h4>
              <div className="space-y-2">
                {application.portfolio_urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-dark-bg rounded-lg hover:bg-dark-card transition-colors"
                  >
                    <FileText className="h-4 w-4 text-dark-muted" />
                    <span className="text-sm text-white flex-1 truncate">{url}</span>
                    <ExternalLink className="h-4 w-4 text-dark-muted" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Skills Breakdown */}
          {(application.matched_skills || application.missing_skills) && (
            <div className="mb-6">
              <h4 className="font-semibold text-white mb-3">Skills Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                {application.matched_skills && application.matched_skills.length > 0 && (
                  <div>
                    <p className="text-sm text-dark-muted mb-2">Has Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {application.matched_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {application.missing_skills && application.missing_skills.length > 0 && (
                  <div>
                    <p className="text-sm text-dark-muted mb-2">Will Need to Learn</p>
                    <div className="flex flex-wrap gap-2">
                      {application.missing_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-orange-400/20 text-orange-400 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Metadata */}
          <div className="text-sm text-dark-muted">
            Applied {new Date(application.applied_at).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dark-border">
          {application.status === 'pending' ? (
            <div className="flex gap-3">
              <NeonButton
                variant="secondary"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={isUpdating}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </NeonButton>
              <NeonButton
                onClick={() => handleStatusUpdate('accepted')}
                disabled={isUpdating}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </NeonButton>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-dark-muted mb-3">
                Application {application.status} • You can update the status if needed
              </p>
              <div className="flex gap-3">
                <NeonButton variant="secondary" onClick={onClose} className="flex-1">
                  Close
                </NeonButton>
                {application.status !== 'pending' && (
                  <NeonButton 
                    variant="secondary"
                    onClick={() => handleStatusUpdate('pending')}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    Reset to Pending
                  </NeonButton>
                )}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}