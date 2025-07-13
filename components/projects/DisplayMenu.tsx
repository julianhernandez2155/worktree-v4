'use client';

import { useState } from 'react';
import {
  Settings2,
  LayoutList,
  LayoutGrid,
  ChevronDown,
  Check,
  Columns3,
  ArrowUpDown,
  GroupIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

export type ViewType = 'list' | 'board';
export type GroupBy = 'none' | 'status' | 'team' | 'priority';
export type OrderBy = 'created_at' | 'due_date' | 'priority' | 'name';

interface DisplayMenuProps {
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  orderBy: OrderBy;
  onOrderByChange: (orderBy: OrderBy) => void;
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  availableColumns: ColumnDefinition[];
}

export interface ColumnDefinition {
  id: string;
  label: string;
  category: 'core' | 'people' | 'progress' | 'scheduling' | 'priority' | 'public' | 'calculated';
  icon?: React.ElementType;
  description?: string;
  defaultVisible?: boolean;
  width?: number;
}

const groupByOptions: { value: GroupBy; label: string; icon: React.ElementType }[] = [
  { value: 'none', label: 'No Grouping', icon: X },
  { value: 'status', label: 'Status', icon: Check },
  { value: 'team', label: 'Team', icon: GroupIcon },
  { value: 'priority', label: 'Priority', icon: ArrowUpDown }
];

const orderByOptions: { value: OrderBy; label: string }[] = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'due_date', label: 'Target Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'name', label: 'Name' }
];

const categoryLabels = {
  core: 'Core Properties',
  people: 'People & Assignment',
  progress: 'Progress & Metrics',
  scheduling: 'Scheduling',
  priority: 'Priority & Organization',
  public: 'Public/Application',
  calculated: 'Calculated Properties'
};

export function DisplayMenu({
  viewType,
  onViewTypeChange,
  groupBy,
  onGroupByChange,
  orderBy,
  onOrderByChange,
  selectedColumns,
  onColumnsChange,
  availableColumns
}: DisplayMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'view' | 'columns'>('view');

  const toggleColumn = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      onColumnsChange(selectedColumns.filter(id => id !== columnId));
    } else {
      onColumnsChange([...selectedColumns, columnId]);
    }
  };

  const groupedColumns = availableColumns.reduce((acc, column) => {
    if (!acc[column.category]) {
      acc[column.category] = [];
    }
    acc[column.category].push(column);
    return acc;
  }, {} as Record<string, ColumnDefinition[]>);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          "bg-dark-card text-gray-300 hover:text-white border border-dark-border",
          isOpen && "bg-dark-surface text-white border-neon-green/30"
        )}
      >
        <Settings2 className="w-4 h-4" />
        <span className="text-sm font-medium">Display</span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-lg shadow-xl z-40"
            >
              {/* Tabs */}
              <div className="flex border-b border-dark-border">
                <button
                  onClick={() => setActiveSection('view')}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    activeSection === 'view'
                      ? "text-white border-b-2 border-neon-green"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  View Options
                </button>
                <button
                  onClick={() => setActiveSection('columns')}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    activeSection === 'columns'
                      ? "text-white border-b-2 border-neon-green"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  Columns
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {activeSection === 'view' ? (
                  <div className="p-4 space-y-4">

                    {/* Grouping */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                        Group By
                      </label>
                      <div className="space-y-1">
                        {groupByOptions.map(option => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => onGroupByChange(option.value)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left",
                                groupBy === option.value
                                  ? "bg-dark-surface text-white"
                                  : "hover:bg-dark-surface/50 text-gray-400 hover:text-white"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{option.label}</span>
                              {groupBy === option.value && (
                                <Check className="w-4 h-4 ml-auto text-neon-green" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ordering */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                        Sort By
                      </label>
                      <div className="space-y-1">
                        {orderByOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => onOrderByChange(option.value)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left",
                              orderBy === option.value
                                ? "bg-dark-surface text-white"
                                : "hover:bg-dark-surface/50 text-gray-400 hover:text-white"
                            )}
                          >
                            <span className="text-sm">{option.label}</span>
                            {orderBy === option.value && (
                              <Check className="w-4 h-4 ml-auto text-neon-green" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {/* Column Chooser */}
                    {Object.entries(groupedColumns).map(([category, columns]) => (
                      <div key={category}>
                        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </h4>
                        <div className="space-y-1">
                          {columns.map(column => (
                            <label
                              key={column.id}
                              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-dark-surface/50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedColumns.includes(column.id)}
                                onChange={() => toggleColumn(column.id)}
                                className="w-4 h-4 rounded border-dark-border bg-dark-surface text-neon-green focus:ring-neon-green focus:ring-offset-0"
                              />
                              <div className="flex-1">
                                <span className="text-sm text-white">{column.label}</span>
                                {column.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{column.description}</p>
                                )}
                              </div>
                              {column.defaultVisible && (
                                <span className="text-xs text-gray-500">Default</span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-dark-border">
                <button
                  onClick={() => {
                    // Reset to defaults
                    const defaultColumns = availableColumns
                      .filter(col => col.defaultVisible)
                      .map(col => col.id);
                    onColumnsChange(defaultColumns);
                    onGroupByChange('none');
                    onOrderByChange('created_at');
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}