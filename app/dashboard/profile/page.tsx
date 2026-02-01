"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/services/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, UserCircle, Mail, Dumbbell, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { equipmentOptions, experienceLevels, goalOptions, daysPerWeekOptions } from "@/src/components/workout/form-options"

export const dynamic = "force-dynamic"

interface ProfileData {
  email: string
  fullName?: string
  level?: string
  equipment?: string[]
  goals?: string[]
  daysPerWeek?: string
}

interface UserStats {
  totalRoutines: number
  completedRoutines: number
  totalSessions: number
  completedSessions: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        // Obtener perfil
        const response = await fetch('/api/profile')
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Error al cargar el perfil')
        }

        setProfile({
          email: user.email || '',
          fullName: user.user_metadata?.full_name,
          level: result.profile?.level,
          equipment: result.profile?.equipment || [],
          goals: result.profile?.goals || [],
          daysPerWeek: result.profile?.daysPerWeek?.toString()
        })

        // Cargar estadísticas si están disponibles
        const progressResponse = await fetch('/api/user-progress')
        const progressResult = await progressResponse.json()

        if (progressResult.success) {
          setStats({
            totalRoutines: progressResult.progress.totalRoutines,
            completedRoutines: progressResult.progress.completedRoutines,
            totalSessions: progressResult.progress.totalSessions,
            completedSessions: progressResult.progress.completedSessions
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el perfil")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router, supabase])

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    if (!profile) return

    setProfile(prev => ({
      ...prev!,
      equipment: checked
        ? [...(prev!.equipment || []), equipmentId]
        : (prev!.equipment || []).filter(e => e !== equipmentId)
    }))
  }

  const handleGoalChange = (goalId: string, checked: boolean) => {
    if (!profile) return

    setProfile(prev => ({
      ...prev!,
      goals: checked
        ? [...(prev!.goals || []), goalId]
        : (prev!.goals || []).filter(g => g !== goalId)
    }))
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: profile.level,
          equipment: profile.equipment,
          goals: profile.goals,
          daysPerWeek: profile.daysPerWeek ? parseInt(profile.daysPerWeek) : undefined
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al guardar el perfil')
      }

      toast.success('Perfil actualizado correctamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar el perfil"
      setError(errorMessage)
      toast.error('Error al actualizar perfil', {
        description: errorMessage
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 -ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || "Error al cargar el perfil"}
          </div>
        </div>
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
            className="mb-2 -ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Button>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mi Perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra tu información y preferencias de entrenamiento
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Form - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info - Read Only */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                Información de Cuenta
              </h2>
              <div className="space-y-4">
                {profile.fullName && (
                  <div>
                    <Label className="text-muted-foreground">Nombre</Label>
                    <p className="text-foreground font-medium">{profile.fullName}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <p className="text-foreground font-medium">{profile.email}</p>
                </div>
              </div>
            </Card>

            {/* Fitness Profile - Editable */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Perfil de Entrenamiento
              </h2>

              <div className="space-y-6">
                {/* Experience Level */}
                <div>
                  <Label className="text-foreground mb-2 block">
                    Nivel de Experiencia
                  </Label>
                  <Select
                    value={profile.level || ''}
                    onValueChange={(value) => setProfile(prev => ({ ...prev!, level: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tu nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level.id} value={level.id}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-muted-foreground">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Days per Week */}
                <div>
                  <Label className="text-foreground mb-2 block">
                    Días de Entrenamiento por Semana
                  </Label>
                  <Select
                    value={profile.daysPerWeek || ''}
                    onValueChange={(value) => setProfile(prev => ({ ...prev!, daysPerWeek: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona los días" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysPerWeekOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Equipment */}
                <div>
                  <Label className="text-foreground mb-3 block">
                    Equipamiento Disponible
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipmentOptions.map((equipment) => (
                      <label
                        key={equipment.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          profile.equipment?.includes(equipment.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/50 hover:border-primary/50'
                        }`}
                      >
                        <Checkbox
                          checked={profile.equipment?.includes(equipment.id)}
                          onCheckedChange={(checked) => handleEquipmentChange(equipment.id, checked as boolean)}
                        />
                        <span className="text-sm text-foreground">{equipment.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <Label className="text-foreground mb-3 block">
                    Objetivos de Entrenamiento
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <label
                        key={goal.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          profile.goals?.includes(goal.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/50 hover:border-primary/50'
                        }`}
                      >
                        <Checkbox
                          checked={profile.goals?.includes(goal.id)}
                          onCheckedChange={(checked) => handleGoalChange(goal.id, checked as boolean)}
                        />
                        <span className="text-sm text-foreground">{goal.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-border mt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats Sidebar - Right Column (1/3) */}
          {stats && (
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estadísticas
                </h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalRoutines}
                    </p>
                    <p className="text-sm text-muted-foreground">Rutinas Creadas</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-foreground">
                      {stats.completedRoutines}
                    </p>
                    <p className="text-sm text-muted-foreground">Rutinas Completadas</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalSessions}
                    </p>
                    <p className="text-sm text-muted-foreground">Sesiones Totales</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-foreground">
                      {stats.completedSessions}
                    </p>
                    <p className="text-sm text-muted-foreground">Sesiones Completadas</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
