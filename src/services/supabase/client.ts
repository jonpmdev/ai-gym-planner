import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check that variables exist and are not placeholder values
  if (!url || !key) return false
  if (url.includes('[project-id]') || url.includes('your-project')) return false
  if (key.includes('...') || key.length < 100) return false

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Singleton client for browser
let client: SupabaseClient<Database> | null = null

export function createClient() {
  // During SSR/build, return a mock or throw a meaningful error
  if (typeof window === "undefined") {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      )
    }
  }

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    )
  }

  // Return singleton on client side
  if (client) return client

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
