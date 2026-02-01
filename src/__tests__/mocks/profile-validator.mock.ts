/**
 * Profile Validator Mock
 *
 * Mock implementation for testing without real validation logic.
 * Allows controlled testing of validation scenarios.
 */

import type { IProfileValidator, Result } from '@/src/core/interfaces/workout-generator.interface'
import type { UserFitnessProfile } from '@/src/core/entities/workout.entity'

/**
 * Mock Profile Validator
 *
 * By default, passes all validation. Can be configured to fail
 * with specific errors for testing error handling paths.
 */
export class MockProfileValidator implements IProfileValidator {
  private shouldFail = false
  private failureError: Error | null = null

  /**
   * Configure the mock to fail validation
   *
   * @param fail - Whether validation should fail
   * @param error - Optional custom error to return
   */
  setShouldFail(fail: boolean, error?: Error) {
    this.shouldFail = fail
    this.failureError = error ?? new Error('Mock validation failure')
  }

  /**
   * Reset the mock to default (passing) state
   */
  reset() {
    this.shouldFail = false
    this.failureError = null
  }

  validate(profile: UserFitnessProfile): Result<UserFitnessProfile> {
    if (this.shouldFail) {
      return {
        success: false,
        error: this.failureError ?? new Error('Mock validation failure')
      }
    }

    return { success: true, data: profile }
  }
}

/**
 * Factory to create a mock profile validator
 */
export function createMockProfileValidator(): MockProfileValidator {
  return new MockProfileValidator()
}
