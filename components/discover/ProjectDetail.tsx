'use client';

import { 
  Building,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  X,
  Send,
  CheckCircle,
  Target,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';

import { Project } from './DiscoverPage';

interface ProjectDetailProps {
  project: Project | null;
  projects: Project[];
  onSaveProject: (projectId: string) => void;
  onPassProject: (projectId: string) => void;
  onApplyProject: (projectId: string) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

// Typing animation hook
function useTypingEffect(text: string, speed = 30) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {return;}
    
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
}

// Generate AI match description
function generateMatchDescription(project: Project): string {
  const matchedCount = project.matched_skills?.length || 0;
  const totalRequired = project.required_skills?.length || 0;
  
  const intros = [
    "This opportunity aligns perfectly with your background!",
    "You're an ideal candidate for this project.",
    "Your skills make you a strong fit here.",
    "This project matches your expertise well."
  ];

  const skillMatch = matchedCount > 0 
    ? `You already have ${matchedCount} of the ${totalRequired} required skills, including ${project.matched_skills?.slice(0, 2).join(' and ')}.`
    : "While you'll be learning new skills, your enthusiasm and willingness to grow make you a great candidate.";

  const growth = project.skills_to_develop?.length 
    ? `This role will help you develop ${project.skills_to_develop.slice(0, 2).join(' and ')}, which are valuable for your career growth.`
    : "You'll gain hands-on experience that employers value.";

  const impact = project.organization.verified 
    ? `Working with ${project.organization.name}, a verified campus organization, will give you credible experience and strong references.`
    : `This project offers real-world experience that will strengthen your portfolio.`;

  return `${intros[Math.floor(Math.random() * intros.length)]} ${skillMatch} ${growth} ${impact}`;
}

export function ProjectDetail({
  project,
  projects,
  onSaveProject,
  onPassProject,
  onApplyProject,
  onNavigate
}: ProjectDetailProps) {
  const matchDescription = project ? generateMatchDescription(project) : '';
  const { displayedText, isTyping } = useTypingEffect(matchDescription);

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-10 w-10 text-dark-muted" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No opportunity selected
          </h3>
          <p className="text-dark-muted">
            Select an opportunity from the list to view details
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = projects.findIndex(p => p.id === project.id);
  
  // Calculate deadline
  const deadline = project.application_deadline ? new Date(project.application_deadline) : null;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Header */}
      <div className="px-8 py-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Opportunity Details</h2>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-dark-muted">
              {currentIndex + 1} of {projects.length}
            </span>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigate('prev')}
                className="p-2 hover:bg-dark-card rounded-lg transition-all"
                disabled={projects.length <= 1}
              >
                <ChevronLeft className="h-5 w-5 text-dark-muted hover:text-white" />
              </button>
              <button
                onClick={() => onNavigate('next')}
                className="p-2 hover:bg-dark-card rounded-lg transition-all"
                disabled={projects.length <= 1}
              >
                <ChevronRight className="h-5 w-5 text-dark-muted hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Organization Section */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              {project.organization.logo_url ? (
                <Image
                  src={project.organization.logo_url}
                  alt={project.organization.name}
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
              ) : (
                <div className="w-16 h-16 bg-dark-card rounded-xl flex items-center justify-center">
                  <Building className="h-8 w-8 text-dark-muted" />
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {project.organization.name}
                  </h3>
                  {project.organization.verified && (
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <p className="text-dark-muted mt-1">
                  {project.organization.description || 'Building amazing experiences for our campus community'}
                </p>
              </div>
            </div>
          </div>

          {/* Project Title & Match Score */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-white">
                {project.name}
              </h1>
              {project.match_score && project.match_score >= 70 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 rounded-full">
                  <Sparkles className="h-4 w-4 text-neon-green" />
                  <span className="text-sm font-medium text-neon-green">
                    {project.match_score}% match
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI Match Description */}
          {project.match_score && project.match_score >= 60 && (
            <GlassCard className="p-6 mb-8 border-neon-green/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-neon-green" />
                <h3 className="text-lg font-semibold text-white">
                  Why you're a great match
                </h3>
              </div>
              <p className="text-dark-text leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </GlassCard>
          )}

          {/* Key Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Commitment */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <h4 className="font-medium text-white">Time Commitment</h4>
              </div>
              <p className="text-lg text-white">
                {project.required_commitment_hours || '10-15'} hours/week
              </p>
              <p className="text-sm text-dark-muted mt-1">
                {project.preferred_start_date 
                  ? `Starting ${new Date(project.preferred_start_date).toLocaleDateString()}`
                  : 'Flexible start date'}
              </p>
            </GlassCard>

            {/* Deadline */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-400" />
                </div>
                <h4 className="font-medium text-white">Application Deadline</h4>
              </div>
              <p className="text-lg text-white">
                {deadline 
                  ? deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                  : 'Rolling basis'}
              </p>
              {daysLeft !== null && daysLeft >= 0 && (
                <p className={cn(
                  "text-sm mt-1",
                  daysLeft <= 3 ? "text-orange-400" : "text-dark-muted"
                )}>
                  {daysLeft === 0 ? "Due today!" : 
                   daysLeft === 1 ? "Due tomorrow!" : 
                   `${daysLeft} days remaining`}
                </p>
              )}
            </GlassCard>

            {/* Location */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-400" />
                </div>
                <h4 className="font-medium text-white">Location</h4>
              </div>
              <p className="text-lg text-white">
                {project.is_remote ? 'Remote' : project.location || 'On-site'}
              </p>
              <p className="text-sm text-dark-muted mt-1">
                {project.is_remote ? 'Work from anywhere' : 'In-person collaboration'}
              </p>
            </GlassCard>

            {/* Team Size */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <h4 className="font-medium text-white">Team Size</h4>
              </div>
              <p className="text-lg text-white">
                {project.max_applicants || 5} members
              </p>
              <p className="text-sm text-dark-muted mt-1">
                {project.application_count || 0} applications received
              </p>
            </GlassCard>
          </div>

          {/* Skills Sections */}
          <div className="space-y-6 mb-8">
            {/* Required Skills */}
            {project.required_skills && project.required_skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Skills Needed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills.map((skill, idx) => {
                    const isMatched = project.matched_skills?.includes(skill);
                    return (
                      <span
                        key={idx}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium",
                          isMatched
                            ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                            : "bg-dark-card text-white border border-dark-border"
                        )}
                      >
                        {isMatched && <CheckCircle className="inline h-3.5 w-3.5 mr-1.5" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skills to Develop */}
            {project.skills_to_develop && project.skills_to_develop.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Skills You'll Develop
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills_to_develop.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-purple-500/20 text-purple-400 
                               border border-purple-500/30 rounded-lg text-sm font-medium"
                    >
                      <TrendingUp className="inline h-3.5 w-3.5 mr-1.5" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">
              About this opportunity
            </h3>
            <p className="text-dark-text whitespace-pre-wrap leading-relaxed">
              {project.public_description}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <div className="px-8 py-6 border-t border-dark-border bg-dark-bg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={() => onSaveProject(project.id)}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
              project.is_saved
                ? "bg-white/10 text-white"
                : "bg-transparent text-white border border-dark-border hover:bg-dark-card"
            )}
          >
            <Bookmark className={cn("h-5 w-5", project.is_saved && "fill-current")} />
            {project.is_saved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={() => onPassProject(project.id)}
            className="px-6 py-3 bg-transparent text-white border border-dark-border 
                     rounded-xl font-medium hover:bg-dark-card transition-all
                     flex items-center gap-2"
          >
            <X className="h-5 w-5" />
            Pass
          </button>

          <NeonButton
            onClick={() => onApplyProject(project.id)}
            className="flex-1"
            disabled={project.has_applied}
            icon={<Send className="h-5 w-5" />}
          >
            {project.has_applied ? 'Application Sent' : 'Express Interest'}
          </NeonButton>
        </div>
      </div>
    </div>
  );
}