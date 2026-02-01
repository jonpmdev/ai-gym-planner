"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/src/services/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Dumbbell,
  Clock,
  Play,
  CheckCircle,
  Archive
} from "lucide-react"

export const dynamic = "force-dynamic"

// Tipos específicos para los datos de la RPC get_routine_details
interface RpcRoutineDay {
  id: string
  dayNumber: number
  dayName: string
  focus: string
  estimatedDuration?: string
  exercises: Array<{
    id: string
    name: string
    sets: number
    reps: string
    restSeconds?: number
    notes?: string
    orderIndex: number
  }>
}

interface RpcRoutineWeek {
  id: string
  weekNumber: number
  theme: string
  days: RpcRoutineDay[]
}

interface RpcRoutineDetails {
  id: string
  title: string
  description: string
  status: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  profileSnapshot?: any
  weeks: RpcRoutineWeek[]
}

export default function RoutineDetailPage() {
  const [routine, setRoutine] = useState<RpcRoutineDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState("1")
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const routineId = params?.id as string

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        // Obtener detalle de la rutina
        const response = await fetch(`/api/routines/${routineId}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Error al cargar la rutina')
        }

        setRoutine(result.routine)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la rutina")
      } finally {
        setIsLoading(false)
      }
    }

    if (routineId) {
      loadRoutine()
    }
  }, [routineId, router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/history")}
            className="mb-4 -ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || "Rutina no encontrada"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/history")}
            className="mb-2 -ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Mis Rutinas
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1
                  className="text-3xl font-bold text-foreground"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {routine.title}
                </h1>
                <Badge
                  variant={
                    routine.status === 'active' ? 'default' :
                    routine.status === 'completed' ? 'secondary' : 'outline'
                  }
                  className={
                    routine.status === 'active' ? 'bg-primary text-primary-foreground' :
                    routine.status === 'completed' ? 'bg-secondary text-secondary-foreground' : ''
                  }
                >
                  {routine.status === 'active' ? 'Activa' :
                   routine.status === 'completed' ? 'Completada' : 'Archivada'}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">{routine.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Creada el {new Date(routine.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Week Tabs */}
        <Tabs value={selectedWeek} onValueChange={setSelectedWeek}>
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-6 bg-secondary">
            {routine.weeks.map(week => (
              <TabsTrigger
                key={week.weekNumber}
                value={week.weekNumber.toString()}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Semana {week.weekNumber}
              </TabsTrigger>
            ))}
          </TabsList>

          {routine.weeks.map(week => (
            <TabsContent key={week.weekNumber} value={week.weekNumber.toString()}>
              {/* Week Theme Card */}
              <Card className="p-4 mb-6 bg-primary/10 border-primary/30">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Enfoque de la semana:</span>
                  <span className="text-muted-foreground">{week.theme}</span>
                </div>
              </Card>

              {/* Training Days */}
              <div className="space-y-4">
                {week.days.map((day, dayIndex) => (
                  <Card key={dayIndex} className="p-6 bg-card border-border">
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{day.dayName}</h3>
                          <p className="text-sm text-muted-foreground">{day.focus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {day.estimatedDuration && (
                          <Badge variant="secondary" className="w-fit bg-secondary text-secondary-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {day.estimatedDuration}
                          </Badge>
                        )}
                        {routine.status === 'active' && day.id && (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/dashboard/session/${day.id}`)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Exercises Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground">
                            <th className="pb-2 font-medium">Ejercicio</th>
                            <th className="pb-2 font-medium text-center">Series</th>
                            <th className="pb-2 font-medium text-center">Reps</th>
                            <th className="pb-2 font-medium text-center">Descanso</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {day.exercises.map((exercise: any, exIndex: number) => (
                            <tr key={exIndex} className="text-foreground">
                              <td className="py-3">
                                <div>
                                  <span className="font-medium">{exercise.name}</span>
                                  {exercise.notes && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                      {exercise.notes}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-center">{exercise.sets}</td>
                              <td className="py-3 text-center">{exercise.reps}</td>
                              <td className="py-3 text-center text-muted-foreground">
                                {exercise.restSeconds ? `${exercise.restSeconds}s` : exercise.rest || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
