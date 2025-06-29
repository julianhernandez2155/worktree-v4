'use client';

import { 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  FileText,
  ChevronRight,
  AlertCircle,
  User,
  Mail,
  Award
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { ApplicationReviewModal } from './ApplicationReviewModal';


interface Application {
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
}

interface ProjectApplicationsListProps {
  projectId: string;
  projectName: string;
  maxApplicants?: number;
}

export function ProjectApplicationsList({ 
  projectId, 
  projectName,
  maxApplicants 
}: ProjectApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const supabase = createClient();

  useEffect(() => {
    loadApplications();
  }, [projectId]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('project_applications')
        .select(`
          *,
          applicant:profiles!applicant_id (
            id,
            full_name,
            email,
            avatar_url,
            major,
            year_of_study
          )
        `)
        .eq('project_id', projectId)
        .order('applied_at', { ascending: false });

      if (error) {throw error;}
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('project_applications')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', applicationId);

      if (error) {throw error;}
      
      // Reload applications
      await loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-400 bg-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      case 'reviewing': return 'text-yellow-400 bg-yellow-400/20';
      case 'withdrawn': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-blue-400 bg-blue-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      case 'withdrawn': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') {return true;}
    return app.status === filterStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (loading) {return <LoadingSpinner />;}

  return (
    <>
      <GlassCard>
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Applications</h3>
            {maxApplicants && (
              <div className="text-sm text-dark-muted">
                {stats.accepted}/{maxApplicants} spots filled
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                "p-3 rounded-lg text-center transition-all",
                filterStatus === 'all' ? "bg-dark-bg border border-neon-green/50" : "bg-dark-bg/50 hover:bg-dark-bg"
              )}
            >
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-dark-muted">Total</p>
            </button>
            
            <button
              onClick={() => setFilterStatus('pending')}
              className={cn(
                "p-3 rounded-lg text-center transition-all",
                filterStatus === 'pending' ? "bg-dark-bg border border-blue-400/50" : "bg-dark-bg/50 hover:bg-dark-bg"
              )}
            >
              <p className="text-2xl font-bold text-blue-400">{stats.pending}</p>
              <p className="text-sm text-dark-muted">Pending</p>
            </button>
            
            <button
              onClick={() => setFilterStatus('accepted')}
              className={cn(
                "p-3 rounded-lg text-center transition-all",
                filterStatus === 'accepted' ? "bg-dark-bg border border-green-400/50" : "bg-dark-bg/50 hover:bg-dark-bg"
              )}
            >
              <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
              <p className="text-sm text-dark-muted">Accepted</p>
            </button>
            
            <button
              onClick={() => setFilterStatus('rejected')}
              className={cn(
                "p-3 rounded-lg text-center transition-all",
                filterStatus === 'rejected' ? "bg-dark-bg border border-red-400/50" : "bg-dark-bg/50 hover:bg-dark-bg"
              )}
            >
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              <p className="text-sm text-dark-muted">Rejected</p>
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="divide-y divide-dark-border">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-dark-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {filterStatus === 'all' ? 'No applications yet' : `No ${filterStatus} applications`}
              </h3>
              <p className="text-dark-muted">
                {filterStatus === 'all' && 'Applications will appear here when students apply'}
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div 
                key={application.id}
                className="p-4 hover:bg-dark-card/50 transition-colors cursor-pointer"
                onClick={() => setSelectedApplication(application.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {application.applicant.avatar_url ? (
                      <img 
                        src={application.applicant.avatar_url} 
                        alt={application.applicant.full_name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-dark-card rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-dark-muted" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">
                          {application.applicant.full_name}
                        </h4>
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
                        <div className="flex items-center gap-2">
                          <Award className={cn(
                            "h-5 w-5",
                            application.skill_match_score >= 80 ? "text-neon-green" : 
                            application.skill_match_score >= 60 ? "text-blue-400" : 
                            "text-yellow-400"
                          )} />
                          <span className={cn(
                            "font-semibold",
                            application.skill_match_score >= 80 ? "text-neon-green" : 
                            application.skill_match_score >= 60 ? "text-blue-400" : 
                            "text-yellow-400"
                          )}>
                            {Math.round(application.skill_match_score)}% match
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Cover Letter Preview */}
                    <p className="text-sm text-dark-muted line-clamp-2 mb-3">
                      {application.cover_letter}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-dark-muted">
                          <Clock className="h-3 w-3" />
                          {application.availability_hours_per_week}h/week
                        </span>
                        <span className="flex items-center gap-1 text-dark-muted">
                          <Calendar className="h-3 w-3" />
                          Applied {new Date(application.applied_at).toLocaleDateString()}
                        </span>
                        {application.portfolio_urls && application.portfolio_urls.length > 0 && (
                          <span className="flex items-center gap-1 text-dark-muted">
                            <FileText className="h-3 w-3" />
                            {application.portfolio_urls.length} portfolio {application.portfolio_urls.length === 1 ? 'link' : 'links'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-sm flex items-center gap-2",
                          getStatusColor(application.status)
                        )}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </div>
                        <ChevronRight className="h-4 w-4 text-dark-muted" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Application Review Modal */}
      {selectedApplication && (
        <ApplicationReviewModal
          application={filteredApplications.find(a => a.id === selectedApplication)!}
          projectName={projectName}
          onClose={() => setSelectedApplication(null)}
          onStatusUpdate={updateApplicationStatus}
        />
      )}
    </>
  );
}