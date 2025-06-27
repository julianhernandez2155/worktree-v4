'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Search,
  Users,
  FolderOpen,
  Plus,
  Settings,
  Hash,
  User,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOrg: any;
}

export function CommandPalette({ open, onOpenChange, currentOrg }: CommandPaletteProps) {
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data when palette opens
  useEffect(() => {
    if (open && currentOrg) {
      loadSearchData();
    }
  }, [open, currentOrg]);

  const loadSearchData = async () => {
    if (!currentOrg) return;
    
    setLoading(true);
    try {
      // Load members
      const { data: memberData } = await supabase
        .from('organization_members')
        .select(`
          role,
          user:profiles (
            id,
            full_name,
            avatar_url,
            skills
          )
        `)
        .eq('organization_id', currentOrg.id)
        .limit(10);

      // Load projects
      const { data: projectData } = await supabase
        .from('internal_projects')
        .select('id, name, status')
        .eq('organization_id', currentOrg.id)
        .eq('status', 'active')
        .limit(10);

      setMembers(memberData || []);
      setProjects(projectData || []);
    } catch (error) {
      console.error('Error loading search data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  const suggestions = [
    {
      icon: Plus,
      title: 'Create new project',
      shortcut: '⌘N',
      action: () => router.push(`/dashboard/org/${currentOrg?.slug}/projects/new`),
    },
    {
      icon: Users,
      title: 'Invite member',
      shortcut: '⌘I',
      action: () => router.push(`/dashboard/org/${currentOrg?.slug}/members/invite`),
    },
    {
      icon: FileText,
      title: 'Post a gig',
      shortcut: '⌘G',
      action: () => router.push(`/dashboard/org/${currentOrg?.slug}/gigs/new`),
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border border-dark-border bg-dark-card shadow-2xl">
        <CommandInput
          placeholder="Search members, projects, or type a command..."
          value={search}
          onValueChange={setSearch}
          className="border-0 bg-transparent"
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty className="py-6 text-center text-gray-400">
            No results found.
          </CommandEmpty>

          {/* Quick actions */}
          {!search && (
            <>
              <CommandGroup heading="Quick Actions">
                {suggestions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.title}
                      onSelect={() => runCommand(item.action)}
                      className="cursor-pointer"
                    >
                      <Icon className="mr-3 h-4 w-4 text-gray-400" />
                      <span className="flex-1">{item.title}</span>
                      <kbd className="ml-auto text-xs text-gray-400 bg-dark-surface px-2 py-1 rounded">
                        {item.shortcut}
                      </kbd>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Members */}
          {members.length > 0 && (
            <>
              <CommandGroup heading="Members">
                {members
                  .filter(m => 
                    m.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                    m.user?.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
                  )
                  .slice(0, 5)
                  .map((member) => (
                    <CommandItem
                      key={member.user.id}
                      onSelect={() => runCommand(() => 
                        router.push(`/dashboard/org/${currentOrg?.slug}/members/${member.user.id}`)
                      )}
                      className="cursor-pointer"
                    >
                      <User className="mr-3 h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">{member.user.full_name}</div>
                        {member.user.skills && member.user.skills.length > 0 && (
                          <div className="text-xs text-gray-400">
                            {member.user.skills.slice(0, 3).join(' • ')}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{member.role}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <>
              <CommandGroup heading="Projects">
                {projects
                  .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                  .slice(0, 5)
                  .map((project) => (
                    <CommandItem
                      key={project.id}
                      onSelect={() => runCommand(() => 
                        router.push(`/dashboard/org/${currentOrg?.slug}/projects/${project.id}`)
                      )}
                      className="cursor-pointer"
                    >
                      <FolderOpen className="mr-3 h-4 w-4 text-gray-400" />
                      <span className="flex-1">{project.name}</span>
                      <span className="text-xs text-neon-green">Active</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => 
                router.push(`/dashboard/org/${currentOrg?.slug}`)
              )}
            >
              <Hash className="mr-3 h-4 w-4 text-gray-400" />
              Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => 
                router.push(`/dashboard/org/${currentOrg?.slug}/members`)
              )}
            >
              <Users className="mr-3 h-4 w-4 text-gray-400" />
              Members
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => 
                router.push(`/dashboard/org/${currentOrg?.slug}/projects`)
              )}
            >
              <FolderOpen className="mr-3 h-4 w-4 text-gray-400" />
              Projects
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => 
                router.push(`/dashboard/org/${currentOrg?.slug}/settings`)
              )}
            >
              <Settings className="mr-3 h-4 w-4 text-gray-400" />
              Settings
            </CommandItem>
          </CommandGroup>

          {/* AI Assistant hint */}
          {search.startsWith('?') && (
            <>
              <CommandSeparator />
              <CommandGroup heading="AI Assistant">
                <CommandItem className="cursor-pointer">
                  <Sparkles className="mr-3 h-4 w-4 text-neon-purple" />
                  <span className="flex-1">Ask AI: "{search.slice(1)}"</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer hint */}
        <div className="border-t border-dark-border px-4 py-3">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Type <kbd className="bg-dark-surface px-1.5 py-0.5 rounded">?</kbd> for AI help</span>
            <span>Use <kbd className="bg-dark-surface px-1.5 py-0.5 rounded">↑↓</kbd> to navigate</span>
            <span><kbd className="bg-dark-surface px-1.5 py-0.5 rounded">⏎</kbd> to select</span>
            <span><kbd className="bg-dark-surface px-1.5 py-0.5 rounded">esc</kbd> to close</span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}