/**
 * Delivery Layer - API Route Handler
 * Endpoints para gestión de sesión individual
 *
 * GET /api/sessions/[id] - Obtener detalle de sesión con logs
 * PATCH /api/sessions/[id] - Completar sesión
 * DELETE /api/sessions/[id] - Abandonar sesión
 */

import { createClient } from '@/src/services/supabase/server'
import { createSessionRepository } from '@/src/services/supabase/session-repository.factory'
import {
  completeSessionSchema,
  type CompleteSessionInput,
} from '@/src/core/schemas/session.schemas'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/sessions/[id]
 * Obtiene el detalle completo de una sesión incluyendo sus logs
 *
 * Returns: { success: true, session: WorkoutSessionWithLogs } | { success: false, error: string }
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

    // Obtener sesión con logs usando el repositorio
    const repo = await createSessionRepository()
    const result = await repo.getSessionWithLogs(sessionId)

    if (!result.success) {
      console.error('[API GET /sessions/[id]] Error:', result.error)
      return Response.json(
        { success: false, error: 'Error al obtener sesión' },
        { status: 500 }
      )
    }

    if (!result.data) {
      return Response.json(
        { success: false, error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la sesión pertenece al usuario autenticado
    if (result.data.userId !== user.id) {
      return Response.json(
        { success: false, error: 'No tienes acceso a esta sesión' },
        { status: 403 }
      )
    }

    return Response.json({
      success: true,
      session: result.data,
    })
  } catch (error) {
    console.error('[API GET /sessions/[id]] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sessions/[id]
 * Completa una sesión con datos opcionales de finalización
 *
 * Body: {
 *   rpe?: number (1-10),
 *   mood?: 'great' | 'good' | 'neutral' | 'tired' | 'exhausted',
 *   notes?: string,
 *   actualDuration?: number (in minutes)
 * }
 *
 * Returns: { success: true } | { success: false, error: string }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
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
      console.error('[API PATCH /sessions/[id]] Error fetching session:', sessionResult.error)
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

    // Verificar que la sesión no esté ya completada
    if (sessionResult.data.completedAt) {
      return Response.json(
        { success: false, error: 'La sesión ya está completada' },
        { status: 409 }
      )
    }

    // Parsear y validar body
    const body = await req.json()
    let validatedData: CompleteSessionInput

    try {
      validatedData = completeSessionSchema.parse(body)
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

    // Completar sesión (cast para compatibilidad de tipos RPE y WorkoutMood)
    const completionData: import('@/src/core/interfaces/workout-session.interface').SessionCompletionData = {
      rpe: validatedData.rpe as import('@/src/core/interfaces/workout-session.interface').RPE | undefined,
      mood: validatedData.mood as import('@/src/core/interfaces/workout-session.interface').WorkoutMood | undefined,
      notes: validatedData.notes,
      actualDuration: validatedData.actualDuration,
    }

    const result = await repo.completeSession(sessionId, completionData)

    if (!result.success) {
      console.error('[API PATCH /sessions/[id]] Error completing session:', result.error)
      return Response.json(
        { success: false, error: 'Error al completar sesión' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Sesión completada exitosamente',
    })
  } catch (error) {
    console.error('[API PATCH /sessions/[id]] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sessions/[id]
 * Abandona una sesión en curso
 *
 * Returns: { success: true } | { success: false, error: string }
 */
export async function DELETE(req: Request, { params }: RouteParams) {
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
      console.error('[API DELETE /sessions/[id]] Error fetching session:', sessionResult.error)
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

    // Verificar que la sesión no esté ya completada
    if (sessionResult.data.completedAt) {
      return Response.json(
        { success: false, error: 'La sesión ya está completada' },
        { status: 409 }
      )
    }

    // Abandonar sesión
    const result = await repo.abandonSession(sessionId)

    if (!result.success) {
      console.error('[API DELETE /sessions/[id]] Error abandoning session:', result.error)
      return Response.json(
        { success: false, error: 'Error al abandonar sesión' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Sesión abandonada exitosamente',
    })
  } catch (error) {
    console.error('[API DELETE /sessions/[id]] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
