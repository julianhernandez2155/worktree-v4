'use client';

import { useState, useCallback, memo } from 'react';
import { 
  ChevronRight,
  Circle,
  Users,
  Calendar,
  AlertCircle,
  Hash,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Pause,
  Archive,
  Check,
  Lightbulb,
  AlertTriangle,
  Eye,
  Globe,
  Send,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  UserPlus,
  CalendarPlus,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { InlineStatusEditor } from './InlineStatusEditor';
import { InlinePriorityEditor } from './InlinePriorityEditor';
import { InlineDateEditor } from './InlineDateEditor';
import { InlineLeadEditor } from './InlineLeadEditor';
import { ColumnDefinition } from './DisplayMenu';
import { PRIORITY_CONFIG } from '@/components/ui/PriorityIcon';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority?: string;
  timeline: string;
  due_date?: string;
  created_at: string;
  updated_at?: string;
  visibility: string;
  organization_id: string;
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
  created_by?: string;
  task_stats?: {
    total: number;
    completed: number;
    assigned: number;
    skill_gaps: number;
  };
  members?: any[];
  actual_hours?: number;
  estimated_hours?: number;
  preferred_start_date?: string;
  labels?: string[];
  achievement?: string;
  image_url?: string;
  is_public?: boolean;
  application_count?: number;
  view_count?: number;
  max_applicants?: number;
  application_deadline?: string;
  required_commitment_hours?: number;
  application_requirements?: string;
  published_at?: string;
}

interface ProjectListViewEnhancedProps {
  projects: Project[];
  groupedProjects: Record<string, Project[]>;
  groupBy: string;
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
  loading: boolean;
  onProjectUpdate?: () => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  showCheckboxes?: boolean;
  selectedColumns: string[];
  availableColumns: ColumnDefinition[];
}

const statusConfig = {
  planning: { icon: Circle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  active: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  on_hold: { icon: Pause, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  completed: { icon: CheckCircle2, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  archived: { icon: Archive, color: 'text-gray-500', bg: 'bg-gray-500/10' }
};

const priorityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
  high: { color: 'text-orange-400', bg: 'bg-orange-400/10', dot: 'bg-orange-400' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' },
  low: { color: 'text-gray-400', bg: 'bg-gray-400/10', dot: 'bg-gray-400' }
};

function formatDate(dateString?: string): string {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function calculateDaysUntilDue(dueDate?: string): { text: string; className: string } | null {
  if (!dueDate) return null;
  
  const date = new Date(dueDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'Overdue', className: 'text-red-400' };
  if (diffDays === 0) return { text: 'Today', className: 'text-yellow-400' };
  if (diffDays === 1) return { text: 'Tomorrow', className: 'text-yellow-400' };
  if (diffDays <= 7) return { text: `${diffDays} days`, className: 'text-green-400' };
  return { text: `${diffDays} days`, className: 'text-gray-400' };
}

// Column renderers for each property type
const createColumnRenderers = (project: Project, onUpdate?: () => void) => ({
  name: (project) => (
    <div className="min-w-0">
      <h3 className="font-medium text-white truncate">{project.name}</h3>
      {project.description && (
        <p className="text-sm text-gray-500 truncate mt-0.5">{project.description}</p>
      )}
    </div>
  ),
  
  status: (project) => (
    <div onClick={(e) => e.stopPropagation()}>
      <InlineStatusEditor
        projectId={project.id}
        currentStatus={project.status}
        onUpdate={onUpdate}
      />
    </div>
  ),
  
  priority: (project) => (
    <div onClick={(e) => e.stopPropagation()} className="inline-block">
      {project.priority ? (
        <InlinePriorityEditor
          projectId={project.id}
          currentPriority={project.priority}
          onUpdate={onUpdate}
        />
      ) : (
        <button className="w-5 h-5 rounded inline-flex items-center justify-center hover:bg-dark-surface transition-all group">
          <Flag className="w-3.5 h-3.5 text-gray-600 group-hover:text-neon-green" />
        </button>
      )}
    </div>
  ),
  
  lead: (project) => (
    <div onClick={(e) => e.stopPropagation()}>
      <InlineLeadEditor
        projectId={project.id}
        orgId={project.organization_id}
        currentLead={project.lead}
        onUpdate={onUpdate}
      />
    </div>
  ),
  
  team: (project) => project.team ? (
    <div 
      className="px-2 py-1 rounded text-xs font-medium inline-block"
      style={{ 
        backgroundColor: `${project.team.color}20`,
        color: project.team.color 
      }}
    >
      {project.team.name}
    </div>
  ) : (
    <button className="w-5 h-5 rounded border border-dashed border-gray-600 inline-flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group">
      <Plus className="w-3 h-3 text-gray-600 group-hover:text-neon-green" />
    </button>
  ),
  
  progress: (project) => {
    const progress = project.task_stats 
      ? (project.task_stats.completed / project.task_stats.total * 100) 
      : 0;
    
    return project.task_stats && project.task_stats.total > 0 ? (
      <div className="inline-block" style={{ width: 100 }}>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">
            {project.task_stats.completed}/{project.task_stats.total}
          </span>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-green to-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    ) : (
      <span className="text-xs text-gray-500">No tasks</span>
    );
  },
  
  skill_gaps: (project) => project.task_stats?.skill_gaps ? (
    <span className="inline-flex items-center gap-1">
      <Lightbulb className="w-4 h-4 text-yellow-400" />
      <span className="text-sm text-yellow-400">{project.task_stats.skill_gaps}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1">
      <div className="w-4 h-4 rounded-full bg-gray-700/50 inline-flex items-center justify-center">
        <Check className="w-2.5 h-2.5 text-gray-600" />
      </div>
      <span className="text-sm text-gray-500">0</span>
    </span>
  ),
  
  due_date: (project) => (
    <div onClick={(e) => e.stopPropagation()}>
      <InlineDateEditor
        projectId={project.id}
        currentDate={project.due_date}
        onUpdate={onUpdate}
      />
    </div>
  ),
  
  created_at: (project) => (
    <span className="text-sm text-gray-400 inline-block">{formatDate(project.created_at)}</span>
  ),
  
  members: (project) => project.members && project.members.length > 0 ? (
    <div className="inline-flex items-center -space-x-2">
      {project.members.slice(0, 3).map((member, idx) => (
        <div key={member.id} className="relative" style={{ zIndex: 3 - idx }}>
          {member.avatar_url ? (
            <img 
              src={member.avatar_url} 
              alt={member.full_name}
              className="w-6 h-6 rounded-full ring-2 ring-dark-surface"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-600 ring-2 ring-dark-surface flex items-center justify-center text-xs text-white">
              {member.full_name[0]}
            </div>
          )}
        </div>
      ))}
      {project.members.length > 3 && (
        <div className="w-6 h-6 rounded-full bg-dark-card ring-2 ring-dark-surface flex items-center justify-center">
          <span className="text-xs text-gray-400">+{project.members.length - 3}</span>
        </div>
      )}
    </div>
  ) : (
    <button className="w-6 h-6 rounded-full border border-dashed border-gray-600 inline-flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group">
      <UserPlus className="w-3.5 h-3.5 text-gray-600 group-hover:text-neon-green" />
    </button>
  ),
  
  visibility: (project) => (
    <span className="inline-flex items-center gap-1">
      {project.visibility === 'public' ? (
        <>
          <Globe className="w-3 h-3 text-green-400" />
          <span className="text-sm text-green-400">Public</span>
        </>
      ) : (
        <>
          <Eye className="w-3 h-3 text-gray-400" />
          <span className="text-sm text-gray-400">Internal</span>
        </>
      )}
    </span>
  ),
  
  application_count: (project) => project.is_public ? (
    <span className="inline-flex items-center gap-1">
      <Send className="w-3 h-3 text-gray-400" />
      <span className="text-sm">{project.application_count || 0}</span>
    </span>
  ) : (
    <span className="text-xs text-gray-500 inline-block">N/A</span>
  ),
  
  labels: (project) => project.labels && project.labels.length > 0 ? (
    <span className="inline-flex flex-wrap gap-1 justify-end">
      {project.labels.map((label, idx) => (
        <span 
          key={idx}
          className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300"
        >
          {label}
        </span>
      ))}
    </span>
  ) : (
    <button className="w-5 h-5 rounded inline-flex items-center justify-center hover:bg-dark-surface transition-all group">
      <Hash className="w-3.5 h-3.5 text-gray-600 group-hover:text-neon-green" />
    </button>
  ),
  
  timeline: (project) => project.timeline ? (
    <span className="text-sm text-gray-300 capitalize inline-block">
      {project.timeline.replace('_', ' ')}
    </span>
  ) : (
    <button className="w-5 h-5 rounded inline-flex items-center justify-center hover:bg-dark-surface transition-all group">
      <Clock className="w-3.5 h-3.5 text-gray-600 group-hover:text-neon-green" />
    </button>
  ),
  
  description: (project) => project.description ? (
    <p className="text-sm text-gray-400 truncate">{project.description}</p>
  ) : (
    <span className="text-sm text-gray-500 italic">No description</span>
  ),
  
  // Add more renderers as needed...
});

// Column Header Component
const ColumnHeader = ({ 
  column, 
  sortColumn, 
  sortDirection, 
  onSort,
  showCheckbox,
  allSelected,
  onSelectAll,
  isFirst,
  isLast
}: {
  column: ColumnDefinition;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (columnId: string) => void;
  showCheckbox?: boolean;
  allSelected?: boolean;
  onSelectAll?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  const Icon = column.icon;
  const isSorted = sortColumn === column.id;
  
  // Special handling for checkbox column
  if (column.id === 'checkbox' && showCheckbox) {
    return (
      <div className="flex-shrink-0 px-4 py-3" style={{ width: 40 }}>
        <button
          onClick={onSelectAll}
          className={cn(
            "w-5 h-5 rounded border flex items-center justify-center transition-all",
            allSelected
              ? "bg-neon-green border-neon-green"
              : "border-dark-border hover:border-gray-500"
          )}
        >
          {allSelected && <Check className="w-3 h-3 text-black" />}
        </button>
      </div>
    );
  }
  
  return (
    <button
      onClick={() => onSort(column.id)}
      className={cn(
        "px-4 py-3 transition-colors group hover:bg-dark-card/50",
        column.id === 'name' ? 'text-left flex-1' : 'text-center flex-shrink-0',
        isSorted && "text-white"
      )}
      style={{ 
        width: column.id === 'name' ? undefined : (column.width || 'auto'), 
        minWidth: column.id === 'name' ? (column.width || 'auto') : (column.width || 'auto')
      }}
    >
      <div className={cn(
        "flex items-center gap-1.5",
        column.id === 'name' ? 'justify-start' : 'justify-center'
      )}>
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {column.label}
        </span>
        {isSorted ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-neon-green" />
          ) : (
            <ArrowDown className="w-3 h-3 text-neon-green" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </button>
  );
};

const ProjectRow = memo(({ 
  project, 
  isSelected,
  showCheckbox,
  onSelect,
  onClick,
  selectedColumns,
  columnDefinitions,
  onProjectUpdate
}: {
  project: Project;
  isSelected: boolean;
  showCheckbox: boolean;
  onSelect: (id: string, event: React.MouseEvent) => void;
  onClick: () => void;
  selectedColumns: string[];
  columnDefinitions: ColumnDefinition[];
  onProjectUpdate?: () => void;
}) => {
  const columnRenderers = createColumnRenderers(project, onProjectUpdate);
  const isOverdue = project.due_date && new Date(project.due_date) < new Date();
  const hasSkillGaps = project.task_stats?.skill_gaps && project.task_stats.skill_gaps > 0;
  const isAtRisk = isOverdue || hasSkillGaps;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      data-project-id={project.id}
      className={cn(
        "group relative pl-6 pr-4 py-3 border-b border-dark-border hover:bg-dark-card/50 cursor-pointer transition-colors overflow-hidden",
        isSelected && "bg-dark-card",
        isOverdue && "bg-red-900/10 hover:bg-red-900/20"
      )}
    >
      {/* Priority color strip */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-2 transition-all",
          project.priority === 'critical' && "bg-red-400",
          project.priority === 'high' && "bg-orange-400",
          project.priority === 'medium' && "bg-yellow-400",
          project.priority === 'low' && "bg-gray-400"
        )}
      />
      
      <div className="flex items-center">
        {/* Checkbox */}
        {showCheckbox && (
          <div className="flex-shrink-0 px-4" style={{ width: 40 }}>
            <button
              onClick={(e) => onSelect(project.id, e)}
              className={cn(
                "w-5 h-5 rounded border flex items-center justify-center transition-all",
                isSelected
                  ? "bg-neon-green border-neon-green"
                  : "border-dark-border hover:border-gray-500"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-black" />}
            </button>
          </div>
        )}

        {/* Risk indicator - positioned absolutely */}
        {isAtRisk && (
          <div className="absolute left-1 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
        )}

        {/* Dynamic columns */}
        {selectedColumns.map(columnId => {
          const column = columnDefinitions.find(c => c.id === columnId);
          if (!column) return null;
          
          const renderer = columnRenderers[columnId as keyof typeof columnRenderers];
          const content = renderer ? renderer(project) : (
            <span className="text-gray-400">
              {String(project[columnId as keyof Project] || '')}
            </span>
          );
          
          return (
            <div 
              key={columnId} 
              className={cn(
                "px-4 flex items-center",
                columnId === 'name' ? 'text-left flex-1' : 'text-center flex-shrink-0 justify-center'
              )}
              style={{ 
                width: columnId === 'name' ? undefined : (column.width || 'auto'), 
                minWidth: columnId === 'name' ? (column.width || 'auto') : (column.width || 'auto')
              }}
            >
              {content}
            </div>
          );
        })}

        {/* Quick Actions */}
        <div className="flex-shrink-0 px-4 text-right" style={{ width: 40 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle quick actions
            }}
            className="inline-block opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-surface rounded transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ProjectRow.displayName = 'ProjectRow';

export function ProjectListViewEnhanced({
  projects,
  groupedProjects,
  groupBy,
  onProjectClick,
  selectedProjectId,
  loading,
  onProjectUpdate,
  onSelectionChange,
  showCheckboxes = false,
  selectedColumns,
  availableColumns
}: ProjectListViewEnhancedProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Object.keys(groupedProjects))
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleProjectSelection = useCallback((projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
    onSelectionChange?.(newSelected);
  }, [selectedProjects, onSelectionChange]);

  const handleSort = useCallback((columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const toggleSelectAll = useCallback(() => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
      onSelectionChange?.(new Set());
    } else {
      const allIds = new Set(projects.map(p => p.id));
      setSelectedProjects(allIds);
      onSelectionChange?.(allIds);
    }
  }, [projects, selectedProjects, onSelectionChange]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Note: Empty state is handled in ProjectsHub to have access to create modal function
  if (projects.length === 0) {
    return null;
  }

  const renderProjectRow = (project: Project) => (
    <ProjectRow
      key={project.id}
      project={project}
      isSelected={selectedProjectId === project.id}
      showCheckbox={showCheckboxes}
      onSelect={toggleProjectSelection}
      onClick={() => onProjectClick(project.id)}
      selectedColumns={selectedColumns}
      columnDefinitions={availableColumns}
      onProjectUpdate={onProjectUpdate}
    />
  );

  // Prepare columns for display
  const displayColumns = [
    ...(showCheckboxes ? [{ id: 'checkbox', label: '', category: 'core' as const, width: 40 }] : []),
    ...selectedColumns.map(id => availableColumns.find(col => col.id === id)).filter(Boolean) as ColumnDefinition[]
  ];

  if (groupBy === 'none') {
    return (
      <div className="h-full flex flex-col">
        {/* Column Headers */}
        <div className="flex border-y border-dark-border bg-dark-surface/50 sticky top-0 z-10">
          {displayColumns.map((column, index) => (
            <ColumnHeader
              key={column.id}
              column={column}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              showCheckbox={column.id === 'checkbox'}
              allSelected={selectedProjects.size === projects.length && projects.length > 0}
              onSelectAll={toggleSelectAll}
              isFirst={index === 0}
              isLast={index === displayColumns.length - 1}
            />
          ))}
          {/* Quick Actions Column Header */}
          <div className="flex-shrink-0 px-4" style={{ width: 40 }}>
            <div className="py-3">
              {/* Empty space for actions column */}
            </div>
          </div>
        </div>
        
        {/* Project Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {projects.map(renderProjectRow)}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Column Headers */}
      <div className="flex border-y border-dark-border bg-dark-surface/50 sticky top-0 z-10">
        {displayColumns.map((column, index) => (
          <ColumnHeader
            key={column.id}
            column={column}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            showCheckbox={column.id === 'checkbox'}
            allSelected={selectedProjects.size === projects.length && projects.length > 0}
            onSelectAll={toggleSelectAll}
            isFirst={index === 0}
            isLast={index === displayColumns.length - 1}
          />
        ))}
        {/* Quick Actions Column Header */}
        <div className="flex-shrink-0 px-4" style={{ width: 40 }}>
          <div className="py-3">
            {/* Empty space for actions column */}
          </div>
        </div>
      </div>
      
      {/* Grouped Project Rows */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {Object.entries(groupedProjects).map(([groupName, groupProjects]) => (
          <div key={groupName} className="mb-4">
            <button
              onClick={() => toggleGroup(groupName)}
              className="w-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors bg-dark-card/30"
            >
              <ChevronRight 
                className={cn(
                  "w-4 h-4 transition-transform",
                  expandedGroups.has(groupName) && "rotate-90"
                )}
              />
              <span>{groupName}</span>
              <span className="text-gray-500">({groupProjects.length})</span>
            </button>
            
            <AnimatePresence>
              {expandedGroups.has(groupName) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {groupProjects.map(renderProjectRow)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}