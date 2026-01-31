/**
 * Generate Workout Plan Use Case Tests
 *
 * Unit tests for the workout plan generation use case.
 * These tests use mocked AI generators to ensure predictable behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GenerateWorkoutPlanUseCase } from '@/src/use-cases'
import { MockWorkoutGenerator, createMockGenerator } from '../mocks/ai-generator.mock'

describe('GenerateWorkoutPlanUseCase', () => {
  let mockGenerator: MockWorkoutGenerator
  let useCase: GenerateWorkoutPlanUseCase

  beforeEach(() => {
    mockGenerator = createMockGenerator()
    useCase = new GenerateWorkoutPlanUseCase(mockGenerator)
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
