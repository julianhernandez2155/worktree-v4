'use client';

import { 
  X, 
  Plus,
  Calendar,
  Flag,
  Clock,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

import { TaskSkillRequirements } from '@/components/tasks/TaskSkillRequirements';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface AddTaskModalProps {
  projectId: string;
  orgSlug: string;
  onClose: () => void;
  onTaskAdded?: () => void;
}

export function AddTaskModal({ projectId, orgSlug, onClose, onTaskAdded }: AddTaskModalProps) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<{ skillId: string; importance: 'required' | 'preferred' }[]>([]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [creating, setCreating] = useState(false);
  
  const supabase = createClient();

  const handleCreate = async () => {
    if (!taskName || !description) {return;}

    try {
      setCreating(true);

      const { data: task, error } = await supabase
        .from('contributions')
        .insert({
          project_id: projectId,
          task_name: taskName,
          task_description: description,
          skills_used: [], // Will be migrated to task_required_skills
          priority,
          due_date: dueDate || null,
          estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
          contribution_type: 'task',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {throw error;}

      // Add required skills if any
      if (task && requiredSkills.length > 0) {
        const { error: skillError } = await supabase
          .from('task_required_skills')
          .insert(
            requiredSkills.map(rs => ({
              task_id: task.id,
              skill_id: rs.skillId,
              importance: rs.importance
            }))
          );
          
        if (skillError) {
          console.error('Error adding required skills:', skillError);
        }
      }

      onTaskAdded?.();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setCreating(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'text-red-400 border-red-400';
      case 'high': return 'text-orange-400 border-orange-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Task</h2>
            <p className="text-dark-muted mt-1">
              Create a task that can be assigned to team members
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-dark-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-2">
              Task Name *
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Design competition poster"
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg 
                       text-white placeholder-dark-muted focus:border-neon-green focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be done..."
              rows={4}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg 
                       text-white placeholder-dark-muted focus:border-neon-green focus:outline-none resize-none"
            />
          </div>

          {/* Skills Required */}
          <TaskSkillRequirements
            onChange={setRequiredSkills}
            isEditing={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-dark-muted mb-2">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "px-3 py-2 rounded-lg border capitalize transition-all",
                      priority === p
                        ? cn("bg-opacity-20", getPriorityColor(p))
                        : "border-dark-border text-dark-muted hover:text-white"
                    )}
                  >
                    <Flag className="h-4 w-4 mx-auto mb-1" />
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-dark-muted mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg 
                           text-white focus:border-neon-green focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-2">
              Estimated Hours
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
              <input
                type="number"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="How many hours will this take?"
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg 
                         text-white placeholder-dark-muted focus:border-neon-green focus:outline-none"
              />
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="p-4 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-neon-purple" />
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Pro tip</p>
                <p className="text-sm text-dark-muted mt-1">
                  Tasks with clear descriptions and skill requirements get assigned 43% faster
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-dark-border">
          <p className="text-sm text-dark-muted">
            * Required fields
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-dark-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <NeonButton
              onClick={handleCreate}
              disabled={!taskName || !description || creating}
              loading={creating}
              icon={<Plus className="h-4 w-4" />}
            >
              Create Task
            </NeonButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}