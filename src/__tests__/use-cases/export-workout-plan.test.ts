/**
 * Export Workout Plan Use Case Tests
 *
 * Unit tests for the workout plan export use case.
 * Tests cover all supported formats and error handling scenarios.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ExportWorkoutPlanUseCase,
  createExportWorkoutPlanUseCase,
  UnsupportedFormatError,
  type ExportFormat,
} from '@/src/use-cases/export-workout-plan.use-case'
import type { IPlanExporter } from '@/src/core/interfaces/workout-generator.interface'
import type { WorkoutPlan } from '@/src/core/entities/workout.entity'

/**
 * Mock implementation of IPlanExporter
 */
class MockPlanExporter implements IPlanExporter {
  toText = vi.fn((plan: WorkoutPlan) => `Exported: ${plan.title}`)
  toPDF = vi.fn(async () => new Blob(['PDF content'], { type: 'application/pdf' }))
}

/**
 * Fixture: Plan de entrenamiento valido para tests
 */
const createValidWorkoutPlan = (): WorkoutPlan => ({
  title: 'Plan de Fuerza 4 Semanas',
  description: 'Plan de entrenamiento para aumentar fuerza',
  weeks: [
    {
      weekNumber: 1,
      theme: 'Adaptacion',
      days: [
        {
          day: 'Lunes',
          focus: 'Tren Superior',
          duration: '45 min',
          exercises: [
            {
              name: 'Press de Banca',
              sets: 3,
              reps: '10-12',
              rest: '90s',
              notes: 'Controlar el descenso',
            },
          ],
        },
      ],
    },
  ],
})

/**
 * Fixture: Plan vacio (caso limite)
 */
const createEmptyWorkoutPlan = (): WorkoutPlan => ({
  title: '',
  description: '',
  weeks: [],
})

describe('ExportWorkoutPlanUseCase', () => {
  let mockExporter: MockPlanExporter
  let useCase: ExportWorkoutPlanUseCase

  beforeEach(() => {
    mockExporter = new MockPlanExporter()
    useCase = createExportWorkoutPlanUseCase(mockExporter)
  })

  describe('execute() - Metodo sincrono', () => {
    describe('cuando el formato es "text"', () => {
      it('deberia exportar el plan a texto plano exitosamente', () => {
        const plan = createValidWorkoutPlan()

        const result = useCase.execute({ plan, format: 'text' })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.content).toBe('Exported: Plan de Fuerza 4 Semanas')
          expect(result.data.filename).toBe('plan-entrenamiento-fitai.txt')
          expect(result.data.mimeType).toBe('text/plain')
        }
      })

      it('deberia llamar al exporter.toText con el plan correcto', () => {
        const plan = createValidWorkoutPlan()

        useCase.execute({ plan, format: 'text' })

        expect(mockExporter.toText).toHaveBeenCalledTimes(1)
        expect(mockExporter.toText).toHaveBeenCalledWith(plan)
      })

      it('deberia manejar un plan vacio', () => {
        const emptyPlan = createEmptyWorkoutPlan()

        const result = useCase.execute({ plan: emptyPlan, format: 'text' })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.content).toBe('Exported: ')
        }
      })
    })

    describe('cuando el formato es "pdf"', () => {
      it('deberia retornar error porque PDF no esta implementado en execute()', () => {
        const plan = createValidWorkoutPlan()

        const result = useCase.execute({ plan, format: 'pdf' })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(UnsupportedFormatError)
          expect(result.error.message).toContain('pdf')
          expect(result.error.message).toContain('no implementado')
        }
      })
    })

    describe('cuando el formato no es soportado', () => {
      it('deberia retornar UnsupportedFormatError para formato desconocido', () => {
        const plan = createValidWorkoutPlan()
        const invalidFormat = 'docx' as ExportFormat

        const result = useCase.execute({ plan, format: invalidFormat })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(UnsupportedFormatError)
          expect((result.error as UnsupportedFormatError).format).toBe('docx')
        }
      })

      it('deberia incluir el formato incorrecto en el mensaje de error', () => {
        const plan = createValidWorkoutPlan()
        const invalidFormat = 'xlsx' as ExportFormat

        const result = useCase.execute({ plan, format: invalidFormat })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.message).toContain('xlsx')
        }
      })
    })
  })

  describe('executeAsync() - Metodo asincrono', () => {
    describe('cuando el formato es "text"', () => {
      it('deberia delegar a execute() y retornar resultado exitoso', async () => {
        const plan = createValidWorkoutPlan()

        const result = await useCase.executeAsync({ plan, format: 'text' })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.content).toBe('Exported: Plan de Fuerza 4 Semanas')
          expect(result.data.mimeType).toBe('text/plain')
        }
      })
    })

    describe('cuando el formato es "pdf"', () => {
      it('deberia exportar a PDF exitosamente cuando el exporter lo soporta', async () => {
        const plan = createValidWorkoutPlan()

        const result = await useCase.executeAsync({ plan, format: 'pdf' })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.content).toBeInstanceOf(Blob)
          expect(result.data.filename).toBe('plan-entrenamiento-fitai.pdf')
          expect(result.data.mimeType).toBe('application/pdf')
        }
      })

      it('deberia llamar a exporter.toPDF con el plan correcto', async () => {
        const plan = createValidWorkoutPlan()

        await useCase.executeAsync({ plan, format: 'pdf' })

        expect(mockExporter.toPDF).toHaveBeenCalledTimes(1)
        expect(mockExporter.toPDF).toHaveBeenCalledWith(plan)
      })

      it('deberia retornar error si el exporter no soporta PDF', async () => {
        const exporterSinPDF: IPlanExporter = {
          toText: vi.fn(() => 'text'),
        }
        const useCaseSinPDF = createExportWorkoutPlanUseCase(exporterSinPDF)
        const plan = createValidWorkoutPlan()

        const result = await useCaseSinPDF.executeAsync({ plan, format: 'pdf' })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(UnsupportedFormatError)
          expect(result.error.message).toContain('exportador no soporta PDF')
        }
      })

      it('deberia manejar errores del exporter.toPDF', async () => {
        mockExporter.toPDF = vi.fn().mockRejectedValue(new Error('Error generando PDF'))
        const plan = createValidWorkoutPlan()

        const result = await useCase.executeAsync({ plan, format: 'pdf' })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.message).toContain('Error generando PDF')
        }
      })

      it('deberia manejar errores no-Error del exporter.toPDF', async () => {
        mockExporter.toPDF = vi.fn().mockRejectedValue('string error')
        const plan = createValidWorkoutPlan()

        const result = await useCase.executeAsync({ plan, format: 'pdf' })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.message).toContain('Error desconocido')
        }
      })
    })

    describe('cuando el formato no es soportado', () => {
      it('deberia retornar UnsupportedFormatError para formato desconocido', async () => {
        const plan = createValidWorkoutPlan()
        const invalidFormat = 'csv' as ExportFormat

        const result = await useCase.executeAsync({ plan, format: invalidFormat })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(UnsupportedFormatError)
        }
      })
    })
  })

  describe('UnsupportedFormatError', () => {
    it('deberia tener el nombre correcto', () => {
      const error = new UnsupportedFormatError('invalid')

      expect(error.name).toBe('UnsupportedFormatError')
    })

    it('deberia almacenar el formato como propiedad', () => {
      const error = new UnsupportedFormatError('xml')

      expect(error.format).toBe('xml')
    })

    it('deberia incluir el formato en el mensaje', () => {
      const error = new UnsupportedFormatError('html')

      expect(error.message).toContain('html')
    })
  })

  describe('Factory function', () => {
    it('deberia crear una instancia de ExportWorkoutPlanUseCase', () => {
      const exporter: IPlanExporter = { toText: () => 'text' }

      const instance = createExportWorkoutPlanUseCase(exporter)

      expect(instance).toBeInstanceOf(ExportWorkoutPlanUseCase)
    })
  })
})
