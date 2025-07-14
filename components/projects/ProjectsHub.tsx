'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus,
  Search,
  Users,
  Check,
  LayoutList,
  LayoutGrid
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

import { ProjectListViewGrid } from './ProjectListViewGrid';
import { ProjectBoardView } from './ProjectBoardView';
import { ProjectBoardViewDnD } from './ProjectBoardViewDnD';
import { ProjectDetailPane } from './ProjectDetailPane';
import { ProjectFilters } from './ProjectFilters';
import { CreateProjectModalLinear } from './CreateProjectModalLinear';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { BulkActionsBar } from './BulkActionsBar';
import { RealtimeIndicator } from '@/components/ui/RealtimeIndicator';
import { DisplayMenu, type ViewType, type GroupBy, type OrderBy } from './DisplayMenu';
import { projectColumns, defaultColumns } from './projectColumns';
import { EmptyProjectsState } from './EmptyProjectsState';
import { SmartInsightsBar } from './SmartInsightsBar';

interface Project {
  id: string;
  name: string;
  description: string;
  timeline: 'this_week' | 'this_month' | 'this_semester';
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  visibility: 'internal' | 'public';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  team_id?: string;
  lead_id?: string;
  due_date?: string;
  labels?: string[];
  created_at: string;
  updated_at?: string;
  organization_id: string;
  
  // Computed fields from joins
  team?: {
    id: string;
    name: string;
    color: string;
  };
  lead?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  tasks?: any[];
  members?: any[];
  task_stats?: {
    total: number;
    completed: number;
    assigned: number;
    skill_gaps: number;
  };
}

interface ProjectsHubProps {
  orgSlug: string;
}

export function ProjectsHub({ orgSlug }: ProjectsHubProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDetailPaneExpanded, setIsDetailPaneExpanded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [bulkSelectedProjects, setBulkSelectedProjects] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState<Date | undefined>();
  
  // View preferences with persistence
  const [viewType, setViewType] = useLocalStorage<ViewType>('worktree-projects-view', 'list');
  const [groupBy, setGroupBy] = useLocalStorage<GroupBy>('worktree-projects-groupby', 'none');
  const [orderBy, setOrderBy] = useLocalStorage<OrderBy>('worktree-projects-orderby', 'created_at');
  
  // Check if we need to reset columns to new defaults
  const [selectedColumns, setSelectedColumns] = useLocalStorage<string[]>(
    'worktree-projects-columns',
    defaultColumns
  );
  
  // Reset columns if they contain old defaults
  useEffect(() => {
    if (selectedColumns.includes('team') || selectedColumns.includes('skill_gaps')) {
      // Reset to new minimal defaults
      setSelectedColumns(['name', 'lead', 'progress', 'due_date']);
    }
  }, []);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyProjects, setShowMyProjects] = useState(true); // Default to My Projects
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  // Refs for keyboard navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedIndex = useRef<number>(-1);
  const statusChangeMode = useRef<boolean>(false);
  
  const supabase = createClient();
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');

  // Load projects with all related data
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get organization
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();
        
      if (!org) return;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user's role in this organization
      if (user && org) {
        const { data: memberData } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', org.id)
          .eq('user_id', user.id)
          .single();
        
        if (memberData) {
          setCurrentUserRole(memberData.role);
        }
      }
      
      // Build query with team join - simplified without nested user profiles
      let query = supabase
        .from('internal_projects')
        .select(`
          *,
          team:organization_teams(id, name, color),
          lead:profiles!lead_id(id, full_name, avatar_url),
          contributions(
            id,
            task_name,
            task_description,
            status,
            priority,
            due_date,
            created_at,
            subtasks,
            contributor_id,
            task_assignees(
              assignee_id,
              is_primary,
              user:profiles!assignee_id(id, full_name, avatar_url)
            ),
            task_required_skills(
              skill_id,
              skill:skills!skill_id(id, name)
            )
          )
        `)
        .eq('organization_id', org.id);
      
      // Don't filter by user at query level - we'll do it client-side
      // to include projects where user is assigned to tasks
      
      if (selectedTeamId) {
        query = query.eq('team_id', selectedTeamId);
      }
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }
      
      if (selectedPriority) {
        query = query.eq('priority', selectedPriority);
      }
      
      const { data: projectsData, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get all unique user IDs from assignees
      const allUserIds = new Set<string>();
      projectsData?.forEach((project: any) => {
        project.contributions?.forEach((task: any) => {
          task.task_assignees?.forEach((assignee: any) => {
            if (assignee.assignee_id) {
              allUserIds.add(assignee.assignee_id);
            }
          });
        });
      });

      // Fetch user profiles for all assignees
      let userProfiles = new Map();
      if (allUserIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', Array.from(allUserIds));
        
        profiles?.forEach(profile => {
          userProfiles.set(profile.id, profile);
        });
      }

      // Process projects to calculate stats
      const processedProjects = (projectsData || []).map(project => {
        const tasks = project.contributions || [];
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
        const assignedTasks = tasks.filter((t: any) => t.contributor_id).length;
        
        // Calculate skill gaps (tasks with required skills but no assignee)
        const skillGaps = tasks.filter((t: any) => 
          t.task_required_skills?.length > 0 && !t.contributor_id
        ).length;
        
        // Get unique members from task assignees
        const uniqueMembers = new Map();
        tasks.forEach((task: any) => {
          task.task_assignees?.forEach((assignee: any) => {
            if (assignee.assignee_id && userProfiles.has(assignee.assignee_id)) {
              uniqueMembers.set(assignee.assignee_id, userProfiles.get(assignee.assignee_id));
            }
          });
        });
        
        return {
          ...project,
          task_stats: {
            total: totalTasks,
            completed: completedTasks,
            assigned: assignedTasks,
            skill_gaps: skillGaps
          },
          members: Array.from(uniqueMembers.values())
        };
      });
      
      // Apply "My Projects" filter client-side
      let filteredProjects = processedProjects;
      if (showMyProjects && user) {
        filteredProjects = processedProjects.filter(project => {
          // Check if user is lead
          if (project.lead_id === user.id) return true;
          
          // Check if user is assigned to any tasks
          const userAssignedToTask = project.contributions?.some((task: any) =>
            task.task_assignees?.some((assignee: any) => assignee.assignee_id === user.id)
          );
          
          return userAssignedToTask;
        });
      }
      
      setProjects(filteredProjects);
      
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, [orgSlug, showMyProjects, selectedTeamId, selectedStatus, selectedPriority]);

  // Load teams for filtering
  const loadTeams = useCallback(async () => {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();
        
      if (!org) return;
      
      const { data: teamsData } = await supabase
        .from('organization_teams')
        .select('*')
        .eq('organization_id', org.id)
        .order('name');
        
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadProjects();
    loadTeams();
  }, [loadProjects, loadTeams]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!projects.length) return;

    // Get organization ID
    const orgId = projects[0]?.organization_id;
    if (!orgId) return;

    // Subscribe to project changes
    const projectSubscription = supabase
      .channel('project-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internal_projects',
          filter: `organization_id=eq.${orgId}`
        },
        (payload) => {
          console.log('Project change:', payload);
          
          // Update last update time
          setLastRealtimeUpdate(new Date());
          
          // Handle different events without full reload
          if (payload.eventType === 'UPDATE' && payload.new) {
            // Update the specific project in local state
            setProjects(prevProjects => 
              prevProjects.map(p => 
                p.id === payload.new.id 
                  ? { ...p, ...payload.new }
                  : p
              )
            );
          } else if (payload.eventType === 'INSERT' && payload.new) {
            // Add new project to local state
            setProjects(prevProjects => [...prevProjects, payload.new as Project]);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            // Remove deleted project from local state
            setProjects(prevProjects => 
              prevProjects.filter(p => p.id !== payload.old.id)
            );
          }
        }
      )
      .on('system', { event: 'connected' }, () => {
        setIsRealtimeConnected(true);
      })
      .on('system', { event: 'disconnected' }, () => {
        setIsRealtimeConnected(false);
      })
      .subscribe();

    // Subscribe to task changes (for task stats updates)
    const taskSubscription = supabase
      .channel('task-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contributions'
        },
        (payload) => {
          console.log('Task change:', payload);
          
          // Check if this task belongs to one of our projects
          const projectId = payload.new?.project_id || payload.old?.project_id;
          const affectedProject = projects.find(p => p.id === projectId);
          
          if (affectedProject) {
            setLastRealtimeUpdate(new Date());
            // Only reload the specific project's task stats
            // For now, we'll skip this to avoid complexity
            // In a production app, you'd fetch just the task stats for this project
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(projectSubscription);
      supabase.removeChannel(taskSubscription);
    };
  }, [projects, supabase, loadProjects]);

  // Filter projects based on search
  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.team?.name.toLowerCase().includes(query) ||
      project.lead?.full_name.toLowerCase().includes(query)
    );
  });

  // Apply sorting based on orderBy
  const sortedFilteredProjects = [...filteredProjects].sort((a, b) => {
    // Always prioritize overdue projects first
    const aOverdue = a.due_date && new Date(a.due_date) < new Date();
    const bOverdue = b.due_date && new Date(b.due_date) < new Date();
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Then apply selected ordering
    switch (orderBy) {
      case 'due_date':
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        return aPriority - bPriority;
      
      case 'name':
        return a.name.localeCompare(b.name);
      
      case 'created_at':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Group projects
  const groupedProjects = groupBy === 'none' 
    ? { 'All Projects': sortedFilteredProjects }
    : sortedFilteredProjects.reduce((acc, project) => {
        let key = '';
        switch (groupBy) {
          case 'status':
            key = project.status || 'No Status';
            break;
          case 'team':
            key = project.team?.name || 'No Team';
            break;
          case 'priority':
            key = project.priority || 'No Priority';
            break;
          case 'timeline':
            key = project.timeline || 'No Timeline';
            break;
        }
        if (!acc[key]) acc[key] = [];
        acc[key].push(project);
        return acc;
      }, {} as Record<string, Project[]>);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Handle bulk selection change
  const handleBulkSelectionChange = useCallback((selectedIds: Set<string>) => {
    setBulkSelectedProjects(selectedIds);
    setShowBulkActions(selectedIds.size > 0);
  }, []);

  // Navigate projects with keyboard
  const navigateToProject = useCallback((direction: 'up' | 'down' | 'enter') => {
    if (filteredProjects.length === 0) return;

    if (direction === 'enter' && selectedIndex.current >= 0) {
      const project = filteredProjects[selectedIndex.current];
      if (project) {
        setSelectedProjectId(project.id);
      }
      return;
    }

    const currentIndex = selectedIndex.current;
    let newIndex = currentIndex;

    if (direction === 'down') {
      newIndex = currentIndex < filteredProjects.length - 1 ? currentIndex + 1 : 0;
    } else if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredProjects.length - 1;
    }

    selectedIndex.current = newIndex;
    const project = filteredProjects[newIndex];
    if (project && viewType === 'list') {
      // Scroll the project into view
      const element = document.querySelector(`[data-project-id="${project.id}"]`);
      element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [filteredProjects, viewType]);

  // Handle quick status change
  const handleQuickStatusChange = useCallback(async (newStatus: string) => {
    if (!selectedProjectId || selectedIndex.current < 0) return;
    
    const project = filteredProjects[selectedIndex.current];
    if (!project) return;

    try {
      const { error } = await supabase
        .from('internal_projects')
        .update({ status: newStatus })
        .eq('id', project.id);

      if (error) throw error;
      
      // Refresh projects
      loadProjects();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }, [selectedProjectId, filteredProjects, supabase, loadProjects]);

  // Define keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      cmd: true,
      handler: () => {
        setIsSearchExpanded(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      },
      description: 'Focus search'
    },
    {
      key: 'Escape',
      handler: () => {
        if (selectedProjectId) {
          setSelectedProjectId(null);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        } else if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
          if (!searchQuery) {
            setIsSearchExpanded(false);
          }
        } else if (isSearchExpanded && !searchQuery) {
          setIsSearchExpanded(false);
        }
      },
      description: 'Close panel/modal or unfocus search'
    },
    {
      key: 'n',
      handler: () => {
        if (!showCreateModal) {
          setShowCreateModal(true);
        }
      },
      description: 'Create new project'
    },
    {
      key: 'ArrowDown',
      handler: () => navigateToProject('down'),
      description: 'Next project'
    },
    {
      key: 'ArrowUp', 
      handler: () => navigateToProject('up'),
      description: 'Previous project'
    },
    {
      key: 'Enter',
      handler: () => navigateToProject('enter'),
      description: 'Open selected project'
    },
    {
      key: '1',
      handler: () => setViewType('list'),
      description: 'List view'
    },
    {
      key: '2',
      handler: () => setViewType('board'),
      description: 'Board view'
    },
    {
      key: 'm',
      handler: () => setShowMyProjects(!showMyProjects),
      description: 'Toggle my projects'
    },
    {
      key: 'g',
      handler: () => {
        // Cycle through grouping options
        const groupOptions: GroupBy[] = ['none', 'status', 'team', 'priority', 'timeline'];
        const currentIndex = groupOptions.indexOf(groupBy);
        const nextIndex = (currentIndex + 1) % groupOptions.length;
        setGroupBy(groupOptions[nextIndex]);
      },
      description: 'Cycle grouping'
    },
    {
      key: '?',
      shift: true,
      handler: () => setShowShortcutsModal(true),
      description: 'Show keyboard shortcuts'
    },
    // Quick status changes
    {
      key: 's',
      handler: () => {
        statusChangeMode.current = true;
      },
      description: 'Enter status change mode'
    },
    {
      key: '1',
      handler: () => {
        if (statusChangeMode.current) {
          handleQuickStatusChange('planning');
          statusChangeMode.current = false;
        } else {
          setViewMode('list');
        }
      },
      description: 'Planning status / List view'
    },
    {
      key: '2',
      handler: () => {
        if (statusChangeMode.current) {
          handleQuickStatusChange('active');
          statusChangeMode.current = false;
        } else {
          setViewMode('board');
        }
      },
      description: 'Active status / Board view'
    },
    {
      key: '3',
      handler: () => {
        if (statusChangeMode.current) {
          handleQuickStatusChange('on_hold');
          statusChangeMode.current = false;
        }
      },
      description: 'On Hold status'
    },
    {
      key: '4',
      handler: () => {
        if (statusChangeMode.current) {
          handleQuickStatusChange('completed');
          statusChangeMode.current = false;
        }
      },
      description: 'Completed status'
    },
    {
      key: 'a',
      cmd: true,
      handler: () => {
        // Select all visible projects
        const allIds = new Set(sortedFilteredProjects.map(p => p.id));
        setBulkSelectedProjects(allIds);
        setShowBulkActions(true);
      },
      description: 'Select all projects'
    },
    {
      key: 'Delete',
      handler: () => {
        if (bulkSelectedProjects.size > 0) {
          // Trigger bulk delete
          const bulkBar = document.querySelector('[data-bulk-delete]') as HTMLButtonElement;
          bulkBar?.click();
        }
      },
      description: 'Delete selected projects'
    }
  ], !loading && !showCreateModal);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Header and Filters Section */}
      <div className="flex-shrink-0">
        {/* Header */}
        <div className="mb-6">
          {/* Smart Insights Bar */}
          <SmartInsightsBar projects={projects} className="mb-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Projects Hub</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-400 mt-1">
                  Manage and track all organization projects
                </p>
                <RealtimeIndicator 
                  isConnected={isRealtimeConnected} 
                  lastUpdate={lastRealtimeUpdate} 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Type Toggle */}
              <div className="flex items-center bg-dark-card border border-dark-border rounded-lg p-1">
                <button
                  onClick={() => setViewType('list')}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-colors text-sm font-medium flex items-center gap-2",
                    viewType === 'list' 
                      ? "bg-neon-green/20 text-neon-green" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <LayoutList className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setViewType('board')}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-colors text-sm font-medium flex items-center gap-2",
                    viewType === 'board' 
                      ? "bg-neon-green/20 text-neon-green" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Board
                </button>
              </div>
              
              {/* Display Menu */}
              <DisplayMenu
                viewType={viewType}
                onViewTypeChange={setViewType}
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
                orderBy={orderBy}
                onOrderByChange={setOrderBy}
                selectedColumns={selectedColumns}
                onColumnsChange={setSelectedColumns}
                availableColumns={projectColumns}
              />
              
              <NeonButton
                onClick={() => setShowCreateModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Project
              </NeonButton>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-3">
            {/* Expandable Search */}
            <AnimatePresence mode="wait">
              {isSearchExpanded ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "24rem", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) setIsSearchExpanded(false);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                    autoFocus
                  />
                </motion.div>
              ) : (
                <button
                  onClick={() => {
                    setIsSearchExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }}
                  className="p-2 rounded-lg bg-dark-card border border-dark-border hover:border-gray-600 transition-colors"
                  title="Search projects (⌘K)"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </AnimatePresence>

            {/* Project Filter Toggle */}
            <div className="flex items-center bg-dark-card border border-dark-border rounded-lg p-1">
              <button
                onClick={() => setShowMyProjects(true)}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors text-sm font-medium",
                  showMyProjects 
                    ? "bg-neon-green/20 text-neon-green" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                My Projects
              </button>
              <button
                onClick={() => setShowMyProjects(false)}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors text-sm font-medium",
                  !showMyProjects 
                    ? "bg-neon-green/20 text-neon-green" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                All Projects
              </button>
            </div>


            {/* Team Filter */}
            <ProjectFilters
              teams={teams}
              selectedTeamId={selectedTeamId}
              onTeamChange={setSelectedTeamId}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Empty State */}
        {!loading && projects.length === 0 ? (
          <EmptyProjectsState
            onCreateProject={() => setShowCreateModal(true)}
            isAdmin={['admin', 'president'].includes(currentUserRole)}
          />
        ) : (
          /* Projects View */
          <div className={cn(
            "h-full overflow-hidden transition-all duration-300",
            selectedProjectId && !isDetailPaneExpanded ? "mr-[600px]" : "mr-0",
            isDetailPaneExpanded && "opacity-0 pointer-events-none"
          )}>
              {viewType === 'list' ? (
              <ProjectListViewGrid
                projects={sortedFilteredProjects}
                groupedProjects={groupedProjects}
                groupBy={groupBy}
                onProjectClick={setSelectedProjectId}
                selectedProjectId={selectedProjectId}
                loading={loading}
                onProjectUpdate={loadProjects}
                onSelectionChange={handleBulkSelectionChange}
                showCheckboxes={showBulkActions}
                selectedColumns={selectedColumns}
                availableColumns={projectColumns}
              />
            ) : (
              <ProjectBoardViewDnD
                projects={sortedFilteredProjects}
                onProjectClick={setSelectedProjectId}
                selectedProjectId={selectedProjectId}
                loading={loading}
                onProjectUpdate={(updatedProject) => {
                  // Update the local state without reloading
                  setProjects(prevProjects => 
                    prevProjects.map(p => 
                      p.id === updatedProject.id ? updatedProject : p
                    )
                  );
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Detail Pane - Now positioned at the root level */}
      <AnimatePresence>
        {selectedProjectId && selectedProject && (
          <ProjectDetailPane
            project={selectedProject}
            orgSlug={orgSlug}
            onClose={() => {
              setSelectedProjectId(null);
              setIsDetailPaneExpanded(false);
            }}
            onUpdate={loadProjects}
            isExpanded={isDetailPaneExpanded}
            onToggleExpand={() => setIsDetailPaneExpanded(!isDetailPaneExpanded)}
          />
        )}
      </AnimatePresence>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModalLinear
          orgSlug={orgSlug}
          teams={teams}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={() => {
            loadProjects();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={bulkSelectedProjects.size}
        selectedProjectIds={bulkSelectedProjects}
        onClose={() => {
          setBulkSelectedProjects(new Set());
          setShowBulkActions(false);
        }}
        onActionComplete={() => {
          loadProjects();
          setBulkSelectedProjects(new Set());
          setShowBulkActions(false);
        }}
      />
    </div>
  );
}