/**
 * Delivery Layer - API Route Handler
 * Endpoint para gestionar el perfil del usuario
 *
 * Tarea 4.1: GET/PATCH perfil de usuario con validación Zod
 */

import { createClient } from '@/src/services/supabase/server'
import { z } from 'zod'
import type { ProfileUpdate } from '@/src/services/supabase/database.types'

export const dynamic = 'force-dynamic'

// Zod schema para validación de actualización de perfil
const updateProfileSchema = z.object({
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  equipment: z.array(
    z.enum([
      'bodyweight',
      'dumbbells',
      'barbell',
      'kettlebell',
      'resistance-bands',
      'pull-up-bar',
      'bench',
      'cables',
      'machines',
      'trx'
    ])
  ).optional(),
  goals: z.array(
    z.enum([
      'muscle-gain',
      'fat-loss',
      'strength',
      'endurance',
      'flexibility',
      'general-fitness'
    ])
  ).optional(),
  days_per_week: z.number().int().min(3).max(6).optional(),
  additional_info: z.string().optional()
})

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/**
 * GET /api/profile
 * Obtiene el perfil del usuario autenticado
 */
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

    // Obtener perfil de la tabla profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[API /profile] GET Error:', error)

      // Si el perfil no existe, retornar null en lugar de error
      if (error.code === 'PGRST116') {
        return Response.json({
          success: true,
          profile: null
        })
      }

      return Response.json(
        { success: false, error: 'Error al obtener perfil' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        fitness_level: profile.fitness_level,
        equipment: profile.equipment,
        goals: profile.goals,
        days_per_week: profile.days_per_week,
        additional_info: profile.additional_info,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    })
  } catch (error) {
    console.error('[API /profile] GET Error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/profile
 * Actualiza el perfil del usuario autenticado
 */
export async function PATCH(req: Request) {
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

    // Parse y validar request body
    const body = await req.json()
    const validation = updateProfileSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const updates: UpdateProfileInput = validation.data

    // Verificar que haya al menos un campo para actualizar
    if (Object.keys(updates).length === 0) {
      return Response.json(
        { success: false, error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    // Actualizar perfil con updated_at automático
    const profileUpdate: ProfileUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[API /profile] PATCH Error:', error)
      return Response.json(
        { success: false, error: 'Error al actualizar perfil' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        fitness_level: updatedProfile.fitness_level,
        equipment: updatedProfile.equipment,
        goals: updatedProfile.goals,
        days_per_week: updatedProfile.days_per_week,
        additional_info: updatedProfile.additional_info,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at
      }
    })
  } catch (error) {
    console.error('[API /profile] PATCH Error:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
