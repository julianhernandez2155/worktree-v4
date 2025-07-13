import {
  FileText,
  Users,
  Calendar,
  Target,
  CheckSquare,
  Clock,
  AlertCircle,
  Tag,
  Trophy,
  Eye,
  Send,
  BarChart3,
  Lightbulb,
  Activity,
  Flag,
  Image,
  Globe,
  BookOpen
} from 'lucide-react';

import { ColumnDefinition } from './DisplayMenu';

export const projectColumns: ColumnDefinition[] = [
  // Core Properties
  {
    id: 'name',
    label: 'Project Name',
    category: 'core',
    icon: FileText,
    defaultVisible: true,
    width: 300
  },
  {
    id: 'description',
    label: 'Description',
    category: 'core',
    icon: FileText,
    description: 'Project description',
    width: 400
  },
  {
    id: 'status',
    label: 'Status',
    category: 'core',
    icon: Activity,
    description: 'Current project status',
    width: 120
  },
  {
    id: 'visibility',
    label: 'Visibility',
    category: 'core',
    icon: Eye,
    description: 'Internal or Public',
    width: 100
  },
  {
    id: 'created_at',
    label: 'Created Date',
    category: 'core',
    icon: Calendar,
    width: 120
  },
  {
    id: 'updated_at',
    label: 'Updated Date',
    category: 'core',
    icon: Calendar,
    width: 120
  },

  // People & Assignment Properties
  {
    id: 'lead',
    label: 'Lead',
    category: 'people',
    icon: Users,
    defaultVisible: true,
    width: 140
  },
  {
    id: 'team',
    label: 'Team',
    category: 'people',
    icon: Users,
    defaultVisible: true,
    width: 120
  },
  {
    id: 'created_by',
    label: 'Created By',
    category: 'people',
    icon: Users,
    width: 180
  },
  {
    id: 'members',
    label: 'Team Members',
    category: 'people',
    icon: Users,
    description: 'All assigned members',
    width: 200
  },
  {
    id: 'member_count',
    label: 'Member Count',
    category: 'people',
    icon: Users,
    width: 100
  },

  // Progress & Metrics Properties
  {
    id: 'progress',
    label: 'Progress',
    category: 'progress',
    icon: BarChart3,
    defaultVisible: true,
    description: 'Task completion percentage',
    width: 120
  },
  {
    id: 'task_count',
    label: 'Task Count',
    category: 'progress',
    icon: CheckSquare,
    width: 100
  },
  {
    id: 'completed_tasks',
    label: 'Completed Tasks',
    category: 'progress',
    icon: CheckSquare,
    width: 120
  },
  {
    id: 'skill_gaps',
    label: 'Skill Gaps',
    category: 'progress',
    icon: Lightbulb,
    defaultVisible: true,
    description: 'Tasks needing skills',
    width: 110
  },
  {
    id: 'actual_hours',
    label: 'Actual Hours',
    category: 'progress',
    icon: Clock,
    width: 100
  },
  {
    id: 'estimated_hours',
    label: 'Estimated Hours',
    category: 'progress',
    icon: Clock,
    width: 120
  },

  // Scheduling Properties
  {
    id: 'due_date',
    label: 'Target Date',
    category: 'scheduling',
    icon: Calendar,
    defaultVisible: true,
    width: 130
  },
  {
    id: 'timeline',
    label: 'Timeline',
    category: 'scheduling',
    icon: Calendar,
    description: 'This week/month/semester',
    width: 140
  },
  {
    id: 'preferred_start_date',
    label: 'Start Date',
    category: 'scheduling',
    icon: Calendar,
    width: 120
  },
  {
    id: 'days_until_due',
    label: 'Days Until Due',
    category: 'scheduling',
    icon: Clock,
    description: 'Calculated from due date',
    width: 120
  },

  // Priority & Organization Properties
  {
    id: 'priority',
    label: 'Priority',
    category: 'priority',
    icon: Flag,
    width: 100
  },
  {
    id: 'labels',
    label: 'Labels',
    category: 'priority',
    icon: Tag,
    description: 'Project tags',
    width: 200
  },
  {
    id: 'achievement',
    label: 'Achievement',
    category: 'priority',
    icon: Trophy,
    width: 200
  },
  {
    id: 'image_url',
    label: 'Image',
    category: 'priority',
    icon: Image,
    width: 80
  },

  // Public/Application Properties
  {
    id: 'is_public',
    label: 'Is Public',
    category: 'public',
    icon: Globe,
    width: 100
  },
  {
    id: 'application_count',
    label: 'Applications',
    category: 'public',
    icon: Send,
    width: 120
  },
  {
    id: 'view_count',
    label: 'Views',
    category: 'public',
    icon: Eye,
    width: 100
  },
  {
    id: 'max_applicants',
    label: 'Max Applicants',
    category: 'public',
    icon: Users,
    width: 120
  },
  {
    id: 'application_deadline',
    label: 'Apply Deadline',
    category: 'public',
    icon: Calendar,
    width: 140
  },
  {
    id: 'required_commitment_hours',
    label: 'Required Hours',
    category: 'public',
    icon: Clock,
    width: 120
  },
  {
    id: 'application_requirements',
    label: 'Requirements',
    category: 'public',
    icon: BookOpen,
    width: 300
  },
  {
    id: 'published_at',
    label: 'Published Date',
    category: 'public',
    icon: Calendar,
    width: 140
  },

  // Calculated/Aggregated Properties
  {
    id: 'active_assignees',
    label: 'Active Assignees',
    category: 'calculated',
    icon: Users,
    description: 'People with in-progress tasks',
    width: 140
  },
  {
    id: 'overdue_tasks',
    label: 'Overdue Tasks',
    category: 'calculated',
    icon: AlertCircle,
    width: 120
  },
  {
    id: 'skills_required',
    label: 'Skills Required',
    category: 'calculated',
    icon: Lightbulb,
    description: 'All unique skills needed',
    width: 200
  },
  {
    id: 'skills_covered',
    label: 'Skills Covered',
    category: 'calculated',
    icon: CheckSquare,
    description: 'Skills matched by team',
    width: 200
  },
  {
    id: 'completion_rate',
    label: 'Completion Rate',
    category: 'calculated',
    icon: BarChart3,
    width: 120
  },
  {
    id: 'days_active',
    label: 'Days Active',
    category: 'calculated',
    icon: Clock,
    description: 'Since creation',
    width: 100
  },
  {
    id: 'last_activity',
    label: 'Last Activity',
    category: 'calculated',
    icon: Activity,
    description: 'Most recent update',
    width: 140
  }
];

// Default columns for clean initial view
export const defaultColumns = [
  'name',
  'priority',
  'lead',
  'progress',
  'due_date'
];