/**
 * Delivery Layer - API Route Handler
 * Endpoints para gestión de sesiones de entrenamiento
 *
 * POST /api/sessions - Iniciar nueva sesión
 * GET /api/sessions - Listar sesiones del usuario
 */

import { createClient } from '@/src/services/supabase/server'
import { createSessionRepository } from '@/src/services/supabase/session-repository.factory'
import {
  startSessionSchema,
  sessionQuerySchema,
  type StartSessionInput,
  type SessionQueryParams,
} from '@/src/core/schemas/session.schemas'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

/**
 * POST /api/sessions
 * Inicia una nueva sesión de entrenamiento
 *
 * Body: { routineDayId: string }
 * Returns: { success: true, sessionId: string } | { success: false, error: string }
 */
export async function POST(req: Request) {
  try {
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

    // Parsear y validar body
    const body = await req.json()
    let validatedData: StartSessionInput

    try {
      validatedData = startSessionSchema.parse(body)
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

    // Crear sesión usando el repositorio
    const repo = await createSessionRepository()
    const result = await repo.startSession(user.id, validatedData.routineDayId)

    if (!result.success) {
      // Manejar errores específicos
      const errorMessage = result.error.message

      if (errorMessage.includes('already has an active session')) {
        return Response.json(
          {
            success: false,
            error: 'Ya tienes una sesión activa. Complétala o abandónala primero.',
          },
          { status: 409 } // Conflict
        )
      }

      if (errorMessage.includes('not found')) {
        return Response.json(
          { success: false, error: 'Día de rutina no encontrado' },
          { status: 404 }
        )
      }

      if (errorMessage.includes('Unauthorized')) {
        return Response.json(
          { success: false, error: 'No tienes acceso a esta rutina' },
          { status: 403 }
        )
      }

      // Error genérico
      console.error('[API POST /sessions] Error:', result.error)
      return Response.json(
        { success: false, error: 'Error al iniciar sesión' },
        { status: 500 }
      )
    }

    return Response.json(
      {
        success: true,
        sessionId: result.data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API POST /sessions] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sessions
 * Lista las sesiones del usuario con filtros opcionales
 *
 * Query params:
 * - status?: 'in_progress' | 'completed' | 'abandoned'
 * - limit?: number (default: 10, max: 100)
 * - offset?: number (default: 0)
 * - fromDate?: ISO date string
 * - toDate?: ISO date string
 *
 * Returns: { success: true, sessions: WorkoutSession[] } | { success: false, error: string }
 */
export async function GET(req: Request) {
  try {
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

    // Parsear query params
    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    let validatedParams: SessionQueryParams

    try {
      validatedParams = sessionQuerySchema.parse(queryParams)
    } catch (error) {
      if (error instanceof ZodError) {
        return Response.json(
          {
            success: false,
            error: 'Parámetros de consulta inválidos',
            details: error.errors,
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Obtener sesiones usando el repositorio
    const repo = await createSessionRepository()
    const result = await repo.getSessionsByUser(user.id, {
      status: validatedParams.status,
      limit: validatedParams.limit,
      offset: validatedParams.offset,
      fromDate: validatedParams.fromDate,
      toDate: validatedParams.toDate,
    })

    if (!result.success) {
      console.error('[API GET /sessions] Error:', result.error)
      return Response.json(
        { success: false, error: 'Error al obtener sesiones' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      sessions: result.data,
      count: result.data.length,
    })
  } catch (error) {
    console.error('[API GET /sessions] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
