/**
 * SupabaseWorkoutRepository
 *
 * Infrastructure implementation of IWorkoutRepository using Supabase.
 * Follows Clean Architecture principles:
 * - Implements domain interface (Dependency Inversion)
 * - Uses Result pattern for error handling
 * - Receives dependencies via constructor (Dependency Injection)
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type {
  WorkoutPlan,
  UserFitnessProfile,
} from '@/src/core/entities/workout.entity'

import type {
  IWorkoutRepository,
  Result,
  StoredWorkoutPlan,
  RoutineStatus,
  FindRoutinesOptions,
} from '@/src/core/interfaces/workout-generator.interface'

import { success, failure } from '@/src/core/interfaces/workout-generator.interface'

import type { Database } from './database.types'

import {
  mapDomainToRpcParams,
  mapDbRecordsToStoredWorkoutPlan,
} from './workout-mappers'

/**
 * Supabase implementation of the IWorkoutRepository interface.
 *
 * This class handles all persistence operations for workout plans,
 * adapting between the domain model and Supabase's data structures.
 */
export class SupabaseWorkoutRepository implements IWorkoutRepository {
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {}

  /**
   * Saves a workout plan using the save_workout_plan RPC function.
   * This ensures atomic creation of the routine with all its nested data.
   */
  async save(
    userId: string,
    plan: WorkoutPlan,
    profileSnapshot: UserFitnessProfile
  ): Promise<Result<string, Error>> {
    try {
      const rpcParams = mapDomainToRpcParams(userId, plan, profileSnapshot)

      const { data, error } = await this.supabase.rpc('save_workout_plan', rpcParams)

      if (error) {
        return failure(
          new Error(`Failed to save workout plan: ${error.message}`)
        )
      }

      if (!data) {
        return failure(
          new Error('Save operation returned no routine ID')
        )
      }

      return success(data)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while saving workout plan')
      )
    }
  }

  /**
   * Retrieves a complete workout plan by its ID.
   * Reconstructs the full domain model from normalized database tables.
   */
  async findById(routineId: string): Promise<Result<StoredWorkoutPlan | null, Error>> {
    try {
      // Fetch the routine with all related data
      const { data: routine, error: routineError } = await this.supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single()

      if (routineError) {
        // Check if it's a "not found" error
        if (routineError.code === 'PGRST116') {
          return success(null)
        }
        return failure(
          new Error(`Failed to fetch routine: ${routineError.message}`)
        )
      }

      if (!routine) {
        return success(null)
      }

      // Fetch weeks
      const { data: weeks, error: weeksError } = await this.supabase
        .from('routine_weeks')
        .select('*')
        .eq('routine_id', routineId)
        .order('week_number', { ascending: true })

      if (weeksError) {
        return failure(
          new Error(`Failed to fetch weeks: ${weeksError.message}`)
        )
      }

      // Fetch days
      const { data: days, error: daysError } = await this.supabase
        .from('routine_days')
        .select('*')
        .eq('routine_id', routineId)
        .order('order_index', { ascending: true })

      if (daysError) {
        return failure(
          new Error(`Failed to fetch days: ${daysError.message}`)
        )
      }

      // Fetch exercises for all days
      const dayIds = days?.map((d) => d.id) ?? []

      let exercises: Database['public']['Tables']['exercises']['Row'][] = []
      if (dayIds.length > 0) {
        const { data: exercisesData, error: exercisesError } = await this.supabase
          .from('exercises')
          .select('*')
          .in('day_id', dayIds)
          .order('order_index', { ascending: true })

        if (exercisesError) {
          return failure(
            new Error(`Failed to fetch exercises: ${exercisesError.message}`)
          )
        }

        exercises = exercisesData ?? []
      }

      // Map to domain model
      const storedPlan = mapDbRecordsToStoredWorkoutPlan(
        routine,
        weeks ?? [],
        days ?? [],
        exercises
      )

      return success(storedPlan)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while fetching workout plan')
      )
    }
  }

  /**
   * Retrieves all workout plans for a user with optional filtering.
   */
  async findByUserId(
    userId: string,
    options?: FindRoutinesOptions
  ): Promise<Result<StoredWorkoutPlan[], Error>> {
    try {
      // Build the query
      let query = this.supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Apply status filter if provided
      if (options?.status) {
        query = query.eq('status', options.status)
      }

      // Apply limit if provided
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data: routines, error: routinesError } = await query

      if (routinesError) {
        return failure(
          new Error(`Failed to fetch routines: ${routinesError.message}`)
        )
      }

      if (!routines || routines.length === 0) {
        return success([])
      }

      // Fetch all related data for the routines
      const routineIds = routines.map((r) => r.id)

      // Fetch weeks for all routines
      const { data: allWeeks, error: weeksError } = await this.supabase
        .from('routine_weeks')
        .select('*')
        .in('routine_id', routineIds)
        .order('week_number', { ascending: true })

      if (weeksError) {
        return failure(
          new Error(`Failed to fetch weeks: ${weeksError.message}`)
        )
      }

      // Fetch days for all routines
      const { data: allDays, error: daysError } = await this.supabase
        .from('routine_days')
        .select('*')
        .in('routine_id', routineIds)
        .order('order_index', { ascending: true })

      if (daysError) {
        return failure(
          new Error(`Failed to fetch days: ${daysError.message}`)
        )
      }

      // Fetch exercises for all days
      const dayIds = allDays?.map((d) => d.id) ?? []
      let allExercises: Database['public']['Tables']['exercises']['Row'][] = []

      if (dayIds.length > 0) {
        const { data: exercisesData, error: exercisesError } = await this.supabase
          .from('exercises')
          .select('*')
          .in('day_id', dayIds)
          .order('order_index', { ascending: true })

        if (exercisesError) {
          return failure(
            new Error(`Failed to fetch exercises: ${exercisesError.message}`)
          )
        }

        allExercises = exercisesData ?? []
      }

      // Group data by routine ID for efficient reconstruction
      const weeksByRoutineId = new Map<string, typeof allWeeks>()
      const daysByRoutineId = new Map<string, typeof allDays>()

      for (const week of allWeeks ?? []) {
        const existing = weeksByRoutineId.get(week.routine_id) ?? []
        existing.push(week)
        weeksByRoutineId.set(week.routine_id, existing)
      }

      for (const day of allDays ?? []) {
        const existing = daysByRoutineId.get(day.routine_id) ?? []
        existing.push(day)
        daysByRoutineId.set(day.routine_id, existing)
      }

      // Create lookup for exercises by day_id
      const exercisesByDayId = new Map<string, typeof allExercises>()
      for (const exercise of allExercises) {
        const existing = exercisesByDayId.get(exercise.day_id) ?? []
        existing.push(exercise)
        exercisesByDayId.set(exercise.day_id, existing)
      }

      // Map each routine to StoredWorkoutPlan
      const storedPlans: StoredWorkoutPlan[] = routines.map((routine) => {
        const routineWeeks = weeksByRoutineId.get(routine.id) ?? []
        const routineDays = daysByRoutineId.get(routine.id) ?? []

        // Get exercises for this routine's days
        const routineDayIds = new Set(routineDays.map((d) => d.id))
        const routineExercises = allExercises.filter((e) =>
          routineDayIds.has(e.day_id)
        )

        return mapDbRecordsToStoredWorkoutPlan(
          routine,
          routineWeeks,
          routineDays,
          routineExercises
        )
      })

      return success(storedPlans)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while fetching user routines')
      )
    }
  }

  /**
   * Updates the status of a workout plan.
   * Also handles related fields like started_at and completed_at.
   */
  async updateStatus(
    routineId: string,
    status: RoutineStatus
  ): Promise<Result<void, Error>> {
    try {
      const updateData: Database['public']['Tables']['routines']['Update'] = {
        status,
        is_active: status === 'active',
      }

      // Set timestamps based on status
      if (status === 'active') {
        updateData.started_at = new Date().toISOString()
        updateData.completed_at = null
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await this.supabase
        .from('routines')
        .update(updateData)
        .eq('id', routineId)

      if (error) {
        return failure(
          new Error(`Failed to update routine status: ${error.message}`)
        )
      }

      return success(undefined)
    } catch (error) {
      return failure(
        error instanceof Error
          ? error
          : new Error('Unknown error while updating routine status')
      )
    }
  }
}
