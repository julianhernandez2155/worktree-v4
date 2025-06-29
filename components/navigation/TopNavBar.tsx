'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, 
  Settings, 
  Search,
  Menu,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface TopNavBarProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  currentOrg?: any;
}

export function TopNavBar({ onMenuClick, onSearchClick, currentOrg }: TopNavBarProps) {
  const pathname = usePathname();
  const [hasNotifications, setHasNotifications] = useState(true);
  const supabase = createClient();

  return (
    <header className="glass-surface border-b border-dark-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Organization name on mobile */}
          <div className="lg:hidden">
            <h2 className="font-semibold">{currentOrg?.name || 'Worktree'}</h2>
          </div>

          {/* Search bar - hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2 bg-dark-surface px-4 py-2 rounded-lg w-96">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members, projects, skills..."
              className="bg-transparent outline-none text-sm flex-1 placeholder-gray-500"
              onFocus={onSearchClick}
            />
            <kbd className="text-xs bg-dark-card px-2 py-1 rounded text-gray-400">⌘K</kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Command palette button on mobile */}
          <button
            onClick={onSearchClick}
            className="lg:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Discover button */}
          <Link 
            href="/discover"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              pathname.startsWith('/discover')
                ? "bg-neon-green/20 text-neon-green"
                : "hover:bg-dark-card text-gray-300 hover:text-white"
            )}
          >
            <Compass className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Discover</span>
          </Link>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-dark-card rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-neon-coral rounded-full" />
            )}
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-dark-card rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* User avatar */}
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green to-neon-blue" />
        </div>
      </div>
    </header>
  );
}