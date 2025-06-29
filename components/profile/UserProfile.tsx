'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Edit,
  Share2,
  Download,
  Users,
  CheckCircle2,
  Star,
  Target,
  Sparkles,
  Shield,
  MessageCircle,
  Briefcase
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { ActivityHeatmap } from './ActivityHeatmap';

interface UserProfileProps {
  profile: any;
  stats: {
    projectsCompleted: number;
    organizationsJoined: number;
    skillsVerified: number;
    totalSkills: number;
    contributionHours: number;
  };
  contributions: any[];
  recentActivity: any[];
  isOwnProfile: boolean;
  highlightedSection?: string | null;
}


export const UserProfile = forwardRef<any, UserProfileProps>(({
  profile,
  stats,
  contributions,
  recentActivity,
  isOwnProfile,
  highlightedSection
}, ref) => {

  // Create refs for sections
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Expose refs to parent
  useImperativeHandle(ref, () => ({
    scrollToSection: (field: string) => {
      let targetRef: React.RefObject<HTMLDivElement> | null = null;
      
      switch (field) {
        case 'full_name':
        case 'avatar_url':
        case 'tagline':
          targetRef = headerRef;
          break;
      }

      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }));

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/u/${profile.username}`);
    // TODO: Show toast notification
  };

  const handleDownloadResume = () => {
    // TODO: Implement resume generation
    console.log('Download resume');
  };

  // Calculate profile completion
  const profileCompletion = [
    profile.full_name,
    profile.bio,
    profile.avatar_url,
    profile.major,
    profile.year_of_study,
    profile.interests?.length > 0,
    profile.looking_for?.length > 0,
    stats.skillsVerified > 0,
    stats.projectsCompleted > 0
  ].filter(Boolean).length / 9 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-card to-dark-bg p-4 lg:p-6">
      {/* Two-Column Layout: Header and About/Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Header (2/3 width) */}
        <div className="lg:col-span-2">
          <div 
            ref={headerRef}
            className={cn(
              "relative overflow-hidden bg-dark-card rounded-2xl h-full",
              highlightedSection === 'header' && "ring-2 ring-neon-green shadow-[0_0_30px_rgba(167,243,208,0.3)]"
            )}
          >
            {/* Cover Photo Section - Edge to edge within card */}
            <div className="relative h-48 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-neon-green/20">
              {profile.cover_photo_url && (
                <Image
                  src={profile.cover_photo_url}
                  alt="Cover photo"
                  fill
                  className="object-cover"
                  priority
                />
              )}
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 via-transparent to-transparent" />
            </div>
            
            {/* Profile Content */}
            <div className="relative px-6 pb-6">
              <div className="flex">
                {/* Left Section - Avatar, Name, Headline */}
                <div className="flex-1">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="relative -mt-16">
                      <div className="rounded-full border-4 border-dark-card bg-dark-card p-1">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.full_name || 'User'}
                            width={120}
                            height={120}
                            className="rounded-full"
                            priority
                          />
                        ) : (
                          <AvatarFallback
                            name={profile.full_name}
                            className="rounded-full"
                            size={120}
                          />
                        )}
                      </div>
                      {profileCompletion >= 80 && (
                        <div className="absolute bottom-0 right-0 bg-neon-green text-black p-1.5 rounded-full border-4 border-dark-card">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="pt-4">
                      <h1 className="text-2xl font-bold text-white">
                        {profile.full_name || profile.username}
                      </h1>
                      <p className="text-gray-400 mt-1">
                        {profile.major && <span>{profile.major}</span>}
                        {profile.major && profile.year_of_study && <span className="mx-1">•</span>}
                        {profile.year_of_study && <span>Class of {profile.year_of_study}</span>}
                      </p>
                      <div 
                        ref={statsRef}
                        className="flex items-center gap-4 text-sm text-gray-500 mt-2"
                      >
                        <span>{stats.projectsCompleted} Projects Completed</span>
                        <span>•</span>
                        <span>{stats.skillsVerified} Verified Skills</span>
                      </div>
                    </div>
                  </div>

                  {/* Headline Section */}
                  <div className="mt-4">
                    <p className="text-lg text-gray-300">
                      {profile.tagline || (
                        <span className="text-gray-500 italic">
                          {isOwnProfile ? "Add a professional headline" : "No headline yet"}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Open To Button */}
                  <div className="mt-4">
                    {profile.open_to_opportunities ? (
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full hover:bg-green-500/20 transition-colors">
                        <Sparkles className="w-4 h-4" />
                        Open to Opportunities
                      </button>
                    ) : isOwnProfile && (
                      <button className="flex items-center gap-2 px-4 py-2 text-gray-400 border border-dark-border rounded-full hover:bg-dark-surface transition-colors">
                        <Sparkles className="w-4 h-4" />
                        Set status
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Section - Organizations and Actions */}
                <div className="flex flex-col items-end gap-4">
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    {isOwnProfile ? (
                      <Link
                        href="/dashboard/profile/edit"
                        className="flex items-center gap-2 px-4 py-2 bg-neon-green text-black font-medium rounded-lg hover:bg-neon-green/90 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Link>
                    ) : (
                      <button className="flex items-center gap-2 px-4 py-2 bg-neon-green text-black font-medium rounded-lg hover:bg-neon-green/90 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    )}
                    <button
                      onClick={handleShare}
                      className="p-2 bg-dark-surface hover:bg-dark-card border border-dark-border rounded-lg transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDownloadResume}
                      className="p-2 bg-dark-surface hover:bg-dark-card border border-dark-border rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Organization Badges */}
                  {profile.organization_members?.filter((m: any) => 
                    ['president', 'vice_president', 'treasurer', 'secretary', 'admin', 'leader'].includes(m.role)
                  ).length > 0 && (
                    <div className="space-y-2">
                      {profile.organization_members?.filter((m: any) => 
                        ['president', 'vice_president', 'treasurer', 'secretary', 'admin', 'leader'].includes(m.role)
                      ).slice(0, 2).map((membership: any) => (
                        <Link
                          key={membership.organization_id}
                          href={`/dashboard/org/${membership.organizations.slug}`}
                          className="block px-3 py-2 bg-dark-surface rounded-lg hover:bg-dark-card transition-colors"
                        >
                          <div className="text-sm font-medium text-white">
                            {membership.organizations.name}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {membership.role.replace('_', ' ')}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - About Me and Top Skills (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* About Me / Bio */}
            <GlassCard>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  About Me
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {profile.bio || (
                    <span className="text-gray-500 italic">
                      {isOwnProfile ? "Add a bio to introduce yourself" : "No bio yet"}
                    </span>
                  )}
                </p>
                
                {/* Looking for */}
                {profile.looking_for && profile.looking_for.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-3 h-3 text-neon-green" />
                      <span className="text-xs font-semibold text-gray-300">Looking for:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.looking_for.map((item: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-dark-surface text-xs text-gray-300 rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {isOwnProfile && !profile.bio && (
                  <Link
                    href="/dashboard/profile/edit"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-neon-green hover:text-neon-green/80 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Add Bio
                  </Link>
                )}
              </div>
            </GlassCard>

            {/* Top Skills - Compact */}
            <GlassCard>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-neon-green" />
                  Top Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.member_skills?.slice(0, 7).map((memberSkill: any) => (
                    <div 
                      key={memberSkill.skill_id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-dark-surface rounded-full text-sm"
                    >
                      <span className="text-white">{memberSkill.skills.name}</span>
                      {memberSkill.verified && (
                        <CheckCircle2 className="w-3 h-3 text-neon-green" />
                      )}
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>
                {profile.member_skills?.length > 7 && (
                  <Link
                    href="/dashboard/skills"
                    className="inline-block text-sm text-neon-green hover:text-neon-green/80 mt-3 transition-colors"
                  >
                    View all {profile.member_skills.length} skills →
                  </Link>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Featured Projects - Full Width */}
      <div className="mt-6">
        <GlassCard className="p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Featured Projects</h2>
          {contributions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributions.slice(0, 3).map((contribution: any) => (
                <GlassCard key={contribution.id} className="group hover:ring-1 hover:ring-neon-green/50 transition-all duration-300">
                  {/* Visual placeholder - future: actual project images */}
                  <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center rounded-t-lg">
                    <div className="text-4xl font-bold text-white/20">
                      {contribution.name?.charAt(0) || 'P'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1 line-clamp-1">{contribution.name}</h3>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {contribution.achievement || contribution.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Briefcase className="w-3 h-3" />
                      <span>{contribution.internal_projects?.organizations?.name}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-surface flex items-center justify-center">
                <Star className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-4">No completed projects yet</p>
              <p className="text-sm text-gray-500 mb-6">
                Start contributing to build your portfolio!
              </p>
              <Link 
                href="/dashboard/discover"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90 transition-colors font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Discover Projects
              </Link>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';