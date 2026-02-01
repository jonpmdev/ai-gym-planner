export { createClient as createBrowserClient, isSupabaseConfigured } from "./client"
export { createClient as createServerClient } from "./server"
export { updateSession, isSupabaseConfigured as isSupabaseConfiguredServer } from "./middleware"
export {
  signUp,
  login,
  signInWithGoogle,
  signOut,
  getUser,
  type SignUpData,
  type LoginData,
} from "./auth-actions"

// Workout Repository
export { SupabaseWorkoutRepository } from "./supabase-workout-repository"
export {
  createWorkoutRepository,
  createWorkoutRepositoryWithClient,
} from "./workout-repository.factory"

// Session Repository
export { SupabaseWorkoutSessionRepository } from "./supabase-session-repository"
export {
  createSessionRepository,
  createSessionRepositoryWithClient,
} from "./session-repository.factory"

// Mappers (useful for testing or custom implementations)
export {
  mapDomainToRpcParams,
  mapDbRecordsToStoredWorkoutPlan,
  mapDbRecordsToWorkoutPlan,
  mapRoutineToStoredWorkoutPlanSummary,
  type SaveWorkoutPlanRpcParams,
} from "./workout-mappers"

// Database types
export type {
  Database,
  Json,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Routine,
  RoutineInsert,
  RoutineUpdate,
  RoutineWeek,
  RoutineWeekInsert,
  RoutineWeekUpdate,
  RoutineDay,
  RoutineDayInsert,
  RoutineDayUpdate,
  Exercise,
  ExerciseInsert,
  ExerciseUpdate,
  WorkoutSession,
  WorkoutSessionInsert,
  WorkoutSessionUpdate,
  ExerciseLog,
  ExerciseLogInsert,
  ExerciseLogUpdate,
  RoutineStatus,
  WorkoutMood,
  UserProgressContext,
} from "./database.types"
