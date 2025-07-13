'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Box,
  Flag,
  User,
  Users,
  Calendar,
  CalendarClock,
  CalendarPlus,
  Tag,
  Link2,
  Plus,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Circle,
  CheckCircle2,
  Clock,
  Pause,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { DatePicker } from '@/components/ui/DatePicker';

interface CreateProjectModalProps {
  orgSlug: string;
  teams?: any[];
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

// Priority bar icon component - signal strength style
const PriorityIcon = ({ level, color }: { level: number; color: string }) => {
  const bars = [
    { height: 'h-1', threshold: 1 },  // shortest bar
    { height: 'h-2', threshold: 2 },  // medium bar
    { height: 'h-3', threshold: 3 },  // tallest bar
  ];
  
  return (
    <div className="flex items-end gap-0.5">
      {bars.map((bar, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-sm transition-colors",
            bar.height,
            level >= bar.threshold ? color.replace('text-', 'bg-') : 'bg-gray-700'
          )}
        />
      ))}
    </div>
  );
};

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'text-red-400', level: 3 },    // all 3 bars lit
  { value: 'high', label: 'High', color: 'text-orange-400', level: 3 },        // all 3 bars lit
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', level: 2 },    // 2 bars lit
  { value: 'low', label: 'Low', color: 'text-gray-400', level: 1 },            // 1 bar lit
  { value: null, label: 'No priority', color: 'text-gray-500', level: 0 }      // no bars lit
];

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'text-blue-400', icon: Circle },
  { value: 'active', label: 'Active', color: 'text-green-400', icon: CheckCircle2 },
  { value: 'on_hold', label: 'On Hold', color: 'text-yellow-400', icon: Pause },
  { value: 'completed', label: 'Completed', color: 'text-gray-400', icon: CheckCircle2 },
  { value: 'archived', label: 'Archived', color: 'text-gray-500', icon: Archive }
];

export function CreateProjectModalLinear({ 
  orgSlug, 
  teams = [], 
  onClose, 
  onProjectCreated 
}: CreateProjectModalProps) {
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('planning');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [milestones, setMilestones] = useState<Array<{ id: string; name: string; date: string }>>([]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [openMilestoneDatePicker, setOpenMilestoneDatePicker] = useState<string | null>(null);
  const [showNewMilestoneDatePicker, setShowNewMilestoneDatePicker] = useState(false);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const leadDropdownRef = useRef<HTMLDivElement>(null);
  const membersDropdownRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLDivElement>(null);
  const targetDateRef = useRef<HTMLDivElement>(null);
  const milestoneInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Focus on name input when modal opens
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, []);

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
      if (leadDropdownRef.current && !leadDropdownRef.current.contains(event.target as Node)) {
        setShowLeadDropdown(false);
      }
      if (membersDropdownRef.current && !membersDropdownRef.current.contains(event.target as Node)) {
        setShowMembersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load organization members
  useEffect(() => {
    loadOrgMembers();
  }, []);

  const loadOrgMembers = async () => {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org) return;

      const { data } = await supabase
        .from('organization_members')
        .select('user:profiles(id, full_name, avatar_url)')
        .eq('organization_id', org.id);
      
      setTeamMembers(data?.map(m => m.user).filter(Boolean) || []);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  const handleAddMilestone = () => {
    if (newMilestoneName.trim()) {
      const newMilestone = {
        id: Date.now().toString(),
        name: newMilestoneName.trim(),
        date: newMilestoneDate || targetDate || new Date().toISOString().split('T')[0]
      };
      setMilestones([...milestones, newMilestone]);
      setNewMilestoneName('');
      setNewMilestoneDate('');
      // Keep the milestones section open and focus back on the input
      setTimeout(() => milestoneInputRef.current?.focus(), 50);
    }
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleCreate = async () => {
    if (!projectName.trim()) return;

    try {
      setCreating(true);

      const { data: { user } } = await supabase.auth.getUser();
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org || !user) return;

      // Create project
      const { data: project, error } = await supabase
        .from('internal_projects')
        .insert({
          organization_id: org.id,
          name: projectName.trim(),
          description: projectSummary.trim() || projectDescription.trim() || null,
          status: selectedStatus,
          priority: selectedPriority,
          team_id: selectedTeam || null,
          lead_id: selectedLead || null,
          preferred_start_date: startDate || null,
          due_date: targetDate || null,
          labels: labels.length > 0 ? labels : null,
          visibility: 'internal',
          created_by: user.id,
          timeline: 'this_semester' // Default timeline
        })
        .select()
        .single();

      if (error) throw error;

      onProjectCreated(project);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };

  const getStatusOption = (value: string) => STATUS_OPTIONS.find(s => s.value === value);
  const getPriorityOption = (value: string | null) => PRIORITY_OPTIONS.find(p => p.value === value);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl bg-dark-card rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
            <h2 className="text-lg font-medium">New project</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-dark-surface rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Project Icon and Name */}
            <div className="flex items-start gap-4">
              <button className="w-12 h-12 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity" style={{ backgroundColor: 'lch(18 5.53 276.78)' }}>
                <Box className="w-6 h-6 text-gray-400" />
              </button>
              <div className="flex-1 space-y-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                  className="w-full text-2xl font-medium bg-transparent border-none outline-none text-white placeholder-gray-500 focus:placeholder-gray-600 focus:ring-0"
                />
                <input
                  type="text"
                  value={projectSummary}
                  onChange={(e) => setProjectSummary(e.target.value)}
                  placeholder="Add a short summary..."
                  className="w-full text-sm bg-transparent border-none outline-none text-gray-400 placeholder-gray-600 focus:ring-0"
                />
              </div>
            </div>

            {/* Property Pills */}
            <div className="flex flex-wrap gap-2">
              {/* Status */}
              <div className="relative" ref={statusDropdownRef}>
                <button 
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showStatusDropdown 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  {(() => {
                    const statusOption = getStatusOption(selectedStatus);
                    const Icon = statusOption?.icon || Circle;
                    return (
                      <>
                        <Icon className={cn("w-4 h-4", statusOption?.color)} />
                        <span className={cn("text-sm", statusOption?.color)}>
                          {statusOption?.label}
                        </span>
                      </>
                    );
                  })()}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedStatus(option.value);
                          setShowStatusDropdown(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                          selectedStatus === option.value && "bg-dark-surface"
                        )}
                      >
                        {(() => {
                          const Icon = option.icon;
                          return <Icon className={cn("w-4 h-4", option.color)} />;
                        })()}
                        <span className={option.color}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="relative" ref={priorityDropdownRef}>
                <button 
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showPriorityDropdown 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  {(() => {
                    const priorityOption = getPriorityOption(selectedPriority);
                    return (
                      <>
                        <PriorityIcon 
                          level={priorityOption?.level || 0} 
                          color={priorityOption?.color || 'text-gray-500'} 
                        />
                        <span className={cn("text-sm", priorityOption?.color || 'text-gray-500')}>
                          {priorityOption?.label || 'No priority'}
                        </span>
                      </>
                    );
                  })()}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                {showPriorityDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl">
                    {PRIORITY_OPTIONS.map((option) => (
                      <button
                        key={option.value || 'none'}
                        onClick={() => {
                          setSelectedPriority(option.value);
                          setShowPriorityDropdown(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                          selectedPriority === option.value && "bg-dark-surface"
                        )}
                      >
                        <PriorityIcon level={option.level} color={option.color} />
                        <span className={option.color}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lead */}
              <div className="relative" ref={leadDropdownRef}>
                <button 
                  onClick={() => setShowLeadDropdown(!showLeadDropdown)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showLeadDropdown 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  {selectedLead ? (
                    <>
                      {(() => {
                        const lead = teamMembers.find(m => m.id === selectedLead);
                        return lead ? (
                          <>
                            {lead.avatar_url ? (
                              <img 
                                src={lead.avatar_url} 
                                alt={lead.full_name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                                {lead.full_name[0]}
                              </div>
                            )}
                            <span className="text-sm text-gray-300">{lead.full_name}</span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-300">Lead</span>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Lead</span>
                    </>
                  )}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                {showLeadDropdown && (
                  <div className="absolute z-10 mt-1 w-64 bg-dark-card border border-dark-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedLead('');
                        setShowLeadDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2 border-b border-dark-border"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">No lead</span>
                    </button>
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setSelectedLead(member.id);
                          setShowLeadDropdown(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                          selectedLead === member.id && "bg-dark-surface"
                        )}
                      >
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.full_name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                            {member.full_name[0]}
                          </div>
                        )}
                        <span className="text-gray-300">{member.full_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Members */}
              <div className="relative" ref={membersDropdownRef}>
                <button 
                  onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showMembersDropdown 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  {selectedMembers.length > 0 ? (
                    <>
                      <div className="flex -space-x-2">
                        {selectedMembers.slice(0, 3).map((memberId) => {
                          const member = teamMembers.find(m => m.id === memberId);
                          if (!member) return null;
                          return (
                            <div key={memberId} className="relative">
                              {member.avatar_url ? (
                                <img 
                                  src={member.avatar_url} 
                                  alt={member.full_name}
                                  className="w-5 h-5 rounded-full ring-2"
                                  style={{ '--tw-ring-color': 'lch(18 5.53 276.78)' } as React.CSSProperties}
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-600 ring-2 flex items-center justify-center text-xs text-white"
                                  style={{ '--tw-ring-color': 'lch(18 5.53 276.78)' } as React.CSSProperties}>
                                  {member.full_name[0]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {selectedMembers.length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-gray-600 ring-2 flex items-center justify-center text-xs text-white"
                            style={{ '--tw-ring-color': 'lch(18 5.53 276.78)' } as React.CSSProperties}>
                            +{selectedMembers.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-300">
                        {selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Members</span>
                    </>
                  )}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                {showMembersDropdown && (
                  <div className="absolute z-10 mt-1 w-64 bg-dark-card border border-dark-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          if (selectedMembers.includes(member.id)) {
                            setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                          } else {
                            setSelectedMembers([...selectedMembers, member.id]);
                          }
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                          selectedMembers.includes(member.id) && "bg-dark-surface"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center",
                          selectedMembers.includes(member.id) 
                            ? "bg-neon-green border-neon-green" 
                            : "border-gray-600"
                        )}>
                          {selectedMembers.includes(member.id) && (
                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.full_name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                            {member.full_name[0]}
                          </div>
                        )}
                        <span className="text-gray-300">{member.full_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div className="relative" ref={startDateRef}>
                <button 
                  onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showStartDatePicker 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {startDate ? new Date(startDate).toLocaleDateString() : 'Start'}
                  </span>
                </button>
                
                {showStartDatePicker && (
                  <DatePicker
                    value={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                      setShowStartDatePicker(false);
                    }}
                    onClose={() => setShowStartDatePicker(false)}
                    maxDate={targetDate}
                  />
                )}
              </div>

              {/* Target Date */}
              <div className="relative" ref={targetDateRef}>
                <button 
                  onClick={() => setShowTargetDatePicker(!showTargetDatePicker)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    showTargetDatePicker 
                      ? "ring-2 ring-neon-green" 
                      : "hover:opacity-90"
                  )}
                  style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                >
                  <CalendarClock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {targetDate ? new Date(targetDate).toLocaleDateString() : 'Target date'}
                  </span>
                </button>
                
                {showTargetDatePicker && (
                  <DatePicker
                    value={targetDate}
                    onChange={(date) => {
                      setTargetDate(date);
                      setShowTargetDatePicker(false);
                    }}
                    onClose={() => setShowTargetDatePicker(false)}
                    minDate={startDate}
                  />
                )}
              </div>

              {/* Labels */}
              <div className="inline-flex items-center gap-2 flex-wrap">
                {labels.map((label) => (
                  <span 
                    key={label}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neon-green/10 rounded-lg border border-neon-green/30"
                  >
                    <Tag className="w-4 h-4 text-neon-green" />
                    <span className="text-sm text-neon-green">{label}</span>
                    <button
                      onClick={() => handleRemoveLabel(label)}
                      className="ml-1 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {showLabelInput ? (
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLabel();
                      }
                    }}
                    onBlur={() => {
                      handleAddLabel();
                      setShowLabelInput(false);
                    }}
                    placeholder="Add label..."
                    className="px-3 py-1.5 bg-dark-surface border border-neon-green rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none w-32"
                    autoFocus
                  />
                ) : (
                  <button 
                    onClick={() => setShowLabelInput(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
                  >
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Labels</span>
                  </button>
                )}
              </div>

              {/* Dependencies */}
              <button 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'lch(18 5.53 276.78)' }}
              >
                <Link2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Dependencies</span>
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-dark-border" />

            {/* Description */}
            <div>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Write a description, a project brief, or collect ideas..."
                className="w-full min-h-[200px] bg-transparent border-none outline-none text-gray-300 placeholder-gray-600 resize-none focus:ring-0"
              />
            </div>

            {/* Milestones Section */}
            <div className="border-t border-dark-border pt-6">
              <motion.div
                className="bg-dark-surface rounded-lg"
                animate={{ 
                  height: showMilestones ? 'auto' : 'auto'
                }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <button 
                  onClick={() => {
                    setShowMilestones(!showMilestones);
                    if (!showMilestones) {
                      setTimeout(() => milestoneInputRef.current?.focus(), 100);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-dark-surface/80 transition-colors"
                >
                  <span className="text-gray-300 font-medium">
                    Milestones {milestones.length > 0 && `(${milestones.length})`}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-white">
                    <Plus className="w-4 h-4" />
                    Add milestone
                  </span>
                </button>
                
                <AnimatePresence initial={false}>
                  {showMilestones && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                      className="overflow-visible"
                    >
                      <motion.div 
                        className="px-3 pb-3 space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                      {/* Existing milestones */}
                      {milestones.map((milestone, index) => (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-2 h-2 rotate-45 bg-gray-500" />
                          <input
                            type="text"
                            value={milestone.name}
                            readOnly
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 border-0 outline-none focus:outline-none focus:ring-0 cursor-default"
                          />
                          <div className="relative">
                            <button
                              onClick={() => setOpenMilestoneDatePicker(
                                openMilestoneDatePicker === milestone.id ? null : milestone.id
                              )}
                              className="p-1.5 hover:bg-dark-card rounded transition-colors"
                            >
                              <CalendarPlus className="w-4 h-4 text-gray-400" />
                            </button>
                            
                            {openMilestoneDatePicker === milestone.id && (
                              <DatePicker
                                value={milestone.date}
                                onChange={(date) => {
                                  setMilestones(milestones.map(m => 
                                    m.id === milestone.id ? { ...m, date } : m
                                  ));
                                  setOpenMilestoneDatePicker(null);
                                }}
                                onClose={() => setOpenMilestoneDatePicker(null)}
                                position="top-left"
                              />
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveMilestone(milestone.id)}
                            className="p-1.5 hover:bg-dark-card rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                          </button>
                        </motion.div>
                      ))}
                      
                      {/* New milestone input */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-2 h-2 rotate-45 bg-gray-500" />
                        <input
                          ref={milestoneInputRef}
                          type="text"
                          value={newMilestoneName}
                          onChange={(e) => setNewMilestoneName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newMilestoneName.trim()) {
                              e.preventDefault();
                              handleAddMilestone();
                            }
                          }}
                          placeholder="Milestone name"
                          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 border-0 outline-none focus:outline-none focus:ring-0"
                        />
                        <div className="relative">
                          <button
                            onClick={() => setShowNewMilestoneDatePicker(!showNewMilestoneDatePicker)}
                            className="p-1.5 hover:bg-dark-card rounded transition-colors"
                          >
                            <CalendarPlus className="w-4 h-4 text-gray-400" />
                          </button>
                          
                          {showNewMilestoneDatePicker && (
                            <DatePicker
                              value={newMilestoneDate}
                              onChange={(date) => {
                                setNewMilestoneDate(date);
                                setShowNewMilestoneDatePicker(false);
                                if (newMilestoneName.trim()) {
                                  handleAddMilestone();
                                }
                              }}
                              onClose={() => setShowNewMilestoneDatePicker(false)}
                              position="top-left"
                            />
                          )}
                        </div>
                        <div className="w-5 h-5" /> {/* Spacer for alignment */}
                      </motion.div>
                      
                      {/* Add another milestone button */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            if (newMilestoneName.trim()) {
                              handleAddMilestone();
                            }
                            setTimeout(() => milestoneInputRef.current?.focus(), 50);
                          }}
                          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add milestone
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-border bg-dark-card">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <NeonButton
              onClick={handleCreate}
              disabled={!projectName.trim() || creating}
              loading={creating}
              size="sm"
            >
              Create project
            </NeonButton>
          </div>
        </motion.div>
      </div>
    </>
  );
}