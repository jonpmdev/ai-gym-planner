import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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

export async function updateSession(request: NextRequest) {
  // Si Supabase no está configurado, permitir acceso
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request })
  }
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rutas /dashboard - requieren autenticación
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Si el usuario está autenticado y va a /auth/login o /auth/registro, redirigir a /dashboard
  if (
    user &&
    (request.nextUrl.pathname === "/auth/login" ||
      request.nextUrl.pathname === "/auth/registro")
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
