/**
 * Application Layer - Export Workout Plan Use Case
 */

import type { IPlanExporter } from '@/src/core/interfaces/workout-generator.interface'
import type { WorkoutPlan } from '@/src/core/entities/workout.entity'

export interface ExportWorkoutPlanInput {
  plan: WorkoutPlan
  format: 'text' | 'pdf'
}

export interface ExportWorkoutPlanOutput {
  content: string | Blob
  filename: string
  mimeType: string
}

export class ExportWorkoutPlanUseCase {
  constructor(private readonly exporter: IPlanExporter) {}

  execute(input: ExportWorkoutPlanInput): ExportWorkoutPlanOutput {
    const { plan, format } = input

    if (format === 'text') {
      const content = this.exporter.toText(plan)
      return {
        content,
        filename: 'plan-entrenamiento-fitai.txt',
        mimeType: 'text/plain'
      }
    }

    // PDF export would be implemented here
    throw new Error('Formato de exportación no soportado')
  }
}

export function createExportWorkoutPlanUseCase(
  exporter: IPlanExporter
): ExportWorkoutPlanUseCase {
  return new ExportWorkoutPlanUseCase(exporter)
}
