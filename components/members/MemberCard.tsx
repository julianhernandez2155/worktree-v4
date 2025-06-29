'use client';

import { 
  User, 
  Calendar,
  GraduationCap,
  Briefcase,
  ChevronRight,
  MessageSquare,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';


interface MemberCardProps {
  member: {
    id: string;
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
      skills: string[];
      year_of_study?: string;
      major?: string;
    };
    role: string;
    joined_at: string;
  };
  viewMode: 'grid' | 'list';
  orgSlug: string;
}

export function MemberCard({ member, viewMode, orgSlug }: MemberCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'president':
      case 'admin':
        return 'bg-neon-purple/20 text-neon-purple border-neon-purple/50';
      case 'treasurer':
      case 'secretary':
      case 'tech_lead':
        return 'bg-neon-blue/20 text-neon-blue border-neon-blue/50';
      case 'member':
        return 'bg-dark-elevated text-gray-300 border-dark-border';
      default:
        return 'bg-neon-green/20 text-neon-green border-neon-green/50';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatJoinDate = (date: string) => {
    const joinDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {return `${diffDays} days ago`;}
    if (diffDays < 365) {return `${Math.floor(diffDays / 30)} months ago`;}
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/dashboard/org/${orgSlug}/members/${member.user.id}`}>
        <GlassCard className="group cursor-pointer p-4 hover:shadow-dark-lg">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center font-semibold">
                {member.user.avatar_url ? (
                  <img 
                    src={member.user.avatar_url} 
                    alt={member.user.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(member.user.full_name)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-bg" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{member.user.full_name}</h3>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs border",
                  getRoleBadgeColor(member.role)
                )}>
                  {formatRole(member.role)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {member.user.major && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {member.user.major}
                  </span>
                )}
                {member.user.year_of_study && (
                  <span>{member.user.year_of_study}</span>
                )}
              </div>
            </div>

            {/* Skills preview */}
            <div className="hidden md:flex items-center gap-2">
              {member.user.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-dark-surface rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
              {member.user.skills.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{member.user.skills.length - 3}
                </span>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </GlassCard>
      </Link>
    );
  }

  // Grid view
  return (
    <GlassCard className="group cursor-pointer relative overflow-hidden h-full">
      {/* Quick actions menu */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowActions(!showActions);
          }}
          className="p-2 rounded-lg bg-dark-surface/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <Link href={`/dashboard/org/${orgSlug}/members/${member.user.id}`}>
        <div className="p-6">
          {/* Avatar and basic info */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xl font-semibold">
                {member.user.avatar_url ? (
                  <img 
                    src={member.user.avatar_url} 
                    alt={member.user.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(member.user.full_name)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-dark-bg" />
            </div>

            <h3 className="font-semibold text-lg mb-1">{member.user.full_name}</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm border",
              getRoleBadgeColor(member.role)
            )}>
              {formatRole(member.role)}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-gray-400 mb-4">
            {member.user.major && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>{member.user.major}</span>
              </div>
            )}
            {member.user.year_of_study && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{member.user.year_of_study}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatJoinDate(member.joined_at)}</span>
            </div>
          </div>

          {/* Skills */}
          {member.user.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Skills
              </h4>
              <div className="flex flex-wrap gap-1">
                {member.user.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-dark-surface rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {member.user.skills.length > 4 && (
                  <span className="px-2 py-1 text-xs text-gray-400">
                    +{member.user.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-dark-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <button className="flex-1 p-2 bg-dark-surface/80 backdrop-blur-sm rounded-lg hover:bg-dark-elevated transition-colors flex items-center justify-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button className="flex-1 p-2 bg-dark-surface/80 backdrop-blur-sm rounded-lg hover:bg-dark-elevated transition-colors flex items-center justify-center gap-2 text-sm">
                <Briefcase className="w-4 h-4" />
                Assign
              </button>
            </div>
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}