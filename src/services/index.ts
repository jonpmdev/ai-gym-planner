/**
 * Services Layer - Infrastructure Exports
 * Clean Architecture: This layer implements core interfaces
 *
 * NOTE: Server-only exports (createServerClient, updateSession) are NOT included here
 * to prevent "next/headers" from being bundled in client components.
 * Import those directly from './supabase/server' or './supabase/middleware' in server contexts.
 */

// AI Services (server-only, but safe to import types)
export {
  GroqWorkoutGenerator,
  getWorkoutGenerator
} from './ai/groq-workout-generator.service'

export { buildPrompt } from './ai/prompt-builder'

// Export Services (can be used client-side)
export {
  TextPlanExporter,
  createPlanExporter
} from './export/plan-exporter.service'

// Supabase Client Services (client-safe only)
export {
  createClient as createBrowserClient,
  isSupabaseConfigured,
} from './supabase/client'

// Auth Actions (server actions - can be called from client)
export {
  signUp,
  login,
  signInWithGoogle,
  signOut,
  getUser,
  type SignUpData,
  type LoginData,
} from './supabase/auth-actions'
