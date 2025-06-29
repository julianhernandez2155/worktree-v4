'use client';

import { 
  Bell, 
  Settings, 
  Search,
  Menu,
  Compass,
  Building,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface TopNavBarProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  currentOrg?: any;
}

export function TopNavBar({ onMenuClick, onSearchClick, currentOrg }: TopNavBarProps) {
  const pathname = usePathname();
  const [hasNotifications, setHasNotifications] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadUserOrganizations();
  }, []);

  const loadUserOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organization:organizations (
            id,
            slug,
            name
          )
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        const orgs = data.map(item => item.organization).filter(Boolean);
        setOrganizations(orgs);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  // Get the org dashboard link - use current org or first org
  const getOrgDashboardLink = () => {
    if (currentOrg?.slug) {
      return `/dashboard/org/${currentOrg.slug}`;
    }
    if (organizations.length > 0) {
      return `/dashboard/org/${organizations[0].slug}`;
    }
    return '/dashboard'; // Fallback to main dashboard
  };

  return (
    <header className="glass-surface border-b border-dark-border">
      <div className="flex items-center px-4 lg:px-6 h-16">
        {/* Left section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo/Brand - visible on desktop */}
          <Link href="/" className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
              <span className="text-dark-bg font-bold text-sm">W</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
              Worktree
            </span>
          </Link>
        </div>

        {/* Center section - Main navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Discover */}
          <Link 
            href="/discover"
            className={cn(
              "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors",
              pathname.startsWith('/discover')
                ? "bg-neon-green/20 text-neon-green"
                : "hover:bg-dark-card text-gray-300 hover:text-white"
            )}
            title="Discover"
          >
            <Compass className="w-5 h-5" />
            <span className="text-sm font-medium hidden md:inline">Discover</span>
          </Link>

          {/* Organization Dashboard */}
          {organizations.length > 0 && (
            <Link 
              href={getOrgDashboardLink()}
              className={cn(
                "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors",
                pathname.includes('/dashboard/org/')
                  ? "bg-neon-green/20 text-neon-green"
                  : "hover:bg-dark-card text-gray-300 hover:text-white"
              )}
              title="Organizations"
            >
              <Building className="w-5 h-5" />
              <span className="text-sm font-medium hidden md:inline">Organizations</span>
            </Link>
          )}

          {/* Portfolio */}
          <Link 
            href="/portfolio"
            className={cn(
              "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors",
              pathname.startsWith('/portfolio')
                ? "bg-neon-green/20 text-neon-green"
                : "hover:bg-dark-card text-gray-300 hover:text-white"
            )}
            title="Portfolio"
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-sm font-medium hidden md:inline">Portfolio</span>
          </Link>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* Search bar - hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2 bg-dark-surface px-4 py-2 rounded-lg w-80">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm flex-1 placeholder-gray-500"
              onFocus={onSearchClick}
            />
            <kbd className="text-xs bg-dark-card px-2 py-1 rounded text-gray-400">⌘K</kbd>
          </div>

          {/* Command palette button on mobile */}
          <button
            onClick={onSearchClick}
            className="lg:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-dark-card rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-neon-coral rounded-full" />
            )}
          </button>

          {/* Settings */}
          <Link 
            href="/settings"
            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* User avatar */}
          <Link 
            href="/profile"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green to-neon-blue"
          />
        </div>
      </div>
    </header>
  );
}