/**
 * Session Repository Factory
 *
 * Provides a centralized way to create IWorkoutSessionRepository instances.
 * Follows the Factory pattern with dependency injection.
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

/**
 * Creates a new IWorkoutSessionRepository instance using Supabase.
 *
 * This factory function:
 * 1. Creates a server-side Supabase client with proper cookie handling
 * 2. Injects it into the repository implementation
 * 3. Returns the repository interface
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
 * Singleton instance for the session repository.
 * Created lazily on first access.
 *
 * Note: Use with caution in long-running processes as it maintains
 * a connection to Supabase. Prefer creating new instances per request
 * in serverless environments.
 */
let repositoryInstance: IWorkoutSessionRepository | null = null

/**
 * Gets or creates a singleton instance of the session repository.
 *
 * This is useful for sharing a single repository instance across
 * multiple operations in the same request/context.
 *
 * @returns A promise that resolves to the singleton repository instance
 *
 * @example
 * ```typescript
 * const repo = await getSessionRepository()
 * ```
 */
export async function getSessionRepository(): Promise<IWorkoutSessionRepository> {
  if (!repositoryInstance) {
    repositoryInstance = await createSessionRepository()
  }
  return repositoryInstance
}

/**
 * Resets the singleton instance.
 * Useful for testing or when you need to force recreation.
 */
export function resetSessionRepository(): void {
  repositoryInstance = null
}
