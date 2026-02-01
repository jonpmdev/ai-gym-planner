/**
 * Workout Session Tracking Interfaces
 *
 * Domain interfaces for tracking workout sessions and exercise logs.
 * Follows Interface Segregation Principle (SOLID - I) and
 * Dependency Inversion Principle (SOLID - D).
 *
 * These interfaces define the contract for session tracking functionality,
 * independent of the persistence layer (Supabase).
 */

import type { Result } from './workout-generator.interface'

// ============================================================================
// Value Objects
// ============================================================================

/**
 * Rate of Perceived Exertion (RPE) scale
 * Standard 1-10 scale for measuring workout intensity
 * - 1-2: Very light
 * - 3-4: Light
 * - 5-6: Moderate
 * - 7-8: Hard
 * - 9-10: Maximum effort
 */
export type RPE = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * User's mood/energy level during workout
 * Used for tracking mental state and recovery needs
 */
export type WorkoutMood = 'great' | 'good' | 'neutral' | 'tired' | 'exhausted'

/**
 * Session status for tracking completion state
 */
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

// ============================================================================
// Domain Entities
// ============================================================================

/**
 * Represents a workout session - a single training instance
 *
 * A session tracks when a user performs exercises from a specific
 * routine day, including timing, perceived effort, and notes.
 */
export interface WorkoutSession {
  readonly id: string
  readonly userId: string
  readonly routineDayId: string
  readonly startedAt: Date
  readonly completedAt?: Date
  readonly actualDuration?: number // in minutes
  readonly rpe?: RPE
  readonly mood?: WorkoutMood
  readonly notes?: string
  readonly createdAt: Date
}

/**
 * Represents a single set logged during a workout session
 *
 * Each ExerciseLog captures the actual performance of one set,
 * including weight used, reps completed, and perceived difficulty.
 */
export interface ExerciseLog {
  readonly id: string
  readonly sessionId: string
  readonly exerciseId: string
  readonly setNumber: number
  readonly weight?: number // in kg
  readonly reps?: number
  readonly rpe?: RPE
  readonly notes?: string
  readonly createdAt: Date
}

// ============================================================================
// Data Transfer Objects (DTOs)
// ============================================================================

/**
 * Data required to start a new workout session
 */
export interface StartSessionData {
  readonly userId: string
  readonly routineDayId: string
}

/**
 * Data for completing/finalizing a workout session
 */
export interface SessionCompletionData {
  readonly rpe?: RPE
  readonly mood?: WorkoutMood
  readonly notes?: string
  readonly actualDuration?: number
}

/**
 * Data for logging a single exercise set
 */
export interface ExerciseLogData {
  readonly exerciseId: string
  readonly setNumber: number
  readonly weight?: number
  readonly reps?: number
  readonly rpe?: RPE
  readonly notes?: string
}

/**
 * Partial update for an existing exercise log
 */
export type ExerciseLogUpdateData = Partial<Omit<ExerciseLogData, 'exerciseId' | 'setNumber'>>

/**
 * Options for querying sessions
 */
export interface FindSessionsOptions {
  readonly limit?: number
  readonly offset?: number
  readonly fromDate?: Date
  readonly toDate?: Date
  readonly status?: SessionStatus
}

// ============================================================================
// Aggregates
// ============================================================================

/**
 * Complete session data including all exercise logs
 * Used when loading a full session for display or analysis
 */
export interface WorkoutSessionWithLogs extends WorkoutSession {
  readonly exerciseLogs: ReadonlyArray<ExerciseLog>
}

/**
 * Summary statistics for a session
 * Used for quick display in lists and dashboards
 */
export interface SessionSummary {
  readonly id: string
  readonly routineDayId: string
  readonly startedAt: Date
  readonly completedAt?: Date
  readonly totalSets: number
  readonly totalExercises: number
  readonly averageRpe?: number
  readonly mood?: WorkoutMood
}

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * Repository interface for workout session persistence
 *
 * Follows the Repository pattern with Result<T, E> for error handling.
 * Implementations should handle all database-specific logic internally.
 *
 * @example
 * ```typescript
 * const repo = new SupabaseWorkoutSessionRepository(client)
 *
 * // Start a new session
 * const result = await repo.startSession('user-123', 'day-456')
 * if (result.success) {
 *   console.log('Session started:', result.data)
 * }
 * ```
 */
export interface IWorkoutSessionRepository {
  // -------------------------------------------------------------------------
  // Session Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Starts a new workout session for a user
   * @param userId - The authenticated user's ID
   * @param routineDayId - The routine day being performed
   * @returns The ID of the created session on success
   */
  startSession(
    userId: string,
    routineDayId: string
  ): Promise<Result<string, Error>>

  /**
   * Marks a session as completed with optional feedback
   * @param sessionId - The session to complete
   * @param data - Optional completion data (RPE, mood, notes)
   */
  completeSession(
    sessionId: string,
    data: SessionCompletionData
  ): Promise<Result<void, Error>>

  /**
   * Marks a session as abandoned (user quit without completing)
   * @param sessionId - The session to abandon
   */
  abandonSession(sessionId: string): Promise<Result<void, Error>>

  // -------------------------------------------------------------------------
  // Exercise Logging
  // -------------------------------------------------------------------------

  /**
   * Logs a single exercise set during a session
   * @param sessionId - The active session
   * @param data - The set data to log
   * @returns The ID of the created log entry
   */
  logExerciseSet(
    sessionId: string,
    data: ExerciseLogData
  ): Promise<Result<string, Error>>

  /**
   * Updates an existing exercise log entry
   * @param logId - The log entry to update
   * @param data - The fields to update
   */
  updateExerciseLog(
    logId: string,
    data: ExerciseLogUpdateData
  ): Promise<Result<void, Error>>

  /**
   * Deletes an exercise log entry (for corrections)
   * @param logId - The log entry to delete
   */
  deleteExerciseLog(logId: string): Promise<Result<void, Error>>

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Retrieves a session by its ID
   * @param sessionId - The session's unique identifier
   * @returns The session or null if not found
   */
  getSessionById(
    sessionId: string
  ): Promise<Result<WorkoutSession | null, Error>>

  /**
   * Retrieves a session with all its exercise logs
   * @param sessionId - The session's unique identifier
   * @returns The complete session with logs or null if not found
   */
  getSessionWithLogs(
    sessionId: string
  ): Promise<Result<WorkoutSessionWithLogs | null, Error>>

  /**
   * Retrieves all sessions for a user with optional filtering
   * @param userId - The user's ID
   * @param options - Optional filters and pagination
   * @returns Array of sessions matching the criteria
   */
  getSessionsByUser(
    userId: string,
    options?: FindSessionsOptions
  ): Promise<Result<ReadonlyArray<WorkoutSession>, Error>>

  /**
   * Retrieves exercise logs for a specific session
   * @param sessionId - The session's unique identifier
   * @returns Array of exercise logs ordered by creation time
   */
  getExerciseLogs(
    sessionId: string
  ): Promise<Result<ReadonlyArray<ExerciseLog>, Error>>

  /**
   * Gets summary statistics for recent sessions
   * @param userId - The user's ID
   * @param limit - Maximum number of summaries to return (default: 10)
   * @returns Array of session summaries
   */
  getSessionSummaries(
    userId: string,
    limit?: number
  ): Promise<Result<ReadonlyArray<SessionSummary>, Error>>

  /**
   * Checks if user has an active (in-progress) session
   * @param userId - The user's ID
   * @returns The active session or null if none exists
   */
  getActiveSession(
    userId: string
  ): Promise<Result<WorkoutSession | null, Error>>
}

// ============================================================================
// Analytics Interface (Optional, for future extension)
// ============================================================================

/**
 * Interface for session analytics and progress tracking
 * Segregated from main repository following ISP
 */
export interface ISessionAnalytics {
  /**
   * Gets exercise history for a specific exercise
   * @param userId - The user's ID
   * @param exerciseName - The exercise name to query
   * @param limit - Maximum entries to return
   */
  getExerciseHistory(
    userId: string,
    exerciseName: string,
    limit?: number
  ): Promise<Result<ReadonlyArray<ExerciseLog>, Error>>

  /**
   * Gets personal records for an exercise
   * @param userId - The user's ID
   * @param exerciseName - The exercise name
   */
  getPersonalRecords(
    userId: string,
    exerciseName: string
  ): Promise<Result<{
    readonly maxWeight?: number
    readonly maxReps?: number
    readonly maxVolume?: number // weight * reps
  }, Error>>

  /**
   * Gets weekly training volume summary
   * @param userId - The user's ID
   * @param weeks - Number of weeks to include (default: 4)
   */
  getWeeklyVolume(
    userId: string,
    weeks?: number
  ): Promise<Result<ReadonlyArray<{
    readonly weekStart: Date
    readonly totalSets: number
    readonly totalReps: number
    readonly totalVolume: number
    readonly sessionsCount: number
  }>, Error>>
}
