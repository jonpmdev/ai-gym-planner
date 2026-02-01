/**
 * SupabaseWorkoutSessionRepository
 *
 * Infrastructure implementation of IWorkoutSessionRepository using Supabase.
 * Handles session lifecycle (start, complete, abandon) and exercise logging.
 *
 * Follows Clean Architecture principles:
 * - Implements domain interface (Dependency Inversion)
 * - Uses Result pattern for error handling
 * - Maps between database types and domain entities
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type {
  IWorkoutSessionRepository,
  WorkoutSession,
  ExerciseLog,
  SessionCompletionData,
  ExerciseLogData,
  ExerciseLogUpdateData,
  FindSessionsOptions,
  WorkoutSessionWithLogs,
  SessionSummary,
} from '@/src/core/interfaces/workout-session.interface'

import type { Result } from '@/src/core/interfaces/workout-generator.interface'
import { success, failure } from '@/src/core/interfaces/workout-generator.interface'

import type { Database } from './database.types'

/**
 * Type aliases for database rows
 */
type DbWorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
type DbWorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert']
type DbWorkoutSessionUpdate = Database['public']['Tables']['workout_sessions']['Update']
type DbExerciseLog = Database['public']['Tables']['exercise_logs']['Row']
type DbExerciseLogInsert = Database['public']['Tables']['exercise_logs']['Insert']
type DbExerciseLogUpdate = Database['public']['Tables']['exercise_logs']['Update']

/**
 * Supabase implementation of the IWorkoutSessionRepository interface.
 *
 * This class handles all persistence operations for workout sessions and exercise logs,
 * adapting between the domain model and Supabase's data structures.
 */
export class SupabaseWorkoutSessionRepository implements IWorkoutSessionRepository {
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {}

  // ==========================================================================
  // Session Lifecycle Methods
  // ==========================================================================

  /**
   * Starts a new workout session for a user.
   * Verifies user is authenticated and routine_day exists.
   */
  async startSession(
    userId: string,
    routineDayId: string
  ): Promise<Result<string, Error>> {
    try {
      // Verify user is authenticated
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()

      if (authError || !user || user.id !== userId) {
        return failure(new Error('Unauthorized: User must be authenticated'))
      }

      // Verify routine_day exists and belongs to user
      const { data: routineDay, error: dayError } = await this.supabase
        .from('routine_days')
        .select('id, routine_id, routines!inner(user_id)')
        .eq('id', routineDayId)
        .single()

      if (dayError) {
        return failure(new Error(`Routine day not found: ${dayError.message}`))
      }

      // Type assertion needed due to Supabase join typing
      const routineDayData = routineDay as any
      if (routineDayData.routines.user_id !== userId) {
        return failure(new Error('Unauthorized: Routine day does not belong to user'))
      }

      // Check if user already has an active session
      const activeSessionResult = await this.getActiveSession(userId)
      if (!activeSessionResult.success) {
        return activeSessionResult
      }

      if (activeSessionResult.data) {
        return failure(
          new Error('User already has an active session. Complete or abandon it first.')
        )
      }

      // Create new session
      const sessionData: DbWorkoutSessionInsert = {
        user_id: userId,
        routine_day_id: routineDayId,
        started_at: new Date().toISOString(),
      }

      const { data, error } = await this.supabase
        .from('workout_sessions')
        .insert(sessionData)
        .select('id')
        .single()

      if (error) {
        return failure(new Error(`Failed to start session: ${error.message}`))
      }

      if (!data) {
        return failure(new Error('Start session returned no ID'))
      }

      return success(data.id)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while starting session')
      )
    }
  }

  /**
   * Marks a session as completed with optional feedback.
   * Calculates actual duration from start time.
   */
  async completeSession(
    sessionId: string,
    data: SessionCompletionData
  ): Promise<Result<void, Error>> {
    try {
      const updateData: DbWorkoutSessionUpdate = {
        completed_at: new Date().toISOString(),
        rpe: data.rpe,
        mood: data.mood,
        notes: data.notes,
        actual_duration: data.actualDuration,
      }

      const { error } = await this.supabase
        .from('workout_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .is('completed_at', null) // Only update if not already completed

      if (error) {
        return failure(new Error(`Failed to complete session: ${error.message}`))
      }

      return success(undefined)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while completing session')
      )
    }
  }

  /**
   * Marks a session as abandoned by setting completed_at without full completion data.
   * Sets a special note to indicate abandonment.
   */
  async abandonSession(sessionId: string): Promise<Result<void, Error>> {
    try {
      const updateData: DbWorkoutSessionUpdate = {
        completed_at: new Date().toISOString(),
        notes: '[Sesión abandonada]',
      }

      const { error } = await this.supabase
        .from('workout_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .is('completed_at', null) // Only abandon if not already completed

      if (error) {
        return failure(new Error(`Failed to abandon session: ${error.message}`))
      }

      return success(undefined)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while abandoning session')
      )
    }
  }

  // ==========================================================================
  // Exercise Logging Methods
  // ==========================================================================

  /**
   * Logs a single exercise set during a session.
   * Verifies session exists and is active.
   */
  async logExerciseSet(
    sessionId: string,
    data: ExerciseLogData
  ): Promise<Result<string, Error>> {
    try {
      // Verify session exists and is active
      const { data: session, error: sessionError } = await this.supabase
        .from('workout_sessions')
        .select('id, completed_at')
        .eq('id', sessionId)
        .single()

      if (sessionError) {
        return failure(new Error(`Session not found: ${sessionError.message}`))
      }

      if (session.completed_at) {
        return failure(new Error('Cannot log exercises to a completed session'))
      }

      // Create exercise log
      const logData: DbExerciseLogInsert = {
        session_id: sessionId,
        exercise_id: data.exerciseId,
        set_number: data.setNumber,
        weight_kg: data.weight,
        reps_completed: data.reps,
        rpe: data.rpe,
        notes: data.notes,
      }

      const { data: log, error } = await this.supabase
        .from('exercise_logs')
        .insert(logData)
        .select('id')
        .single()

      if (error) {
        return failure(new Error(`Failed to log exercise set: ${error.message}`))
      }

      if (!log) {
        return failure(new Error('Log exercise set returned no ID'))
      }

      return success(log.id)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while logging exercise set')
      )
    }
  }

  /**
   * Updates an existing exercise log entry.
   * Allows corrections to weight, reps, RPE, or notes.
   */
  async updateExerciseLog(
    logId: string,
    data: ExerciseLogUpdateData
  ): Promise<Result<void, Error>> {
    try {
      const updateData: DbExerciseLogUpdate = {
        weight_kg: data.weight,
        reps_completed: data.reps,
        rpe: data.rpe,
        notes: data.notes,
      }

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof DbExerciseLogUpdate] === undefined) {
          delete updateData[key as keyof DbExerciseLogUpdate]
        }
      })

      const { error } = await this.supabase
        .from('exercise_logs')
        .update(updateData)
        .eq('id', logId)

      if (error) {
        return failure(new Error(`Failed to update exercise log: ${error.message}`))
      }

      return success(undefined)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while updating exercise log')
      )
    }
  }

  /**
   * Deletes an exercise log entry.
   * Used for corrections when user logged wrong data.
   */
  async deleteExerciseLog(logId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await this.supabase
        .from('exercise_logs')
        .delete()
        .eq('id', logId)

      if (error) {
        return failure(new Error(`Failed to delete exercise log: ${error.message}`))
      }

      return success(undefined)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while deleting exercise log')
      )
    }
  }

  // ==========================================================================
  // Query Methods
  // ==========================================================================

  /**
   * Retrieves a session by its ID.
   * Returns null if session not found.
   */
  async getSessionById(
    sessionId: string
  ): Promise<Result<WorkoutSession | null, Error>> {
    try {
      const { data, error } = await this.supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) {
        // Check if it's a "not found" error
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new Error(`Failed to fetch session: ${error.message}`))
      }

      if (!data) {
        return success(null)
      }

      const session = this.mapDbSessionToDomain(data)
      return success(session)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while fetching session')
      )
    }
  }

  /**
   * Retrieves a session with all its exercise logs.
   * Useful for displaying full session details.
   */
  async getSessionWithLogs(
    sessionId: string
  ): Promise<Result<WorkoutSessionWithLogs | null, Error>> {
    try {
      // Fetch session
      const { data: sessionData, error: sessionError } = await this.supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          return success(null)
        }
        return failure(new Error(`Failed to fetch session: ${sessionError.message}`))
      }

      if (!sessionData) {
        return success(null)
      }

      // Fetch exercise logs
      const { data: logsData, error: logsError } = await this.supabase
        .from('exercise_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (logsError) {
        return failure(new Error(`Failed to fetch exercise logs: ${logsError.message}`))
      }

      const session = this.mapDbSessionToDomain(sessionData)
      const logs = (logsData ?? []).map(this.mapDbLogToDomain)

      const sessionWithLogs: WorkoutSessionWithLogs = {
        ...session,
        exerciseLogs: logs,
      }

      return success(sessionWithLogs)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while fetching session with logs')
      )
    }
  }

  /**
   * Retrieves all sessions for a user with optional filtering.
   * Supports pagination and date range filtering.
   */
  async getSessionsByUser(
    userId: string,
    options?: FindSessionsOptions
  ): Promise<Result<ReadonlyArray<WorkoutSession>, Error>> {
    try {
      // Build query
      let query = this.supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })

      // Apply filters
      if (options?.status) {
        if (options.status === 'in_progress') {
          query = query.is('completed_at', null)
        } else if (options.status === 'completed') {
          query = query.not('completed_at', 'is', null)
        }
        // Note: 'abandoned' status is inferred from notes, not a DB field
      }

      if (options?.fromDate) {
        query = query.gte('started_at', options.fromDate.toISOString())
      }

      if (options?.toDate) {
        query = query.lte('started_at', options.toDate.toISOString())
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        return failure(new Error(`Failed to fetch sessions: ${error.message}`))
      }

      const sessions = (data ?? []).map(this.mapDbSessionToDomain)
      return success(sessions)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while fetching user sessions')
      )
    }
  }

  /**
   * Retrieves exercise logs for a specific session.
   * Ordered by creation time.
   */
  async getExerciseLogs(
    sessionId: string
  ): Promise<Result<ReadonlyArray<ExerciseLog>, Error>> {
    try {
      const { data, error } = await this.supabase
        .from('exercise_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) {
        return failure(new Error(`Failed to fetch exercise logs: ${error.message}`))
      }

      const logs = (data ?? []).map(this.mapDbLogToDomain)
      return success(logs)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while fetching exercise logs')
      )
    }
  }

  /**
   * Gets summary statistics for recent sessions.
   * Used for dashboard display.
   */
  async getSessionSummaries(
    userId: string,
    limit: number = 10
  ): Promise<Result<ReadonlyArray<SessionSummary>, Error>> {
    try {
      // Fetch recent sessions
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit)

      if (sessionsError) {
        return failure(new Error(`Failed to fetch sessions: ${sessionsError.message}`))
      }

      if (!sessions || sessions.length === 0) {
        return success([])
      }

      const sessionIds = sessions.map((s) => s.id)

      // Fetch exercise logs for all sessions
      const { data: logs, error: logsError } = await this.supabase
        .from('exercise_logs')
        .select('*')
        .in('session_id', sessionIds)

      if (logsError) {
        return failure(new Error(`Failed to fetch logs: ${logsError.message}`))
      }

      // Group logs by session
      const logsBySession = new Map<string, DbExerciseLog[]>()
      for (const log of logs ?? []) {
        const existing = logsBySession.get(log.session_id) ?? []
        existing.push(log)
        logsBySession.set(log.session_id, existing)
      }

      // Build summaries
      const summaries: SessionSummary[] = sessions.map((session) => {
        const sessionLogs = logsBySession.get(session.id) ?? []
        const uniqueExercises = new Set(sessionLogs.map((l) => l.exercise_id))

        // Calculate average RPE from logs
        const rpeValues = sessionLogs
          .map((l) => l.rpe)
          .filter((rpe): rpe is number => rpe !== null)

        const averageRpe = rpeValues.length > 0
          ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length
          : undefined

        return {
          id: session.id,
          routineDayId: session.routine_day_id,
          startedAt: new Date(session.started_at),
          completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
          totalSets: sessionLogs.length,
          totalExercises: uniqueExercises.size,
          averageRpe,
          mood: session.mood as any,
        }
      })

      return success(summaries)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while fetching session summaries')
      )
    }
  }

  /**
   * Checks if user has an active (in-progress) session.
   * Returns the active session or null if none exists.
   */
  async getActiveSession(
    userId: string
  ): Promise<Result<WorkoutSession | null, Error>> {
    try {
      const { data, error } = await this.supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        return failure(new Error(`Failed to fetch active session: ${error.message}`))
      }

      if (!data) {
        return success(null)
      }

      const session = this.mapDbSessionToDomain(data)
      return success(session)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while fetching active session')
      )
    }
  }

  // ==========================================================================
  // Private Mapper Methods
  // ==========================================================================

  /**
   * Maps a database workout_sessions row to domain WorkoutSession entity.
   */
  private mapDbSessionToDomain(dbSession: DbWorkoutSession): WorkoutSession {
    return {
      id: dbSession.id,
      userId: dbSession.user_id,
      routineDayId: dbSession.routine_day_id,
      startedAt: new Date(dbSession.started_at),
      completedAt: dbSession.completed_at ? new Date(dbSession.completed_at) : undefined,
      actualDuration: dbSession.actual_duration ?? undefined,
      rpe: dbSession.rpe as any,
      mood: dbSession.mood as any,
      notes: dbSession.notes ?? undefined,
      createdAt: new Date(dbSession.created_at ?? dbSession.started_at),
    }
  }

  /**
   * Maps a database exercise_logs row to domain ExerciseLog entity.
   */
  private mapDbLogToDomain(dbLog: DbExerciseLog): ExerciseLog {
    return {
      id: dbLog.id,
      sessionId: dbLog.session_id,
      exerciseId: dbLog.exercise_id,
      setNumber: dbLog.set_number,
      weight: dbLog.weight_kg ?? undefined,
      reps: dbLog.reps_completed ?? undefined,
      rpe: dbLog.rpe as any,
      notes: dbLog.notes ?? undefined,
      createdAt: new Date(dbLog.created_at ?? new Date()),
    }
  }
}
