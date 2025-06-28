export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Creative' | 'Business' | 'Leadership' | 'Communication' | 'Operations';
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberSkill {
  user_id: string;
  skill_id: string;
  skill?: Skill;
  added_at: string;
  source: 'self_reported' | 'task_verified' | 'peer_endorsed';
  verified_at?: string;
  endorsed_by_count: number;
}

export interface TaskRequiredSkill {
  task_id: string;
  skill_id: string;
  skill?: Skill;
  importance: 'required' | 'preferred';
  added_at: string;
}

export interface MemberWithSkills {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  email?: string;
  skills: MemberSkill[];
}