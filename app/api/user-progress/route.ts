/**
 * Delivery Layer - API Route Handler
 * Endpoint para obtener el progreso del usuario
 *
 * Tarea 2.1: Llama a RPC get_user_progress_context()
 */

import { createClient } from '@/src/services/supabase/server'
import type { Database } from '@/src/services/supabase/database.types'

export const dynamic = 'force-dynamic'

type UserProgressRpcResponse = Database['public']['Functions']['get_user_progress_context']['Returns']

export async function GET() {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Llamar a la función RPC get_user_progress_context
    const { data, error } = await supabase
      .rpc('get_user_progress_context', {
        p_user_id: user.id
      })

    if (error) {
      console.error('[API /user-progress] RPC Error:', error)
      return Response.json(
        { success: false, error: 'Error al obtener progreso del usuario' },
        { status: 500 }
      )
    }

    // La función RPC retorna un JSONB, lo parseamos si es string
    const progress = typeof data === 'string' ? JSON.parse(data) : data

    return Response.json({
      success: true,
      progress: {
        totalRoutines: progress.totalRoutines || 0,
        completedRoutines: progress.completedRoutines || 0,
        activeRoutines: progress.activeRoutines || 0,
        totalSessions: progress.totalSessions || 0,
        completedSessions: progress.completedSessions || 0,
        averageRpe: progress.averageRpe || null,
        averageDuration: progress.averageDuration || null,
        lastSession: progress.lastSession || null,
        currentRoutine: progress.currentRoutine || null,
        recentExercises: progress.recentExercises || [],
        moodDistribution: progress.moodDistribution || {}
      }
    })
  } catch (error) {
    console.error('[API /user-progress] Error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
