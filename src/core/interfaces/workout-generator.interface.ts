/**
 * Core Domain Interfaces
 * Following Interface Segregation Principle (SOLID - I)
 * and Dependency Inversion Principle (SOLID - D)
 */

import type { UserFitnessProfile, WorkoutPlan } from '../entities/workout.entity'

// Result type for operations
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

// Interface for AI-based workout generation
export interface IWorkoutGenerator {
  generate(profile: UserFitnessProfile): Promise<Result<WorkoutPlan>>
}

// Interface for workout plan persistence (future use)
export interface IWorkoutRepository {
  save(plan: WorkoutPlan, userId?: string): Promise<Result<string>>
  findById(id: string): Promise<Result<WorkoutPlan | null>>
  findByUserId(userId: string): Promise<Result<WorkoutPlan[]>>
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
