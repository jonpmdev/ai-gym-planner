"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/src/services/supabase/client"
import { Button } from "@/components/ui/button"
import { WorkoutSessionTracker } from "@/src/components/workout/workout-session-tracker"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const dynamic = "force-dynamic"

interface RoutineDayData {
  id: string
  day: string
  focus: string
  duration: string
  exercises: Array<{
    id: string
    name: string
    sets: number
    reps: string
    rest: string
    notes?: string
  }>
}

export default function WorkoutSessionPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [routineDay, setRoutineDay] = useState<RoutineDayData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routineId, setRoutineId] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const dayId = params?.dayId as string

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        // 1. Verificar si hay sesión activa
        const activeSessionResponse = await fetch("/api/sessions/active")
        const activeSessionResult = await activeSessionResponse.json()

        if (!activeSessionResponse.ok || !activeSessionResult.success) {
          throw new Error("Error al verificar sesión activa")
        }

        let currentSessionId: string | null = null

        // 2. Si hay sesión activa, verificar si es para este día
        if (activeSessionResult.active && activeSessionResult.session) {
          const activeSession = activeSessionResult.session

          if (activeSession.routineDayId === dayId) {
            // Usar la sesión activa existente
            currentSessionId = activeSession.id
          } else {
            // Hay una sesión activa para otro día
            setError(
              "Ya tienes una sesión activa para otro día. Complétala o abandónala primero."
            )
            setIsLoading(false)
            return
          }
        }

        // 3. Si no hay sesión activa, crear una nueva
        if (!currentSessionId) {
          const createSessionResponse = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ routineDayId: dayId }),
          })

          const createSessionResult = await createSessionResponse.json()

          if (!createSessionResponse.ok || !createSessionResult.success) {
            throw new Error(
              createSessionResult.error || "Error al iniciar sesión de entrenamiento"
            )
          }

          currentSessionId = createSessionResult.sessionId
        }

        // 4. Obtener los datos del día de rutina
        // Necesitamos obtener el routine_day con sus ejercicios
        // Hacemos una consulta directa a Supabase
        const { data: dayData, error: dayError } = await supabase
          .from("routine_days")
          .select(`
            id,
            day_name,
            focus,
            estimated_duration,
            week_id,
            exercises!routine_day_id (
              id,
              name,
              sets,
              reps,
              rest_seconds,
              notes
            )
          `)
          .eq("id", dayId)
          .single()

        if (dayError || !dayData) {
          throw new Error("Día de rutina no encontrado")
        }

        // Obtener el routine_id desde la semana (week)
        if (dayData.week_id) {
          const { data: weekData, error: weekError } = await supabase
            .from("routine_weeks")
            .select("routine_id")
            .eq("id", dayData.week_id)
            .single()

          if (weekError || !weekData) {
            console.warn("No se pudo obtener el routine_id")
          } else {
            setRoutineId(weekData.routine_id)
          }
        }

        // Mapear los datos al formato esperado por el componente
        const mappedDay: RoutineDayData = {
          id: dayData.id,
          day: dayData.day_name || "Día de entrenamiento",
          focus: dayData.focus || "",
          duration: typeof dayData.estimated_duration === "number"
            ? `${dayData.estimated_duration} min`
            : (dayData.estimated_duration || "60 min"),
          exercises: (dayData.exercises || []).map((ex: any) => ({
            id: ex.id,
            name: ex.name || "Ejercicio",
            sets: ex.sets || 3,
            reps: ex.reps || "10",
            rest: ex.rest_seconds ? `${ex.rest_seconds}s` : "60s",
            notes: ex.notes || undefined,
          })),
        }

        setSessionId(currentSessionId)
        setRoutineDay(mappedDay)
      } catch (err) {
        console.error("Error al inicializar sesión:", err)
        setError(err instanceof Error ? err.message : "Error al cargar la sesión")
      } finally {
        setIsLoading(false)
      }
    }

    if (dayId) {
      initializeSession()
    }
  }, [dayId, router, supabase])

  const handleSessionComplete = () => {
    // Redirigir al detalle de la rutina o al dashboard
    if (routineId) {
      router.push(`/dashboard/routines/${routineId}`)
    } else {
      router.push("/dashboard")
    }
  }

  const handleAbandonSession = async () => {
    if (!sessionId) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al abandonar sesión")
      }

      // Redirigir al dashboard
      if (routineId) {
        router.push(`/dashboard/routines/${routineId}`)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Error al abandonar sesión:", err)
      setError(err instanceof Error ? err.message : "Error al abandonar sesión")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Preparando tu sesión de entrenamiento...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionId || !routineDay) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 -ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Error al cargar la sesión de entrenamiento"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header con botón de abandonar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleAbandonSession}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Abandonar
          </Button>
          <span className="text-sm text-muted-foreground">Sesión activa</span>
        </div>
      </div>

      {/* Componente de tracking */}
      <WorkoutSessionTracker
        sessionId={sessionId}
        routineDay={routineDay}
        onSessionComplete={handleSessionComplete}
      />
    </div>
  )
}
