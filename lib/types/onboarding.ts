// Onboarding types for Worktree's Hook & Nudge approach

// User types
export type UserType = 'student' | 'org_leader' | 'admin';
export type PrimaryRole = 'org_member' | 'freelancer' | 'both';

// Organization setup types
export interface OrgQuickSetup {
  name: string;
  type: 'academic' | 'cultural' | 'professional' | 'service' | 'greek' | 'other';
  size: 'small' | 'medium' | 'large'; // <20, 20-50, 50+
  primaryChallenge: string;
}

// Project setup types
export interface QuickProject {
  name: string;
  timeline: 'this_week' | 'this_month' | 'this_semester';
  topNeeds: string[]; // Max 3 skills needed
}

// Student quick start
export interface StudentQuickStart {
  fullName: string;
  university: string;
  primaryRole: PrimaryRole;
}

// Skill types
export interface SkillWithLevel {
  skillId: string;
  skillName: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  experience: 'class' | 'personal' | 'org_projects' | 'paid_work';
  portfolioUrl?: string;
}

// Invitation types
export interface InvitationData {
  inviterId: string;
  inviteeEmail: string;
  organizationId: string;
  invitationCode?: string;
  personalizedMessage?: string;
}

// Contextual prompt types
export interface ContextualPrompt {
  id: string;
  promptType: string;
  title: string;
  message: string;
  actionText: string;
  data?: Record<string, any>; // Dynamic data for the prompt
}

// Onboarding progress
export interface OnboardingProgress {
  userId: string;
  userType: UserType;
  stepsCompleted: Record<string, boolean>;
  lastPromptShown?: string;
  lastPromptTimestamp?: Date;
  completionPercentage: number;
  qualityScore?: number;
}

// Assessment types
export type AssessmentType = 'big_five' | 'riasec' | 'grit' | 'work_style';

export interface AssessmentResult {
  assessmentType: AssessmentType;
  rawScores: Record<string, number>;
  computedProfile?: {
    archetype: string; // e.g., "Creative Architect"
    traits: string[];
    description: string;
  };
  percentileScores?: Record<string, number>;
  context?: string;
}

// Organization analytics
export interface OrganizationHealth {
  organizationId: string;
  skillSufficiencyScore: number; // 0-100%
  projectCompletionRate: number; // 0-100%
  memberUtilizationRate: number; // 0-100%
  externalDependencyRate: number; // 0-100%
  activeMembers: number;
  totalProjects: number;
  calculatedAt: Date;
}

// Contribution tracking
export interface Contribution {
  id: string;
  projectId: string;
  contributorId: string;
  taskName: string;
  taskDescription?: string;
  skillsUsed: string[];
  hoursWorked?: number;
  completionQuality?: number; // 1-5
  verifiedBy?: string;
  contributionType: 'internal' | 'external';
  status: 'in_progress' | 'completed' | 'verified';
}

// Admin dashboard types
export interface AdminGoals {
  primaryObjectives: Array<
    'increase_engagement' | 
    'track_skill_development' | 
    'improve_retention' | 
    'measure_learning_outcomes' | 
    'identify_at_risk_students'
  >;
  reportingFrequency: 'weekly' | 'monthly' | 'semester';
  keyStakeholders: string[];
}

export interface DashboardMetrics {
  studentMetrics: Array<
    'participation_rate' | 
    'skill_growth' | 
    'project_completion' | 
    'cross_org_collaboration'
  >;
  orgMetrics: Array<
    'self_sufficiency_score' | 
    'project_velocity' | 
    'skill_gap_analysis' | 
    'member_utilization'
  >;
  campusMetrics: Array<
    'overall_engagement' | 
    'skill_supply_demand' | 
    'collaboration_network' | 
    'trending_skills'
  >;
}

// Psychometric archetypes based on assessments
export const PSYCHOMETRIC_ARCHETYPES = {
  'creative_architect': {
    name: 'The Creative Architect',
    traits: ['High Openness', 'High Conscientiousness'],
    description: 'You combine creativity with structure, perfect for innovative projects that need careful planning.'
  },
  'community_catalyst': {
    name: 'The Community Catalyst',
    traits: ['High Extraversion', 'High Social Interest'],
    description: 'You thrive on bringing people together and creating positive change through collaboration.'
  },
  'strategic_leader': {
    name: 'The Strategic Leader',
    traits: ['High Conscientiousness', 'High Enterprising'],
    description: 'You excel at planning and executing complex initiatives with clear goals.'
  },
  'analytical_innovator': {
    name: 'The Analytical Innovator',
    traits: ['High Investigative', 'High Openness'],
    description: 'You love solving complex problems and discovering new approaches through research.'
  },
  'supportive_mentor': {
    name: 'The Supportive Mentor',
    traits: ['High Agreeableness', 'High Social Interest'],
    description: 'You naturally help others grow and succeed, making you perfect for teaching and guidance roles.'
  }
} as const;

export type ArchetypeKey = keyof typeof PSYCHOMETRIC_ARCHETYPES;