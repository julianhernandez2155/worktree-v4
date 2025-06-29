import { LucideIcon } from 'lucide-react';

// Common types used across card implementations
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  verified?: boolean;
}

export interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  skills?: string[];
  year_of_study?: string;
  major?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organization: Organization;
  match_score?: number;
  application_deadline?: string;
  required_commitment_hours?: string;
  commitment_level?: 'Low' | 'Medium' | 'High' | 'Intensive';
  is_remote?: boolean;
  location?: string;
  required_skills?: string[];
  preferred_skills?: string[];
  matched_skills?: string[];
  is_saved?: boolean;
  is_applied?: boolean;
  status?: 'open' | 'in_progress' | 'completed';
}

export interface Member {
  id: string;
  user: User;
  role: string;
  joined_at: string;
  contributions?: number;
  last_active?: string;
}

export interface Role {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills?: string[];
  current_holder?: User;
  term_start_date?: string;
  term_end_date?: string;
  responsibilities?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  project_name?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  due_date?: string;
  created_at: string;
  assigned_to?: User[];
  required_skills?: string[];
  subtasks?: Subtask[];
  progress?: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Candidate {
  user: User;
  match_score: number;
  ready: boolean;
  skills_matched?: string[];
  skills_missing?: string[];
  development_plan?: string[];
}

// Card-specific types
export interface CardAction {
  icon: LucideIcon;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'default' | 'primary' | 'danger';
}

export interface CardMetadata {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export interface CardSkillGroup {
  label: string;
  skills: string[];
  variant?: 'default' | 'matched' | 'required' | 'growth';
  maxVisible?: number;
}

// Utility types for card variants
export type CardInteractionMode = 'view' | 'edit' | 'select';
export type CardDisplayMode = 'grid' | 'list' | 'compact';
export type CardStatus = 'default' | 'selected' | 'disabled' | 'loading';

// Props helpers for common card patterns
export interface BaseCardProps {
  mode?: CardInteractionMode;
  status?: CardStatus;
  onClick?: () => void;
  onSelect?: (selected: boolean) => void;
  className?: string;
}

export interface ProjectCardProps extends BaseCardProps {
  project: Project;
  showMatchScore?: boolean;
  showOrganization?: boolean;
  actions?: CardAction[];
}

export interface MemberCardProps extends BaseCardProps {
  member: Member;
  displayMode?: CardDisplayMode;
  showSkills?: boolean;
  showActivity?: boolean;
  orgSlug: string;
}

export interface RoleCardProps extends BaseCardProps {
  role: Role;
  status: 'stable' | 'at-risk' | 'vacant';
  candidates?: Candidate[];
  showSuccession?: boolean;
}

export interface TaskCardProps extends BaseCardProps {
  task: Task;
  showProject?: boolean;
  showAssignees?: boolean;
  showProgress?: boolean;
  onStatusChange?: (status: Task['status']) => void;
}