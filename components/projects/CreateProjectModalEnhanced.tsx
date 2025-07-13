'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  Tag,
  Clock,
  AlertCircle,
  Trash2,
  Check,
  ChevronDown,
  Building2,
  Flag,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Modal } from '@/components/ui/Modal';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Step = 'basics' | 'details' | 'tasks' | 'team';

interface Task {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  estimatedHours?: number;
}

interface CreateProjectModalProps {
  orgSlug: string;
  teams?: any[];
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'text-red-400', icon: '🔴' },
  { value: 'high', label: 'High', color: 'text-orange-400', icon: '🟠' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', icon: '🟡' },
  { value: 'low', label: 'Low', color: 'text-gray-400', icon: '⚪' }
];

const TIMELINE_OPTIONS = [
  { value: 'this_week', label: 'This Week', description: '1-7 days' },
  { value: 'this_month', label: 'This Month', description: '1-4 weeks' },
  { value: 'this_semester', label: 'This Semester', description: '3-4 months' }
];

export function CreateProjectModalEnhanced({ 
  orgSlug, 
  teams = [], 
  onClose, 
  onProjectCreated 
}: CreateProjectModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [creating, setCreating] = useState(false);
  
  // Form data
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    timeline: 'this_month' as 'this_week' | 'this_month' | 'this_semester',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    teamId: '',
    leadId: '',
    dueDate: '',
    labels: [] as string[],
    estimatedHours: 0
  });
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task>({
    id: '',
    name: '',
    description: '',
    requiredSkills: [],
    estimatedHours: 0
  });
  
  const [labelInput, setLabelInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [skillMatches, setSkillMatches] = useState<Record<string, number>>({});
  
  const supabase = createClient();

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: 'basics', label: 'Basic Info', icon: Building2 },
    { key: 'details', label: 'Details', icon: Tag },
    { key: 'tasks', label: 'Tasks', icon: Check },
    { key: 'team', label: 'Team', icon: Users }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  // Load team members when team is selected
  useEffect(() => {
    if (projectData.teamId) {
      loadTeamMembers();
    }
  }, [projectData.teamId]);

  const loadTeamMembers = async () => {
    try {
      const { data } = await supabase
        .from('team_members')
        .select('user:profiles(id, full_name, avatar_url)')
        .eq('team_id', projectData.teamId);
      
      setTeamMembers(data?.map(tm => tm.user) || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const nextStep = () => {
    const stepOrder: Step[] = ['basics', 'details', 'tasks', 'team'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: Step[] = ['basics', 'details', 'tasks', 'team'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basics':
        return projectData.name && projectData.description;
      case 'details':
        return true; // All fields are optional
      case 'tasks':
        return tasks.length > 0;
      case 'team':
        return true; // Team assignment is optional
      default:
        return false;
    }
  };

  const addTask = () => {
    if (currentTask.name && currentTask.description) {
      const newTask = {
        ...currentTask,
        id: Date.now().toString()
      };
      setTasks([...tasks, newTask]);
      setCurrentTask({
        id: '',
        name: '',
        description: '',
        requiredSkills: [],
        estimatedHours: 0
      });
    }
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const addSkill = () => {
    if (skillInput.trim() && !currentTask.requiredSkills.includes(skillInput.trim())) {
      setCurrentTask({
        ...currentTask,
        requiredSkills: [...currentTask.requiredSkills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const addLabel = () => {
    if (labelInput.trim() && !projectData.labels.includes(labelInput.trim())) {
      setProjectData({
        ...projectData,
        labels: [...projectData.labels, labelInput.trim()]
      });
      setLabelInput('');
    }
  };

  const handleCreate = async () => {
    try {
      setCreating(true);

      const { data: { user } } = await supabase.auth.getUser();
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org || !user) return;

      // Create project with all the new fields
      const { data: project, error: projectError } = await supabase
        .from('internal_projects')
        .insert({
          organization_id: org.id,
          name: projectData.name,
          description: projectData.description,
          timeline: projectData.timeline,
          priority: projectData.priority,
          team_id: projectData.teamId || null,
          lead_id: projectData.leadId || null,
          due_date: projectData.dueDate || null,
          labels: projectData.labels,
          estimated_hours: projectData.estimatedHours || null,
          status: 'planning',
          visibility: 'internal',
          created_by: user.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create tasks
      if (tasks.length > 0) {
        const taskInserts = tasks.map(task => ({
          project_id: project.id,
          task_name: task.name,
          task_description: task.description,
          skills_used: task.requiredSkills,
          status: 'pending',
          estimated_hours: task.estimatedHours
        }));

        const { error: tasksError } = await supabase
          .from('contributions')
          .insert(taskInserts);

        if (tasksError) throw tasksError;
      }

      onProjectCreated(project);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      size="lg"
      className="max-w-3xl"
    >
      <div className="flex flex-col h-full">
        {/* Header with Steps */}
        <div className="px-6 py-4 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create New Project</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.key === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <button
                    onClick={() => isCompleted && setCurrentStep(step.key)}
                    disabled={!isCompleted}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                      isActive && "bg-dark-card",
                      isCompleted && !isActive && "cursor-pointer hover:bg-dark-card/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      isActive && "bg-neon-green text-dark-bg",
                      isCompleted && !isActive && "bg-green-400/20 text-green-400",
                      !isActive && !isCompleted && "bg-dark-card text-gray-500"
                    )}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      isActive && "text-white",
                      isCompleted && !isActive && "text-green-400",
                      !isActive && !isCompleted && "text-gray-500"
                    )}>
                      {step.label}
                    </span>
                  </button>
                  
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2",
                      isCompleted ? "bg-green-400/30" : "bg-dark-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {currentStep === 'basics' && (
              <motion.div
                key="basics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                    placeholder="e.g., Spring Robotics Competition"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    placeholder="What's this project about?"
                    rows={4}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Timeline
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {TIMELINE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setProjectData({ ...projectData, timeline: option.value as any })}
                        className={cn(
                          "p-3 rounded-lg border transition-all",
                          projectData.timeline === option.value
                            ? "bg-neon-green/20 border-neon-green text-neon-green"
                            : "bg-dark-card border-dark-border text-gray-400 hover:text-white hover:border-gray-600"
                        )}
                      >
                        <Calendar className="w-5 h-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {PRIORITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setProjectData({ ...projectData, priority: option.value as any })}
                        className={cn(
                          "p-3 rounded-lg border transition-all flex items-center gap-3",
                          projectData.priority === option.value
                            ? "bg-dark-card border-neon-green"
                            : "bg-dark-card border-dark-border hover:border-gray-600"
                        )}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <div className="text-left">
                          <div className={cn("text-sm font-medium", option.color)}>
                            {option.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {teams.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Assign to Team
                    </label>
                    <select
                      value={projectData.teamId}
                      onChange={(e) => setProjectData({ ...projectData, teamId: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                    >
                      <option value="">No team assigned</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={projectData.dueDate}
                    onChange={(e) => setProjectData({ ...projectData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Labels
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                      placeholder="Add a label..."
                      className="flex-1 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                    />
                    <button
                      onClick={addLabel}
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {projectData.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {projectData.labels.map((label, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-dark-card rounded-full text-sm flex items-center gap-2"
                        >
                          {label}
                          <button
                            onClick={() => setProjectData({
                              ...projectData,
                              labels: projectData.labels.filter((_, i) => i !== index)
                            })}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={projectData.estimatedHours || ''}
                    onChange={(e) => setProjectData({ 
                      ...projectData, 
                      estimatedHours: parseInt(e.target.value) || 0 
                    })}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Existing tasks */}
                {tasks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-400">Project Tasks</h3>
                    {tasks.map((task) => (
                      <div key={task.id} className="p-4 bg-dark-card rounded-lg border border-dark-border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{task.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                            {task.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.requiredSkills.map((skill, index) => (
                                  <span key={index} className="px-2 py-1 bg-dark-surface rounded text-xs text-gray-300">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeTask(task.id)}
                            className="p-1 hover:bg-dark-surface rounded transition-colors ml-3"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new task */}
                <div className="p-4 bg-dark-card rounded-lg border border-dashed border-dark-border">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Add New Task</h3>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={currentTask.name}
                      onChange={(e) => setCurrentTask({ ...currentTask, name: e.target.value })}
                      placeholder="Task name"
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                    />
                    
                    <textarea
                      value={currentTask.description}
                      onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                      placeholder="Task description"
                      rows={2}
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none resize-none"
                    />
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Required Skills</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          placeholder="Add skill..."
                          className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                        />
                        <button
                          onClick={addSkill}
                          className="px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {currentTask.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {currentTask.requiredSkills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-dark-surface rounded text-xs text-gray-300 flex items-center gap-1">
                              {skill}
                              <button
                                onClick={() => setCurrentTask({
                                  ...currentTask,
                                  requiredSkills: currentTask.requiredSkills.filter((_, i) => i !== index)
                                })}
                                className="hover:text-red-400 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <NeonButton
                      onClick={addTask}
                      disabled={!currentTask.name || !currentTask.description}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      Add Task
                    </NeonButton>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'team' && (
              <motion.div
                key="team"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {teamMembers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Project Lead
                    </label>
                    <select
                      value={projectData.leadId}
                      onChange={(e) => setProjectData({ ...projectData, leadId: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                    >
                      <option value="">Select project lead...</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="p-4 bg-dark-card rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Project Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timeline:</span>
                      <span className="text-white capitalize">{projectData.timeline.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Priority:</span>
                      <span className={PRIORITY_OPTIONS.find(p => p.value === projectData.priority)?.color}>
                        {PRIORITY_OPTIONS.find(p => p.value === projectData.priority)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tasks:</span>
                      <span className="text-white">{tasks.length}</span>
                    </div>
                    {projectData.teamId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Team:</span>
                        <span className="text-white">
                          {teams.find(t => t.id === projectData.teamId)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-400 font-medium">Ready to create!</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Your project will start in "Planning" status. You can begin assigning tasks to team members immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStepIndex > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            {currentStepIndex < steps.length - 1 ? (
              <NeonButton
                onClick={nextStep}
                disabled={!canProceed()}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </NeonButton>
            ) : (
              <NeonButton
                onClick={handleCreate}
                disabled={!canProceed() || creating}
                loading={creating}
              >
                Create Project
              </NeonButton>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}