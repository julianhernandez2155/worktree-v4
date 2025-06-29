export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          bio: string | null;
          major: string | null;
          year_of_study: string | null;
          university_id: string | null;
          created_at: string;
          updated_at: string;
          cover_photo_url: string | null;
          tagline: string | null;
          phone: string | null;
          location: string | null;
          social_links: any[] | null;
          interests: string[] | null;
          looking_for: string[] | null;
          open_to_opportunities: boolean;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
          mission: string | null;
          what_we_do: string | null;
          values: string[] | null;
          email: string | null;
          location: string | null;
          social_links: any[] | null;
          meeting_schedule: string | null;
          join_process: string | null;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      organization_members: {
        Row: {
          organization_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: Database['public']['Tables']['organization_members']['Row'];
        Update: Partial<Database['public']['Tables']['organization_members']['Insert']>;
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['skills']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['skills']['Insert']>;
      };
      member_skills: {
        Row: {
          skill_id: string;
          user_id: string;
          added_at: string;
          verified_at: string | null;
          endorsed_by_count: number;
          source: string;
        };
        Insert: Database['public']['Tables']['member_skills']['Row'];
        Update: Partial<Database['public']['Tables']['member_skills']['Insert']>;
      };
      internal_projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
          is_public: boolean;
          team_size_limit: number | null;
          commitment_level: string | null;
          time_commitment_hours: number | null;
          achievement: string | null;
          image_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['internal_projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['internal_projects']['Insert']>;
      };
      contributions: {
        Row: {
          id: string;
          project_id: string;
          contributor_id: string | null;
          title: string;
          description: string | null;
          status: string;
          points: number | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          subtasks: any[] | null;
        };
        Insert: Omit<Database['public']['Tables']['contributions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contributions']['Insert']>;
      };
      task_assignees: {
        Row: {
          task_id: string;
          user_id: string;
          assigned_at: string;
          completed_at: string | null;
        };
        Insert: Database['public']['Tables']['task_assignees']['Row'];
        Update: Partial<Database['public']['Tables']['task_assignees']['Insert']>;
      };
      task_required_skills: {
        Row: {
          task_id: string;
          skill_id: string;
          required: boolean;
        };
        Insert: Database['public']['Tables']['task_required_skills']['Row'];
        Update: Partial<Database['public']['Tables']['task_required_skills']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Helper types for common query results
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
export type Skill = Database['public']['Tables']['skills']['Row'];
export type MemberSkill = Database['public']['Tables']['member_skills']['Row'];
export type InternalProject = Database['public']['Tables']['internal_projects']['Row'];
export type Contribution = Database['public']['Tables']['contributions']['Row'];
export type TaskAssignee = Database['public']['Tables']['task_assignees']['Row'];
export type TaskRequiredSkill = Database['public']['Tables']['task_required_skills']['Row'];

// Extended types with relations
export interface ProfileWithRelations extends Profile {
  organization_members?: (OrganizationMember & {
    organizations: Organization;
  })[];
  member_skills?: (MemberSkill & {
    skills: Skill;
  })[];
}

export interface OrganizationWithRelations extends Organization {
  organization_members?: (OrganizationMember & {
    profiles: Profile;
  })[];
}

export interface ContributionWithRelations extends Contribution {
  internal_projects?: InternalProject & {
    organizations: Organization;
  };
  task_assignees?: TaskAssignee[];
  task_required_skills?: (TaskRequiredSkill & {
    skills: Skill;
  })[];
}