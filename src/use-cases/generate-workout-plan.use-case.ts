/**
 * Application Layer - Generate Workout Plan Use Case
 * Following Single Responsibility and Open/Closed Principles
 */

import type {
  IWorkoutGenerator,
  IProfileValidator,
  Result
} from '@/src/core/interfaces/workout-generator.interface'
import type {
  UserFitnessProfile,
  WorkoutPlan,
  Equipment,
  ExperienceLevel,
  FitnessGoal,
  DaysPerWeek
} from '@/src/core/entities/workout.entity'

// Input DTO (Data Transfer Object)
export interface GenerateWorkoutPlanInput {
  equipment: string[]
  level: string
  goals: string[]
  daysPerWeek: string
  additionalInfo?: string
}

// Output DTO
export interface GenerateWorkoutPlanOutput {
  plan: WorkoutPlan
}

// Validation Errors
export class ValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Generate Workout Plan Use Case
 * Orchestrates the workout plan generation process
 *
 * Dependencies are injected via constructor (Dependency Inversion Principle)
 */
export class GenerateWorkoutPlanUseCase {
  constructor(
    private readonly generator: IWorkoutGenerator,
    private readonly validator: IProfileValidator
  ) {}

  async execute(input: GenerateWorkoutPlanInput): Promise<Result<GenerateWorkoutPlanOutput>> {
    // Transform DTO to domain entity
    const profile: UserFitnessProfile = {
      equipment: input.equipment as Equipment[],
      level: input.level as ExperienceLevel,
      goals: input.goals as FitnessGoal[],
      daysPerWeek: parseInt(input.daysPerWeek) as DaysPerWeek,
      additionalInfo: input.additionalInfo
    }

    // Validate profile
    const validationResult = this.validator.validate(profile)
    if (!validationResult.success) {
      return validationResult as Result<GenerateWorkoutPlanOutput>
    }

    // Generate workout plan
    const generationResult = await this.generator.generate(profile)
    if (!generationResult.success) {
      return generationResult as Result<GenerateWorkoutPlanOutput>
    }

    return {
      success: true,
      data: { plan: generationResult.data }
    }
  }
}

/**
 * Factory function for dependency injection
 *
 * Creates a new instance of GenerateWorkoutPlanUseCase with all required dependencies.
 * This follows the Factory pattern, enabling easy testing with mock implementations.
 *
 * @param generator - Implementation of IWorkoutGenerator (e.g., GroqWorkoutGenerator)
 * @param validator - Implementation of IProfileValidator (e.g., ProfileValidator)
 * @returns A fully configured GenerateWorkoutPlanUseCase instance
 */
export function createGenerateWorkoutPlanUseCase(
  generator: IWorkoutGenerator,
  validator: IProfileValidator
): GenerateWorkoutPlanUseCase {
  return new GenerateWorkoutPlanUseCase(generator, validator)
}
