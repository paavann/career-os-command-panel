export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          copilot_slug: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          copilot_slug: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          copilot_slug?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      authority_sessions: {
        Row: {
          authority_audit: string
          authority_score: number
          consistency_score: number
          created_at: string
          followup_transcript: Json
          form_data: Json
          framework_illustration: string
          framework_name: string
          framework_strength_score: number
          framework_structure: Json
          id: string
          member_id: string
          recognition_score: number
          score_reasoning: string
          this_weeks_action: string
          thought_leadership_score: number
        }
        Insert: {
          authority_audit: string
          authority_score: number
          consistency_score: number
          created_at?: string
          followup_transcript?: Json
          form_data?: Json
          framework_illustration: string
          framework_name: string
          framework_strength_score: number
          framework_structure?: Json
          id?: string
          member_id: string
          recognition_score: number
          score_reasoning: string
          this_weeks_action: string
          thought_leadership_score: number
        }
        Update: {
          authority_audit?: string
          authority_score?: number
          consistency_score?: number
          created_at?: string
          followup_transcript?: Json
          form_data?: Json
          framework_illustration?: string
          framework_name?: string
          framework_strength_score?: number
          framework_structure?: Json
          id?: string
          member_id?: string
          recognition_score?: number
          score_reasoning?: string
          this_weeks_action?: string
          thought_leadership_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "authority_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      career_scores: {
        Row: {
          authority: number
          clarity: number
          energy: number
          evidence: number
          reach: number
          revenue: number
          updated_at: string
          user_id: string
        }
        Insert: {
          authority?: number
          clarity?: number
          energy?: number
          evidence?: number
          reach?: number
          revenue?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          authority?: number
          clarity?: number
          energy?: number
          evidence?: number
          reach?: number
          revenue?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clarity_sessions: {
        Row: {
          clarity_score: number
          created_at: string
          followup_transcript: Json
          form_data: Json
          id: string
          market_gap_analysis: string
          market_gap_score: number
          member_id: string
          north_star_role: string
          persona_statement: string
          positioning_headlines: Json
          power_signals: Json
          score_reasoning: string
          specificity_score: number
          upskill_plan: string
          velocity_score: number
        }
        Insert: {
          clarity_score: number
          created_at?: string
          followup_transcript?: Json
          form_data?: Json
          id?: string
          market_gap_analysis: string
          market_gap_score: number
          member_id: string
          north_star_role: string
          persona_statement: string
          positioning_headlines?: Json
          power_signals?: Json
          score_reasoning: string
          specificity_score: number
          upskill_plan: string
          velocity_score: number
        }
        Update: {
          clarity_score?: number
          created_at?: string
          followup_transcript?: Json
          form_data?: Json
          id?: string
          market_gap_analysis?: string
          market_gap_score?: number
          member_id?: string
          north_star_role?: string
          persona_statement?: string
          positioning_headlines?: Json
          power_signals?: Json
          score_reasoning?: string
          specificity_score?: number
          upskill_plan?: string
          velocity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "clarity_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      diamond_goals: {
        Row: {
          created_at: string
          id: string
          member_id: string
          progress: number
          status: string
          target_date: string
          target_role: string | null
          timeline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          progress?: number
          status?: string
          target_date: string
          target_role?: string | null
          timeline?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          progress?: number
          status?: string
          target_date?: string
          target_role?: string | null
          timeline?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diamond_goals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_rewrites: {
        Row: {
          context_type: string
          created_at: string
          id: string
          member_id: string
          original_text: string
          rewritten_text: string
          what_changed: Json
        }
        Insert: {
          context_type: string
          created_at?: string
          id?: string
          member_id: string
          original_text: string
          rewritten_text: string
          what_changed?: Json
        }
        Update: {
          context_type?: string
          created_at?: string
          id?: string
          member_id?: string
          original_text?: string
          rewritten_text?: string
          what_changed?: Json
        }
        Relationships: [
          {
            foreignKeyName: "energy_rewrites_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_sessions: {
        Row: {
          clarity_thought_score: number
          command_room_score: number
          composure_score: number
          consideration_score: number
          conviction_score: number
          created_at: string
          energy_score: number
          fixes_list: Json
          followup_transcript: Json
          form_data: Json
          id: string
          member_id: string
          practice_checks: Json
          presence_audit: string
          score_reasoning: string
          weekly_practice: Json
        }
        Insert: {
          clarity_thought_score: number
          command_room_score: number
          composure_score: number
          consideration_score: number
          conviction_score: number
          created_at?: string
          energy_score: number
          fixes_list?: Json
          followup_transcript?: Json
          form_data?: Json
          id?: string
          member_id: string
          practice_checks?: Json
          presence_audit: string
          score_reasoning: string
          weekly_practice?: Json
        }
        Update: {
          clarity_thought_score?: number
          command_room_score?: number
          composure_score?: number
          consideration_score?: number
          conviction_score?: number
          created_at?: string
          energy_score?: number
          fixes_list?: Json
          followup_transcript?: Json
          form_data?: Json
          id?: string
          member_id?: string
          practice_checks?: Json
          presence_audit?: string
          score_reasoning?: string
          weekly_practice?: Json
        }
        Relationships: [
          {
            foreignKeyName: "energy_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_entries: {
        Row: {
          category: string
          created_at: string
          edited_at: string
          id: string
          member_id: string
          polished_bullet: string
          quality_note: string
          quality_score: number
          raw_input: string
        }
        Insert: {
          category: string
          created_at?: string
          edited_at?: string
          id?: string
          member_id: string
          polished_bullet: string
          quality_note?: string
          quality_score: number
          raw_input: string
        }
        Update: {
          category?: string
          created_at?: string
          edited_at?: string
          id?: string
          member_id?: string
          polished_bullet?: string
          quality_note?: string
          quality_score?: number
          raw_input?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_entries_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string
          goal_id: string
          id: string
          sort_order: number
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string
          goal_id: string
          id?: string
          sort_order?: number
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string
          goal_id?: string
          id?: string
          sort_order?: number
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "diamond_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_mission_completions: {
        Row: {
          completed_on: string
          created_at: string
          id: string
          mission_slug: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          completed_on?: string
          created_at?: string
          id?: string
          mission_slug: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          completed_on?: string
          created_at?: string
          id?: string
          mission_slug?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company: string
          created_at: string
          ctc_max: number | null
          ctc_min: number | null
          follow_up_date: string | null
          id: string
          jd_text: string | null
          job_url: string | null
          notes: string | null
          notes_log: Json
          outcome: string | null
          priority: Database["public"]["Enums"]["job_priority"]
          recruiter_contact: string | null
          recruiter_name: string | null
          role: string
          source: string | null
          stage: Database["public"]["Enums"]["job_stage"]
          stage_entered_at: string
          stage_history: Json
          target_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          ctc_max?: number | null
          ctc_min?: number | null
          follow_up_date?: string | null
          id?: string
          jd_text?: string | null
          job_url?: string | null
          notes?: string | null
          notes_log?: Json
          outcome?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          recruiter_contact?: string | null
          recruiter_name?: string | null
          role: string
          source?: string | null
          stage?: Database["public"]["Enums"]["job_stage"]
          stage_entered_at?: string
          stage_history?: Json
          target_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          ctc_max?: number | null
          ctc_min?: number | null
          follow_up_date?: string | null
          id?: string
          jd_text?: string | null
          job_url?: string | null
          notes?: string | null
          notes_log?: Json
          outcome?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          recruiter_contact?: string | null
          recruiter_name?: string | null
          role?: string
          source?: string | null
          stage?: Database["public"]["Enums"]["job_stage"]
          stage_entered_at?: string
          stage_history?: Json
          target_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          access_code_hash: string
          career_goal: string | null
          created_at: string
          first_seen: string
          id: string
          industry: string | null
          last_seen: string
          role_title: string | null
          target_timeline: string | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          access_code_hash: string
          career_goal?: string | null
          created_at?: string
          first_seen?: string
          id: string
          industry?: string | null
          last_seen?: string
          role_title?: string | null
          target_timeline?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          access_code_hash?: string
          career_goal?: string | null
          created_at?: string
          first_seen?: string
          id?: string
          industry?: string | null
          last_seen?: string
          role_title?: string | null
          target_timeline?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          active: boolean
          category: string
          coin_reward: number
          created_at: string
          description: string | null
          id: string
          title: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          category?: string
          coin_reward?: number
          created_at?: string
          description?: string | null
          id?: string
          title: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          category?: string
          coin_reward?: number
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biggest_challenge: string | null
          city: string | null
          coins: number
          cpi_score: number
          created_at: string
          current_company: string | null
          display_name: string
          first_name: string | null
          headline: string | null
          id: string
          industry: string | null
          job_title: string | null
          last_active_date: string | null
          last_name: string | null
          last_promotion: string | null
          level: number
          linkedin_status: string | null
          linkedin_url: string | null
          onboarding_completed: boolean
          primary_goal: string | null
          streak_days: number
          target_role: string | null
          target_timeline: string | null
          tier: string
          updated_at: string
          xp: number
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          biggest_challenge?: string | null
          city?: string | null
          coins?: number
          cpi_score?: number
          created_at?: string
          current_company?: string | null
          display_name?: string
          first_name?: string | null
          headline?: string | null
          id: string
          industry?: string | null
          job_title?: string | null
          last_active_date?: string | null
          last_name?: string | null
          last_promotion?: string | null
          level?: number
          linkedin_status?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean
          primary_goal?: string | null
          streak_days?: number
          target_role?: string | null
          target_timeline?: string | null
          tier?: string
          updated_at?: string
          xp?: number
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          biggest_challenge?: string | null
          city?: string | null
          coins?: number
          cpi_score?: number
          created_at?: string
          current_company?: string | null
          display_name?: string
          first_name?: string | null
          headline?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_active_date?: string | null
          last_name?: string | null
          last_promotion?: string | null
          level?: number
          linkedin_status?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean
          primary_goal?: string | null
          streak_days?: number
          target_role?: string | null
          target_timeline?: string | null
          tier?: string
          updated_at?: string
          xp?: number
          years_experience?: number | null
        }
        Relationships: []
      }
      reach_sessions: {
        Row: {
          brand_score: number
          created_at: string
          find_people_score: number
          followup_transcript: Json
          form_data: Json
          id: string
          insights_score: number
          member_id: string
          reach_score: number
          relationships_score: number
          score_reasoning: string
          seven_day_sprint: Json
          thirty_day_trajectory: Json
          visibility_audit: string
        }
        Insert: {
          brand_score: number
          created_at?: string
          find_people_score: number
          followup_transcript?: Json
          form_data?: Json
          id?: string
          insights_score: number
          member_id: string
          reach_score: number
          relationships_score: number
          score_reasoning: string
          seven_day_sprint?: Json
          thirty_day_trajectory?: Json
          visibility_audit: string
        }
        Update: {
          brand_score?: number
          created_at?: string
          find_people_score?: number
          followup_transcript?: Json
          form_data?: Json
          id?: string
          insights_score?: number
          member_id?: string
          reach_score?: number
          relationships_score?: number
          score_reasoning?: string
          seven_day_sprint?: Json
          thirty_day_trajectory?: Json
          visibility_audit?: string
        }
        Relationships: [
          {
            foreignKeyName: "reach_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_sessions: {
        Row: {
          created_at: string
          current_ctc: number
          form_data: Json
          gap_analysis: string
          id: string
          leverage_points: Json
          market_alignment_score: number
          market_range_high: number
          market_range_low: number
          market_range_median: number
          member_id: string
          negotiation_readiness_score: number
          revenue_score: number
          score_reasoning: string
          sources_used: Json
        }
        Insert: {
          created_at?: string
          current_ctc: number
          form_data?: Json
          gap_analysis: string
          id?: string
          leverage_points?: Json
          market_alignment_score: number
          market_range_high: number
          market_range_low: number
          market_range_median: number
          member_id: string
          negotiation_readiness_score: number
          revenue_score: number
          score_reasoning: string
          sources_used?: Json
        }
        Update: {
          created_at?: string
          current_ctc?: number
          form_data?: Json
          gap_analysis?: string
          id?: string
          leverage_points?: Json
          market_alignment_score?: number
          market_range_high?: number
          market_range_low?: number
          market_range_median?: number
          member_id?: string
          negotiation_readiness_score?: number
          revenue_score?: number
          score_reasoning?: string
          sources_used?: Json
        }
        Relationships: [
          {
            foreignKeyName: "revenue_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          completed_modules: number[]
          course_completed_at: string | null
          course_slug: string
          notes: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_modules?: number[]
          course_completed_at?: string | null
          course_slug: string
          notes?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_modules?: number[]
          course_completed_at?: string | null
          course_slug?: string
          notes?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: {
          _amount: number
          _coins?: number
          _source: string
          _user_id: string
        }
        Returns: {
          new_coins: number
          new_level: number
          new_streak: number
          new_xp: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      job_priority: "high" | "medium" | "low"
      job_stage:
        | "wishlist"
        | "applied"
        | "phone_screen"
        | "interview"
        | "final_round"
        | "offer"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member"],
      job_priority: ["high", "medium", "low"],
      job_stage: [
        "wishlist",
        "applied",
        "phone_screen",
        "interview",
        "final_round",
        "offer",
        "closed",
      ],
    },
  },
} as const
