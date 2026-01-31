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
 * Profile Validator Implementation
 */
class ProfileValidator implements IProfileValidator {
  private readonly validEquipment: Set<Equipment> = new Set([
    'bodyweight', 'dumbbells', 'barbell', 'kettlebell', 
    'resistance-bands', 'pull-up-bar', 'bench', 'cables', 
    'machines', 'trx'
  ])

  private readonly validLevels: Set<ExperienceLevel> = new Set([
    'beginner', 'intermediate', 'advanced'
  ])

  private readonly validGoals: Set<FitnessGoal> = new Set([
    'muscle-gain', 'fat-loss', 'strength', 
    'endurance', 'flexibility', 'general-fitness'
  ])

  private readonly validDays: Set<DaysPerWeek> = new Set([3, 4, 5, 6])

  validate(profile: UserFitnessProfile): Result<UserFitnessProfile> {
    // Validate equipment
    if (profile.equipment.length === 0) {
      return {
        success: false,
        error: new ValidationError('equipment', 'Debes seleccionar al menos un equipo')
      }
    }

    for (const eq of profile.equipment) {
      if (!this.validEquipment.has(eq)) {
        return {
          success: false,
          error: new ValidationError('equipment', `Equipo no válido: ${eq}`)
        }
      }
    }

    // Validate level
    if (!this.validLevels.has(profile.level)) {
      return {
        success: false,
        error: new ValidationError('level', 'Nivel de experiencia no válido')
      }
    }

    // Validate goals
    if (profile.goals.length === 0) {
      return {
        success: false,
        error: new ValidationError('goals', 'Debes seleccionar al menos un objetivo')
      }
    }

    for (const goal of profile.goals) {
      if (!this.validGoals.has(goal)) {
        return {
          success: false,
          error: new ValidationError('goals', `Objetivo no válido: ${goal}`)
        }
      }
    }

    // Validate days per week
    if (!this.validDays.has(profile.daysPerWeek)) {
      return {
        success: false,
        error: new ValidationError('daysPerWeek', 'Días por semana no válido')
      }
    }

    return { success: true, data: profile }
  }
}

/**
 * Generate Workout Plan Use Case
 * Orchestrates the workout plan generation process
 */
export class GenerateWorkoutPlanUseCase {
  private readonly validator: IProfileValidator
  private readonly generator: IWorkoutGenerator

  constructor(generator: IWorkoutGenerator) {
    this.validator = new ProfileValidator()
    this.generator = generator
  }

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

// Factory function for dependency injection
export function createGenerateWorkoutPlanUseCase(
  generator: IWorkoutGenerator
): GenerateWorkoutPlanUseCase {
  return new GenerateWorkoutPlanUseCase(generator)
}
