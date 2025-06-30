'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Filter,
  ChevronDown,
  Users,
  Tag,
  AlertTriangle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

interface ProjectFiltersProps {
  teams: any[];
  selectedTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  selectedPriority: string | null;
  onPriorityChange: (priority: string | null) => void;
}

const statusOptions = [
  { value: null, label: 'All Statuses' },
  { value: 'planning', label: 'Planning', color: 'text-blue-400' },
  { value: 'active', label: 'Active', color: 'text-green-400' },
  { value: 'on_hold', label: 'On Hold', color: 'text-yellow-400' },
  { value: 'completed', label: 'Completed', color: 'text-gray-400' },
  { value: 'archived', label: 'Archived', color: 'text-gray-500' }
];

const priorityOptions = [
  { value: null, label: 'All Priorities' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'low', label: 'Low', color: 'text-gray-400' }
];

export function ProjectFilters({
  teams,
  selectedTeamId,
  onTeamChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange
}: ProjectFiltersProps) {
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  const teamDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target as Node)) {
        setShowTeamDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const selectedStatusOption = statusOptions.find(s => s.value === selectedStatus);
  const selectedPriorityOption = priorityOptions.find(p => p.value === selectedPriority);

  const activeFiltersCount = 
    (selectedTeamId ? 1 : 0) + 
    (selectedStatus ? 1 : 0) + 
    (selectedPriority ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-400" />
      
      {/* Team Filter */}
      <div ref={teamDropdownRef} className="relative">
        <button
          onClick={() => setShowTeamDropdown(!showTeamDropdown)}
          className={cn(
            "px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm transition-colors flex items-center gap-2",
            selectedTeamId ? "text-white border-neon-green/30" : "text-gray-400 hover:text-white"
          )}
        >
          <Users className="w-3 h-3" />
          {selectedTeam ? (
            <span>{selectedTeam.name}</span>
          ) : (
            <span>All Teams</span>
          )}
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {showTeamDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-1 left-0 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10 py-1"
            >
              <button
                onClick={() => {
                  onTeamChange(null);
                  setShowTeamDropdown(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between",
                  !selectedTeamId ? "text-white" : "text-gray-400"
                )}
              >
                All Teams
                {!selectedTeamId && <Check className="w-3 h-3" />}
              </button>
              
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => {
                    onTeamChange(team.id);
                    setShowTeamDropdown(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between",
                    selectedTeamId === team.id ? "text-white" : "text-gray-400"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.name}
                  </div>
                  {selectedTeamId === team.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Filter */}
      <div ref={statusDropdownRef} className="relative">
        <button
          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          className={cn(
            "px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm transition-colors flex items-center gap-2",
            selectedStatus ? "text-white border-neon-green/30" : "text-gray-400 hover:text-white"
          )}
        >
          <Tag className="w-3 h-3" />
          {selectedStatusOption ? (
            <span className={selectedStatusOption.color}>{selectedStatusOption.label}</span>
          ) : (
            <span>Status</span>
          )}
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {showStatusDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-1 left-0 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10 py-1"
            >
              {statusOptions.map(option => (
                <button
                  key={option.value || 'all'}
                  onClick={() => {
                    onStatusChange(option.value);
                    setShowStatusDropdown(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between",
                    selectedStatus === option.value ? "text-white" : "text-gray-400"
                  )}
                >
                  <span className={option.color}>{option.label}</span>
                  {selectedStatus === option.value && <Check className="w-3 h-3" />}
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
            <span>Priority</span>
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