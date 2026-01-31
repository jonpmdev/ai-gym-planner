/**
 * AI Generator Mock
 *
 * Mock implementation for testing workout generation without calling the actual AI.
 */

import type { IWorkoutGenerator, Result } from '@/src/core/interfaces/workout-generator.interface'
import type { UserFitnessProfile, WorkoutPlan } from '@/src/core/entities/workout.entity'

export class MockWorkoutGenerator implements IWorkoutGenerator {
  private shouldFail = false
  private mockPlan: WorkoutPlan | null = null

  setShouldFail(fail: boolean) {
    this.shouldFail = fail
  }

  setMockPlan(plan: WorkoutPlan) {
    this.mockPlan = plan
  }

  async generate(profile: UserFitnessProfile): Promise<Result<WorkoutPlan>> {
    if (this.shouldFail) {
      return {
        success: false,
        error: new Error('Mock generator failure')
      }
    }

    if (this.mockPlan) {
      return { success: true, data: this.mockPlan }
    }

    // Return a default mock plan
    const plan: WorkoutPlan = {
      title: `Plan de ${profile.goals.join(' y ')}`,
      description: 'Plan de entrenamiento generado para testing',
      weeks: [
        {
          weekNumber: 1,
          theme: 'Adaptación',
          days: [
            {
              day: 'Día 1',
              focus: 'Tren superior',
              duration: '45 min',
              exercises: [
                {
                  name: 'Press de banca',
                  sets: 3,
                  reps: '10-12',
                  rest: '90s',
                  notes: 'Controla el movimiento',
                },
              ],
            },
          ],
        },
      ],
    }

    return { success: true, data: plan }
  }
}

export function createMockGenerator(): MockWorkoutGenerator {
  return new MockWorkoutGenerator()
}
