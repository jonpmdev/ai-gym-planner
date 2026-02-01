/**
 * Database types for Supabase
 *
 * Auto-generated from Supabase schema on 2026-02-01
 * To regenerate: npx supabase gen types typescript --project-id <project-id>
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exercise_library: {
        Row: {
          created_at: string | null
          difficulty: string | null
          equipment_required: Json | null
          id: string
          instructions: string | null
          muscle_groups: Json | null
          name: string
          name_normalized: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          equipment_required?: Json | null
          id?: string
          instructions?: string | null
          muscle_groups?: Json | null
          name: string
          name_normalized: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          equipment_required?: Json | null
          id?: string
          instructions?: string | null
          muscle_groups?: Json | null
          name?: string
          name_normalized?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          reps_completed: number | null
          rpe: number | null
          session_id: string
          set_number: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          reps_completed?: number | null
          rpe?: number | null
          session_id: string
          set_number: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          reps_completed?: number | null
          rpe?: number | null
          session_id?: string
          set_number?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          day_id: string
          id: string
          name: string
          notes: string | null
          order_index: number | null
          reps: string | null
          rest_seconds: number | null
          rest_time: string | null
          routine_day_id: string | null
          rpe_target: number | null
          sets: number | null
        }
        Insert: {
          day_id: string
          id?: string
          name: string
          notes?: string | null
          order_index?: number | null
          reps?: string | null
          rest_seconds?: number | null
          rest_time?: string | null
          routine_day_id?: string | null
          rpe_target?: number | null
          sets?: number | null
        }
        Update: {
          day_id?: string
          id?: string
          name?: string
          notes?: string | null
          order_index?: number | null
          reps?: string | null
          rest_seconds?: number | null
          rest_time?: string | null
          routine_day_id?: string | null
          rpe_target?: number | null
          sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_routine_day_id_fkey"
            columns: ["routine_day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          additional_info: string | null
          created_at: string | null
          days_per_week: number | null
          email: string | null
          equipment: Json | null
          fitness_level: string | null
          goals: Json | null
          id: string
          updated_at: string | null
        }
        Insert: {
          additional_info?: string | null
          created_at?: string | null
          days_per_week?: number | null
          email?: string | null
          equipment?: Json | null
          fitness_level?: string | null
          goals?: Json | null
          id: string
          updated_at?: string | null
        }
        Update: {
          additional_info?: string | null
          created_at?: string | null
          days_per_week?: number | null
          email?: string | null
          equipment?: Json | null
          fitness_level?: string | null
          goals?: Json | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      routine_days: {
        Row: {
          day_label: string
          day_name: string | null
          day_number: number | null
          estimated_duration: number | null
          focus: string | null
          id: string
          order_index: number
          routine_id: string
          week_id: string | null
        }
        Insert: {
          day_label: string
          day_name?: string | null
          day_number?: number | null
          estimated_duration?: number | null
          focus?: string | null
          id?: string
          order_index: number
          routine_id: string
          week_id?: string | null
        }
        Update: {
          day_label?: string
          day_name?: string | null
          day_number?: number | null
          estimated_duration?: number | null
          focus?: string | null
          id?: string
          order_index?: number
          routine_id?: string
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_days_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "routine_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_weeks: {
        Row: {
          created_at: string | null
          id: string
          routine_id: string
          theme: string | null
          week_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          routine_id: string
          theme?: string | null
          week_number: number
        }
        Update: {
          created_at?: string | null
          id?: string
          routine_id?: string
          theme?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "routine_weeks_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          goal: string | null
          id: string
          is_active: boolean | null
          profile_snapshot: Json | null
          started_at: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          profile_snapshot?: Json | null
          started_at?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          profile_snapshot?: Json | null
          started_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          actual_duration: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          mood: string | null
          notes: string | null
          routine_day_id: string
          rpe: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          actual_duration?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          routine_day_id: string
          rpe?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          actual_duration?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          routine_day_id?: string
          rpe?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_routine_day_id_fkey"
            columns: ["routine_day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_routine_details: { Args: { p_routine_id: string }; Returns: Json }
      get_user_progress_context: { Args: { p_user_id: string }; Returns: Json }
      save_workout_plan: {
        Args: {
          p_description: string
          p_profile_snapshot: Json
          p_title: string
          p_user_id: string
          p_weeks: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// Convenience Types
// ============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Routine = Database['public']['Tables']['routines']['Row']
export type RoutineInsert = Database['public']['Tables']['routines']['Insert']
export type RoutineUpdate = Database['public']['Tables']['routines']['Update']

export type RoutineWeek = Database['public']['Tables']['routine_weeks']['Row']
export type RoutineWeekInsert = Database['public']['Tables']['routine_weeks']['Insert']
export type RoutineWeekUpdate = Database['public']['Tables']['routine_weeks']['Update']

export type RoutineDay = Database['public']['Tables']['routine_days']['Row']
export type RoutineDayInsert = Database['public']['Tables']['routine_days']['Insert']
export type RoutineDayUpdate = Database['public']['Tables']['routine_days']['Update']

export type Exercise = Database['public']['Tables']['exercises']['Row']
export type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']
export type ExerciseUpdate = Database['public']['Tables']['exercises']['Update']

export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
export type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert']
export type WorkoutSessionUpdate = Database['public']['Tables']['workout_sessions']['Update']

export type ExerciseLog = Database['public']['Tables']['exercise_logs']['Row']
export type ExerciseLogInsert = Database['public']['Tables']['exercise_logs']['Insert']
export type ExerciseLogUpdate = Database['public']['Tables']['exercise_logs']['Update']

export type ExerciseLibraryItem = Database['public']['Tables']['exercise_library']['Row']

// Value Objects
export type WorkoutMood = 'great' | 'good' | 'neutral' | 'tired' | 'exhausted'
export type RoutineStatus = 'active' | 'completed' | 'archived'
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced'

// RPC Function Types
export interface UserProgressContext {
  totalRoutines: number
  completedRoutines: number
  totalSessions: number
  averageRpe: number | null
  lastSession: {
    date: string
    rpe: number | null
    mood: WorkoutMood | null
  } | null
  recentExercises: string[]
}
