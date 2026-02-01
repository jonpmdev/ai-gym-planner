"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/services/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Loader2,
  Calendar,
  TrendingUp,
  Flame,
  Award,
  Dumbbell,
  Clock,
  Smile,
  Meh,
  Frown,
  BatteryLow,
  Eye,
} from "lucide-react"
import type { WorkoutSession } from "@/src/core/interfaces/workout-session.interface"

export const dynamic = "force-dynamic"

interface WorkoutSessionWithLogs extends WorkoutSession {
  exerciseLogs: Array<{
    id: string
    exerciseId: string
    setNumber: number
    weight?: number
    reps?: number
    rpe?: number
    notes?: string
    createdAt: Date
  }>
}

interface UserProgress {
  totalSessions: number
  completedSessions: number
  averageRpe: number | null
  averageDuration: number | null
  lastSession: string | null
  moodDistribution: Record<string, number>
}

const MOOD_ICONS = {
  great: { icon: Smile, label: "Excelente", color: "text-green-500" },
  good: { icon: Smile, label: "Bien", color: "text-blue-500" },
  neutral: { icon: Meh, label: "Normal", color: "text-yellow-500" },
  tired: { icon: Frown, label: "Cansado", color: "text-orange-500" },
  exhausted: { icon: BatteryLow, label: "Agotado", color: "text-red-500" },
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<WorkoutSessionWithLogs | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [limit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        // Cargar estadísticas generales
        const progressResponse = await fetch("/api/user-progress")
        const progressResult = await progressResponse.json()

        if (progressResult.success) {
          setUserProgress(progressResult.progress)
        }

        // Cargar sesiones completadas
        await loadSessions()
      } catch (err) {
        console.error("Error al cargar datos:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, supabase.auth])

  const loadSessions = async () => {
    try {
      const response = await fetch(
        `/api/sessions?status=completed&limit=${limit}&offset=${offset}`
      )
      const result = await response.json()

      if (result.success) {
        const newSessions = result.sessions || []
        setSessions((prev) => [...prev, ...newSessions])
        setHasMore(newSessions.length === limit)
      }
    } catch (err) {
      console.error("Error al cargar sesiones:", err)
    }
  }

  const handleViewSessionDetail = async (sessionId: string) => {
    setIsLoadingDetail(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      const result = await response.json()

      if (result.success) {
        setSelectedSession(result.session)
      }
    } catch (err) {
      console.error("Error al cargar detalle de sesión:", err)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit)
    loadSessions()
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 -ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <h1
            className="text-3xl font-bold text-foreground mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mi Progreso
          </h1>
          <p className="text-muted-foreground">
            Historial de entrenamientos y estadísticas
          </p>
        </div>

        {/* Estadísticas Generales */}
        {userProgress && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total de sesiones */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sesiones totales</p>
                  <p className="text-2xl font-bold text-foreground">
                    {userProgress.completedSessions}
                  </p>
                </div>
              </div>
            </Card>

            {/* RPE Promedio */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RPE promedio</p>
                  <p className="text-2xl font-bold text-foreground">
                    {userProgress.averageRpe?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Duración promedio */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duración promedio</p>
                  <p className="text-2xl font-bold text-foreground">
                    {userProgress.averageDuration
                      ? formatDuration(userProgress.averageDuration)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Racha (placeholder - podría calcularse) */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mejor racha</p>
                  <p className="text-2xl font-bold text-foreground">
                    {/* Placeholder - implementar cálculo de racha */}
                    -
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Lista de Sesiones */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Historial de Sesiones
          </h2>

          {sessions.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border">
              <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aún no tienes sesiones completadas. ¡Empieza a entrenar!
              </p>
            </Card>
          ) : (
            <>
              {sessions.map((session) => {
                const MoodIcon = session.mood
                  ? MOOD_ICONS[session.mood]?.icon || Meh
                  : null
                const moodColor = session.mood
                  ? MOOD_ICONS[session.mood]?.color || "text-gray-500"
                  : "text-gray-500"
                const moodLabel = session.mood
                  ? MOOD_ICONS[session.mood]?.label || "Desconocido"
                  : null

                return (
                  <Card
                    key={session.id}
                    className="p-4 sm:p-6 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleViewSessionDetail(session.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(session.startedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {session.rpe && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              RPE {session.rpe}
                            </Badge>
                          )}
                          {MoodIcon && (
                            <div className="flex items-center gap-1.5">
                              <MoodIcon className={`w-4 h-4 ${moodColor}`} />
                              <span className="text-sm text-muted-foreground">{moodLabel}</span>
                            </div>
                          )}
                          {session.actualDuration && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(session.actualDuration)}
                              </span>
                            </div>
                          )}
                        </div>

                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {session.notes}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewSessionDetail(session.id)
                        }}
                        className="border-border hover:border-primary/50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalle
                      </Button>
                    </div>
                  </Card>
                )
              })}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    className="border-border hover:border-primary/50"
                  >
                    Cargar más
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalle de Sesión */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Sesión</DialogTitle>
            <DialogDescription>
              {selectedSession &&
                formatDate(selectedSession.startedAt)}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : selectedSession ? (
            <div className="space-y-4 py-4">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4">
                {selectedSession.rpe && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">RPE General</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {selectedSession.rpe} / 10
                    </Badge>
                  </div>
                )}
                {selectedSession.mood && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estado de ánimo</p>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const MoodIcon = MOOD_ICONS[selectedSession.mood]?.icon || Meh
                        const color = MOOD_ICONS[selectedSession.mood]?.color || "text-gray-500"
                        return <MoodIcon className={`w-5 h-5 ${color}`} />
                      })()}
                      <span className="text-sm text-foreground">
                        {MOOD_ICONS[selectedSession.mood]?.label || "Desconocido"}
                      </span>
                    </div>
                  </div>
                )}
                {selectedSession.actualDuration && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duración</p>
                    <span className="text-sm font-medium text-foreground">
                      {formatDuration(selectedSession.actualDuration)}
                    </span>
                  </div>
                )}
              </div>

              {selectedSession.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedSession.notes}
                  </p>
                </div>
              )}

              {/* Ejercicios Realizados */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Ejercicios Realizados ({selectedSession.exerciseLogs.length} sets)
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedSession.exerciseLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg text-sm"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-foreground">
                          Set {log.setNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        {log.weight && <span>{log.weight} kg</span>}
                        {log.reps && <span>{log.reps} reps</span>}
                        {log.rpe && (
                          <Badge variant="outline" className="text-xs">
                            RPE {log.rpe}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
