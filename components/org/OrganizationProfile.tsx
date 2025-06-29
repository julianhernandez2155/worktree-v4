'use client';

import { motion } from 'framer-motion';
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
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface OrganizationProfileProps {
  organization: any;
  memberCount: number;
  projectCount: number;
  publicProjects: any[];
  isMember: boolean;
  isAdmin: boolean;
}

export function OrganizationProfile({
  organization,
  memberCount,
  projectCount,
  publicProjects,
  isMember,
  isAdmin
}: OrganizationProfileProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'projects' | 'contact'>('about');

  // Format the category nicely
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <GlassCard className="relative overflow-hidden">
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
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {organization.name}
                  </h1>
                  <p className="text-lg text-gray-300 mb-4">
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
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {formatCategory(organization.category)}
                    </span>
                  </div>
                </div>

                {/* Edit button for admins */}
                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-card rounded-lg
                             hover:bg-dark-elevated transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit Profile</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neon-green">{memberCount}</div>
              <div className="text-sm text-gray-400">Active Members</div>
            </div>
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neon-blue">{projectCount}</div>
              <div className="text-sm text-gray-400">Projects</div>
            </div>
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {publicProjects.length}
              </div>
              <div className="text-sm text-gray-400">Open Positions</div>
            </div>
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
            {/* Mission & Vision */}
            <GlassCard>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-neon-green" />
                    Our Mission
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {organization.mission || 
                     "We're dedicated to creating impactful experiences and fostering growth through collaborative projects and innovative solutions."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-neon-blue" />
                    What We Do
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {organization.what_we_do || 
                     "Our organization focuses on hands-on learning, real-world projects, and building a strong community of passionate individuals working together to achieve common goals."}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Values */}
            <GlassCard>
              <div className="p-6">
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
          >
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Current Opportunities
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
                                   transition-colors cursor-pointer"
                        >
                          <h4 className="font-semibold text-white mb-2">
                            {project.name}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {project.public_description || project.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {project.required_commitment_hours 
                                ? `${project.required_commitment_hours}h/week` 
                                : 'Flexible'}
                            </span>
                            <span className="text-neon-green flex items-center gap-1">
                              View Details
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
          >
            <GlassCard>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
                
                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    <span>{organization.website}</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}

                {organization.email && (
                  <a
                    href={`mailto:${organization.email}`}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{organization.email}</span>
                  </a>
                )}

                {organization.location && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="w-5 h-5" />
                    <span>{organization.location}</span>
                  </div>
                )}

                {/* Social Links */}
                <div className="pt-4 border-t border-dark-border">
                  <p className="text-sm text-gray-400 mb-3">Connect with us</p>
                  <div className="flex gap-3">
                    {organization.social_links?.map((link: any) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-dark-surface rounded-lg hover:bg-dark-card transition-colors"
                      >
                        <LinkIcon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}