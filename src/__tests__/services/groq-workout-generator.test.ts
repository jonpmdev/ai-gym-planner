/**
 * Groq Workout Generator Service Tests
 *
 * Unit tests for the GroqWorkoutGenerator service.
 * Mocks the AI SDK to test generation logic without real API calls.
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import type { UserFitnessProfile, WorkoutPlan } from '@/src/core/entities/workout.entity'

// Mock del modulo 'ai' antes de importar el servicio
vi.mock('ai', () => ({
  generateObject: vi.fn(),
}))

// Mock del modulo '@ai-sdk/groq'
vi.mock('@ai-sdk/groq', () => ({
  createGroq: vi.fn(() => vi.fn(() => 'mocked-model')),
}))

// Importar despues de configurar los mocks
import { generateObject } from 'ai'
import { GroqWorkoutGenerator, createWorkoutGenerator } from '@/src/services/ai/groq-workout-generator.service'

/**
 * Fixture: Perfil de usuario valido
 */
const createValidProfile = (): UserFitnessProfile => ({
  equipment: ['dumbbells', 'barbell'],
  level: 'intermediate',
  goals: ['strength', 'muscle-gain'],
  daysPerWeek: 4,
})

/**
 * Fixture: Plan de entrenamiento generado por IA (mock response)
 */
const createMockWorkoutPlan = (): WorkoutPlan => ({
  title: 'Plan de Fuerza e Hipertrofia - 4 Semanas',
  description: 'Plan diseado para aumentar fuerza y masa muscular',
  weeks: [
    {
      weekNumber: 1,
      theme: 'Semana de Adaptacion',
      days: [
        {
          day: 'Lunes',
          focus: 'Tren Superior - Push',
          duration: '50-60 min',
          exercises: [
            {
              name: 'Press de Banca con Barra',
              sets: 4,
              reps: '8-10',
              rest: '90s',
              notes: 'Mantener escápulas retraidas',
            },
            {
              name: 'Press Militar con Mancuernas',
              sets: 3,
              reps: '10-12',
              rest: '60s',
              notes: null,
            },
          ],
        },
        {
          day: 'Martes',
          focus: 'Tren Inferior',
          duration: '55-65 min',
          exercises: [
            {
              name: 'Sentadilla con Barra',
              sets: 4,
              reps: '6-8',
              rest: '120s',
              notes: 'Profundidad paralela o mas',
            },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      theme: 'Semana de Desarrollo',
      days: [
        {
          day: 'Lunes',
          focus: 'Tren Superior - Push',
          duration: '50-60 min',
          exercises: [
            {
              name: 'Press de Banca con Barra',
              sets: 4,
              reps: '6-8',
              rest: '120s',
              notes: null,
            },
          ],
        },
      ],
    },
  ],
})

describe('GroqWorkoutGenerator', () => {
  let generator: GroqWorkoutGenerator
  let mockGenerateObject: Mock

  beforeEach(() => {
    vi.clearAllMocks()
    generator = new GroqWorkoutGenerator()
    mockGenerateObject = generateObject as Mock
  })

  describe('generate() - Generacion exitosa', () => {
    it('deberia generar un plan de entrenamiento exitosamente', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockPlan)
        expect(result.data.title).toBeDefined()
        expect(result.data.weeks).toHaveLength(2)
      }
    })

    it('deberia llamar a generateObject con los parametros correctos', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      const profile = createValidProfile()
      await generator.generate(profile)

      expect(mockGenerateObject).toHaveBeenCalledTimes(1)
      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.anything(),
          schema: expect.anything(),
          prompt: expect.stringContaining('mancuernas'),
          providerOptions: expect.objectContaining({
            groq: expect.objectContaining({
              structuredOutputs: false,
            }),
          }),
        })
      )
    })

    it('deberia incluir el prompt construido correctamente', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      const profile = createValidProfile()
      await generator.generate(profile)

      const callArgs = mockGenerateObject.mock.calls[0][0]
      expect(callArgs.prompt).toContain('intermedio')
      expect(callArgs.prompt).toContain('aumentar fuerza')
      expect(callArgs.prompt).toContain('4')
    })
  })

  describe('generate() - Respuesta nula', () => {
    it('deberia retornar error cuando object es null', async () => {
      mockGenerateObject.mockResolvedValue({ object: null })

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('No se pudo generar')
      }
    })

    it('deberia retornar error cuando object es undefined', async () => {
      mockGenerateObject.mockResolvedValue({ object: undefined })

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('No se pudo generar')
      }
    })
  })

  describe('generate() - Manejo de errores de API', () => {
    it('deberia manejar errores de red', async () => {
      mockGenerateObject.mockRejectedValue(new Error('Network error'))

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toBe('Network error')
      }
    })

    it('deberia manejar errores de rate limit', async () => {
      mockGenerateObject.mockRejectedValue(new Error('Rate limit exceeded'))

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Rate limit')
      }
    })

    it('deberia manejar errores de autenticacion', async () => {
      mockGenerateObject.mockRejectedValue(new Error('Invalid API key'))

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Invalid API key')
      }
    })

    it('deberia manejar errores no-Error (string)', async () => {
      mockGenerateObject.mockRejectedValue('String error message')

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Error desconocido')
      }
    })

    it('deberia manejar errores no-Error (objeto)', async () => {
      mockGenerateObject.mockRejectedValue({ code: 500, message: 'Server error' })

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Error desconocido')
      }
    })

    it('deberia manejar timeout', async () => {
      mockGenerateObject.mockRejectedValue(new Error('Request timeout'))

      const profile = createValidProfile()
      const result = await generator.generate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('timeout')
      }
    })
  })

  describe('generate() - Validacion de schema', () => {
    it('deberia pasar el schema correcto a generateObject', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      await generator.generate(createValidProfile())

      const callArgs = mockGenerateObject.mock.calls[0][0]
      expect(callArgs.schema).toBeDefined()
      // El schema debe ser un objeto Zod
      expect(callArgs.schema._def).toBeDefined()
    })

    it('deberia retornar datos que cumplen con la estructura WorkoutPlan', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      const result = await generator.generate(createValidProfile())

      expect(result.success).toBe(true)
      if (result.success) {
        // Verificar estructura del plan
        expect(result.data).toHaveProperty('title')
        expect(result.data).toHaveProperty('description')
        expect(result.data).toHaveProperty('weeks')
        expect(Array.isArray(result.data.weeks)).toBe(true)

        // Verificar estructura de la primera semana
        const firstWeek = result.data.weeks[0]
        expect(firstWeek).toHaveProperty('weekNumber')
        expect(firstWeek).toHaveProperty('theme')
        expect(firstWeek).toHaveProperty('days')

        // Verificar estructura del primer dia
        const firstDay = firstWeek.days[0]
        expect(firstDay).toHaveProperty('day')
        expect(firstDay).toHaveProperty('focus')
        expect(firstDay).toHaveProperty('duration')
        expect(firstDay).toHaveProperty('exercises')

        // Verificar estructura del primer ejercicio
        const firstExercise = firstDay.exercises[0]
        expect(firstExercise).toHaveProperty('name')
        expect(firstExercise).toHaveProperty('sets')
        expect(firstExercise).toHaveProperty('reps')
        expect(firstExercise).toHaveProperty('rest')
        expect(firstExercise).toHaveProperty('notes')
      }
    })
  })

  describe('generate() - Diferentes perfiles de usuario', () => {
    it('deberia generar para principiante con bodyweight', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      const profile: UserFitnessProfile = {
        equipment: ['bodyweight'],
        level: 'beginner',
        goals: ['general-fitness'],
        daysPerWeek: 3,
      }

      const result = await generator.generate(profile)

      expect(result.success).toBe(true)
      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('peso corporal'),
        })
      )
    })

    it('deberia generar para avanzado con gimnasio completo', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      const profile: UserFitnessProfile = {
        equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
        level: 'advanced',
        goals: ['muscle-gain', 'strength'],
        daysPerWeek: 6,
      }

      const result = await generator.generate(profile)

      expect(result.success).toBe(true)
      const callArgs = mockGenerateObject.mock.calls[0][0]
      expect(callArgs.prompt).toContain('avanzado')
      expect(callArgs.prompt).toContain('6')
    })

    it('deberia incluir informacion adicional en el prompt', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      const profile: UserFitnessProfile = {
        equipment: ['dumbbells'],
        level: 'intermediate',
        goals: ['strength'],
        daysPerWeek: 4,
        additionalInfo: 'Lesion en el hombro derecho',
      }

      const result = await generator.generate(profile)

      expect(result.success).toBe(true)
      const callArgs = mockGenerateObject.mock.calls[0][0]
      expect(callArgs.prompt).toContain('Lesion en el hombro derecho')
    })
  })

  describe('Factory function', () => {
    it('deberia crear una instancia de GroqWorkoutGenerator', () => {
      const instance = createWorkoutGenerator()

      expect(instance).toBeInstanceOf(GroqWorkoutGenerator)
    })

    it('deberia crear instancias independientes', () => {
      const instance1 = createWorkoutGenerator()
      const instance2 = createWorkoutGenerator()

      expect(instance1).not.toBe(instance2)
    })

    it('la instancia creada deberia poder generar planes', async () => {
      const mockPlan = createMockWorkoutPlan()
      mockGenerateObject.mockResolvedValue({ object: mockPlan })

      const instance = createWorkoutGenerator()
      const result = await instance.generate(createValidProfile())

      expect(result.success).toBe(true)
    })
  })
})
