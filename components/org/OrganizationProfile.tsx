'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe,
  Users,
  FolderOpen,
  Calendar,
  CheckCircle2,
  Link as LinkIcon,
  Mail,
  MapPin,
  Edit,
  ExternalLink,
  Award,
  Target,
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface OrganizationProfileProps {
  organization: any;
  memberCount: number;
  projectCount: number;
  publicProjects: any[];
  completedProjects: any[];
  skillsCount: number;
  skillsList: string[];
  leadershipTeam: any[];
  recentActivities: any[];
  isMember: boolean;
  isAdmin: boolean;
  highlightedSection?: string | null;
  activeTab?: 'about' | 'projects' | 'contact';
  onTabChange?: (tab: 'about' | 'projects' | 'contact') => void;
}

export const OrganizationProfile = forwardRef<any, OrganizationProfileProps>(({
  organization,
  memberCount,
  projectCount,
  publicProjects,
  completedProjects,
  skillsCount,
  skillsList,
  leadershipTeam,
  recentActivities,
  isAdmin,
  highlightedSection,
  activeTab: controlledActiveTab,
  onTabChange
}, ref) => {
  const [localActiveTab, setLocalActiveTab] = useState<'about' | 'projects' | 'contact'>('about');
  const activeTab = controlledActiveTab ?? localActiveTab;
  const setActiveTab = onTabChange ?? setLocalActiveTab;

  // Create refs for each section
  const headerRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const whatWeDoRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const websiteRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const meetingScheduleRef = useRef<HTMLDivElement>(null);
  const joinProcessRef = useRef<HTMLDivElement>(null);
  const socialLinksRef = useRef<HTMLDivElement>(null);

  // Expose refs to parent
  useImperativeHandle(ref, () => ({
    scrollToSection: (field: string) => {
      let targetRef: React.RefObject<HTMLDivElement> | null = null;
      
      switch (field) {
        case 'name':
        case 'description':
        case 'category':
        case 'logo_url':
          targetRef = headerRef;
          break;
        case 'mission':
          targetRef = missionRef;
          break;
        case 'what_we_do':
          targetRef = whatWeDoRef;
          break;
        case 'values':
          targetRef = valuesRef;
          break;
        case 'email':
        case 'website':
          targetRef = emailRef;  // Both are in the Contact Information card
          break;
        case 'location':
          targetRef = meetingScheduleRef;  // Location is now in the meeting section
          break;
        case 'meeting_schedule':
          targetRef = meetingScheduleRef;
          break;
        case 'join_process':
          targetRef = joinProcessRef;
          break;
        case 'social_links':
          targetRef = socialLinksRef;
          break;
      }
      
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }));

  // Format the category nicely
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format role names
  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'president': 'President',
      'vice_president': 'Vice President',
      'treasurer': 'Treasurer',
      'secretary': 'Secretary',
      'admin': 'Officer'
    };
    return roleMap[role] || role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <GlassCard 
        ref={headerRef}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          (highlightedSection === 'name' || highlightedSection === 'description' || highlightedSection === 'category' || highlightedSection === 'logo_url') && 
          "ring-2 ring-neon-green/50 shadow-[0_0_20px_rgba(0,255,127,0.3)]"
        )}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-blue/10" />
        
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Organization Logo */}
            <div className="relative">
              {organization.logo_url ? (
                <Image
                  src={organization.logo_url}
                  alt={organization.name}
                  width={120}
                  height={120}
                  className="rounded-xl"
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-gradient-to-br from-gray-600 to-gray-700 
                           rounded-xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {organization.name.charAt(0)}
                  </span>
                </div>
              )}
              {organization.verified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1.5"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </div>

            {/* Organization Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className={cn(
                    "text-3xl font-bold text-white mb-2 transition-all duration-300",
                    highlightedSection === 'name' && "text-neon-green drop-shadow-[0_0_10px_rgba(0,255,127,0.5)]"
                  )}>
                    {organization.name}
                  </h1>
                  <p className={cn(
                    "text-lg text-gray-300 mb-4 transition-all duration-300",
                    highlightedSection === 'description' && "text-neon-green drop-shadow-[0_0_10px_rgba(0,255,127,0.5)]"
                  )}>
                    {organization.description || 'Building amazing things together'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {memberCount} members
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-4 h-4" />
                      {projectCount} active projects
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 transition-all duration-300",
                      highlightedSection === 'category' && "text-neon-green drop-shadow-[0_0_10px_rgba(0,255,127,0.5)]"
                    )}>
                      <Award className="w-4 h-4" />
                      {formatCategory(organization.category)}
                    </span>
                  </div>
                </div>

                {/* Edit button for admins */}
                {isAdmin && (
                  <Link href={`/dashboard/org/${organization.slug}/edit`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-dark-card rounded-lg
                               hover:bg-dark-elevated transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Edit Profile</span>
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <Link 
              href={`/dashboard/org/${organization.slug}/members`}
              className="bg-dark-surface rounded-lg p-4 text-center hover:bg-dark-card transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-neon-green">{memberCount}</div>
              <div className="text-sm text-gray-400">Active Members</div>
            </Link>
            <button 
              onClick={() => setActiveTab('projects')}
              className="bg-dark-surface rounded-lg p-4 text-center hover:bg-dark-card transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-neon-blue">{projectCount}</div>
              <div className="text-sm text-gray-400">Projects</div>
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className="bg-dark-surface rounded-lg p-4 text-center hover:bg-dark-card transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-purple-400">
                {publicProjects.length}
              </div>
              <div className="text-sm text-gray-400">Get Involved</div>
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className="bg-dark-surface rounded-lg p-4 text-center hover:bg-dark-card transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-yellow-400">
                {skillsCount}
              </div>
              <div className="text-sm text-gray-400">Skills Developed</div>
            </button>
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {new Date().getFullYear() - 2020}
              </div>
              <div className="text-sm text-gray-400">Years Active</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2 bg-dark-surface p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('about')}
          className={cn(
            "flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium",
            activeTab === 'about'
              ? "bg-dark-card text-white"
              : "text-gray-400 hover:text-white"
          )}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={cn(
            "flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium",
            activeTab === 'projects'
              ? "bg-dark-card text-white"
              : "text-gray-400 hover:text-white"
          )}
        >
          Projects ({publicProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={cn(
            "flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium",
            activeTab === 'contact'
              ? "bg-dark-card text-white"
              : "text-gray-400 hover:text-white"
          )}
        >
          Contact
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Two Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Mission */}
                <GlassCard 
                  ref={missionRef}
                  className={cn(
                    "transition-all duration-300",
                    highlightedSection === 'mission' && "ring-2 ring-neon-green/50 shadow-[0_0_20px_rgba(0,255,127,0.3)]"
                  )}>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-neon-green" />
                      Our Mission
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {organization.mission || 
                       "We're dedicated to creating impactful experiences and fostering growth through collaborative projects and innovative solutions."}
                    </p>
                  </div>
                </GlassCard>

                {/* What We Do */}
                <GlassCard 
                  ref={whatWeDoRef}
                  className={cn(
                    "transition-all duration-300",
                    highlightedSection === 'what_we_do' && "ring-2 ring-neon-green/50 shadow-[0_0_20px_rgba(0,255,127,0.3)]"
                  )}>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-neon-blue" />
                      What We Do
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {organization.what_we_do || 
                       "Our organization focuses on hands-on learning, real-world projects, and building a strong community of passionate individuals working together to achieve common goals."}
                    </p>
                  </div>
                </GlassCard>

                {/* Skills You'll Gain */}
                <GlassCard>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      Skills You'll Gain
                    </h3>
                    {skillsList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skillsList.slice(0, 10).map((skill) => {
                          // Simple hash to generate consistent colors for skills
                          const colors = [
                            'bg-purple-500/10 text-purple-400 border-purple-500/20',
                            'bg-blue-500/10 text-blue-400 border-blue-500/20',
                            'bg-green-500/10 text-green-400 border-green-500/20',
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                            'bg-pink-500/10 text-pink-400 border-pink-500/20',
                          ];
                          const colorIndex = skill.length % colors.length;
                          
                          return (
                            <span 
                              key={skill}
                              className={`px-3 py-1 text-sm rounded-full border ${colors[colorIndex]}`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                        {skillsList.length > 10 && (
                          <span className="px-3 py-1 text-sm text-gray-400">
                            +{skillsList.length - 10} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No skills data available</p>
                    )}
                  </div>
                </GlassCard>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Leadership Team */}
                <GlassCard>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-neon-green" />
                      Leadership Team
                    </h3>
                    {leadershipTeam.length > 0 ? (
                      <div className="space-y-3">
                        {leadershipTeam.map((leader) => (
                          <Link
                            key={leader.user_id}
                            href={`/dashboard/org/${organization.slug}/members/${leader.user_id}`}
                            className="flex items-center gap-3 hover:bg-dark-surface p-2 -m-2 rounded-lg transition-colors"
                          >
                            {leader.user?.avatar_url ? (
                              <img 
                                src={leader.user.avatar_url} 
                                alt={leader.user.full_name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                {leader.user?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-white">{leader.user?.full_name || 'Unknown'}</div>
                              <div className="text-xs text-gray-400">{formatRole(leader.role)}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No leadership team members listed</p>
                    )}
                  </div>
                </GlassCard>

                {/* Recent Activity */}
                <GlassCard>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-neon-blue" />
                      Recent Activity
                    </h3>
                    {recentActivities.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-neon-green rounded-full mt-1.5 flex-shrink-0" />
                            <div className="text-sm">
                              <span className="text-gray-300">
                                Completed "{activity.title}"
                              </span>
                              {activity.project && (
                                <span className="text-gray-500"> in {activity.project.name}</span>
                              )}
                              {activity.completed_at && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(activity.completed_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Fallback to some default activities if no real data */}
                        {[
                          'Actively working on exciting projects',
                          'Building amazing things with our members',
                          'Growing our community and impact'
                        ].map((activity, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-neon-green rounded-full mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300">{activity}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Values - Full Width */}
            <GlassCard 
              ref={valuesRef}
              className={cn(
                "transition-all duration-300",
                highlightedSection === 'values' && "ring-2 ring-neon-green/50 shadow-[0_0_20px_rgba(0,255,127,0.3)]"
              )}>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Our Values</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {['Innovation', 'Collaboration', 'Excellence'].map((value) => (
                    <div key={value} className="bg-dark-surface rounded-lg p-4 text-center">
                      <div className="text-neon-green font-semibold mb-1">{value}</div>
                      <div className="text-sm text-gray-400">
                        Core to everything we do
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Project Showcase / Trophy Case */}
            {completedProjects.length > 0 && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-400" />
                    Our Project Showcase
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="relative bg-dark-surface rounded-lg overflow-hidden border border-dark-border hover:border-yellow-400/30 transition-all"
                      >
                        {/* Project Image or Gradient */}
                        <div className="h-32 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20 relative">
                          {project.image_url ? (
                            <img 
                              src={project.image_url} 
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FolderOpen className="w-12 h-12 text-white/30" />
                            </div>
                          )}
                          {/* Achievement Badge */}
                          {project.achievement && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded">
                              {project.achievement}
                            </div>
                          )}
                        </div>
                        
                        {/* Project Details */}
                        <div className="p-4">
                          <h4 className="font-bold text-white mb-2">{project.name}</h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {project.description}
                          </p>
                          {/* Project Stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {project.team_member_ids && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {project.team_member_ids.length} members
                              </span>
                            )}
                            {project.completed_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.completed_at).getFullYear()}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Current Opportunities */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-neon-green" />
                  Get Involved - Current Opportunities
                </h3>
                {publicProjects.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {publicProjects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/discover/project/${project.id}`}
                        className="block"
                      >
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="bg-dark-surface rounded-lg p-4 hover:bg-dark-card 
                                   transition-colors cursor-pointer border border-dark-border hover:border-neon-green/30"
                        >
                          <h4 className="font-semibold text-white mb-2">
                            {project.name}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {project.public_description || project.description}
                          </p>
                          {/* Skills Needed */}
                          {project.skills_needed && project.skills_needed.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.skills_needed.slice(0, 3).map((skill: string) => (
                                <span 
                                  key={skill}
                                  className="px-2 py-0.5 bg-neon-green/10 text-neon-green text-xs rounded-full border border-neon-green/20"
                                >
                                  {skill}
                                </span>
                              ))}
                              {project.skills_needed.length > 3 && (
                                <span className="px-2 py-0.5 text-xs text-gray-400">
                                  +{project.skills_needed.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {project.required_commitment_hours 
                                ? `${project.required_commitment_hours}h/week` 
                                : 'Flexible commitment'}
                            </span>
                            <span className="text-neon-green flex items-center gap-1">
                              Apply Now
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No open positions at the moment. Check back soon!
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Multi-column contact layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <GlassCard 
                ref={emailRef}
                className={cn(
                  "transition-all duration-300",
                  (highlightedSection === 'email' || highlightedSection === 'website') && "ring-2 ring-neon-green/50 shadow-[0_0_20px_rgba(0,255,127,0.3)]"
                )}>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-neon-green" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {organization.email && (
                      <a
                        href={`mailto:${organization.email}`}
                        className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                      >
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span>{organization.email}</span>
                      </a>
                    )}

                    {organization.website && (
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                      >
                        <Globe className="w-5 h-5 text-gray-500" />
                        <span>{organization.website}</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}

                    {organization.location && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span>{organization.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Social Media */}
              <GlassCard 
                ref={socialLinksRef}
                className={cn(
                  "transition-all duration-300",
                  highlightedSection === 'social_links' && "ring-2 ring-neon-green/50 shadow-[0_0_20px_rgba(0,255,127,0.3)]"
                )}>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-neon-blue" />
                    Connect With Us
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {organization.social_links && organization.social_links.length > 0 ? (
                      organization.social_links.map((link: any) => {
                        const platformIcons: Record<string, any> = {
                          instagram: { icon: Instagram, color: 'hover:text-pink-400' },
                          discord: { icon: MessageCircle, color: 'hover:text-purple-400' },
                          linkedin: { icon: Linkedin, color: 'hover:text-blue-400' },
                          twitter: { icon: Twitter, color: 'hover:text-sky-400' },
                        };
                        const platform = platformIcons[link.platform] || { icon: LinkIcon, color: 'hover:text-gray-300' };
                        const Icon = platform.icon;
                        
                        return (
                          <a
                            key={link.platform}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-3 bg-dark-surface rounded-lg hover:bg-dark-card transition-colors text-gray-300 ${platform.color}`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm capitalize">{link.platform}</span>
                          </a>
                        );
                      })
                    ) : (
                      // Show placeholder links if no social links configured
                      [
                        { platform: 'Instagram', icon: Instagram, color: 'hover:text-pink-400', url: '#' },
                        { platform: 'Discord', icon: MessageCircle, color: 'hover:text-purple-400', url: '#' },
                      ].map((social) => (
                        <a
                          key={social.platform}
                          href={social.url}
                          className={`flex items-center gap-2 p-3 bg-dark-surface rounded-lg hover:bg-dark-card transition-colors text-gray-300 ${social.color} opacity-50`}
                        >
                          <social.icon className="w-5 h-5" />
                          <span className="text-sm">{social.platform}</span>
                        </a>
                      ))
                    )}
                  </div>
                  {/* Join Discord CTA */}
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Join our Discord
                  </motion.a>
                </div>
              </GlassCard>

              {/* Primary Contact Person */}
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    Primary Contact
                  </h3>
                  {leadershipTeam.length > 0 ? (
                    <div className="space-y-4">
                      {/* Show president or first leadership member */}
                      {(() => {
                        const president = leadershipTeam.find(l => l.role === 'president') || leadershipTeam[0];
                        return president ? (
                          <div>
                            <Link
                              href={`/dashboard/org/${organization.slug}/members/${president.user_id}`}
                              className="flex items-center gap-3 hover:bg-dark-surface p-3 -m-3 rounded-lg transition-colors"
                            >
                              {president.user?.avatar_url ? (
                                <img 
                                  src={president.user.avatar_url} 
                                  alt={president.user.full_name}
                                  className="w-12 h-12 rounded-full"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-lg font-bold text-white">
                                  {president.user?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-white">{president.user?.full_name || 'Unknown'}</div>
                                <div className="text-sm text-gray-400">{formatRole(president.role)}</div>
                              </div>
                            </Link>
                            <div className="mt-4 space-y-2">
                              <p className="text-sm text-gray-400">
                                Feel free to reach out with any questions about joining {organization.name}!
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-colors text-sm font-medium"
                              >
                                Send Message
                              </motion.button>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Contact information coming soon.
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Interest Form or Meeting Times */}
            <GlassCard 
              ref={meetingScheduleRef}
              className={cn(
                "transition-all duration-300",
                (highlightedSection === 'location' || highlightedSection === 'meeting_schedule' || highlightedSection === 'join_process') && "ring-2 ring-neon-green/50 shadow-[0_0_20px_rgba(0,255,127,0.3)]"
              )}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  Meeting Times & Application Info
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-2">Regular Meetings</h4>
                    <div className="text-gray-400">
                      {(() => {
                        let scheduleData = organization.meeting_schedule;
                        
                        // Parse if it's a string
                        if (typeof scheduleData === 'string') {
                          try {
                            scheduleData = JSON.parse(scheduleData);
                          } catch (e) {
                            // If parsing fails, show the string as is or default message
                            return scheduleData || 'Meeting times to be announced';
                          }
                        }
                        
                        // Handle JSONB format
                        if (scheduleData && typeof scheduleData === 'object') {
                          const activeDays = Object.entries(scheduleData)
                            .filter(([day, schedule]: any) => 
                              day !== 'legacy_text' && schedule?.enabled
                            )
                            .map(([day, schedule]: any) => {
                              const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                              return `${dayName}s at ${schedule.time}`;
                            });
                          
                          if (activeDays.length > 0) {
                            return (
                              <>
                                <p>{activeDays.join(', ')}</p>
                                {organization.location && (
                                  <p className="text-sm mt-1">
                                    <MapPin className="inline w-3 h-3 mr-1" />
                                    {organization.location}
                                  </p>
                                )}
                              </>
                            );
                          }
                        }
                        
                        // Fallback
                        return 'Meeting times to be announced';
                      })()}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">How to Join</h4>
                    <p className="text-gray-400">
                      {organization.join_process || 'Applications open at the beginning of each semester. No experience required!'}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

OrganizationProfile.displayName = 'OrganizationProfile';