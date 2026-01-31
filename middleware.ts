import { updateSession, isSupabaseConfigured } from "@/src/services/supabase/middleware"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // Si Supabase no está configurado, permitir acceso sin autenticación
  if (!isSupabaseConfigured()) {
    return NextResponse.next()
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
