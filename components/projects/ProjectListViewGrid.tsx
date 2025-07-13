'use client';

import { useState, useCallback, memo, useMemo } from 'react';
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
  Flag,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { InlineStatusEditor } from './InlineStatusEditor';
import { InlinePriorityEditor } from './InlinePriorityEditor';
import { InlineDateEditor } from './InlineDateEditor';
import { InlineLeadEditor } from './InlineLeadEditor';
import { InlineNameEditor } from './InlineNameEditor';
import { InlineProgressEditor } from './InlineProgressEditor';
import { QuickActionButtons } from './QuickActionButtons';
import { ColumnDefinition } from './DisplayMenu';

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

interface ProjectListViewGridProps {
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
  name: () => (
    <div onClick={(e) => e.stopPropagation()}>
      <InlineNameEditor
        projectId={project.id}
        currentName={project.name}
        currentDescription={project.description}
        onUpdate={onUpdate || (() => {})}
      />
    </div>
  ),
  
  status: () => (
    <div onClick={(e) => e.stopPropagation()}>
      <InlineStatusEditor
        projectId={project.id}
        currentStatus={project.status}
        onUpdate={onUpdate}
      />
    </div>
  ),
  
  priority: () => (
    <div onClick={(e) => e.stopPropagation()}>
      {project.priority ? (
        <InlinePriorityEditor
          projectId={project.id}
          currentPriority={project.priority}
          onUpdate={onUpdate}
        />
      ) : (
        <button className="w-7 h-7 rounded-lg border border-dashed border-gray-600 flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group/prioritybtn mx-auto">
          <Flag className="w-4 h-4 text-gray-600 group-hover/prioritybtn:text-neon-green" />
        </button>
      )}
    </div>
  ),
  
  lead: () => (
    <div onClick={(e) => e.stopPropagation()}>
      <InlineLeadEditor
        projectId={project.id}
        orgId={project.organization_id}
        currentLead={project.lead}
        onUpdate={onUpdate}
      />
    </div>
  ),
  
  team: () => project.team ? (
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
    <button className="w-7 h-7 rounded-lg border border-dashed border-gray-600 flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group/teambtn">
      <Plus className="w-4 h-4 text-gray-600 group-hover/teambtn:text-neon-green" />
    </button>
  ),
  
  progress: () => (
    <div onClick={(e) => e.stopPropagation()}>
      <InlineProgressEditor
        projectId={project.id}
        taskStats={project.task_stats}
        onUpdate={onUpdate || (() => {})}
      />
    </div>
  ),
  
  skill_gaps: () => {
    if (project.task_stats?.skill_gaps) {
      return (
        <span className="inline-flex items-center gap-1">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-yellow-400">{project.task_stats.skill_gaps}</span>
        </span>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-gray-700/50 inline-flex items-center justify-center">
        <Check className="w-3 h-3 text-gray-600" />
      </div>
    );
  },
  
  due_date: () => (
    <div onClick={(e) => e.stopPropagation()}>
      <InlineDateEditor
        projectId={project.id}
        currentDate={project.due_date}
        onUpdate={onUpdate}
      />
    </div>
  ),
  
  created_at: () => (
    <span className="text-sm text-gray-400">{formatDate(project.created_at)}</span>
  ),
  
  members: () => (
    <div className="flex justify-center">
      {project.members && project.members.length > 0 ? (
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
        <button className="w-6 h-6 rounded-full border border-dashed border-gray-600 inline-flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group/memberbtn">
          <UserPlus className="w-3.5 h-3.5 text-gray-600 group-hover/memberbtn:text-neon-green" />
        </button>
      )}
    </div>
  ),
  
  visibility: () => (
    <div className="flex justify-center">
      <span className="inline-flex items-center gap-1">
        {project.visibility === 'public' ? (
          <>
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Public</span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Internal</span>
          </>
        )}
      </span>
    </div>
  ),
  
  application_count: () => (
    <div className="flex justify-center">
      {project.is_public ? (
        <span className="inline-flex items-center gap-1">
          <Send className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{project.application_count || 0}</span>
        </span>
      ) : (
        <span className="text-xs text-gray-500">N/A</span>
      )}
    </div>
  ),
  
  labels: () => (
    <div className="flex justify-center">
      {project.labels && project.labels.length > 0 ? (
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
        <button className="w-7 h-7 rounded-lg border border-dashed border-gray-600 inline-flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group/labelbtn">
          <Hash className="w-4 h-4 text-gray-600 group-hover/labelbtn:text-neon-green" />
        </button>
      )}
    </div>
  ),
  
  timeline: () => (
    <div className="flex justify-center">
      {project.timeline ? (
        <span className="text-sm text-gray-300 capitalize">
          {project.timeline.replace('_', ' ')}
        </span>
      ) : (
        <button className="w-7 h-7 rounded-lg border border-dashed border-gray-600 inline-flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group/timelinebtn">
          <Clock className="w-4 h-4 text-gray-600 group-hover/timelinebtn:text-neon-green" />
        </button>
      )}
    </div>
  ),
  
  description: () => (
    <div className="flex justify-center">
      {project.description ? (
        <p className="text-sm text-gray-400 truncate">{project.description}</p>
      ) : (
        <span className="text-sm text-gray-500 italic">No description</span>
      )}
    </div>
  ),
  
  // Add more renderers as needed...
});

// Generate CSS Grid template columns
function generateGridTemplateColumns(columns: ColumnDefinition[], showCheckboxes: boolean): string {
  const parts: string[] = [];
  
  // Status column (replaces checkbox column)
  parts.push('120px');
  
  // Dynamic columns (excluding status since it's always first)
  columns.filter(col => col.id !== 'status').forEach(col => {
    if (col.id === 'name') {
      parts.push('1fr'); // Name column is flexible
    } else {
      parts.push(`${col.width || 120}px`); // Other columns use defined widths
    }
  });
  
  // Actions column
  parts.push('120px');
  
  return parts.join(' ');
}

// Column Header Component
const ColumnHeader = ({ 
  column, 
  sortColumn, 
  sortDirection, 
  onSort,
  showCheckbox,
  allSelected,
  onSelectAll,
}: {
  column: ColumnDefinition;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (columnId: string) => void;
  showCheckbox?: boolean;
  allSelected?: boolean;
  onSelectAll?: () => void;
}) => {
  const Icon = column.icon;
  const isSorted = sortColumn === column.id;
  
  // Special handling for checkbox column
  if (column.id === 'checkbox') {
    return (
      <div className="flex items-center justify-center">
        {showCheckbox && (
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
        )}
      </div>
    );
  }
  
  return (
    <button
      onClick={() => onSort(column.id)}
      className={cn(
        "px-4 py-2 transition-colors group flex items-center rounded-md",
        column.id === 'name' ? 'justify-start' : 'justify-center',
        isSorted && "text-white"
      )}
    >
      <div className={cn(
        "flex items-center gap-1.5",
        column.id === 'name' ? 'justify-start' : 'justify-center'
      )}>
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
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
  onProjectUpdate,
  gridTemplateColumns
}: {
  project: Project;
  isSelected: boolean;
  showCheckbox: boolean;
  onSelect: (id: string, event: React.MouseEvent) => void;
  onClick: () => void;
  selectedColumns: string[];
  columnDefinitions: ColumnDefinition[];
  onProjectUpdate?: () => void;
  gridTemplateColumns: string;
}) => {
  const columnRenderers = createColumnRenderers(project, onProjectUpdate);
  const isOverdue = !!(project.due_date && new Date(project.due_date) < new Date());
  const hasSkillGaps = !!(project.task_stats?.skill_gaps && project.task_stats.skill_gaps > 0);
  const isAtRisk = isOverdue || hasSkillGaps;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      data-project-id={project.id}
      className={cn(
        "group relative cursor-pointer transition-all duration-200",
        "grid items-stretch",
        "mx-4 mb-2 rounded-lg",
        "bg-dark-card border border-dark-border",
        "hover:border-neon-green/30 hover:shadow-lg hover:shadow-neon-green/5",
        "hover:-translate-y-0.5",
        isSelected && "border-neon-green/50 bg-neon-green/5 shadow-md shadow-neon-green/10",
        isOverdue && "bg-red-900/5 border-red-900/20 hover:border-red-900/40 hover:shadow-red-900/10"
      )}
      style={{ 
        gridTemplateColumns,
        gridAutoRows: 'minmax(3.5rem, auto)'
      }}
    >
      {/* Priority color strip */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-2 rounded-l-lg transition-all",
          project.priority === 'critical' && "bg-red-400",
          project.priority === 'high' && "bg-orange-400",
          project.priority === 'medium' && "bg-yellow-400",
          project.priority === 'low' && "bg-gray-400"
        )}
      />
      
      {/* Status column - always first */}
      <div 
        className="relative flex items-center justify-center px-4" 
        data-cell="status" 
        style={{ gridColumn: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Risk indicator overlay */}
        {isAtRisk && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 animate-pulse z-10">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
        )}
        <InlineStatusEditor
          projectId={project.id}
          currentStatus={project.status}
          onUpdate={onProjectUpdate}
        />
      </div>

      {/* Dynamic columns (excluding status) */}
      {selectedColumns.filter(col => col !== 'status').map((columnId, index) => {
        const column = columnDefinitions.find(c => c.id === columnId);
        if (!column) {
          return null;
        }
        
        const renderer = columnRenderers[columnId as keyof typeof columnRenderers];
        const content = renderer ? renderer() : (
          <span className="text-gray-400">
            {String(project[columnId as keyof Project] || '')}
          </span>
        );
        
        return (
          <div 
            key={columnId} 
            className={cn(
              "px-4 flex items-center overflow-hidden",
              columnId === 'name' ? 'justify-start' : 'justify-center'
            )}
            data-column={columnId}
            style={{ gridColumn: index + 2 }} // +2 because status is column 1
          >
            {content}
          </div>
        );
      })}

      {/* Quick Actions */}
      <div 
        className="flex items-center justify-end pr-2 overflow-hidden" 
        style={{ gridColumn: selectedColumns.filter(col => col !== 'status').length + 2 }}
      >
        <QuickActionButtons 
          project={project} 
          onUpdate={onProjectUpdate || (() => {})}
        />
      </div>
    </motion.div>
  );
});

ProjectRow.displayName = 'ProjectRow';

export function ProjectListViewGrid({
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
}: ProjectListViewGridProps) {
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

  // Prepare columns for display
  const displayColumns = useMemo(() => {
    return selectedColumns
      .map(id => availableColumns.find(col => col.id === id))
      .filter(Boolean) as ColumnDefinition[];
  }, [selectedColumns, availableColumns]);

  // Calculate grid template columns
  const gridTemplateColumns = useMemo(() => {
    return generateGridTemplateColumns(displayColumns, showCheckboxes);
  }, [displayColumns, showCheckboxes]);

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
        gridTemplateColumns={gridTemplateColumns}
      />
  );

  if (groupBy === 'none') {
    return (
      <div className="h-full flex flex-col">
        {/* Column Headers */}
        <div 
          className="grid mb-2 px-4 sticky top-0 z-10 bg-dark-bg"
          style={{ 
            gridTemplateColumns,
            gridAutoRows: 'minmax(2.5rem, auto)'
          }}
        >
          {/* Status column header (always first) */}
          <ColumnHeader
            column={{ id: 'status', label: 'Status', category: 'core', icon: Activity }}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          {displayColumns.filter(col => col.id !== 'status').map(column => (
            <ColumnHeader
              key={column.id}
              column={column}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          ))}
          {/* Actions column header */}
          <div>
            {/* Empty space for actions column */}
          </div>
        </div>
        
        {/* Project Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
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
      <div 
        className="grid mb-2 px-4 sticky top-0 z-10 bg-dark-bg"
        style={{ 
          gridTemplateColumns,
          gridAutoRows: 'minmax(2.5rem, auto)'
        }}
      >
        {/* Status column header (always first) */}
        <ColumnHeader
          column={{ id: 'status', label: 'Status', category: 'core', icon: Activity }}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        {displayColumns.filter(col => col.id !== 'status').map(column => (
          <ColumnHeader
            key={column.id}
            column={column}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        ))}
        {/* Actions column header */}
        <div>
          {/* Empty space for actions column */}
        </div>
      </div>
      
      {/* Grouped Project Rows */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {Object.entries(groupedProjects).map(([groupName, groupProjects]) => (
          <div key={groupName} className="mb-4">
            <button
              onClick={() => toggleGroup(groupName)}
              className="w-full px-4 py-2 mb-2 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
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