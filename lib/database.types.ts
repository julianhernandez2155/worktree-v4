
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applications: {
        Row: {
          ai_feedback: Json | null
          cover_letter: string | null
          created_at: string
          id: string
          match_score: number | null
          opportunity_id: string
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          match_score?: number | null
          opportunity_id: string
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          match_score?: number | null
          opportunity_id?: string
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contextual_prompts: {
        Row: {
          action_text: string | null
          active: boolean | null
          completed_by_users: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          message: string
          prompt_type: string
          shown_to_users: number | null
          title: string
          trigger_condition: string
        }
        Insert: {
          action_text?: string | null
          active?: boolean | null
          completed_by_users?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          message: string
          prompt_type: string
          shown_to_users?: number | null
          title: string
          trigger_condition: string
        }
        Update: {
          action_text?: string | null
          active?: boolean | null
          completed_by_users?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          message?: string
          prompt_type?: string
          shown_to_users?: number | null
          title?: string
          trigger_condition?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          assigned_at: string | null
          assignee_notes: string | null
          completed_at: string | null
          completion_quality: number | null
          contributor_id: string | null
          created_at: string | null
          due_date: string | null
          estimated_hours: number | null
          hours_worked: number | null
          id: string
          priority: string | null
          project_id: string | null
          skills_used: string[] | null
          status: string | null
          subtasks: Json | null
          task_description: string | null
          task_name: string
          verified_by: string | null
        }
        Insert: {
          assigned_at?: string | null
          assignee_notes?: string | null
          completed_at?: string | null
          completion_quality?: number | null
          contributor_id?: string | null
          created_at?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          hours_worked?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          skills_used?: string[] | null
          status?: string | null
          subtasks?: Json | null
          task_description?: string | null
          task_name: string
          verified_by?: string | null
        }
        Update: {
          assigned_at?: string | null
          assignee_notes?: string | null
          completed_at?: string | null
          completion_quality?: number | null
          contributor_id?: string | null
          created_at?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          hours_worked?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          skills_used?: string[] | null
          status?: string | null
          subtasks?: Json | null
          task_description?: string | null
          task_name?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "internal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_skill_matches"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "contributions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_projects: {
        Row: {
          achievement: string | null
          application_count: number | null
          application_deadline: string | null
          application_requirements: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          max_applicants: number | null
          name: string
          organization_id: string | null
          preferred_start_date: string | null
          public_description: string | null
          published_at: string | null
          required_commitment_hours: number | null
          status: string | null
          timeline: string | null
          updated_at: string | null
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          achievement?: string | null
          application_count?: number | null
          application_deadline?: string | null
          application_requirements?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          max_applicants?: number | null
          name: string
          organization_id?: string | null
          preferred_start_date?: string | null
          public_description?: string | null
          published_at?: string | null
          required_commitment_hours?: number | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          achievement?: string | null
          application_count?: number | null
          application_deadline?: string | null
          application_requirements?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          max_applicants?: number | null
          name?: string
          organization_id?: string | null
          preferred_start_date?: string | null
          public_description?: string | null
          published_at?: string | null
          required_commitment_hours?: number | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          expires_at: string | null
          id: string
          invitation_code: string | null
          invitee_email: string
          inviter_id: string | null
          opened_at: string | null
          organization_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_code?: string | null
          invitee_email: string
          inviter_id?: string | null
          opened_at?: string | null
          organization_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_code?: string | null
          invitee_email?: string
          inviter_id?: string | null
          opened_at?: string | null
          organization_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      member_skills: {
        Row: {
          added_at: string | null
          endorsed_by_count: number | null
          skill_id: string
          source: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          added_at?: string | null
          endorsed_by_count?: number | null
          skill_id: string
          source?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          added_at?: string | null
          endorsed_by_count?: number | null
          skill_id?: string
          source?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          id: string
          last_prompt_shown: string | null
          last_prompt_timestamp: string | null
          quality_score: number | null
          steps_completed: Json | null
          updated_at: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_prompt_shown?: string | null
          last_prompt_timestamp?: string | null
          quality_score?: number | null
          steps_completed?: Json | null
          updated_at?: string | null
          user_id?: string | null
          user_type: string
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_prompt_shown?: string | null
          last_prompt_timestamp?: string | null
          quality_score?: number | null
          steps_completed?: Json | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          application_count: number | null
          application_deadline: string | null
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          end_date: string | null
          id: string
          is_remote: boolean | null
          location: string | null
          organization_id: string
          preferred_skills: string[] | null
          required_skills: string[] | null
          skill_embeddings: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          time_commitment: string
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at: string
          view_count: number | null
        }
        Insert: {
          application_count?: number | null
          application_deadline?: string | null
          created_at?: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          end_date?: string | null
          id?: string
          is_remote?: boolean | null
          location?: string | null
          organization_id: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          skill_embeddings?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          time_commitment: string
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          application_count?: number | null
          application_deadline?: string | null
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          end_date?: string | null
          id?: string
          is_remote?: boolean | null
          location?: string | null
          organization_id?: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          skill_embeddings?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          time_commitment?: string
          title?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_analytics: {
        Row: {
          active_members: number | null
          calculated_at: string | null
          external_dependency_rate: number | null
          id: string
          member_utilization_rate: number | null
          organization_id: string | null
          project_completion_rate: number | null
          skill_sufficiency_score: number | null
          total_projects: number | null
        }
        Insert: {
          active_members?: number | null
          calculated_at?: string | null
          external_dependency_rate?: number | null
          id?: string
          member_utilization_rate?: number | null
          organization_id?: string | null
          project_completion_rate?: number | null
          skill_sufficiency_score?: number | null
          total_projects?: number | null
        }
        Update: {
          active_members?: number | null
          calculated_at?: string | null
          external_dependency_rate?: number | null
          id?: string
          member_utilization_rate?: number | null
          organization_id?: string | null
          project_completion_rate?: number | null
          skill_sufficiency_score?: number | null
          total_projects?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          joined_at: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          joined_at?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_roles: {
        Row: {
          created_at: string | null
          current_holder_id: string | null
          description: string | null
          id: string
          organization_id: string | null
          required_skills: string[] | null
          term_end_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_holder_id?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          required_skills?: string[] | null
          term_end_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_holder_id?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          required_skills?: string[] | null
          term_end_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_roles_current_holder_id_fkey"
            columns: ["current_holder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_skill_needs: {
        Row: {
          created_at: string | null
          current_gap_level: number | null
          frequency: string | null
          id: string
          last_fulfilled: string | null
          need_type: string
          organization_id: string | null
          skill_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_gap_level?: number | null
          frequency?: string | null
          id?: string
          last_fulfilled?: string | null
          need_type: string
          organization_id?: string | null
          skill_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_gap_level?: number | null
          frequency?: string | null
          id?: string
          last_fulfilled?: string | null
          need_type?: string
          organization_id?: string | null
          skill_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_skill_needs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_skill_needs_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          admin_id: string
          category: string
          created_at: string
          description: string | null
          email: string | null
          founded_date: string | null
          id: string
          join_process: string | null
          location: string | null
          logo_url: string | null
          meeting_schedule: string | null
          member_count: number | null
          mission: string | null
          name: string
          slug: string
          social_links: Json | null
          updated_at: string
          values: string[] | null
          verified: boolean | null
          website: string | null
          what_we_do: string | null
        }
        Insert: {
          admin_id: string
          category: string
          created_at?: string
          description?: string | null
          email?: string | null
          founded_date?: string | null
          id?: string
          join_process?: string | null
          location?: string | null
          logo_url?: string | null
          meeting_schedule?: string | null
          member_count?: number | null
          mission?: string | null
          name: string
          slug: string
          social_links?: Json | null
          updated_at?: string
          values?: string[] | null
          verified?: boolean | null
          website?: string | null
          what_we_do?: string | null
        }
        Update: {
          admin_id?: string
          category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          founded_date?: string | null
          id?: string
          join_process?: string | null
          location?: string | null
          logo_url?: string | null
          meeting_schedule?: string | null
          member_count?: number | null
          mission?: string | null
          name?: string
          slug?: string
          social_links?: Json | null
          updated_at?: string
          values?: string[] | null
          verified?: boolean | null
          website?: string | null
          what_we_do?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assessment_status: Json | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          interest_embeddings: string | null
          interests: string[] | null
          last_assessment_prompt: string | null
          looking_for: string[] | null
          major: string | null
          onboarding_completed: boolean | null
          primary_role: string | null
          profile_completeness: number | null
          psychometric_profile: Json | null
          university_id: string | null
          updated_at: string
          user_type: string[] | null
          username: string | null
          year_of_study: string | null
        }
        Insert: {
          assessment_status?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          interest_embeddings?: string | null
          interests?: string[] | null
          last_assessment_prompt?: string | null
          looking_for?: string[] | null
          major?: string | null
          onboarding_completed?: boolean | null
          primary_role?: string | null
          profile_completeness?: number | null
          psychometric_profile?: Json | null
          university_id?: string | null
          updated_at?: string
          user_type?: string[] | null
          username?: string | null
          year_of_study?: string | null
        }
        Update: {
          assessment_status?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          interest_embeddings?: string | null
          interests?: string[] | null
          last_assessment_prompt?: string | null
          looking_for?: string[] | null
          major?: string | null
          onboarding_completed?: boolean | null
          primary_role?: string | null
          profile_completeness?: number | null
          psychometric_profile?: Json | null
          university_id?: string | null
          updated_at?: string
          user_type?: string[] | null
          username?: string | null
          year_of_study?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      project_applications: {
        Row: {
          applicant_id: string | null
          applied_at: string | null
          availability_hours_per_week: number | null
          cover_letter: string | null
          created_at: string | null
          expected_start_date: string | null
          id: string
          matched_skills: string[] | null
          missing_skills: string[] | null
          portfolio_urls: string[] | null
          project_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          skill_match_score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id?: string | null
          applied_at?: string | null
          availability_hours_per_week?: number | null
          cover_letter?: string | null
          created_at?: string | null
          expected_start_date?: string | null
          id?: string
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          portfolio_urls?: string[] | null
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          skill_match_score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string | null
          applied_at?: string | null
          availability_hours_per_week?: number | null
          cover_letter?: string | null
          created_at?: string | null
          expected_start_date?: string | null
          id?: string
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          portfolio_urls?: string[] | null
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          skill_match_score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "internal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_skill_matches"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_views: {
        Row: {
          id: string
          project_id: string | null
          referrer: string | null
          view_duration_seconds: number | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          referrer?: string | null
          view_duration_seconds?: number | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          referrer?: string | null
          view_duration_seconds?: number | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "internal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_skill_matches"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_opportunities: {
        Row: {
          opportunity_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          opportunity_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          opportunity_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_projects: {
        Row: {
          project_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          project_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          project_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "internal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_skill_matches"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "saved_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_progression: {
        Row: {
          created_at: string | null
          current_level: Database["public"]["Enums"]["difficulty_level"] | null
          endorsement_count: number | null
          id: string
          initial_level: Database["public"]["Enums"]["difficulty_level"] | null
          last_used: string | null
          projects_used_in: number | null
          skill_id: string | null
          user_id: string | null
          verified_through_work: boolean | null
        }
        Insert: {
          created_at?: string | null
          current_level?: Database["public"]["Enums"]["difficulty_level"] | null
          endorsement_count?: number | null
          id?: string
          initial_level?: Database["public"]["Enums"]["difficulty_level"] | null
          last_used?: string | null
          projects_used_in?: number | null
          skill_id?: string | null
          user_id?: string | null
          verified_through_work?: boolean | null
        }
        Update: {
          created_at?: string | null
          current_level?: Database["public"]["Enums"]["difficulty_level"] | null
          endorsement_count?: number | null
          id?: string
          initial_level?: Database["public"]["Enums"]["difficulty_level"] | null
          last_used?: string | null
          projects_used_in?: number | null
          skill_id?: string | null
          user_id?: string | null
          verified_through_work?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_progression_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_progression_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          embedding: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      skills_array_backup: {
        Row: {
          backed_up_at: string | null
          full_name: string | null
          id: string | null
          skills: string[] | null
        }
        Insert: {
          backed_up_at?: string | null
          full_name?: string | null
          id?: string | null
          skills?: string[] | null
        }
        Update: {
          backed_up_at?: string | null
          full_name?: string | null
          id?: string | null
          skills?: string[] | null
        }
        Relationships: []
      }
      task_assignees: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assignee_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          task_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignee_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          task_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignee_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "my_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_required_skills: {
        Row: {
          added_at: string | null
          importance: string | null
          skill_id: string
          task_id: string
        }
        Insert: {
          added_at?: string | null
          importance?: string | null
          skill_id: string
          task_id: string
        }
        Update: {
          added_at?: string | null
          importance?: string | null
          skill_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_required_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_required_skills_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_required_skills_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "my_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          is_active: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          student_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          student_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          student_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_assessments: {
        Row: {
          assessment_type: string
          completed_at: string | null
          computed_profile: Json | null
          context: string | null
          id: string
          raw_scores: Json
          user_id: string | null
        }
        Insert: {
          assessment_type: string
          completed_at?: string | null
          computed_profile?: Json | null
          context?: string | null
          id?: string
          raw_scores: Json
          user_id?: string | null
        }
        Update: {
          assessment_type?: string
          completed_at?: string | null
          computed_profile?: Json | null
          context?: string | null
          id?: string
          raw_scores?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_psychometrics: {
        Row: {
          assessed_at: string | null
          assessment_type: string
          computed_profile: string | null
          context: string | null
          percentile_scores: Json | null
          raw_scores: Json
          user_id: string
        }
        Insert: {
          assessed_at?: string | null
          assessment_type: string
          computed_profile?: string | null
          context?: string | null
          percentile_scores?: Json | null
          raw_scores: Json
          user_id: string
        }
        Update: {
          assessed_at?: string | null
          assessment_type?: string
          computed_profile?: string | null
          context?: string | null
          percentile_scores?: Json | null
          raw_scores?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_psychometrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      index_usage_stats: {
        Row: {
          index_scans: number | null
          indexname: unknown | null
          schemaname: unknown | null
          tablename: unknown | null
          tuples_fetched: number | null
          tuples_read: number | null
        }
        Relationships: []
      }
      my_tasks: {
        Row: {
          assigned_at: string | null
          assignee_id: string | null
          assignee_notes: string | null
          completed_at: string | null
          completion_quality: number | null
          contribution_type: string | null
          contributor_id: string | null
          created_at: string | null
          due_date: string | null
          estimated_hours: number | null
          hours_worked: number | null
          id: string | null
          is_primary: boolean | null
          organization_id: string | null
          organization_name: string | null
          organization_slug: string | null
          priority: string | null
          project_id: string | null
          project_name: string | null
          skills_used: string[] | null
          status: string | null
          subtasks: Json | null
          task_description: string | null
          task_name: string | null
          urgency_status: string | null
          verified_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "internal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_skill_matches"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "contributions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_skill_matches: {
        Row: {
          application_deadline: string | null
          is_public: boolean | null
          organization_id: string | null
          organization_logo: string | null
          organization_name: string | null
          organization_verified: boolean | null
          preferred_skills: string[] | null
          project_id: string | null
          project_name: string | null
          required_skills: string[] | null
          status: string | null
          total_skills_needed: number | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_task_assignee: {
        Args: {
          p_task_id: string
          p_assignee_id: string
          p_assigned_by: string
          p_is_primary?: boolean
        }
        Returns: boolean
      }
      array_diff_uuid: {
        Args: { a: string[]; b: string[] }
        Returns: string[]
      }
      array_intersect_uuid: {
        Args: { a: string[]; b: string[] }
        Returns: string[]
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_organization_health: {
        Args: { org_id: string }
        Returns: {
          skill_sufficiency: number
          project_completion: number
          member_utilization: number
          external_dependency: number
        }[]
      }
      calculate_skill_match_score: {
        Args: { p_user_id: string; p_project_id: string }
        Returns: {
          match_score: number
          matched_required_skills: string[]
          matched_preferred_skills: string[]
          missing_required_skills: string[]
          total_required_skills: number
          total_preferred_skills: number
        }[]
      }
      get_recommended_projects: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          project_id: string
          project_name: string
          organization_id: string
          organization_name: string
          organization_logo: string
          match_score: number
          required_skills: string[]
          preferred_skills: string[]
          matched_skills: string[]
          missing_skills: string[]
          application_deadline: string
          is_saved: boolean
          has_applied: boolean
        }[]
      }
      get_user_recommendations: {
        Args: { user_id: string; limit_count?: number }
        Returns: {
          opportunity_id: string
          match_score: number
          reasons: Json
        }[]
      }
      get_user_task_load: {
        Args: { user_id: string }
        Returns: {
          total_tasks: number
          overdue_tasks: number
          high_priority_tasks: number
          hours_committed: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_opportunities: {
        Args: {
          query_embedding: string
          match_threshold?: number
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          organization_id: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          similarity: number
        }[]
      }
      refresh_project_skill_matches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      remove_task_assignee: {
        Args: { p_task_id: string; p_assignee_id: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      application_status:
        | "pending"
        | "reviewing"
        | "accepted"
        | "rejected"
        | "withdrawn"
      contribution_status: "pending" | "in_progress" | "completed" | "verified"
      difficulty_level: "beginner" | "intermediate" | "advanced" | "expert"
      member_role:
        | "member"
        | "admin"
        | "president"
        | "vice_president"
        | "treasurer"
        | "secretary"
        | "tech_lead"
        | "project_lead"
      opportunity_status: "draft" | "active" | "closed" | "archived"
      opportunity_type:
        | "project"
        | "internship"
        | "research"
        | "volunteer"
        | "job"
        | "event"
      priority_level: "low" | "medium" | "high" | "urgent"
      skill_source:
        | "self_reported"
        | "task_verified"
        | "peer_endorsed"
        | "migrated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "pending",
        "reviewing",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      contribution_status: ["pending", "in_progress", "completed", "verified"],
      difficulty_level: ["beginner", "intermediate", "advanced", "expert"],
      member_role: [
        "member",
        "admin",
        "president",
        "vice_president",
        "treasurer",
        "secretary",
        "tech_lead",
        "project_lead",
      ],
      opportunity_status: ["draft", "active", "closed", "archived"],
      opportunity_type: [
        "project",
        "internship",
        "research",
        "volunteer",
        "job",
        "event",
      ],
      priority_level: ["low", "medium", "high", "urgent"],
      skill_source: [
        "self_reported",
        "task_verified",
        "peer_endorsed",
        "migrated",
      ],
    },
  },
} as const
