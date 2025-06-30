export interface Project {
  id: string;
  name: string;
  description: string;
  timeline: 'this_week' | 'this_month' | 'this_semester';
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  visibility: 'internal' | 'public';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  team_id?: string;
  lead_id?: string;
  due_date?: string;
  labels?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at?: string;
  organization_id: string;
  
  // Computed fields from joins
  team?: Team;
  lead?: User;
  tasks?: Task[];
  members?: User[];
  task_stats?: TaskStats;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

export interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
}

export interface Task {
  id: string;
  task_name: string;
  task_description: string;
  skills_used: string[];
  status: 'pending' | 'in_progress' | 'completed';
  contributor_id?: string;
  contributor?: User;
  subtasks?: Subtask[];
  required_skills?: Skill[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  assigned: number;
  skill_gaps: number;
}