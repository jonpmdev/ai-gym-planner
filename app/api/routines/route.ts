/**
 * Delivery Layer - API Route Handler
 * Endpoint para obtener las rutinas del usuario
 */

import { createClient } from '@/src/services/supabase/server'
import { createWorkoutRepository } from '@/src/services/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
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

    // Obtener query params (si hay filtros)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as 'active' | 'completed' | 'archived' | null
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : undefined

    // Crear repositorio y obtener rutinas
    const repository = await createWorkoutRepository()
    const result = await repository.findByUserId(user.id, {
      ...(status && { status }),
      ...(limit && { limit })
    })

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      routines: result.data
    })
  } catch (error) {
    console.error('[API /routines] Error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
