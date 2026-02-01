"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/services/supabase/client"
import { Button } from "@/components/ui/button"
import { WorkoutForm, WorkoutPlanDisplay } from "@/src/components/workout"
import { DashboardHome } from "@/src/components/dashboard/dashboard-home"
import type { WorkoutFormData } from "@/src/components/workout/types"
import type { WorkoutPlan, UserFitnessProfile, Equipment, ExperienceLevel, FitnessGoal, DaysPerWeek } from "@/src/core"
import { Dumbbell, LogOut, User, Loader2, History, UserCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DashboardView = "home" | "form" | "plan"

interface UserProgress {
  totalRoutines: number
  completedRoutines: number
  activeRoutines: number
  totalSessions: number
  completedSessions: number
  averageRpe: number | null
  averageDuration: number | null
  lastSession: string | null
  currentRoutine: {
    id: string
    title: string
    description: string
    status: string
    createdAt: string
  } | null
  recentExercises: Array<{ name: string; count: number }>
  moodDistribution: Record<string, number>
}

interface RecentRoutine {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>("home")
  const [isLoading, setIsLoading] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [userProfile, setUserProfile] = useState<UserFitnessProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [recentRoutines, setRecentRoutines] = useState<RecentRoutine[]>([])
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setIsLoadingUser(false)

      // Fetch user progress
      try {
        const progressResponse = await fetch('/api/user-progress')
        const progressResult = await progressResponse.json()

        if (progressResult.success) {
          setUserProgress(progressResult.progress)

          // Fetch recent routines
          const routinesResponse = await fetch('/api/routines')
          const routinesResult = await routinesResponse.json()

          if (routinesResult.success) {
            setRecentRoutines(routinesResult.routines || [])
          }

          // Determine initial view based on progress
          if (progressResult.progress.totalRoutines === 0) {
            setView("form")
          } else {
            setView("home")
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setView("form")
      } finally {
        setIsLoadingProgress(false)
      }
    }
    initializeDashboard()
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

      // Guardar el plan y el perfil del usuario
      setWorkoutPlan(result.plan)
      setUserProfile({
        equipment: data.equipment as Equipment[],
        level: data.level as ExperienceLevel,
        goals: data.goals as FitnessGoal[],
        daysPerWeek: parseInt(data.daysPerWeek) as DaysPerWeek,
        additionalInfo: data.additionalInfo || undefined
      })
      setView("plan")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setWorkoutPlan(null)
    setUserProfile(null)
    setView("form")
    setError(null)
  }

  if (isLoadingUser || isLoadingProgress) {
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

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/history")}
                className="hidden sm:flex items-center gap-2 hover:bg-secondary"
              >
                <History className="w-4 h-4" />
                Mis Rutinas
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/progress")}
                className="hidden sm:flex items-center gap-2 hover:bg-secondary"
              >
                <Dumbbell className="w-4 h-4" />
                Progreso
              </Button>

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
                  <DropdownMenuItem onClick={() => router.push("/dashboard/history")} className="sm:hidden cursor-pointer">
                    <History className="w-4 h-4 mr-2" />
                    Mis Rutinas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/progress")} className="sm:hidden cursor-pointer">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Progreso
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
      {view === "home" && userProgress ? (
        <DashboardHome
          progress={userProgress}
          recentRoutines={recentRoutines}
          onCreateRoutine={() => setView("form")}
          onContinueTraining={(routineId) => router.push(`/dashboard/routines/${routineId}`)}
          onViewRoutine={(routineId) => {
            if (routineId) {
              router.push(`/dashboard/routines/${routineId}`)
            } else {
              router.push("/dashboard/history")
            }
          }}
        />
      ) : view === "form" ? (
        <WorkoutForm
          onSubmit={handleFormSubmit}
          onBack={() => {
            if (userProgress && userProgress.totalRoutines > 0) {
              setView("home")
            } else {
              router.push("/")
            }
          }}
          isLoading={isLoading}
        />
      ) : workoutPlan && userProfile ? (
        <WorkoutPlanDisplay
          plan={workoutPlan}
          profile={userProfile}
          onBack={() => setView("form")}
          onReset={handleReset}
        />
      ) : null}
    </div>
  )
}
