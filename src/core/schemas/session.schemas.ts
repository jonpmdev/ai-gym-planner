/**
 * Zod Validation Schemas for Workout Sessions
 *
 * Schemas for validating API request bodies and query parameters
 * related to workout session tracking.
 */

import { z } from 'zod'

// ============================================================================
// Value Object Schemas
// ============================================================================

/**
 * RPE (Rate of Perceived Exertion) - 1-10 scale
 */
export const rpeSchema = z
  .number()
  .int()
  .min(1, 'RPE debe ser al menos 1')
  .max(10, 'RPE debe ser máximo 10')

/**
 * Workout Mood
 */
export const workoutMoodSchema = z.enum([
  'great',
  'good',
  'neutral',
  'tired',
  'exhausted',
])

/**
 * Session Status
 */
export const sessionStatusSchema = z.enum([
  'in_progress',
  'completed',
  'abandoned',
])

// ============================================================================
// Request Body Schemas
// ============================================================================

/**
 * Schema for starting a new session
 * POST /api/sessions
 */
export const startSessionSchema = z.object({
  routineDayId: z
    .string()
    .uuid('ID de día de rutina debe ser un UUID válido'),
})

export type StartSessionInput = z.infer<typeof startSessionSchema>

/**
 * Schema for completing a session
 * PATCH /api/sessions/[id]
 */
export const completeSessionSchema = z.object({
  rpe: rpeSchema.optional(),
  mood: workoutMoodSchema.optional(),
  notes: z.string().max(500, 'Las notas no deben exceder 500 caracteres').optional(),
  actualDuration: z
    .number()
    .int()
    .positive('La duración debe ser positiva')
    .max(300, 'La duración no debe exceder 300 minutos (5 horas)')
    .optional(),
})

export type CompleteSessionInput = z.infer<typeof completeSessionSchema>

/**
 * Schema for logging an exercise set
 * POST /api/sessions/[id]/logs
 */
export const logExerciseSetSchema = z.object({
  exerciseId: z.string().uuid('ID de ejercicio debe ser un UUID válido'),
  setNumber: z
    .number()
    .int()
    .positive('El número de serie debe ser positivo'),
  weight: z
    .number()
    .nonnegative('El peso no puede ser negativo')
    .max(1000, 'El peso no debe exceder 1000 kg')
    .optional(),
  reps: z
    .number()
    .int()
    .positive('Las repeticiones deben ser positivas')
    .max(1000, 'Las repeticiones no deben exceder 1000')
    .optional(),
  rpe: rpeSchema.optional(),
  notes: z.string().max(200, 'Las notas no deben exceder 200 caracteres').optional(),
})

export type LogExerciseSetInput = z.infer<typeof logExerciseSetSchema>

/**
 * Schema for updating an exercise log
 * PATCH /api/sessions/[id]/logs/[logId]
 */
export const updateExerciseLogSchema = z.object({
  weight: z
    .number()
    .nonnegative('El peso no puede ser negativo')
    .max(1000, 'El peso no debe exceder 1000 kg')
    .optional(),
  reps: z
    .number()
    .int()
    .positive('Las repeticiones deben ser positivas')
    .max(1000, 'Las repeticiones no deben exceder 1000')
    .optional(),
  rpe: rpeSchema.optional(),
  notes: z.string().max(200, 'Las notas no deben exceder 200 caracteres').optional(),
}).strict()

export type UpdateExerciseLogInput = z.infer<typeof updateExerciseLogSchema>

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * Schema for session list query parameters
 * GET /api/sessions
 */
export const sessionQuerySchema = z.object({
  status: sessionStatusSchema.optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100, 'El límite máximo es 100')
    .default(10)
    .optional(),
  offset: z.coerce.number().int().nonnegative().default(0).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
})

export type SessionQueryParams = z.infer<typeof sessionQuerySchema>
