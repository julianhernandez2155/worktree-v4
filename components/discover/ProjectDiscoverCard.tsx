'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { 
  Clock, 
  Users, 
  Calendar,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  TrendingUp,
  Building,
  Sparkles,
  Target,
  Zap,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import { SkillMatchBreakdown } from './SkillMatchBreakdown';

interface ProjectDiscoverCardProps {
  project: {
    id: string;
    name: string;
    public_description: string;
    tagline?: string;
    hero_image?: string;
    organization: {
      name: string;
      logo_url?: string;
      verified: boolean;
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
    skills_to_gain?: string[];
    view_count?: number;
    recent_activity?: string;
    interested_count?: number;
  };
  onSave: () => void;
  onApply: () => void;
}

// Generate consistent gradient based on project name
const getProjectGradient = (name: string) => {
  const gradients = [
    '#667eea, #764ba2', // Purple to violet
    '#f093fb, #f5576c', // Pink to red
    '#4facfe, #00f2fe', // Blue to cyan
    '#43e97b, #38f9d7', // Green to teal
    '#fa709a, #fee140', // Pink to yellow
    '#30cfd0, #330867', // Cyan to purple
    '#a8edea, #fed6e3', // Light blue to pink
    '#ff9a9e, #fecfef', // Light red to pink
  ];
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
};

export function ProjectDiscoverCard({ project, onSave, onApply }: ProjectDiscoverCardProps) {
  const [showSkillBreakdown, setShowSkillBreakdown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const getCategoryBadge = () => {
    const matchScore = project.match_score || 0;
    const hasAllSkills = project.missing_skills?.length === 0;
    const isNew = project.application_count < 3;
    const isUrgent = getDeadlineInfo()?.urgent;
    
    if (matchScore >= 90 && hasAllSkills) {
      return { label: 'Perfect for You', icon: Sparkles, color: 'text-neon-green bg-neon-green/20' };
    } else if (matchScore >= 75) {
      return { label: 'Great Match', icon: Target, color: 'text-blue-400 bg-blue-400/20' };
    } else if (isNew) {
      return { label: 'New Opportunity', icon: Zap, color: 'text-purple-400 bg-purple-400/20' };
    } else if (isUrgent) {
      return { label: 'Apply Soon', icon: Clock, color: 'text-orange-400 bg-orange-400/20' };
    } else if (project.organization.verified) {
      return { label: 'Popular Org', icon: Heart, color: 'text-pink-400 bg-pink-400/20' };
    }
    return null;
  };
  
  const getDeadlineInfo = () => {
    if (!project.application_deadline) return null;
    
    const deadline = new Date(project.application_deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: 'Deadline passed', urgent: true };
    if (daysLeft === 0) return { text: 'Ends today', urgent: true };
    if (daysLeft === 1) return { text: 'Ends tomorrow', urgent: true };
    if (daysLeft <= 7) return { text: `${daysLeft} days left`, urgent: true };
    return { text: `${daysLeft} days left`, urgent: false };
  };

  const deadlineInfo = getDeadlineInfo();
  const spotsLeft = project.max_applicants 
    ? Math.max(0, project.max_applicants - project.application_count)
    : null;
  const categoryBadge = getCategoryBadge();

  return (
    <>
      <GlassCard 
        className="hover:border-neon-green/30 hover:shadow-lg hover:shadow-neon-green/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hero Status Bar */}
        {project.has_applied && (
          <div className={cn(
            "px-4 py-2 font-medium text-sm flex items-center justify-between",
            project.application_status === 'accepted' ? 'bg-green-500/20 text-green-400 border-b border-green-500/30' :
            project.application_status === 'rejected' ? 'bg-red-500/20 text-red-400 border-b border-red-500/30' :
            project.application_status === 'reviewing' ? 'bg-yellow-500/20 text-yellow-400 border-b border-yellow-500/30' :
            'bg-blue-500/20 text-blue-400 border-b border-blue-500/30'
          )}>
            <div className="flex items-center gap-2">
              {project.application_status === 'accepted' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>🎉 You're in! Check your email for next steps</span>
                </>
              ) : project.application_status === 'rejected' ? (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Not selected this time</span>
                </>
              ) : project.application_status === 'reviewing' ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Application under review</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Application submitted</span>
                </>
              )}
            </div>
            {project.application_status === 'accepted' && (
              <span className="text-xs opacity-75">View Details →</span>
            )}
          </div>
        )}
        
        {/* Hero Section */}
        {!project.has_applied && (
          <div 
            className="h-24 relative overflow-hidden bg-gradient-to-br"
            style={{
              background: `linear-gradient(135deg, ${getProjectGradient(project.name)})`
            }}
          >
            {/* Category Badge */}
            {categoryBadge && (
              <div className="absolute top-4 left-4 z-10">
                <div className={cn(
                  "px-3 py-1.5 rounded-full flex items-center gap-2 font-medium text-sm backdrop-blur-md bg-white/10",
                  "text-white border border-white/20"
                )}>
                  <categoryBadge.icon className="h-4 w-4" />
                  {categoryBadge.label}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent" />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex gap-6">

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {project.organization.logo_url ? (
                    <Image
                      src={project.organization.logo_url}
                      alt={project.organization.name}
                      width={20}
                      height={20}
                      className="rounded"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-dark-card rounded flex items-center justify-center">
                      <Building className="h-3 w-3 text-dark-muted" />
                    </div>
                  )}
                  <span className="text-sm text-dark-muted">{project.organization.name}</span>
                  {project.organization.verified && (
                    <CheckCircle className="h-3 w-3 text-blue-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-neon-green transition-colors">
                  {project.name}
                </h3>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
                className="p-2 hover:bg-dark-card rounded-lg transition-colors relative z-10"
              >
                {project.is_saved ? (
                  <BookmarkCheck className="h-5 w-5 text-neon-green" />
                ) : (
                  <Bookmark className="h-5 w-5 text-dark-muted hover:text-white" />
                )}
              </button>
            </div>

            {/* Hero Description */}
            <p className="text-white mb-2 font-medium">
              {project.tagline || project.public_description}
            </p>
            
            {/* What You'll Do */}
            <p className="text-dark-muted mb-4 text-sm line-clamp-2">
              {project.public_description}
            </p>
            
            {/* Skills You'll Gain */}
            {project.skills_to_gain && project.skills_to_gain.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-dark-muted mb-2">Skills you'll gain:</p>
                <div className="flex flex-wrap gap-2">
                  {project.skills_to_gain.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-dark-bg text-xs rounded-full text-white border border-dark-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills on Hover */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-bg to-transparent p-6 transform transition-transform duration-300",
              isHovered ? "translate-y-0" : "translate-y-full"
            )}>
              {project.required_skills && project.required_skills.length > 0 && (
                <div>
                  <p className="text-xs text-dark-muted mb-2">Skills you'll use:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.required_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "px-3 py-1 text-xs rounded-full",
                          project.matched_skills?.includes(skill)
                            ? "bg-neon-green/20 text-neon-green"
                            : "bg-dark-card text-white"
                        )}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm">
              {/* Key Details in Compact Row */}
              <div className="flex items-center gap-3">
                {project.required_commitment_hours && (
                  <span className="text-sm text-dark-muted">
                    {project.required_commitment_hours}h/week
                  </span>
                )}
                
                {deadlineInfo && (
                  <span className={cn(
                    "text-sm",
                    deadlineInfo.urgent ? "text-orange-400" : "text-dark-muted"
                  )}>
                    • {deadlineInfo.text}
                  </span>
                )}
                
                {spotsLeft !== null && (
                  <span className={cn(
                    "text-sm",
                    spotsLeft <= 2 ? "text-red-400" : "text-dark-muted"
                  )}>
                    • {spotsLeft === 0 
                      ? 'Full' 
                      : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'}`}
                  </span>
                )}
              </div>

              {/* Social Proof */}
              {(project.interested_count > 0 || project.recent_activity) && (
                <div className="text-sm text-neon-green flex items-center gap-1">
                  <div className="h-2 w-2 bg-neon-green rounded-full animate-pulse" />
                  {project.interested_count > 5 
                    ? `${project.interested_count} students interested`
                    : project.recent_activity || '2 students viewing now'
                  }
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center">
            {project.has_applied ? (
              <div className={cn(
                "flex items-center gap-2",
                project.application_status === 'accepted' ? 'text-green-400' :
                project.application_status === 'rejected' ? 'text-red-400' :
                project.application_status === 'reviewing' ? 'text-yellow-400' :
                'text-blue-400'
              )}>
                {project.application_status === 'accepted' ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Accepted</span>
                  </>
                ) : project.application_status === 'rejected' ? (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Rejected</span>
                  </>
                ) : project.application_status === 'reviewing' ? (
                  <>
                    <Eye className="h-5 w-5" />
                    <span className="text-sm font-medium">Under Review</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">Applied</span>
                  </>
                )}
              </div>
            ) : deadlineInfo && deadlineInfo.text === 'Deadline passed' ? (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Closed</span>
              </div>
            ) : spotsLeft === 0 ? (
              <div className="flex items-center gap-2 text-orange-400">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Full</span>
              </div>
            ) : (
              <NeonButton
                onClick={(e) => {
                  e.stopPropagation();
                  onApply();
                }}
                variant="secondary"
                className="hover:bg-neon-green hover:text-dark-bg transition-all relative z-10"
              >
                I'm Interested
              </NeonButton>
            )}
          </div>
        </div>
        </div>
      </GlassCard>

      {/* Skill Match Breakdown Modal */}
      {showSkillBreakdown && (
        <SkillMatchBreakdown
          projectName={project.name}
          matchScore={project.match_score || 0}
          matchedSkills={project.matched_skills || []}
          missingSkills={project.missing_skills || []}
          onClose={() => setShowSkillBreakdown(false)}
        />
      )}
    </>
  );
}