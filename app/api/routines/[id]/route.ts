/**
 * Delivery Layer - API Route Handler
 * Endpoint para obtener el detalle de una rutina específica
 *
 * Tarea 3.1: Llama a RPC get_routine_details(p_routine_id)
 */

import { createClient } from '@/src/services/supabase/server'
import type { Database } from '@/src/services/supabase/database.types'

export const dynamic = 'force-dynamic'

type RoutineDetailsRpcResponse = Database['public']['Functions']['get_routine_details']['Returns']

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  req: Request,
  { params }: RouteParams
) {
  try {
    // Obtener el ID de la rutina desde los parámetros
    const { id: routineId } = await params

    // Validar que el ID sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(routineId)) {
      return Response.json(
        { success: false, error: 'ID de rutina inválido' },
        { status: 400 }
      )
    }

    // Verificar autenticación
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Llamar a la función RPC get_routine_details
    // La función ya valida que el usuario tenga acceso a la rutina
    const { data, error } = await supabase
      .rpc('get_routine_details', {
        p_routine_id: routineId
      })

    if (error) {
      console.error('[API /routines/[id]] RPC Error:', error)

      // Si el error es de unauthorized, retornar 403
      if (error.message.includes('Unauthorized')) {
        return Response.json(
          { success: false, error: 'No tienes acceso a esta rutina' },
          { status: 403 }
        )
      }

      return Response.json(
        { success: false, error: 'Error al obtener detalle de rutina' },
        { status: 500 }
      )
    }

    // La función RPC retorna un JSONB, lo parseamos si es string
    const routine = typeof data === 'string' ? JSON.parse(data) : data

    // Si la rutina está vacía o no existe
    if (!routine || Object.keys(routine).length === 0) {
      return Response.json(
        { success: false, error: 'Rutina no encontrada' },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      routine
    })
  } catch (error) {
    console.error('[API /routines/[id]] Error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
