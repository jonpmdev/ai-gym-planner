/**
 * Generate Workout Plan Use Case Tests
 *
 * Unit tests for the workout plan generation use case.
 * These tests use mocked AI generators and validators to ensure predictable behavior.
 *
 * NOTE: These tests demonstrate proper dependency injection - the use case
 * receives both generator and validator as constructor arguments, making
 * it fully testable without any real infrastructure dependencies.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GenerateWorkoutPlanUseCase } from '@/src/use-cases'
import { ProfileValidator } from '@/src/services/validation/profile-validator.service'
import { MockWorkoutGenerator, createMockGenerator } from '../mocks/ai-generator.mock'
import type { IProfileValidator } from '@/src/core/interfaces/workout-generator.interface'

describe('GenerateWorkoutPlanUseCase', () => {
  let mockGenerator: MockWorkoutGenerator
  let validator: IProfileValidator
  let useCase: GenerateWorkoutPlanUseCase

  beforeEach(() => {
    mockGenerator = createMockGenerator()
    // Using real ProfileValidator here since we want to test actual validation rules
    // For unit tests that need to isolate the use case, use MockProfileValidator instead
    validator = new ProfileValidator()
    useCase = new GenerateWorkoutPlanUseCase(mockGenerator, validator)
  })

  it('should generate a workout plan successfully', async () => {
    const input = {
      equipment: ['dumbbells', 'barbell'],
      level: 'intermediate',
      goals: ['strength', 'muscle-gain'],
      daysPerWeek: '4',
    }

    const result = await useCase.execute(input)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.plan).toBeDefined()
      expect(result.data.plan.title).toBeDefined()
      expect(result.data.plan.weeks).toHaveLength(1)
    }
  })

  it('should return error for empty equipment', async () => {
    const invalidInput = {
      equipment: [],
      level: 'beginner',
      goals: ['general-fitness'],
      daysPerWeek: '3',
    }

    const result = await useCase.execute(invalidInput)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('equipo')
    }
  })

  it('should return error for invalid goals', async () => {
    const invalidInput = {
      equipment: ['dumbbells'],
      level: 'beginner',
      goals: ['invalid-goal'],
      daysPerWeek: '3',
    }

    const result = await useCase.execute(invalidInput)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('Objetivo no válido')
    }
  })

  it('should return error for invalid days per week', async () => {
    const invalidInput = {
      equipment: ['dumbbells'],
      level: 'beginner',
      goals: ['general-fitness'],
      daysPerWeek: '7', // Invalid - should be 3-6
    }

    const result = await useCase.execute(invalidInput)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('Días por semana')
    }
  })

  it('should handle generator failures gracefully', async () => {
    mockGenerator.setShouldFail(true)

    const input = {
      equipment: ['dumbbells'],
      level: 'beginner',
      goals: ['general-fitness'],
      daysPerWeek: '3',
    }

    const result = await useCase.execute(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('Mock generator failure')
    }
  })
})
