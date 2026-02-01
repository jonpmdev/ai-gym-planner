/**
 * Delivery Layer - API Route Handler
 * Endpoint para obtener la sesión activa del usuario
 *
 * GET /api/sessions/active - Obtener sesión activa (in_progress)
 */

import { createClient } from '@/src/services/supabase/server'
import { createSessionRepository } from '@/src/services/supabase/session-repository.factory'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sessions/active
 * Obtiene la sesión activa del usuario (si existe)
 *
 * Una sesión activa es aquella que tiene completed_at = null
 *
 * Returns:
 * - { success: true, active: true, session: WorkoutSession } si hay sesión activa
 * - { success: true, active: false } si no hay sesión activa
 * - { success: false, error: string } en caso de error
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

    // Obtener sesión activa usando el repositorio
    const repo = await createSessionRepository()
    const result = await repo.getActiveSession(user.id)

    if (!result.success) {
      console.error('[API GET /sessions/active] Error:', result.error)
      return Response.json(
        { success: false, error: 'Error al obtener sesión activa' },
        { status: 500 }
      )
    }

    // Si no hay sesión activa
    if (!result.data) {
      return Response.json({
        success: true,
        active: false,
      })
    }

    // Hay una sesión activa
    return Response.json({
      success: true,
      active: true,
      session: result.data,
    })
  } catch (error) {
    console.error('[API GET /sessions/active] Unexpected error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
