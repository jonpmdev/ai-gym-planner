/**
 * Delivery Layer - API Route Handler
 * Endpoints para gestión de un log individual de ejercicio
 *
 * PATCH /api/sessions/[id]/logs/[logId] - Actualizar log específico
 * DELETE /api/sessions/[id]/logs/[logId] - Eliminar log
 */

import { createClient } from '@/src/services/supabase/server'
import { createSessionRepository } from '@/src/services/supabase/session-repository.factory'
import {
  updateExerciseLogSchema,
  type UpdateExerciseLogInput,
} from '@/src/core/schemas/session.schemas'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    id: string
    logId: string
  }>
}

/**
 * PATCH /api/sessions/[id]/logs/[logId]
 * Actualiza un log de ejercicio existente
 *
 * Body: {
 *   weight?: number,
 *   reps?: number,
 *   rpe?: number (1-10),
 *   notes?: string
 * }
 *
 * Returns: { success: true } | { success: false, error: string }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    // Obtener los IDs
    const { id: sessionId, logId } = await params

    // Validar UUIDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sessionId) || !uuidRegex.test(logId)) {
      return Response.json(
        { success: false, error: 'ID inválido' },
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
      console.error('[API PATCH /sessions/[id]/logs/[logId]] Error fetching session:', sessionResult.error)
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

    // Verificar que el log existe y pertenece a la sesión
    const logsResult = await repo.getExerciseLogs(sessionId)

    if (!logsResult.success) {
      console.error('[API PATCH /sessions/[id]/logs/[logId]] Error fetching logs:', logsResult.error)
      return Response.json(
        { success: false, error: 'Error al verificar log' },
        { status: 500 }
      )
    }

    const logExists = logsResult.data.some(log => log.id === logId)
    if (!logExists) {
      return Response.json(
        { success: false, error: 'Log no encontrado en esta sesión' },
        { status: 404 }
      )
    }

    // Parsear y validar body
    const body = await req.json()
    let validatedData: UpdateExerciseLogInput

    try {
      validatedData = updateExerciseLogSchema.parse(body)
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

    // Verificar que se está actualizando al menos un campo
    if (Object.keys(validatedData).length === 0) {
      return Response.json(
        { success: false, error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      )
    }

    // Actualizar el log (cast para compatibilidad de tipos RPE)
    const updateData: import('@/src/core/interfaces/workout-session.interface').ExerciseLogUpdateData = {
      weight: validatedData.weight,
      reps: validatedData.reps,
      rpe: validatedData.rpe as import('@/src/core/interfaces/workout-session.interface').RPE | undefined,
      notes: validatedData.notes,
    }

    const result = await repo.updateExerciseLog(logId, updateData)

    if (!result.success) {
      console.error('[API PATCH /sessions/[id]/logs/[logId]] Error updating log:', result.error)
      return Response.json(
        { success: false, error: 'Error al actualizar log de ejercicio' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Log actualizado exitosamente',
    })
  } catch (error) {
    console.error('[API PATCH /sessions/[id]/logs/[logId]] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sessions/[id]/logs/[logId]
 * Elimina un log de ejercicio (usado para correcciones)
 *
 * Returns: { success: true } | { success: false, error: string }
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    // Obtener los IDs
    const { id: sessionId, logId } = await params

    // Validar UUIDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sessionId) || !uuidRegex.test(logId)) {
      return Response.json(
        { success: false, error: 'ID inválido' },
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
      console.error('[API DELETE /sessions/[id]/logs/[logId]] Error fetching session:', sessionResult.error)
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

    // Verificar que el log existe y pertenece a la sesión
    const logsResult = await repo.getExerciseLogs(sessionId)

    if (!logsResult.success) {
      console.error('[API DELETE /sessions/[id]/logs/[logId]] Error fetching logs:', logsResult.error)
      return Response.json(
        { success: false, error: 'Error al verificar log' },
        { status: 500 }
      )
    }

    const logExists = logsResult.data.some(log => log.id === logId)
    if (!logExists) {
      return Response.json(
        { success: false, error: 'Log no encontrado en esta sesión' },
        { status: 404 }
      )
    }

    // Eliminar el log
    const result = await repo.deleteExerciseLog(logId)

    if (!result.success) {
      console.error('[API DELETE /sessions/[id]/logs/[logId]] Error deleting log:', result.error)
      return Response.json(
        { success: false, error: 'Error al eliminar log de ejercicio' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Log eliminado exitosamente',
    })
  } catch (error) {
    console.error('[API DELETE /sessions/[id]/logs/[logId]] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
