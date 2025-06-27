'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OrgSwitcher } from './OrgSwitcher';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { 
  Bell, 
  Settings, 
  Search,
  Menu,
  X,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  role?: string;
}

export function OrgLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  // Extract org slug from pathname
  const orgSlug = pathname.split('/')[3]; // /dashboard/org/[slug]

  useEffect(() => {
    loadUserOrganizations();
  }, []);

  useEffect(() => {
    // Keyboard shortcut for command palette
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

      const orgs = data?.map(item => ({
        ...item.organization,
        role: item.role
      })) as Organization[];

      setOrganizations(orgs || []);

      // Set current org based on URL
      if (orgSlug && orgs) {
        const current = orgs.find(org => org.slug === orgSlug);
        setCurrentOrg(current || null);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  return (
    <>
      {/* Command Palette */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen}
        currentOrg={currentOrg}
      />

      <div className="min-h-screen bg-dark-bg flex">
        {/* Desktop Sidebar */}
        <div
          className={cn(
            'hidden lg:flex transition-all duration-300 ease-in-out',
            sidebarOpen ? 'w-72' : 'w-20'
          )}
        >
          <OrgSwitcher
            organizations={organizations}
            currentOrg={currentOrg}
            collapsed={!sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative flex w-72">
              <OrgSwitcher
                organizations={organizations}
                currentOrg={currentOrg}
                collapsed={false}
                onToggle={() => setMobileSidebarOpen(false)}
                isMobile
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="glass-surface border-b border-dark-border">
            <div className="flex items-center justify-between px-4 lg:px-6 h-16">
              {/* Left side */}
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Organization name on mobile */}
                <div className="lg:hidden">
                  <h2 className="font-semibold">{currentOrg?.name}</h2>
                </div>

                {/* Search bar - hidden on mobile */}
                <div className="hidden lg:flex items-center gap-2 bg-dark-surface px-4 py-2 rounded-lg w-96">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members, projects, skills..."
                    className="bg-transparent outline-none text-sm flex-1 placeholder-gray-500"
                    onFocus={() => setCommandPaletteOpen(true)}
                  />
                  <kbd className="text-xs bg-dark-card px-2 py-1 rounded text-gray-400">⌘K</kbd>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">
                {/* Command palette button on mobile */}
                <button
                  onClick={() => setCommandPaletteOpen(true)}
                  className="lg:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-dark-card rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-neon-coral rounded-full" />
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

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}