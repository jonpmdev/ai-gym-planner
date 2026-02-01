/**
 * Delivery Layer - API Route Handler
 * Endpoint para guardar planes de entrenamiento generados
 */

import { createClient } from '@/src/services/supabase/server'
import { createWorkoutRepository } from '@/src/services/supabase'
import type { WorkoutPlan, UserFitnessProfile } from '@/src/core/entities/workout.entity'

export const dynamic = 'force-dynamic'

interface SavePlanRequest {
  plan: WorkoutPlan
  profile: UserFitnessProfile
}

export async function POST(req: Request) {
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

    // Parse request body
    const { plan, profile }: SavePlanRequest = await req.json()

    // Validar datos requeridos
    if (!plan || !profile) {
      return Response.json(
        { success: false, error: 'Datos incompletos: plan y profile son requeridos' },
        { status: 400 }
      )
    }

    // Crear repositorio y guardar plan
    const repository = await createWorkoutRepository()
    const result = await repository.save(user.id, plan, profile)

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      routineId: result.data
    })
  } catch (error) {
    console.error('[API /save-plan] Error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
