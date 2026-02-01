/**
 * Infrastructure Layer - Profile Validator Implementation
 * Implements IProfileValidator interface (Dependency Inversion Principle)
 */

import type { IProfileValidator, Result } from '@/src/core/interfaces/workout-generator.interface'
import type {
  UserFitnessProfile,
  Equipment,
  ExperienceLevel,
  FitnessGoal,
  DaysPerWeek
} from '@/src/core/entities/workout.entity'

/**
 * Validation Error for profile fields
 */
export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Profile Validator Implementation
 *
 * Validates user fitness profiles against domain rules.
 * This is a stateless service that can be safely instantiated multiple times.
 */
export class ProfileValidator implements IProfileValidator {
  private readonly validEquipment: ReadonlySet<Equipment> = new Set([
    'bodyweight',
    'dumbbells',
    'barbell',
    'kettlebell',
    'resistance-bands',
    'pull-up-bar',
    'bench',
    'cables',
    'machines',
    'trx'
  ])

  private readonly validLevels: ReadonlySet<ExperienceLevel> = new Set([
    'beginner',
    'intermediate',
    'advanced'
  ])

  private readonly validGoals: ReadonlySet<FitnessGoal> = new Set([
    'muscle-gain',
    'fat-loss',
    'strength',
    'endurance',
    'flexibility',
    'general-fitness'
  ])

  private readonly validDays: ReadonlySet<DaysPerWeek> = new Set([3, 4, 5, 6])

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
 * Factory function to create a ProfileValidator instance
 *
 * @returns A new ProfileValidator instance
 */
export function createProfileValidator(): IProfileValidator {
  return new ProfileValidator()
}
