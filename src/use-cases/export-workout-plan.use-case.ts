/**
 * Application Layer - Export Workout Plan Use Case
 * Uses Result<T, E> pattern for consistent error handling (no exceptions)
 */

import type {
  IPlanExporter,
  Result
} from '@/src/core/interfaces/workout-generator.interface'
import type { WorkoutPlan } from '@/src/core/entities/workout.entity'

// Supported export formats
export type ExportFormat = 'text' | 'pdf'

export interface ExportWorkoutPlanInput {
  readonly plan: WorkoutPlan
  readonly format: ExportFormat
}

export interface ExportWorkoutPlanOutput {
  readonly content: string | Blob
  readonly filename: string
  readonly mimeType: string
}

/**
 * Error thrown when an unsupported export format is requested
 */
export class UnsupportedFormatError extends Error {
  constructor(public readonly format: string) {
    super(`Formato de exportacion no soportado: ${format}`)
    this.name = 'UnsupportedFormatError'
  }
}

/**
 * Export Workout Plan Use Case
 *
 * Handles exporting workout plans to different formats.
 * Uses Result<T, E> pattern for predictable error handling.
 */
export class ExportWorkoutPlanUseCase {
  constructor(private readonly exporter: IPlanExporter) {}

  /**
   * Execute the export operation
   *
   * @param input - The plan and desired format
   * @returns Result with export output on success, or error on failure
   */
  execute(input: ExportWorkoutPlanInput): Result<ExportWorkoutPlanOutput> {
    const { plan, format } = input

    if (format === 'text') {
      const content = this.exporter.toText(plan)
      return {
        success: true,
        data: {
          content,
          filename: 'plan-entrenamiento-fitai.txt',
          mimeType: 'text/plain'
        }
      }
    }

    if (format === 'pdf') {
      // PDF export not yet implemented
      // When implemented, this should call this.exporter.toPDF(plan)
      return {
        success: false,
        error: new UnsupportedFormatError('pdf (no implementado)')
      }
    }

    // Unsupported format
    return {
      success: false,
      error: new UnsupportedFormatError(format)
    }
  }

  /**
   * Async version for formats that require async processing (e.g., PDF)
   *
   * @param input - The plan and desired format
   * @returns Promise<Result> with export output on success, or error on failure
   */
  async executeAsync(
    input: ExportWorkoutPlanInput
  ): Promise<Result<ExportWorkoutPlanOutput>> {
    const { plan, format } = input

    if (format === 'text') {
      return this.execute(input)
    }

    if (format === 'pdf') {
      if (!this.exporter.toPDF) {
        return {
          success: false,
          error: new UnsupportedFormatError('pdf (exportador no soporta PDF)')
        }
      }

      try {
        const content = await this.exporter.toPDF(plan)
        return {
          success: true,
          data: {
            content,
            filename: 'plan-entrenamiento-fitai.pdf',
            mimeType: 'application/pdf'
          }
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error
              : new Error('Error desconocido al exportar PDF')
        }
      }
    }

    return {
      success: false,
      error: new UnsupportedFormatError(format)
    }
  }
}

/**
 * Factory function for dependency injection
 *
 * @param exporter - Implementation of IPlanExporter
 * @returns A new ExportWorkoutPlanUseCase instance
 */
export function createExportWorkoutPlanUseCase(
  exporter: IPlanExporter
): ExportWorkoutPlanUseCase {
  return new ExportWorkoutPlanUseCase(exporter)
}
