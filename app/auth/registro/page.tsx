"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/src/services/supabase/client"
import { Dumbbell, Loader2, Check, ArrowLeft } from "lucide-react"

export default function RegistroPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error con Google")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            AI Gym Planner
          </span>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Crear cuenta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Empieza a entrenar de forma inteligente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-6 bg-transparent border-border hover:bg-secondary"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Registrarse con Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O continúa con email</span>
              </div>
            </div>

            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-foreground">
                    Nombre completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-foreground">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>
                )}

                {/* Benefits */}
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-foreground">Al registrarte obtienes:</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Planes de entrenamiento ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Seguimiento de tu progreso</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Acceso a IA avanzada Llama 3.1</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="text-primary hover:underline underline-offset-4">
                  Iniciar sesión
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <Link href="#" className="hover:text-foreground underline underline-offset-2">
            Términos de servicio
          </Link>{" "}
          y{" "}
          <Link href="#" className="hover:text-foreground underline underline-offset-2">
            Política de privacidad
          </Link>
        </p>
      </div>
    </div>
  )
}
