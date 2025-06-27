'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Home,
  Users,
  FolderOpen,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  role?: string;
}

interface OrgSwitcherProps {
  organizations: Organization[];
  currentOrg: Organization | null;
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '', icon: Home },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Roles', href: '/roles', icon: UserCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function OrgSwitcher({ 
  organizations, 
  currentOrg, 
  collapsed, 
  onToggle,
  isMobile = false 
}: OrgSwitcherProps) {
  const router = useRouter();
  const [showCreateOrg, setShowCreateOrg] = useState(false);

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

  return (
    <aside className={cn(
      'h-screen bg-dark-surface border-r border-dark-border flex flex-col transition-all duration-300',
      collapsed && !isMobile ? 'w-20' : 'w-72'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!collapsed || isMobile ? (
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent"
              >
                Worktree
              </motion.h1>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center"
              >
                <span className="text-dark-bg font-bold">W</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-dark-card rounded-lg transition-colors"
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

      {/* Organizations */}
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
            onClick={() => setShowCreateOrg(true)}
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

      {/* Navigation */}
      {currentOrg && (
        <nav className="flex-1 px-4 pb-4 space-y-1">
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
              >
                Navigation
              </motion.h3>
            )}
          </AnimatePresence>

          {navigation.map((item) => {
            const href = `/dashboard/org/${currentOrg.slug}${item.href}`;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-card transition-all duration-200 group',
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
      )}

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