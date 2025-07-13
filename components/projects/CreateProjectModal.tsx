'use client';

import { 
  Plus, 
  Calendar, 
  Lock, 
  Trash2,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';
import { useState } from 'react';

import { Modal, ModalFooter } from '@/components/ui/Modal';
import { SkillBadge } from '@/components/ui/SkillBadge';
import { IconText } from '@/components/ui/IconText';
import { FormField, FormTextarea } from '@/components/ui/FormField';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Task {
  name: string;
  description: string;
  requiredSkills: string[];
}

interface CreateProjectModalProps {
  orgSlug: string;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export function CreateProjectModal({ orgSlug, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState<'this_week' | 'this_month' | 'this_semester'>('this_month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task>({
    name: '',
    description: '',
    requiredSkills: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [skillMatches, setSkillMatches] = useState<Record<string, number>>({});
  
  const supabase = createClient();

  const addTask = () => {
    if (currentTask.name && currentTask.description) {
      setTasks([...tasks, currentTask]);
      setCurrentTask({ name: '', description: '', requiredSkills: [] });
      checkSkillMatches([...tasks, currentTask]);
    }
  };

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    checkSkillMatches(newTasks);
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

  const removeSkill = (skill: string) => {
    setCurrentTask({
      ...currentTask,
      requiredSkills: currentTask.requiredSkills.filter(s => s !== skill)
    });
  };

  const checkSkillMatches = async (projectTasks: Task[]) => {
    try {
      // Get all required skills
      const allSkills = projectTasks.flatMap(t => t.requiredSkills);
      const uniqueSkills = [...new Set(allSkills)];

      if (uniqueSkills.length === 0) {
        setSkillMatches({});
        return;
      }

      // Get organization ID
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org) {return;}

      // Check how many members have each skill
      const { data: members } = await supabase
        .from('organization_members')
        .select('user:profiles!inner(skills)')
        .eq('organization_id', org.id);

      const matches: Record<string, number> = {};
      uniqueSkills.forEach(skill => {
        matches[skill] = members?.filter(m => {
          const userSkills = m.user as { skills?: string[] } | null;
          return userSkills?.skills?.includes(skill);
        }).length || 0;
      });

      setSkillMatches(matches);
    } catch (error) {
      console.error('Error checking skill matches:', error);
    }
  };

  const handleCreate = async () => {
    if (!projectName || !description || tasks.length === 0) {return;}

    try {
      setCreating(true);

      // Get organization ID and user
      const { data: { user } } = await supabase.auth.getUser();
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org || !user) {return;}

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('internal_projects')
        .insert({
          organization_id: org.id,
          name: projectName,
          description,
          timeline,
          status: 'active',
          visibility: 'internal',
          created_by: user.id
        })
        .select()
        .single();

      if (projectError) {throw projectError;}

      // Create tasks (contributions)
      const taskInserts = tasks.map(task => ({
        project_id: project.id,
        task_name: task.name,
        task_description: task.description,
        skills_used: task.requiredSkills,
        status: 'pending'
      }));

      const { error: tasksError } = await supabase
        .from('contributions')
        .insert(taskInserts);

      if (tasksError) {throw tasksError;}

      onProjectCreated(project);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };

  // Calculate total skill coverage
  const totalSkillCoverage = tasks.length > 0
    ? Math.round(
        tasks.reduce((acc, task) => {
          const coverage = task.requiredSkills.length > 0
            ? task.requiredSkills.reduce((sum, skill) => 
                sum + (skillMatches[skill] || 0), 0
              ) / task.requiredSkills.length
            : 0;
          return acc + coverage;
        }, 0) / tasks.length
      )
    : 0;

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Create Internal Project"
      description="Start with internal talent before going public"
      size="lg"
      footer={
        <ModalFooter>
          <IconText
            icon={Lock}
            text="This project will be internal to your organization"
            size="sm"
            variant="muted"
          />
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-dark-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <NeonButton
              onClick={handleCreate}
              disabled={!projectName || !description || tasks.length === 0 || creating}
              loading={creating}
            >
              Create Project
            </NeonButton>
          </div>
        </ModalFooter>
      }
    >
      <div className="space-y-6">
        {/* Project Details */}
        <div className="space-y-4">
            <FormField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Spring Robotics Competition"
            />

            <FormTextarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-dark-muted mb-2">
                Timeline
              </label>
              <div className="flex gap-2">
                {(['this_week', 'this_month', 'this_semester'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setTimeline(option)}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg border transition-colors",
                      timeline === option
                        ? "bg-neon-green/20 border-neon-green text-neon-green"
                        : "bg-dark-card border-dark-border text-dark-muted hover:text-white"
                    )}
                  >
                    <Calendar className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-sm">
                      {option === 'this_week' && 'This Week'}
                      {option === 'this_month' && 'This Month'}
                      {option === 'this_semester' && 'This Semester'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Project Tasks</h3>
            
            {/* Existing Tasks */}
            {tasks.length > 0 && (
              <div className="space-y-3 mb-6">
                {tasks.map((task, index) => (
                  <div key={index} className="p-4 bg-dark-card rounded-lg border border-dark-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{task.name}</h4>
                        <p className="text-sm text-dark-muted">{task.description}</p>
                      </div>
                      <button
                        onClick={() => removeTask(index)}
                        className="p-1 hover:bg-dark-bg rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {task.requiredSkills.map((skill) => (
                        <SkillBadge
                          key={skill}
                          skill={`${skill} (${skillMatches[skill] || 0} members)`}
                          variant={(skillMatches[skill] || 0) > 0 ? 'matched' : 'missing'}
                          size="xs"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Task Form */}
            <div className="p-4 bg-dark-card rounded-lg border border-dark-border">
              <h4 className="font-medium text-white mb-3">Add New Task</h4>
              
              <div className="space-y-3">
                <FormField
                  value={currentTask.name}
                  onChange={(e) => setCurrentTask({ ...currentTask, name: e.target.value })}
                  placeholder="Task name"
                />
                
                <FormTextarea
                  value={currentTask.description}
                  onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                  placeholder="Task description"
                  rows={2}
                />
                
                <div>
                  <label className="block text-sm text-dark-muted mb-2">Required Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Type a skill and press Enter"
                      className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg 
                               text-white placeholder-dark-muted focus:border-neon-green focus:outline-none"
                    />
                    <NeonButton
                      onClick={addSkill}
                      size="sm"
                      variant="secondary"
                    >
                      Add
                    </NeonButton>
                  </div>
                  
                  {currentTask.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentTask.requiredSkills.map((skill) => (
                        <span 
                          key={skill} 
                          className="px-2 py-1 bg-dark-bg text-sm text-dark-muted rounded-full 
                                   flex items-center gap-1"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <NeonButton
                  onClick={addTask}
                  disabled={!currentTask.name || !currentTask.description}
                  icon={<Plus className="h-4 w-4" />}
                  variant="secondary"
                  className="w-full"
                >
                  Add Task
                </NeonButton>
              </div>
            </div>
          </div>

          {/* Skill Coverage Alert */}
          {tasks.length > 0 && (
            <div className={cn(
              "mt-6 p-4 rounded-lg border",
              totalSkillCoverage > 0
                ? "bg-green-500/10 border-green-500/20"
                : "bg-yellow-500/10 border-yellow-500/20"
            )}>
              <div className="flex items-center gap-3">
                {totalSkillCoverage > 0 ? (
                  <Sparkles className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                )}
                <div>
                  <p className={cn(
                    "font-medium",
                    totalSkillCoverage > 0 ? "text-green-400" : "text-yellow-400"
                  )}>
                    Average {totalSkillCoverage} members per required skill
                  </p>
                  <p className="text-sm text-dark-muted mt-1">
                    {totalSkillCoverage > 0
                      ? "Good internal coverage! You can likely fill these roles internally."
                      : "Low skill coverage. You may need to make this project public later."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
    </Modal>
  );
}