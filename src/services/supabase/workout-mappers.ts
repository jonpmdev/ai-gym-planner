/**
 * Mappers between Domain Entities and Database DTOs
 *
 * These functions handle the conversion between:
 * - Domain models (pure, immutable entities in /src/core/entities)
 * - Database DTOs (Supabase table structures and RPC parameters)
 *
 * This separation follows Clean Architecture principles:
 * - Domain layer has no knowledge of infrastructure
 * - Infrastructure adapts external data to domain formats
 */

import type {
  WorkoutPlan,
  Week,
  WorkoutDay,
  Exercise as DomainExercise,
  UserFitnessProfile,
} from '@/src/core/entities/workout.entity'

import type {
  StoredWorkoutPlan,
  RoutineStatus,
} from '@/src/core/interfaces/workout-generator.interface'

import type {
  Json,
  Routine,
  RoutineWeek,
  RoutineDay,
  Exercise as DbExercise,
} from './database.types'

// ============================================================================
// Types for RPC Parameters
// ============================================================================

/**
 * Parameters expected by the save_workout_plan RPC function
 */
export interface SaveWorkoutPlanRpcParams {
  readonly p_user_id: string
  readonly p_title: string
  readonly p_description: string
  readonly p_profile_snapshot: Json
  readonly p_weeks: Json
}

/**
 * Week structure expected by the RPC function
 */
interface RpcWeek {
  readonly weekNumber: number
  readonly theme: string
  readonly days: ReadonlyArray<RpcDay>
}

/**
 * Day structure expected by the RPC function
 */
interface RpcDay {
  readonly day: number
  readonly dayName?: string
  readonly focus: string
  readonly duration: number
  readonly exercises: ReadonlyArray<RpcExercise>
}

/**
 * Exercise structure expected by the RPC function
 */
interface RpcExercise {
  readonly name: string
  readonly sets: number
  readonly reps: string
  readonly rest: number
  readonly notes?: string
  readonly orderIndex: number
}

// ============================================================================
// Domain to RPC Mappers (for saving)
// ============================================================================

/**
 * Parses a duration string to minutes
 * Examples: "45 minutos" -> 45, "1 hora" -> 60, "1h 30min" -> 90
 */
function parseDurationToMinutes(duration: string): number {
  // Try to extract numeric value
  const numericMatch = duration.match(/(\d+)/)
  if (numericMatch) {
    const value = parseInt(numericMatch[1], 10)
    // Check if it mentions hours
    if (duration.toLowerCase().includes('hora') || duration.toLowerCase().includes('hour')) {
      return value * 60
    }
    return value
  }
  // Default to 45 minutes if parsing fails
  return 45
}

/**
 * Parses a rest string to seconds
 * Examples: "60 segundos" -> 60, "90s" -> 90, "2 minutos" -> 120
 */
function parseRestToSeconds(rest: string): number {
  const numericMatch = rest.match(/(\d+)/)
  if (numericMatch) {
    const value = parseInt(numericMatch[1], 10)
    // Check if it mentions minutes
    if (rest.toLowerCase().includes('min')) {
      return value * 60
    }
    return value
  }
  // Default to 60 seconds if parsing fails
  return 60
}

/**
 * Extracts day number from day string
 * Examples: "Día 1" -> 1, "Day 2" -> 2, "Lunes" -> based on position
 */
function parseDayNumber(day: string, index: number): number {
  const numericMatch = day.match(/(\d+)/)
  if (numericMatch) {
    return parseInt(numericMatch[1], 10)
  }
  // Use 1-based index if no number found
  return index + 1
}

/**
 * Maps a domain Exercise to RPC format
 */
function mapExerciseToRpc(exercise: DomainExercise, orderIndex: number): RpcExercise {
  return {
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    rest: parseRestToSeconds(exercise.rest),
    notes: exercise.notes ?? undefined,
    orderIndex,
  }
}

/**
 * Maps a domain WorkoutDay to RPC format
 */
function mapDayToRpc(day: WorkoutDay, index: number): RpcDay {
  return {
    day: parseDayNumber(day.day, index),
    dayName: day.day,
    focus: day.focus,
    duration: parseDurationToMinutes(day.duration),
    exercises: day.exercises.map((exercise, exerciseIndex) =>
      mapExerciseToRpc(exercise, exerciseIndex)
    ),
  }
}

/**
 * Maps a domain Week to RPC format
 */
function mapWeekToRpc(week: Week): RpcWeek {
  return {
    weekNumber: week.weekNumber,
    theme: week.theme,
    days: week.days.map((day, index) => mapDayToRpc(day, index)),
  }
}

/**
 * Maps domain entities to RPC parameters for save_workout_plan
 */
export function mapDomainToRpcParams(
  userId: string,
  plan: WorkoutPlan,
  profileSnapshot: UserFitnessProfile
): SaveWorkoutPlanRpcParams {
  return {
    p_user_id: userId,
    p_title: plan.title,
    p_description: plan.description,
    p_profile_snapshot: profileSnapshot as unknown as Json,
    p_weeks: plan.weeks.map(mapWeekToRpc) as unknown as Json,
  }
}

// ============================================================================
// Database to Domain Mappers (for reading)
// ============================================================================

/**
 * Formats seconds to rest string
 * Examples: 60 -> "60 segundos", 120 -> "2 minutos"
 */
function formatSecondsToRest(seconds: number | null): string {
  if (seconds === null) return '60 segundos'
  if (seconds >= 120 && seconds % 60 === 0) {
    const minutes = seconds / 60
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`
  }
  return `${seconds} segundos`
}

/**
 * Formats minutes to duration string
 */
function formatMinutesToDuration(minutes: number | null): string {
  if (minutes === null) return '45 minutos'
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`
    }
    return `${hours}h ${remainingMinutes}min`
  }
  return `${minutes} minutos`
}

/**
 * Maps a database exercise to domain Exercise
 */
function mapDbExerciseToDomain(dbExercise: DbExercise): DomainExercise {
  return {
    name: dbExercise.name,
    sets: dbExercise.sets ?? 3,
    reps: dbExercise.reps ?? '10',
    rest: formatSecondsToRest(dbExercise.rest_seconds),
    notes: dbExercise.notes,
  }
}

/**
 * Maps database day with exercises to domain WorkoutDay
 */
function mapDbDayToDomain(
  dbDay: RoutineDay,
  exercises: DbExercise[]
): WorkoutDay {
  // Sort exercises by order_index (default to 0 if null)
  const sortedExercises = [...exercises].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))

  return {
    day: dbDay.day_name ?? dbDay.day_label,
    focus: dbDay.focus ?? '',
    duration: formatMinutesToDuration(dbDay.estimated_duration),
    exercises: sortedExercises.map(mapDbExerciseToDomain),
  }
}

/**
 * Maps database week with days to domain Week
 */
function mapDbWeekToDomain(
  dbWeek: RoutineWeek,
  days: RoutineDay[],
  exercisesByDayId: Map<string, DbExercise[]>
): Week {
  // Sort days by order_index
  const sortedDays = [...days].sort((a, b) => a.order_index - b.order_index)

  return {
    weekNumber: dbWeek.week_number,
    theme: dbWeek.theme ?? '',
    days: sortedDays.map((day) =>
      mapDbDayToDomain(day, exercisesByDayId.get(day.id) ?? [])
    ),
  }
}

/**
 * Reconstructs a full WorkoutPlan from database records
 */
export function mapDbRecordsToWorkoutPlan(
  routine: Routine,
  weeks: RoutineWeek[],
  days: RoutineDay[],
  exercises: DbExercise[]
): WorkoutPlan {
  // Create lookup maps for efficient reconstruction
  const daysByWeekId = new Map<string, RoutineDay[]>()
  const exercisesByDayId = new Map<string, DbExercise[]>()

  // Group days by week_id
  for (const day of days) {
    if (day.week_id) {
      const existing = daysByWeekId.get(day.week_id) ?? []
      existing.push(day)
      daysByWeekId.set(day.week_id, existing)
    }
  }

  // Group exercises by day_id
  for (const exercise of exercises) {
    const existing = exercisesByDayId.get(exercise.day_id) ?? []
    existing.push(exercise)
    exercisesByDayId.set(exercise.day_id, existing)
  }

  // Sort weeks by week_number
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  return {
    title: routine.title,
    description: routine.description ?? '',
    weeks: sortedWeeks.map((week) =>
      mapDbWeekToDomain(
        week,
        daysByWeekId.get(week.id) ?? [],
        exercisesByDayId
      )
    ),
  }
}

/**
 * Creates a StoredWorkoutPlan with metadata from database records
 */
export function mapDbRecordsToStoredWorkoutPlan(
  routine: Routine,
  weeks: RoutineWeek[],
  days: RoutineDay[],
  exercises: DbExercise[]
): StoredWorkoutPlan {
  const workoutPlan = mapDbRecordsToWorkoutPlan(routine, weeks, days, exercises)

  return {
    ...workoutPlan,
    id: routine.id,
    userId: routine.user_id,
    status: (routine.status ?? 'active') as RoutineStatus,
    profileSnapshot: routine.profile_snapshot as unknown as UserFitnessProfile,
    createdAt: routine.created_at ? new Date(routine.created_at) : new Date(),
    startedAt: routine.started_at ? new Date(routine.started_at) : undefined,
    completedAt: routine.completed_at ? new Date(routine.completed_at) : undefined,
  }
}

/**
 * Maps a routine row to a StoredWorkoutPlan summary (without full week data)
 * Useful for listing routines without fetching all nested data
 */
export function mapRoutineToStoredWorkoutPlanSummary(
  routine: Routine
): Omit<StoredWorkoutPlan, 'weeks'> & { weeks: ReadonlyArray<Week> } {
  return {
    id: routine.id,
    userId: routine.user_id,
    title: routine.title,
    description: routine.description ?? '',
    status: (routine.status ?? 'active') as RoutineStatus,
    profileSnapshot: routine.profile_snapshot as unknown as UserFitnessProfile,
    createdAt: routine.created_at ? new Date(routine.created_at) : new Date(),
    startedAt: routine.started_at ? new Date(routine.started_at) : undefined,
    completedAt: routine.completed_at ? new Date(routine.completed_at) : undefined,
    weeks: [], // Will be populated separately if needed
  }
}
