/**
 * Infrastructure Layer - Groq AI Service Implementation
 * Implements IWorkoutGenerator interface (Dependency Inversion)
 */

import { generateObject } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'
import type {
  IWorkoutGenerator,
  Result
} from '@/src/core/interfaces/workout-generator.interface'
import type {
  UserFitnessProfile,
  WorkoutPlan
} from '@/src/core/entities/workout.entity'
import { buildPrompt } from './prompt-builder'

// Zod schemas for AI output validation
const exerciseSchema = z.object({
  name: z.string().describe("Nombre del ejercicio"),
  sets: z.number().describe("Número de series"),
  reps: z.string().describe("Rango de repeticiones, ej: '8-12' o '15'"),
  rest: z.string().describe("Tiempo de descanso, ej: '60s' o '90s'"),
  notes: z.string().nullable().describe("Notas técnicas opcionales")
})

const workoutDaySchema = z.object({
  day: z.string().describe("Nombre del día, ej: 'Lunes' o 'Día 1'"),
  focus: z.string().describe("Enfoque del día, ej: 'Pecho y Tríceps'"),
  exercises: z.array(exerciseSchema).describe("Lista de ejercicios"),
  duration: z.string().describe("Duración estimada, ej: '45-60 min'")
})

const weekSchema = z.object({
  weekNumber: z.number().describe("Número de semana (1-4)"),
  theme: z.string().describe("Tema o enfoque de la semana"),
  days: z.array(workoutDaySchema).describe("Días de entrenamiento")
})

const workoutPlanSchema = z.object({
  title: z.string().describe("Título del plan de entrenamiento"),
  description: z.string().describe("Descripción breve del plan"),
  weeks: z.array(weekSchema).describe("4 semanas de entrenamiento")
})

export type WorkoutPlanSchema = z.infer<typeof workoutPlanSchema>

// Initialize Groq provider
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

/**
 * Groq-based Workout Generator
 * Uses Llama 3.3 70B for high-quality workout plan generation
 */
export class GroqWorkoutGenerator implements IWorkoutGenerator {
  private readonly modelId = 'llama-3.3-70b-versatile'

  async generate(profile: UserFitnessProfile): Promise<Result<WorkoutPlan>> {
    try {
      const prompt = buildPrompt(profile)

      const { object } = await generateObject({
        model: groq(this.modelId),
        schema: workoutPlanSchema,
        prompt,
        providerOptions: {
          groq: {
            structuredOutputs: false // Llama 3.3 no soporta json_schema, usa json_object mode
          }
        }
      })

      if (!object) {
        return {
          success: false,
          error: new Error('No se pudo generar el plan de entrenamiento')
        }
      }

      return {
        success: true,
        data: object as WorkoutPlan
      }
    } catch (error) {
      console.error('[GroqWorkoutGenerator] Error:', error)
      return {
        success: false,
        error: error instanceof Error
          ? error
          : new Error('Error desconocido al generar el plan')
      }
    }
  }
}

// Singleton instance for dependency injection
let instance: GroqWorkoutGenerator | null = null

export function getWorkoutGenerator(): IWorkoutGenerator {
  if (!instance) {
    instance = new GroqWorkoutGenerator()
  }
  return instance
}
