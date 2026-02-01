"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/services/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Calendar, Dumbbell, FolderOpen } from "lucide-react"
import type { StoredWorkoutPlan } from "@/src/core/interfaces/workout-generator.interface"

export default function HistoryPage() {
  const [routines, setRoutines] = useState<StoredWorkoutPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadRoutines = async () => {
      try {
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        // Obtener rutinas del usuario vía API
        const response = await fetch('/api/routines')
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Error al cargar rutinas')
        }

        setRoutines(result.routines)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar rutinas")
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutines()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 -ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Button>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mis Rutinas
          </h1>
          <p className="text-muted-foreground mt-1">
            Tus rutinas de entrenamiento guardadas
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Routines List */}
        {routines.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No tienes rutinas guardadas
                </h3>
                <p className="text-muted-foreground">
                  Genera tu primera rutina personalizada y guárdala para acceder a ella cuando quieras
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                Generar rutina
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <Card key={routine.id} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Routine Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{routine.title}</h3>
                        <p className="text-sm text-muted-foreground">{routine.description}</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(routine.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Badge>
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
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/routines/${routine.id}`)}
                    className="border-border bg-transparent"
                  >
                    Ver rutina
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
