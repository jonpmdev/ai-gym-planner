/**
 * Core Domain Interfaces
 * Following Interface Segregation Principle (SOLID - I)
 * and Dependency Inversion Principle (SOLID - D)
 */

import type { UserFitnessProfile, WorkoutPlan } from '../entities/workout.entity'

// Result type for operations that can fail
// Use this pattern instead of throwing exceptions for expected errors
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Helper to create success result
export function success<T>(data: T): Result<T, never> {
  return { success: true, data }
}

// Helper to create failure result
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error }
}

// Domain value object for routine status
export type RoutineStatus = 'active' | 'completed' | 'archived'

// Options for querying routines
export interface FindRoutinesOptions {
  readonly status?: RoutineStatus
  readonly limit?: number
}

// Extended WorkoutPlan with persistence metadata
export interface StoredWorkoutPlan extends WorkoutPlan {
  readonly id: string
  readonly userId: string
  readonly status: RoutineStatus
  readonly profileSnapshot: UserFitnessProfile
  readonly createdAt: Date
  readonly startedAt?: Date
  readonly completedAt?: Date
}

// Interface for AI-based workout generation
export interface IWorkoutGenerator {
  generate(profile: UserFitnessProfile): Promise<Result<WorkoutPlan>>
}

// Interface for workout plan persistence
// Following Repository pattern with Result<T, E> for error handling
export interface IWorkoutRepository {
  /**
   * Persists a workout plan for a user
   * @param userId - The authenticated user's ID
   * @param plan - The workout plan to save
   * @param profileSnapshot - The user profile used to generate this plan
   * @returns The ID of the created routine on success
   */
  save(
    userId: string,
    plan: WorkoutPlan,
    profileSnapshot: UserFitnessProfile
  ): Promise<Result<string, Error>>

  /**
   * Retrieves a workout plan by its ID
   * @param routineId - The routine's unique identifier
   * @returns The stored workout plan or null if not found
   */
  findById(routineId: string): Promise<Result<StoredWorkoutPlan | null, Error>>

  /**
   * Retrieves all workout plans for a user
   * @param userId - The user's ID
   * @param options - Optional filters (status, limit)
   * @returns Array of stored workout plans
   */
  findByUserId(
    userId: string,
    options?: FindRoutinesOptions
  ): Promise<Result<StoredWorkoutPlan[], Error>>

  /**
   * Updates the status of a workout plan
   * @param routineId - The routine's unique identifier
   * @param status - The new status
   */
  updateStatus(
    routineId: string,
    status: RoutineStatus
  ): Promise<Result<void, Error>>
}

// Interface for user profile validation
export interface IProfileValidator {
  validate(profile: UserFitnessProfile): Result<UserFitnessProfile>
}

// Interface for plan export functionality
export interface IPlanExporter {
  toText(plan: WorkoutPlan): string
  toPDF?(plan: WorkoutPlan): Promise<Blob>
}
