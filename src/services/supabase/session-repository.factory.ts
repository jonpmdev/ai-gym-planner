/**
 * Session Repository Factory
 *
 * Provides a centralized way to create IWorkoutSessionRepository instances.
 * Follows the Factory pattern with dependency injection.
 *
 * IMPORTANT: This factory always creates new instances, which is the correct
 * behavior for serverless environments (Vercel, AWS Lambda, etc.) where
 * each request should have its own instance with fresh credentials.
 *
 * Usage:
 * ```typescript
 * const repo = await createSessionRepository()
 * const result = await repo.startSession(userId, routineDayId)
 * ```
 */

import { createClient } from './server'
import { SupabaseWorkoutSessionRepository } from './supabase-session-repository'
import type { IWorkoutSessionRepository } from '@/src/core/interfaces/workout-session.interface'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a new IWorkoutSessionRepository instance using Supabase.
 *
 * This factory function:
 * 1. Creates a server-side Supabase client with proper cookie handling
 * 2. Injects it into the repository implementation
 * 3. Returns the repository interface
 *
 * Each call creates a NEW instance - this is intentional for serverless
 * environments where request isolation is important.
 *
 * @returns A promise that resolves to a fully configured session repository
 * @throws Error if Supabase is not properly configured
 *
 * @example
 * ```typescript
 * // In a Server Component or Server Action
 * const repo = await createSessionRepository()
 * const activeSession = await repo.getActiveSession(userId)
 * ```
 */
export async function createSessionRepository(): Promise<IWorkoutSessionRepository> {
  const supabase = await createClient()
  return new SupabaseWorkoutSessionRepository(supabase)
}

/**
 * Creates a session repository with a pre-existing Supabase client.
 *
 * Use this when you already have a Supabase client instance and want
 * to avoid creating another one (e.g., sharing across multiple repositories
 * in the same request).
 *
 * @param supabase - An existing Supabase client instance
 * @returns A new session repository using the provided client
 *
 * @example
 * ```typescript
 * const supabase = await createClient()
 * const sessionRepo = createSessionRepositoryWithClient(supabase)
 * const workoutRepo = createWorkoutRepositoryWithClient(supabase)
 * ```
 */
export function createSessionRepositoryWithClient(
  supabase: SupabaseClient
): IWorkoutSessionRepository {
  return new SupabaseWorkoutSessionRepository(supabase)
}
