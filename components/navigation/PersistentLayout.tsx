'use client';

import { useState, useEffect } from 'react';

import { CommandPalette } from '@/components/ui/CommandPalette';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/lib/contexts/SidebarContext';

import { ContextSidebar } from './ContextSidebar';
import { TopNavBar } from './TopNavBar';

interface PersistentLayoutProps {
  children: React.ReactNode;
}

export function PersistentLayout({ children }: PersistentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarProvider value={{ sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen }}>
      <>
        {/* Command Palette */}
        <CommandPalette 
          open={commandPaletteOpen} 
          onOpenChange={setCommandPaletteOpen}
        />

        <div className="min-h-screen bg-dark-bg flex">
          {/* Desktop Sidebar */}
          <div
            className={cn(
              'hidden lg:flex transition-all duration-300 ease-in-out',
              sidebarOpen ? 'w-72' : 'w-20'
            )}
          >
            <ContextSidebar
              collapsed={!sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>

          {/* Mobile Sidebar Overlay */}
          {mobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
              <div className="relative flex w-72">
                <ContextSidebar
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
            <TopNavBar 
              onMenuClick={() => setMobileSidebarOpen(true)}
              onSearchClick={() => setCommandPaletteOpen(true)}
            />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-4 lg:p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </>
    </SidebarProvider>
  );
}