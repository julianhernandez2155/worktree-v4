'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  FolderOpen,
  Users,
  UserCheck,
  UsersRound,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  X,
  Menu,
  CheckSquare
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { NavGroup } from './NavGroup';
import { NavItem } from './NavItem';
import { OrgHeader } from './OrgHeader';
import { OrgSwitcher } from './OrgSwitcher';
import { AddOrgGatewayModal } from './AddOrgGatewayModal';
import { CreateOrgModal } from '@/components/modals/CreateOrgModal';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  role?: string;
}

interface OrgContextSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

// Admin navigation structure with groups
const adminNavigationStructure = {
  topLevel: [
    { name: 'Dashboard', href: '', icon: Home },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/projects', icon: FolderOpen }
  ],
  groups: [
    {
      title: 'People & Teams',
      key: 'people-teams',
      items: [
        { name: 'Members', href: '/members', icon: Users },
        { name: 'Teams / Cabinets', href: '/teams', icon: UsersRound }
      ]
    },
    {
      title: 'Insights & Admin',
      key: 'insights-admin',
      items: [
        { name: 'Roles & Succession', href: '/roles', icon: UserCheck },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Org Profile', href: '/profile', icon: Globe },
        { name: 'Settings', href: '/settings', icon: Settings }
      ]
    }
  ]
};

// Member navigation structure with groups
const memberNavigationStructure = {
  topLevel: [
    { name: 'Dashboard', href: '', icon: Home },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/projects', icon: FolderOpen }
  ],
  groups: [
    {
      title: 'People & Teams',
      key: 'people-teams',
      items: [
        { name: 'Members', href: '/members', icon: Users },
        { name: 'Teams / Cabinets', href: '/teams', icon: UsersRound }
      ]
    }
  ],
  bottomItems: [
    { name: 'Org Profile', href: '/profile', icon: Globe }
  ]
};

export function OrgContextSidebar({ 
  collapsed, 
  onToggle, 
  isMobile = false 
}: OrgContextSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgSwitcherExpanded, setOrgSwitcherExpanded] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [expandedGroups, setExpandedGroups] = useLocalStorage<Record<string, boolean>>(
    'worktree-org-sidebar-expanded',
    {
      'people-teams': false,
      'insights-admin': false
    }
  );
  const supabase = createClient();

  // Extract org slug from pathname
  const orgSlug = pathname.split('/')[3]; // /dashboard/org/[slug]

  // Load user's organizations
  useEffect(() => {
    const loadUserOrganizations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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

        if (error) throw error;

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

        // Set current org based on URL
        if (orgSlug && orgs) {
          const current = orgs.find(org => org.slug === orgSlug);
          if (current) {
            setCurrentOrg(current);
          }
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    };

    loadUserOrganizations();
  }, [orgSlug]);

  // Determine if user is admin in current organization early for use in effects
  const isAdmin = currentOrg && currentOrg.role && ['admin', 'president'].includes(currentOrg.role);
  const navigationStructure = isAdmin ? adminNavigationStructure : memberNavigationStructure;

  // Auto-expand groups that contain the active page
  useEffect(() => {
    // Only run on client after initial render
    if (typeof window === 'undefined') return;
    
    const activeGroupKey = findActiveGroup(navigationStructure);
    if (activeGroupKey && !expandedGroups[activeGroupKey]) {
      setExpandedGroups(prev => ({ ...prev, [activeGroupKey]: true }));
    }
  }, [pathname, orgSlug, navigationStructure]); // Add dependencies

  const findActiveGroup = (navStructure: typeof adminNavigationStructure) => {
    for (const group of navStructure.groups) {
      const hasActiveChild = group.items.some(item => {
        const fullPath = `/dashboard/org/${orgSlug}${item.href}`;
        return pathname === fullPath;
      });
      if (hasActiveChild) return group.key;
    }
    return null;
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const isNavItemActive = (href: string) => {
    const fullPath = `/dashboard/org/${orgSlug}${href}`;
    return pathname === fullPath;
  };
  
  const activeGroupKey = findActiveGroup(navigationStructure);

  const handleOrgSwitch = (org: Organization) => {
    router.push(`/dashboard/org/${org.slug}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleGatewayChoice = (choice: 'join' | 'create') => {
    setShowGatewayModal(false);
    if (choice === 'create') {
      setShowCreateOrgModal(true);
    } else {
      // Navigate to organizations discovery page
      router.push('/discover/organizations');
    }
  };

  // Close org switcher with ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && orgSwitcherExpanded) {
        setOrgSwitcherExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [orgSwitcherExpanded]);

  return (
    <aside className={cn(
      'h-screen bg-dark-surface border-r border-dark-border flex flex-col transition-all duration-300',
      collapsed && !isMobile ? 'w-20' : 'w-72'
    )}>
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-sm font-semibold text-gray-400 uppercase tracking-wider"
            >
              Workspace
            </motion.h3>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-dark-card rounded-lg transition-colors ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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

      {/* Organization Header */}
      <OrgHeader 
        organization={currentOrg}
        collapsed={collapsed}
        isMobile={isMobile}
        isExpanded={orgSwitcherExpanded}
        onClick={() => setOrgSwitcherExpanded(!orgSwitcherExpanded)}
      />
      
      {/* Organization Switcher Dropdown - Pushes content down */}
      {(!collapsed || isMobile) && (
        <OrgSwitcher
          organizations={organizations}
          currentOrg={currentOrg}
          isExpanded={orgSwitcherExpanded}
          onClose={() => setOrgSwitcherExpanded(false)}
          onOrgSwitch={handleOrgSwitch}
          onAddOrgClick={() => setShowGatewayModal(true)}
          collapsed={collapsed}
          isMobile={isMobile}
        />
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Top-level navigation items */}
        <div className="space-y-1">
          {navigationStructure.topLevel.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              href={`/dashboard/org/${orgSlug}${item.href}`}
              icon={item.icon}
              isActive={isNavItemActive(item.href)}
              collapsed={collapsed}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Grouped navigation items */}
        <div className="space-y-4">
          {navigationStructure.groups.map((group) => (
            <NavGroup
              key={group.key}
              title={group.title}
              isExpanded={expandedGroups?.[group.key] ?? false}
              onToggle={() => toggleGroup(group.key)}
              collapsed={collapsed}
              isMobile={isMobile}
              hasActiveChild={activeGroupKey === group.key}
            >
              {group.items.map((item) => (
                <NavItem
                  key={item.name}
                  name={item.name}
                  href={`/dashboard/org/${orgSlug}${item.href}`}
                  icon={item.icon}
                  isActive={isNavItemActive(item.href)}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </NavGroup>
          ))}
        </div>

        {/* Bottom items for members */}
        {(navigationStructure as any).bottomItems && (
          <div className="mt-4 space-y-1">
            {(navigationStructure as any).bottomItems.map((item: any) => (
              <NavItem
                key={item.name}
                name={item.name}
                href={`/dashboard/org/${orgSlug}${item.href}`}
                icon={item.icon}
                isActive={isNavItemActive(item.href)}
                collapsed={collapsed}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </nav>

      {/* Footer with sign out */}
      <div className="p-4 border-t border-dark-border">
        <button 
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg',
            'text-gray-400 hover:text-white hover:bg-dark-card',
            'transition-all duration-200',
            collapsed && !isMobile && 'justify-center'
          )}
        >
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

      {/* Modals */}
      <AddOrgGatewayModal
        open={showGatewayModal}
        onClose={() => setShowGatewayModal(false)}
        onJoinExisting={() => handleGatewayChoice('join')}
        onCreateNew={() => handleGatewayChoice('create')}
      />

      <CreateOrgModal
        open={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
        onSuccess={(org) => {
          // Refresh organizations list
          setOrganizations(prev => [...prev, { ...org, role: 'admin' }]);
          setShowCreateOrgModal(false);
        }}
      />
    </aside>
  );
}