'use client';

import { 
  Bell, 
  Settings, 
  Search,
  Menu,
  Home,
  Compass,
  Building,
  User,
  LogOut,
  Edit,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface TopNavBarProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  currentOrg?: any;
}

export function TopNavBar({ onMenuClick, onSearchClick, currentOrg }: TopNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasNotifications, _setHasNotifications] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUserOrganizations();
    loadUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
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
          {/* Home */}
          <Link 
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors",
              pathname === '/dashboard' || (pathname.startsWith('/dashboard') && !pathname.includes('/org/'))
                ? "bg-neon-green/20 text-neon-green"
                : "hover:bg-dark-card text-gray-300 hover:text-white"
            )}
            title="Home"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium hidden md:inline">Home</span>
          </Link>

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

          {/* Profile */}
          <Link 
            href={userProfile?.username ? `/u/${userProfile.username}` : '/dashboard/profile'}
            className={cn(
              "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors",
              pathname.startsWith('/u/') || pathname.includes('/profile')
                ? "bg-neon-green/20 text-neon-green"
                : "hover:bg-dark-card text-gray-300 hover:text-white"
            )}
            title="Profile"
          >
            <User className="w-5 h-5" />
            <span className="text-sm font-medium hidden md:inline">Profile</span>
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

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pr-3 hover:bg-dark-card rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-neon-green to-neon-blue">
                {userProfile?.avatar_url ? (
                  <Image
                    src={userProfile.avatar_url}
                    alt={userProfile.full_name || userProfile.username || 'User'}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-4 h-4 text-dark-bg" />
                  </div>
                )}
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-gray-400 transition-transform hidden sm:block",
                showUserMenu && "rotate-180"
              )} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-dark-card border border-dark-border rounded-lg shadow-xl overflow-hidden z-50"
                >
                  {/* User info */}
                  <div className="p-4 border-b border-dark-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-neon-green to-neon-blue">
                        {userProfile?.avatar_url ? (
                          <Image
                            src={userProfile.avatar_url}
                            alt={userProfile.full_name || userProfile.username || 'User'}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-dark-bg" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {userProfile?.full_name || userProfile?.username || 'User'}
                        </p>
                        {userProfile?.username && (
                          <p className="text-xs text-gray-400">@{userProfile.username}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    {userProfile?.username && (
                      <Link
                        href={`/u/${userProfile.username}`}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-dark-surface rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">View Profile</span>
                      </Link>
                    )}
                    
                    <Link
                      href="/dashboard/profile/edit"
                      className="flex items-center gap-3 px-3 py-2 hover:bg-dark-surface rounded-lg transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Edit Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2 hover:bg-dark-surface rounded-lg transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Settings</span>
                    </Link>

                    <hr className="my-2 border-dark-border" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-surface rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}