export { createClient as createBrowserClient, isSupabaseConfigured } from "./client"
export { createClient as createServerClient } from "./server"
export { updateSession, isSupabaseConfigured as isSupabaseConfiguredServer } from "./middleware"
export {
  signUp,
  login,
  signInWithGoogle,
  signOut,
  getUser,
  type SignUpData,
  type LoginData,
} from "./auth-actions"
