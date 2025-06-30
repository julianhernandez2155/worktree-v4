'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  CheckSquare,
  Briefcase,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface PersonalSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

// Personal workspace navigation items
const personalNavigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'My Gigs', href: '/dashboard/gigs', icon: Briefcase },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function PersonalSidebar({ collapsed, onToggle, isMobile = false }: PersonalSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className={cn(
      'h-screen bg-dark-surface border-r border-dark-border flex flex-col transition-all duration-300',
      collapsed && !isMobile ? 'w-20' : 'w-72'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-sm font-semibold text-gray-400 uppercase tracking-wider"
            >
              Personal Workspace
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

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {personalNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative',
                isActive 
                  ? 'bg-dark-card text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-dark-card/50',
                collapsed && !isMobile && 'justify-center'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-neon-green rounded-r-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {(!collapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
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
    </aside>
  );
}