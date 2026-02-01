"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dumbbell,
  Play,
  Plus,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  Activity
} from "lucide-react"

interface CurrentRoutine {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
}

interface RecentRoutine {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
}

interface UserProgress {
  totalRoutines: number
  completedRoutines: number
  activeRoutines: number
  totalSessions: number
  completedSessions: number
  averageRpe: number | null
  averageDuration: number | null
  lastSession: string | null
  currentRoutine: CurrentRoutine | null
  recentExercises: Array<{
    name: string
    count: number
  }>
  moodDistribution: Record<string, number>
}

interface RecentRoutines {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
}

export interface DashboardHomeProps {
  progress: UserProgress
  recentRoutines: RecentRoutines[]
  onCreateRoutine: () => void
  onContinueTraining: (routineId: string) => void
  onViewRoutine: (routineId: string) => void
}

export function DashboardHome({
  progress,
  recentRoutines,
  onCreateRoutine,
  onContinueTraining,
  onViewRoutine
}: DashboardHomeProps) {
  const hasActiveRoutine = progress.currentRoutine !== null

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mi Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido a tu centro de entrenamiento
            </p>
          </div>
          <Button
            onClick={onCreateRoutine}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear nueva rutina
          </Button>
        </div>

        {/* Active Routine Card - Prominent */}
        {hasActiveRoutine && progress.currentRoutine && (
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-foreground">
                      {progress.currentRoutine.title}
                    </h2>
                    <Badge className="bg-primary text-primary-foreground">
                      Activa
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {progress.currentRoutine.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Iniciada el {new Date(progress.currentRoutine.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => onContinueTraining(progress.currentRoutine!.id)}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
              >
                <Play className="w-5 h-5 mr-2" />
                Continuar entrenamiento
              </Button>
            </div>
          </Card>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Routines */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Rutinas
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {progress.totalRoutines}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          {/* Completed Sessions */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Sesiones Completadas
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {progress.completedSessions}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          {/* Total Sessions */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Sesiones
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {progress.totalSessions}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          {/* Average Duration */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Duración Promedio
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {progress.averageDuration ? `${Math.round(progress.averageDuration)}m` : '-'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Routines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Rutinas Recientes
            </h2>
            <Button
              variant="ghost"
              onClick={() => onViewRoutine('')}
              className="text-primary hover:text-primary/80"
            >
              Ver todas
            </Button>
          </div>

          {recentRoutines.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Aún no tienes rutinas. ¡Crea tu primera rutina personalizada!
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentRoutines.slice(0, 3).map((routine) => (
                <Card
                  key={routine.id}
                  className="p-6 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => onViewRoutine(routine.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {routine.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {routine.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
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
                    <span className="text-xs text-muted-foreground">
                      {new Date(routine.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
