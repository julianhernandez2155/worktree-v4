export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          year_of_study: string | null
          major: string | null
          interests: string[]
          looking_for: string[]
          interest_embeddings: number[] | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          year_of_study?: string | null
          major?: string | null
          interests?: string[]
          looking_for?: string[]
          interest_embeddings?: number[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          year_of_study?: string | null
          major?: string | null
          interests?: string[]
          looking_for?: string[]
          interest_embeddings?: number[] | null
        }
      }
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website: string | null
          verified: boolean
          admin_id: string
          member_count: number
          category: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          verified?: boolean
          admin_id: string
          member_count?: number
          category: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          verified?: boolean
          admin_id?: string
          member_count?: number
          category?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          title: string
          description: string
          type: 'project' | 'internship' | 'research' | 'volunteer' | 'job' | 'event'
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          time_commitment: string
          location: string | null
          is_remote: boolean
          start_date: string | null
          end_date: string | null
          application_deadline: string | null
          required_skills: string[]
          preferred_skills: string[]
          skill_embeddings: number[] | null
          status: 'draft' | 'active' | 'closed' | 'archived'
          view_count: number
          application_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          title: string
          description: string
          type: 'project' | 'internship' | 'research' | 'volunteer' | 'job' | 'event'
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          time_commitment: string
          location?: string | null
          is_remote?: boolean
          start_date?: string | null
          end_date?: string | null
          application_deadline?: string | null
          required_skills?: string[]
          preferred_skills?: string[]
          skill_embeddings?: number[] | null
          status?: 'draft' | 'active' | 'closed' | 'archived'
          view_count?: number
          application_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id?: string
          title?: string
          description?: string
          type?: 'project' | 'internship' | 'research' | 'volunteer' | 'job' | 'event'
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          time_commitment?: string
          location?: string | null
          is_remote?: boolean
          start_date?: string | null
          end_date?: string | null
          application_deadline?: string | null
          required_skills?: string[]
          preferred_skills?: string[]
          skill_embeddings?: number[] | null
          status?: 'draft' | 'active' | 'closed' | 'archived'
          view_count?: number
          application_count?: number
        }
      }
      applications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          opportunity_id: string
          user_id: string
          status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
          cover_letter: string | null
          resume_url: string | null
          match_score: number | null
          ai_feedback: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          opportunity_id: string
          user_id: string
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
          cover_letter?: string | null
          resume_url?: string | null
          match_score?: number | null
          ai_feedback?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          opportunity_id?: string
          user_id?: string
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
          cover_letter?: string | null
          resume_url?: string | null
          match_score?: number | null
          ai_feedback?: Json | null
        }
      }
      skills: {
        Row: {
          id: string
          created_at: string
          name: string
          category: string
          embedding: number[] | null
          usage_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          category: string
          embedding?: number[] | null
          usage_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          category?: string
          embedding?: number[] | null
          usage_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_opportunities: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          organization_id: string
          difficulty: string
          similarity: number
        }[]
      }
      get_user_recommendations: {
        Args: {
          user_id: string
          limit_count?: number
        }
        Returns: {
          opportunity_id: string
          match_score: number
          reasons: Json
        }[]
      }
    }
    Enums: {
      opportunity_type: 'project' | 'internship' | 'research' | 'volunteer' | 'job' | 'event'
      difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      application_status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
      opportunity_status: 'draft' | 'active' | 'closed' | 'archived'
    }
  }
}