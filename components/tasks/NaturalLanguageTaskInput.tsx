'use client';

import { 
  Sparkles,
  Wand2,
  Calendar,
  Users,
  AlertCircle,
  Check,
  Flag
} from 'lucide-react';
import { useState, useCallback } from 'react';

import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { parseNaturalDate, formatDueDate, toISODateString, parseLocalISODate } from '@/lib/utils/date-parser';

interface NaturalLanguageTaskInputProps {
  projectId: string;
  orgSlug: string;
  memberNames?: string[];
  onTaskCreated?: (task: any) => void;
  className?: string;
}

interface ParsedTaskPreview {
  title: string;
  assignee_names?: string[];
  assignee_matches?: Array<{
    requestedName: string;
    matchedName: string | null;
    confidence: string;
  }>;
  due_date?: string;
  due_date_parsed?: {
    date: string;
    confidence: string;
  };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  subtasks?: string[];
  description?: string;
}

export function NaturalLanguageTaskInput({ 
  projectId, 
  orgSlug, 
  memberNames = [], 
  onTaskCreated,
  className 
}: NaturalLanguageTaskInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ParsedTaskPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  
  const supabase = createClient();

  const examples = [
    "Assign Sarah and Mike to design flyers by Friday",
    "Create landing page mockups - high priority, due next week",
    "Set up meeting room for tomorrow's event, assign to logistics team",
    "Research venue options by end of month with subtasks: check availability, compare prices, visit top 3",
  ];

  const handleParse = useCallback(async () => {
    if (!input.trim()) {return;}

    setIsProcessing(true);
    setError(null);
    setPreview(null);

    try {
      // Get organization ID
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org) {throw new Error('Organization not found');}

      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Call the parse-task Edge Function
      const { data, error: parseError } = await supabase.functions.invoke('parse-task', {
        body: {
          input: input.trim(),
          orgId: org.id,
          memberNames,
          timezone: userTimezone,
        },
      });

      if (parseError) {throw parseError;}
      if (!data?.success) {throw new Error(data?.error || 'Failed to parse task');}

      // Always parse dates on the frontend for correct timezone handling
      if (data.parsed.due_date) {
        const parsedDate = parseNaturalDate(data.parsed.due_date);
        console.log('Frontend date parsing:', {
          input: data.parsed.due_date,
          parsed: parsedDate,
          userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        if (parsedDate) {
          data.parsed.due_date_parsed = {
            date: toISODateString(parsedDate.date),
            confidence: parsedDate.confidence,
          };
        }
      }

      console.log('Parsed data from Edge Function:', data.parsed);
      setPreview(data.parsed);
    } catch (err) {
      console.error('Error parsing task:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse task');
    } finally {
      setIsProcessing(false);
    }
  }, [input, supabase, orgSlug, memberNames]);

  const handleCreateTask = useCallback(async () => {
    if (!preview) {return;}

    setIsProcessing(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Not authenticated');}

      // Create the task
      const taskData = {
        project_id: projectId,
        task_name: preview.title,
        task_description: preview.description || '',
        contribution_type: 'task', // Required field!
        status: 'pending',
        priority: preview.priority || 'medium',
        due_date: preview.due_date_parsed?.date || null,
        skills_used: [],
        subtasks: preview.subtasks ? preview.subtasks.map(title => ({
          id: crypto.randomUUID(),
          title,
          completed: false,
          created_at: new Date().toISOString(),
        })) : null,
      };

      console.log('Creating task with data:', taskData);

      const { data: task, error: taskError } = await supabase
        .from('contributions')
        .insert(taskData)
        .select()
        .single();

      if (taskError) {throw taskError;}

      // Assign members if any matched
      if (preview.assignee_matches && preview.assignee_matches.length > 0) {
        const matchedAssignees = preview.assignee_matches
          .filter(match => match.matchedName)
          .map(match => match.matchedName);

        if (matchedAssignees.length > 0) {
          // Get member IDs - need to join properly
          const { data: members } = await supabase
            .from('organization_members')
            .select(`
              user_id,
              profiles!organization_members_user_id_fkey(
                full_name
              )
            `)
            .eq('organization_id', (await supabase
              .from('internal_projects')
              .select('organization_id')
              .eq('id', projectId)
              .single()
            ).data?.organization_id);

          // Filter members whose names match
          const matchingMembers = members?.filter(m => 
            matchedAssignees.includes(m.profiles?.full_name)
          ) || [];

          if (matchingMembers.length > 0) {
            for (let i = 0; i < matchingMembers.length; i++) {
              await supabase.rpc('add_task_assignee', {
                p_task_id: task.id,
                p_assignee_id: matchingMembers[i].user_id,
                p_assigned_by: user.id,
                p_is_primary: i === 0,
              });
            }

            // Update task status to in_progress
            await supabase
              .from('contributions')
              .update({ status: 'in_progress' })
              .eq('id', task.id);
          }
        }
      }

      // Success!
      onTaskCreated?.(task);
      setInput('');
      setPreview(null);

    } catch (err) {
      console.error('Error creating task:', err);
      console.error('Full error details:', {
        error: err,
        preview: preview,
        projectId: projectId
      });
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsProcessing(false);
    }
  }, [preview, supabase, projectId, onTaskCreated]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input Section */}
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="relative">
              <Sparkles className="absolute left-3 top-3 h-5 w-5 text-neon-green" />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleParse();
                  }
                }}
                placeholder="Describe your task in natural language..."
                className="w-full pl-11 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg 
                         text-white placeholder-dark-muted focus:border-neon-green focus:outline-none
                         resize-none min-h-[80px]"
              />
            </div>
            
            {/* Examples */}
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="text-xs text-dark-muted hover:text-neon-green mt-2 transition-colors"
            >
              {showExamples ? 'Hide' : 'Show'} examples
            </button>
            
            {showExamples && (
              <div className="mt-2 space-y-1">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="block text-xs text-left text-dark-muted hover:text-white 
                             bg-dark-surface px-3 py-2 rounded hover:bg-dark-card 
                             transition-all w-full"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            )}
          </div>

          <NeonButton
            onClick={handleParse}
            disabled={!input.trim() || isProcessing}
            loading={isProcessing}
            size="sm"
            className="mt-1"
          >
            <Wand2 className="h-4 w-4" />
            Parse
          </NeonButton>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-neon-green mb-3">Task Preview</h3>
          
          {/* Title */}
          <div>
            <h4 className="font-medium text-white">{preview.title}</h4>
            {preview.description && (
              <p className="text-sm text-dark-muted mt-1">{preview.description}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm">
            {/* Priority */}
            {preview.priority && (
              <div className="flex items-center gap-2">
                <Flag className={cn("h-4 w-4", getPriorityColor(preview.priority))} />
                <span className="capitalize">{preview.priority} priority</span>
              </div>
            )}

            {/* Due Date */}
            {preview.due_date_parsed && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>
                  {formatDueDate(parseLocalISODate(preview.due_date_parsed.date))}
                  {preview.due_date_parsed.confidence === 'low' && (
                    <span className="text-yellow-400 ml-1">(?)</span>
                  )}
                  <span className="text-xs text-dark-muted ml-1">
                    ({parseLocalISODate(preview.due_date_parsed.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })})
                  </span>
                </span>
              </div>
            )}

            {/* Assignees */}
            {preview.assignee_matches && preview.assignee_matches.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span>
                  {preview.assignee_matches
                    .filter(m => m.matchedName)
                    .map(m => m.matchedName)
                    .join(', ') || 'No matches found'}
                </span>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {preview.subtasks && preview.subtasks.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-dark-muted mb-2">Subtasks:</p>
              <ul className="space-y-1">
                {preview.subtasks.map((subtask, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 border border-dark-border rounded" />
                    <span>{subtask}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unmatched Assignees Warning */}
          {preview.assignee_matches?.some(m => !m.matchedName) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
              <p className="text-xs text-yellow-400">
                Could not find: {preview.assignee_matches
                  .filter(m => !m.matchedName)
                  .map(m => m.requestedName)
                  .join(', ')}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-dark-border">
            <button
              onClick={() => {
                setPreview(null);
                setInput('');
              }}
              className="text-sm text-dark-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <NeonButton
              onClick={handleCreateTask}
              disabled={isProcessing}
              loading={isProcessing}
              size="sm"
            >
              <Check className="h-4 w-4" />
              Create Task
            </NeonButton>
          </div>
        </div>
      )}
    </div>
  );
}