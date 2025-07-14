'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Filter,
  ChevronDown,
  Users,
  Eye,
  AlertTriangle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

interface TaskFiltersProps {
  members: {
    id: string;
    full_name: string;
    avatar_url?: string;
  }[];
  selectedMemberId: string | null;
  onMemberChange: (memberId: string | null) => void;
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  selectedPriority: string | null;
  onPriorityChange: (priority: string | null) => void;
}

const columnOptions = [
  { value: 'pending', label: 'To Do', color: 'text-blue-400' },
  { value: 'in_progress', label: 'In Progress', color: 'text-yellow-400' },
  { value: 'completed', label: 'Completed', color: 'text-green-400' },
  { value: 'verified', label: 'Verified', color: 'text-purple-400' }
];

const priorityOptions = [
  { value: null, label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'low', label: 'Low', color: 'text-gray-400' }
];

export function TaskFilters({
  members,
  selectedMemberId,
  onMemberChange,
  visibleColumns,
  onVisibleColumnsChange,
  selectedPriority,
  onPriorityChange
}: TaskFiltersProps) {
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  const memberDropdownRef = useRef<HTMLDivElement>(null);
  const columnDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
        setShowMemberDropdown(false);
      }
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target as Node)) {
        setShowColumnDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const selectedPriorityOption = priorityOptions.find(p => p.value === selectedPriority);

  const activeFiltersCount = 
    (selectedMemberId ? 1 : 0) + 
    (visibleColumns.length < 4 ? 1 : 0) + 
    (selectedPriority ? 1 : 0);

  const handleColumnToggle = (columnValue: string) => {
    if (visibleColumns.includes(columnValue)) {
      if (visibleColumns.length > 1) { // Keep at least one column visible
        onVisibleColumnsChange(visibleColumns.filter(col => col !== columnValue));
      }
    } else {
      onVisibleColumnsChange([...visibleColumns, columnValue]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-400" />
      
      {/* Member Filter */}
      <div ref={memberDropdownRef} className="relative">
        <button
          onClick={() => setShowMemberDropdown(!showMemberDropdown)}
          className={cn(
            "px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm transition-colors flex items-center gap-2",
            selectedMemberId ? "text-white border-neon-green/30" : "text-gray-400 hover:text-white"
          )}
        >
          <Users className="w-3 h-3" />
          {selectedMember ? (
            <div className="flex items-center gap-2">
              {selectedMember.avatar_url ? (
                <img 
                  src={selectedMember.avatar_url} 
                  alt={selectedMember.full_name}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-[10px] text-white">
                  {selectedMember.full_name?.[0]}
                </div>
              )}
              <span>{selectedMember.full_name.split(' ')[0]}</span>
            </div>
          ) : (
            <span>All Members</span>
          )}
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {showMemberDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-1 left-0 w-56 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10 py-1 max-h-80 overflow-y-auto"
            >
              <button
                onClick={() => {
                  onMemberChange(null);
                  setShowMemberDropdown(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between",
                  !selectedMemberId ? "text-white" : "text-gray-400"
                )}
              >
                All Members
                {!selectedMemberId && <Check className="w-3 h-3" />}
              </button>
              
              {members.map(member => (
                <button
                  key={member.id}
                  onClick={() => {
                    onMemberChange(member.id);
                    setShowMemberDropdown(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between",
                    selectedMemberId === member.id ? "text-white" : "text-gray-400"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.full_name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                        {member.full_name?.[0]}
                      </div>
                    )}
                    {member.full_name}
                  </div>
                  {selectedMemberId === member.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Column Visibility Filter */}
      <div ref={columnDropdownRef} className="relative">
        <button
          onClick={() => setShowColumnDropdown(!showColumnDropdown)}
          className={cn(
            "px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm transition-colors flex items-center gap-2",
            visibleColumns.length < 4 ? "text-white border-neon-green/30" : "text-gray-400 hover:text-white"
          )}
        >
          <Eye className="w-3 h-3" />
          <span>All Statuses</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {showColumnDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-1 left-0 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10 py-1"
            >
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-dark-border">
                Toggle column visibility
              </div>
              {columnOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleColumnToggle(option.value)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between"
                >
                  <span className={cn(
                    option.color,
                    visibleColumns.includes(option.value) ? '' : 'opacity-50'
                  )}>
                    {option.label}
                  </span>
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center",
                    visibleColumns.includes(option.value) 
                      ? "bg-neon-green border-neon-green" 
                      : "border-gray-600"
                  )}>
                    {visibleColumns.includes(option.value) && (
                      <Check className="w-3 h-3 text-black" />
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Priority Filter */}
      <div ref={priorityDropdownRef} className="relative">
        <button
          onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
          className={cn(
            "px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm transition-colors flex items-center gap-2",
            selectedPriority ? "text-white border-neon-green/30" : "text-gray-400 hover:text-white"
          )}
        >
          <AlertTriangle className="w-3 h-3" />
          {selectedPriorityOption ? (
            <span className={selectedPriorityOption.color}>{selectedPriorityOption.label}</span>
          ) : (
            <span>All Priorities</span>
          )}
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {showPriorityDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-1 left-0 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10 py-1"
            >
              {priorityOptions.map(option => (
                <button
                  key={option.value || 'all'}
                  onClick={() => {
                    onPriorityChange(option.value);
                    setShowPriorityDropdown(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between",
                    selectedPriority === option.value ? "text-white" : "text-gray-400"
                  )}
                >
                  <span className={option.color}>{option.label}</span>
                  {selectedPriority === option.value && <Check className="w-3 h-3" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active filters count */}
      {activeFiltersCount > 0 && (
        <div className="px-2 py-1 bg-neon-green/20 text-neon-green rounded text-xs font-medium">
          {activeFiltersCount} active
        </div>
      )}
    </div>
  );
}