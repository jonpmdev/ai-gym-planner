/**
 * Delivery Layer - API Route Handler
 * Endpoints para registros de ejercicios en una sesión
 *
 * POST /api/sessions/[id]/logs - Registrar un set de ejercicio
 * GET /api/sessions/[id]/logs - Obtener todos los logs de la sesión
 */

import { createClient } from '@/src/services/supabase/server'
import { createSessionRepository } from '@/src/services/supabase/session-repository.factory'
import {
  logExerciseSetSchema,
  type LogExerciseSetInput,
} from '@/src/core/schemas/session.schemas'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/sessions/[id]/logs
 * Registra un set de ejercicio durante una sesión activa
 *
 * Body: {
 *   exerciseId: string,
 *   setNumber: number,
 *   weight?: number,
 *   reps?: number,
 *   rpe?: number (1-10),
 *   notes?: string
 * }
 *
 * Returns: { success: true, data: { logId: string } } | { success: false, error: string }
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    // Obtener el ID de la sesión
    const { id: sessionId } = await params

    // Validar UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sessionId)) {
      return Response.json(
        { success: false, error: 'ID de sesión inválido' },
        { status: 400 }
      )
    }

    // Verificar autenticación
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que la sesión existe y pertenece al usuario
    const repo = await createSessionRepository()
    const sessionResult = await repo.getSessionById(sessionId)

    if (!sessionResult.success) {
      console.error('[API POST /sessions/[id]/logs] Error fetching session:', sessionResult.error)
      return Response.json(
        { success: false, error: 'Error al verificar sesión' },
        { status: 500 }
      )
    }

    if (!sessionResult.data) {
      return Response.json(
        { success: false, error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    if (sessionResult.data.userId !== user.id) {
      return Response.json(
        { success: false, error: 'No tienes acceso a esta sesión' },
        { status: 403 }
      )
    }

    // Verificar que la sesión esté activa
    if (sessionResult.data.completedAt) {
      return Response.json(
        { success: false, error: 'No se pueden agregar logs a una sesión completada' },
        { status: 409 }
      )
    }

    // Parsear y validar body
    const body = await req.json()
    let validatedData: LogExerciseSetInput

    try {
      validatedData = logExerciseSetSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return Response.json(
          {
            success: false,
            error: 'Datos inválidos',
            details: error.errors,
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Registrar el set (cast para compatibilidad de tipos RPE)
    const logData: import('@/src/core/interfaces/workout-session.interface').ExerciseLogData = {
      exerciseId: validatedData.exerciseId,
      setNumber: validatedData.setNumber,
      weight: validatedData.weight,
      reps: validatedData.reps,
      rpe: validatedData.rpe as import('@/src/core/interfaces/workout-session.interface').RPE | undefined,
      notes: validatedData.notes,
    }

    const result = await repo.logExerciseSet(sessionId, logData)

    if (!result.success) {
      console.error('[API POST /sessions/[id]/logs] Error logging set:', result.error)
      return Response.json(
        { success: false, error: 'Error al registrar set de ejercicio' },
        { status: 500 }
      )
    }

    return Response.json(
      {
        success: true,
        data: {
          logId: result.data,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API POST /sessions/[id]/logs] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sessions/[id]/logs
 * Obtiene todos los logs de ejercicios de una sesión
 *
 * Returns: { success: true, logs: ExerciseLog[] } | { success: false, error: string }
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    // Obtener el ID de la sesión
    const { id: sessionId } = await params

    // Validar UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sessionId)) {
      return Response.json(
        { success: false, error: 'ID de sesión inválido' },
        { status: 400 }
      )
    }

    // Verificar autenticación
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que la sesión existe y pertenece al usuario
    const repo = await createSessionRepository()
    const sessionResult = await repo.getSessionById(sessionId)

    if (!sessionResult.success) {
      console.error('[API GET /sessions/[id]/logs] Error fetching session:', sessionResult.error)
      return Response.json(
        { success: false, error: 'Error al verificar sesión' },
        { status: 500 }
      )
    }

    if (!sessionResult.data) {
      return Response.json(
        { success: false, error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    if (sessionResult.data.userId !== user.id) {
      return Response.json(
        { success: false, error: 'No tienes acceso a esta sesión' },
        { status: 403 }
      )
    }

    // Obtener logs
    const result = await repo.getExerciseLogs(sessionId)

    if (!result.success) {
      console.error('[API GET /sessions/[id]/logs] Error fetching logs:', result.error)
      return Response.json(
        { success: false, error: 'Error al obtener logs de ejercicios' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      logs: result.data,
      count: result.data.length,
    })
  } catch (error) {
    console.error('[API GET /sessions/[id]/logs] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
