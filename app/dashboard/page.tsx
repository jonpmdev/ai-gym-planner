"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/services/supabase/client"
import { Button } from "@/components/ui/button"
import { WorkoutForm, WorkoutPlanDisplay } from "@/src/components/workout"
import type { WorkoutFormData } from "@/src/components/workout/types"
import type { WorkoutPlan } from "@/src/core"
import { Dumbbell, LogOut, User, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DashboardView = "form" | "plan"

export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>("form")
  const [isLoading, setIsLoading] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setIsLoadingUser(false)
    }
    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleFormSubmit = async (data: WorkoutFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al generar el plan")
      }

      setWorkoutPlan(result.plan)
      setView("plan")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setWorkoutPlan(null)
    setView("form")
    setError(null)
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                AI Gym Planner
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-secondary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm text-foreground">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium text-foreground">
                    {user?.user_metadata?.full_name || "Usuario"}
                  </p>
                  <p className="text-muted-foreground text-xs">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      {view === "form" ? (
        <WorkoutForm 
          onSubmit={handleFormSubmit} 
          onBack={() => router.push("/")}
          isLoading={isLoading}
        />
      ) : workoutPlan ? (
        <WorkoutPlanDisplay 
          plan={workoutPlan} 
          onBack={() => setView("form")}
          onReset={handleReset}
        />
      ) : null}
    </div>
  )
}
