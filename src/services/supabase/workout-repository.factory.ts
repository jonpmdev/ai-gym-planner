/**
 * Factory function for SupabaseWorkoutRepository
 *
 * This factory follows the Dependency Injection pattern by providing
 * a way to create repositories with their dependencies properly configured.
 *
 * Usage in API routes or Server Actions:
 * ```typescript
 * const repository = await createWorkoutRepository()
 * const result = await repository.save(userId, plan, profile)
 * ```
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IWorkoutRepository } from '@/src/core/interfaces/workout-generator.interface'
import { createClient } from './server'
import { SupabaseWorkoutRepository } from './supabase-workout-repository'
import type { Database } from './database.types'

/**
 * Creates a SupabaseWorkoutRepository instance with the server client.
 *
 * This factory is async because it needs to create the Supabase client
 * which requires access to cookies (async in Next.js 15+).
 *
 * @returns A configured IWorkoutRepository instance
 * @throws Error if Supabase is not configured
 */
export async function createWorkoutRepository(): Promise<IWorkoutRepository> {
  const supabase = await createClient()
  return new SupabaseWorkoutRepository(supabase)
}

/**
 * Creates a SupabaseWorkoutRepository with a provided Supabase client.
 *
 * Useful when you already have a Supabase client instance and want to
 * avoid creating another one, or for testing with mock clients.
 *
 * @param supabase - An existing Supabase client instance
 * @returns A configured IWorkoutRepository instance
 */
export function createWorkoutRepositoryWithClient(
  supabase: SupabaseClient<Database>
): IWorkoutRepository {
  return new SupabaseWorkoutRepository(supabase)
}
