'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Home,
  Users,
  FolderOpen,
  UserCheck,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  X,
  Compass,
  Grid3x3,
  Bookmark,
  Briefcase,
  Award,
  FileText,
  Globe,
  User,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';


interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  role?: string;
}

interface ContextSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

// Navigation items for different contexts
type NavItem = {
  name: string;
  href: string;
  icon: any;
  isGlobal?: boolean;
};

const orgNavigation: NavItem[] = [
  { name: 'Dashboard', href: '', icon: Home },
  { name: 'My Tasks', href: '/my-tasks', icon: CheckSquare },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Roles', href: '/roles', icon: UserCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Org Profile', href: '/profile', icon: Globe },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const discoverNavigation: NavItem[] = [
  { name: 'For You', href: '/discover', icon: Compass },
  { name: 'All Projects', href: '/discover/all-projects', icon: Grid3x3 },
  { name: 'Saved', href: '/discover/saved', icon: Bookmark },
  { name: 'Applied', href: '/discover/applied', icon: CheckSquare },
];

const portfolioNavigation: NavItem[] = [
  { name: 'Overview', href: '/portfolio', icon: Briefcase },
  { name: 'Projects', href: '/portfolio/projects', icon: FolderOpen },
  { name: 'Skills', href: '/portfolio/skills', icon: BarChart3 },
  { name: 'Achievements', href: '/portfolio/achievements', icon: Award },
  { name: 'Resume', href: '/portfolio/resume', icon: FileText },
];

const profileNavigation: NavItem[] = [
  { name: 'Overview', href: '', icon: User },
  { name: 'Experience', href: '?tab=experience', icon: Briefcase },
  { name: 'Skills', href: '?tab=skills', icon: Award },
  { name: 'Portfolio', href: '?tab=portfolio', icon: BookOpen },
  { name: 'Edit Profile', href: '/dashboard/profile/edit', icon: Settings, isGlobal: true },
];

const defaultNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Profile', href: '/dashboard/profile', icon: User },
  { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function ContextSidebar({ collapsed, onToggle, isMobile = false }: ContextSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const supabase = createClient();

  const orgSlug = pathname.split('/')[3]; // /dashboard/org/[slug]

  useEffect(() => {
    loadUserOrganizations();
  }, []);

  useEffect(() => {
    // Set current org based on URL
    if (orgSlug && organizations.length > 0) {
      const current = organizations.find(org => org.slug === orgSlug);
      setCurrentOrg(current || null);
    }
  }, [orgSlug, organizations]);

  const loadUserOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      // Get user's organizations with their role
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          organization:organizations (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {throw error;}

      const orgs = data?.map(item => {
        const org = item.organization as any;
        return {
          id: org?.id || '',
          name: org?.name || '',
          slug: org?.slug || '',
          logo_url: org?.logo_url,
          role: item.role
        };
      }) as Organization[];

      setOrganizations(orgs || []);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const handleOrgSwitch = (org: Organization) => {
    router.push(`/dashboard/org/${org.slug}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'president':
      case 'admin':
        return 'bg-neon-purple';
      case 'treasurer':
      case 'secretary':
        return 'bg-neon-blue';
      default:
        return 'bg-dark-elevated';
    }
  };

  // Determine which navigation to show
  const getNavigation = () => {
    if (pathname.includes('/dashboard/org/')) {
      return orgNavigation;
    } else if (pathname.startsWith('/discover')) {
      return discoverNavigation;
    } else if (pathname.startsWith('/portfolio')) {
      return portfolioNavigation;
    } else if (pathname.startsWith('/u/')) {
      return profileNavigation;
    }
    return defaultNavigation;
  };

  const navigation = getNavigation();
  const showOrgSection = pathname.includes('/dashboard/org/');

  return (
    <aside className={cn(
      'h-screen bg-dark-surface border-r border-dark-border flex flex-col transition-all duration-300',
      collapsed && !isMobile ? 'w-20' : 'w-72'
    )}>
      {/* Header - Simplified without branding */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-sm font-semibold text-gray-400 uppercase tracking-wider"
              >
                {pathname.includes('/dashboard/org/') ? 'Organization' : 
                 pathname.startsWith('/discover') ? 'Discover' :
                 pathname.startsWith('/portfolio') ? 'Portfolio' :
                 pathname.startsWith('/u/') ? 'Profile' : 'Menu'}
              </motion.h3>
            )}
          </AnimatePresence>
          
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-dark-card rounded-lg transition-colors ml-auto"
          >
            {isMobile ? (
              <X className="w-5 h-5" />
            ) : collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Organizations section (only for org pages) */}
      {showOrgSection && (
        <div className="p-4 space-y-2">
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
              >
                Organizations
              </motion.h3>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            {organizations.map((org) => {
              const isActive = currentOrg?.id === org.id;
              
              return (
                <button
                  key={org.id}
                  onClick={() => handleOrgSwitch(org)}
                  className={cn(
                    'w-full group relative rounded-lg transition-all duration-200',
                    isActive ? 'bg-dark-card' : 'hover:bg-dark-card/50',
                    collapsed && !isMobile ? 'p-2' : 'p-3'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Organization avatar */}
                    <div className={cn(
                      'relative flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center font-semibold',
                      collapsed && !isMobile ? 'w-10 h-10 text-sm' : 'w-10 h-10 text-sm'
                    )}>
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        getInitials(org.name)
                      )}
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-green rounded-r-full" />
                      )}
                    </div>

                    {/* Organization info */}
                    <AnimatePresence mode="wait">
                      {(!collapsed || isMobile) && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium text-sm">{org.name}</div>
                          {org.role && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs',
                                getRoleBadgeColor(org.role)
                              )}>
                                {org.role}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              );
            })}

            {/* Create organization button */}
            <button
              onClick={() => router.push('/dashboard/org/create')}
              className={cn(
                'w-full group rounded-lg border-2 border-dashed border-dark-border hover:border-neon-green/50 transition-all duration-200',
                collapsed && !isMobile ? 'p-2' : 'p-3'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex-shrink-0 rounded-lg bg-dark-card group-hover:bg-neon-green/20 flex items-center justify-center transition-colors',
                  collapsed && !isMobile ? 'w-10 h-10' : 'w-10 h-10'
                )}>
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-neon-green" />
                </div>
                <AnimatePresence mode="wait">
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm text-gray-400 group-hover:text-neon-green"
                    >
                      Create Organization
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-1">
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-4"
            >
              Navigation
            </motion.h3>
          )}
        </AnimatePresence>

        {navigation.map((item) => {
          let href = item.href;
          
          // Handle different navigation contexts
          if (item.isGlobal) {
            // Global links use their href as-is
            href = item.href;
          } else if (pathname.startsWith('/u/')) {
            // Profile pages use the current pathname as base
            const username = pathname.split('/')[2];
            href = item.href.startsWith('?') ? `/u/${username}${item.href}` : `/u/${username}${item.href}`;
          } else if (currentOrg && showOrgSection) {
            // Org pages use org slug
            href = `/dashboard/org/${currentOrg.slug}${item.href}`;
          }
          
          const Icon = item.icon;
          
          // Check if item is active
          let isActive = false;
          if (item.href.startsWith('?')) {
            // For query params, check if current URL matches
            if (typeof window !== 'undefined') {
              const currentQuery = new URLSearchParams(window.location.search);
              const itemQuery = new URLSearchParams(item.href);
              isActive = pathname === href.split('?')[0] && 
                        currentQuery.get('tab') === itemQuery.get('tab');
            }
          } else {
            isActive = pathname === href;
          }
          
          // Special case for overview tab on profile pages
          if (pathname.startsWith('/u/') && item.name === 'Overview') {
            if (typeof window !== 'undefined' && !window.location.search) {
              isActive = true;
            } else if (typeof window === 'undefined') {
              // During SSR, assume overview is active if no query params
              isActive = true;
            }
          }
          
          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                isActive 
                  ? 'bg-dark-card text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-dark-card',
                collapsed && !isMobile && 'justify-center'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {(!collapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-border">
        <button className={cn(
          'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-card transition-all duration-200',
          collapsed && !isMobile && 'justify-center'
        )}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  );
}