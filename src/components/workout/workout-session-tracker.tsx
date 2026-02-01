"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Dumbbell,
  Plus,
  Check,
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  Save,
  Flag,
  Smile,
  Meh,
  Frown,
  BatteryLow,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { RPE, WorkoutMood } from "@/src/core/interfaces/workout-session.interface"

// ============================================================================
// Tipos e Interfaces
// ============================================================================

interface ExerciseSet {
  setNumber: number
  weight?: number
  reps?: number
  rpe?: RPE
  isCompleted: boolean
  logId?: string // ID del log guardado en la API
}

interface ExerciseState {
  id: string
  name: string
  plannedSets: number
  plannedReps: string
  plannedRest: string
  notes?: string
  completedSets: ExerciseSet[]
  isExpanded: boolean
}

interface WorkoutSessionTrackerProps {
  sessionId: string
  routineDay: {
    day: string
    focus: string
    exercises: Array<{
      id: string
      name: string
      sets: number
      reps: string
      rest: string
      notes?: string
    }>
  }
  onSessionComplete?: () => void
}

// ============================================================================
// Configuración de Timers y Moods
// ============================================================================

const TIMER_PRESETS = [30, 60, 90, 120, 180] as const
type TimerPreset = typeof TIMER_PRESETS[number]

const MOOD_OPTIONS: Array<{ value: WorkoutMood; label: string; icon: typeof Smile }> = [
  { value: "great", label: "Excelente", icon: Smile },
  { value: "good", label: "Bien", icon: Smile },
  { value: "neutral", label: "Normal", icon: Meh },
  { value: "tired", label: "Cansado", icon: Frown },
  { value: "exhausted", label: "Agotado", icon: BatteryLow },
]

// ============================================================================
// Componente Principal
// ============================================================================

export function WorkoutSessionTracker({
  sessionId,
  routineDay,
  onSessionComplete,
}: WorkoutSessionTrackerProps) {
  // Estados de ejercicios
  const [exercises, setExercises] = useState<ExerciseState[]>(() =>
    routineDay.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      plannedSets: ex.sets,
      plannedReps: ex.reps,
      plannedRest: ex.rest,
      notes: ex.notes,
      completedSets: [],
      isExpanded: false,
    }))
  )

  // Estado del timer de descanso
  const [restTimer, setRestTimer] = useState<{
    isActive: boolean
    timeLeft: number
    totalTime: number
  }>({
    isActive: false,
    timeLeft: 0,
    totalTime: 0,
  })

  // Estado del modal de finalización
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false)
  const [finishData, setFinishData] = useState<{
    rpe?: RPE
    mood?: WorkoutMood
    notes: string
  }>({
    notes: "",
  })

  // Estado de inputs de nuevo set
  const [newSetInputs, setNewSetInputs] = useState<Record<string, {
    weight: string
    reps: string
    rpe?: RPE
  }>>({})

  // Estado de carga
  const [isSaving, setIsSaving] = useState(false)

  // ============================================================================
  // Cálculos de Progreso
  // ============================================================================

  const totalExercises = exercises.length
  const completedExercises = exercises.filter((ex) =>
    ex.completedSets.length >= ex.plannedSets
  ).length
  const progressPercentage = (completedExercises / totalExercises) * 100

  const totalSetsPlanned = exercises.reduce((sum, ex) => sum + ex.plannedSets, 0)
  const totalSetsCompleted = exercises.reduce(
    (sum, ex) => sum + ex.completedSets.filter(s => s.isCompleted).length,
    0
  )

  // ============================================================================
  // Timer de Descanso
  // ============================================================================

  useEffect(() => {
    if (!restTimer.isActive || restTimer.timeLeft <= 0) return

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev.timeLeft <= 1) {
          // Timer terminado
          toast("¡Descanso terminado!", {
            description: "Listo para la siguiente serie",
            duration: 3000,
          })
          return { isActive: false, timeLeft: 0, totalTime: 0 }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [restTimer.isActive, restTimer.timeLeft])

  const startRestTimer = useCallback((seconds: TimerPreset) => {
    setRestTimer({
      isActive: true,
      timeLeft: seconds,
      totalTime: seconds,
    })
    toast.success(`Timer de descanso iniciado: ${seconds}s`)
  }, [])

  const pauseRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isActive: false }))
  }, [])

  const resumeRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isActive: true }))
  }, [])

  const resetRestTimer = useCallback(() => {
    setRestTimer({ isActive: false, timeLeft: 0, totalTime: 0 })
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // ============================================================================
  // Manejo de Sets
  // ============================================================================

  const handleToggleExercise = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, isExpanded: !ex.isExpanded } : ex
      )
    )
  }

  const handleAddSet = async (exerciseId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId)
    if (!exercise) return

    const inputs = newSetInputs[exerciseId]
    if (!inputs?.weight || !inputs?.reps) {
      toast.error("Completa peso y repeticiones")
      return
    }

    const setNumber = exercise.completedSets.length + 1

    setIsSaving(true)

    try {
      // Llamada a la API para guardar el set
      const response = await fetch(`/api/sessions/${sessionId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: exercise.id,
          setNumber,
          weight: parseFloat(inputs.weight),
          reps: parseInt(inputs.reps, 10),
          rpe: inputs.rpe,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al guardar el set")
      }

      // Actualizar estado local
      const newSet: ExerciseSet = {
        setNumber,
        weight: parseFloat(inputs.weight),
        reps: parseInt(inputs.reps, 10),
        rpe: inputs.rpe,
        isCompleted: true,
        logId: result.data.logId,
      }

      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? { ...ex, completedSets: [...ex.completedSets, newSet] }
            : ex
        )
      )

      // Limpiar inputs
      setNewSetInputs((prev) => ({
        ...prev,
        [exerciseId]: { weight: "", reps: "" },
      }))

      toast.success(`Set ${setNumber} registrado`)

      // Sugerir timer de descanso
      if (setNumber < exercise.plannedSets) {
        const restMatch = exercise.plannedRest.match(/(\d+)/)
        const suggestedRest = restMatch ? parseInt(restMatch[1], 10) : 60
        const preset = TIMER_PRESETS.includes(suggestedRest as TimerPreset)
          ? (suggestedRest as TimerPreset)
          : 60
        startRestTimer(preset)
      }
    } catch (error) {
      toast.error("Error al guardar el set", {
        description: error instanceof Error ? error.message : "Inténtalo de nuevo",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateSetInput = (
    exerciseId: string,
    field: "weight" | "reps",
    value: string
  ) => {
    setNewSetInputs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
      },
    }))
  }

  const handleUpdateSetRPE = (exerciseId: string, rpe: RPE) => {
    setNewSetInputs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        rpe,
      },
    }))
  }

  // ============================================================================
  // Finalización de Sesión
  // ============================================================================

  const handleOpenFinishDialog = () => {
    if (totalSetsCompleted === 0) {
      toast.error("Debes completar al menos un set antes de finalizar")
      return
    }
    setIsFinishDialogOpen(true)
  }

  const handleFinishSession = async () => {
    if (!finishData.rpe) {
      toast.error("El RPE general es obligatorio")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rpe: finishData.rpe,
          mood: finishData.mood,
          notes: finishData.notes,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al finalizar la sesión")
      }

      toast.success("¡Sesión finalizada correctamente!", {
        description: "Buen trabajo en tu entrenamiento",
      })

      setIsFinishDialogOpen(false)

      // Callback para redirigir o actualizar UI
      onSessionComplete?.()
    } catch (error) {
      toast.error("Error al finalizar la sesión", {
        description: error instanceof Error ? error.message : "Inténtalo de nuevo",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================================
  // Renderizado
  // ============================================================================

  return (
    <div className="min-h-screen py-6 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold text-foreground mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {routineDay.day}
          </h1>
          <p className="text-muted-foreground">{routineDay.focus}</p>
        </div>

        {/* Progress Card */}
        <Card className="p-4 sm:p-6 mb-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso de ejercicios</span>
              <span className="font-semibold text-foreground">
                {completedExercises} / {totalExercises}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sets completados</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {totalSetsCompleted} / {totalSetsPlanned}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Rest Timer */}
        {restTimer.timeLeft > 0 && (
          <Card className="p-4 mb-6 bg-primary/10 border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Descanso</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatTime(restTimer.timeLeft)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {restTimer.isActive ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={pauseRestTimer}
                    className="border-primary/30 hover:bg-primary/20"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resumeRestTimer}
                    className="border-primary/30 hover:bg-primary/20"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetRestTimer}
                  className="border-primary/30 hover:bg-primary/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Exercise List */}
        <div className="space-y-4 mb-6">
          {exercises.map((exercise) => {
            const isComplete = exercise.completedSets.length >= exercise.plannedSets
            const inputs = newSetInputs[exercise.id] || { weight: "", reps: "" }

            return (
              <Card
                key={exercise.id}
                className={cn(
                  "border-border transition-colors",
                  isComplete && "bg-primary/5 border-primary/30"
                )}
              >
                <Collapsible
                  open={exercise.isExpanded}
                  onOpenChange={() => handleToggleExercise(exercise.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 sm:p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left flex-1">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                            isComplete
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                          {isComplete ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Dumbbell className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {exercise.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {exercise.completedSets.length} / {exercise.plannedSets} sets
                            {" • "}
                            {exercise.plannedReps} reps
                            {" • "}
                            {exercise.plannedRest}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-2",
                          exercise.isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 border-t border-border pt-4">
                      {/* Notas del ejercicio */}
                      {exercise.notes && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Notas: </span>
                            {exercise.notes}
                          </p>
                        </div>
                      )}

                      {/* Sets completados */}
                      {exercise.completedSets.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Sets completados</Label>
                          <div className="space-y-2">
                            {exercise.completedSets.map((set) => (
                              <div
                                key={set.setNumber}
                                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg text-sm"
                              >
                                <span className="font-medium text-foreground">
                                  Set {set.setNumber}
                                </span>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                  <span>{set.weight} kg</span>
                                  <span>{set.reps} reps</span>
                                  {set.rpe && (
                                    <Badge variant="outline" className="text-xs">
                                      RPE {set.rpe}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Input para nuevo set */}
                      {!isComplete && (
                        <div className="space-y-4 pt-2">
                          <Label className="text-sm font-medium">
                            Registrar set {exercise.completedSets.length + 1}
                          </Label>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`weight-${exercise.id}`} className="text-sm">
                                Peso (kg)
                              </Label>
                              <Input
                                id={`weight-${exercise.id}`}
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="0"
                                value={inputs.weight}
                                onChange={(e) =>
                                  handleUpdateSetInput(exercise.id, "weight", e.target.value)
                                }
                                className="text-lg h-12"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`reps-${exercise.id}`} className="text-sm">
                                Repeticiones
                              </Label>
                              <Input
                                id={`reps-${exercise.id}`}
                                type="number"
                                min="0"
                                placeholder="0"
                                value={inputs.reps}
                                onChange={(e) =>
                                  handleUpdateSetInput(exercise.id, "reps", e.target.value)
                                }
                                className="text-lg h-12"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`rpe-${exercise.id}`} className="text-sm">
                              RPE (1-10) - Opcional
                            </Label>
                            <Select
                              value={inputs.rpe?.toString()}
                              onValueChange={(value) =>
                                handleUpdateSetRPE(exercise.id, parseInt(value, 10) as RPE)
                              }
                            >
                              <SelectTrigger id={`rpe-${exercise.id}`} className="h-12">
                                <SelectValue placeholder="Selecciona intensidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as RPE[]).map((rpe) => (
                                  <SelectItem key={rpe} value={rpe.toString()}>
                                    RPE {rpe} - {rpe <= 4 ? "Ligero" : rpe <= 6 ? "Moderado" : rpe <= 8 ? "Duro" : "Máximo"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            onClick={() => handleAddSet(exercise.id)}
                            disabled={isSaving || !inputs.weight || !inputs.reps}
                            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {isSaving ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Guardar set
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Timer rápido */}
                      {!isComplete && exercise.completedSets.length > 0 && (
                        <div className="pt-2">
                          <Label className="text-sm font-medium mb-2 block">Descanso rápido</Label>
                          <div className="grid grid-cols-5 gap-2">
                            {TIMER_PRESETS.map((seconds) => (
                              <Button
                                key={seconds}
                                variant="outline"
                                size="sm"
                                onClick={() => startRestTimer(seconds)}
                                className="border-border hover:border-primary/50"
                              >
                                {seconds}s
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>

        {/* Botón flotante de finalizar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={handleOpenFinishDialog}
              disabled={totalSetsCompleted === 0}
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg text-base font-semibold"
            >
              <Flag className="w-5 h-5 mr-2" />
              Terminar sesión
            </Button>
          </div>
        </div>

        {/* Dialog de finalización */}
        <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Finalizar sesión</DialogTitle>
              <DialogDescription>
                ¡Buen trabajo! Completa estos datos para finalizar tu entrenamiento.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* RPE General */}
              <div className="space-y-2">
                <Label htmlFor="session-rpe" className="text-sm font-medium">
                  Intensidad general (RPE) *
                </Label>
                <div className="space-y-3">
                  <Slider
                    id="session-rpe"
                    min={1}
                    max={10}
                    step={1}
                    value={[finishData.rpe || 5]}
                    onValueChange={([value]) =>
                      setFinishData((prev) => ({ ...prev, rpe: value as RPE }))
                    }
                    className="py-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ligero</span>
                    {finishData.rpe && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        RPE {finishData.rpe}
                      </Badge>
                    )}
                    <span className="text-muted-foreground">Máximo</span>
                  </div>
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-2">
                <Label htmlFor="session-mood" className="text-sm font-medium">
                  ¿Cómo te sentiste?
                </Label>
                <Select
                  value={finishData.mood}
                  onValueChange={(value) =>
                    setFinishData((prev) => ({ ...prev, mood: value as WorkoutMood }))
                  }
                >
                  <SelectTrigger id="session-mood">
                    <SelectValue placeholder="Selecciona tu estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="session-notes" className="text-sm font-medium">
                  Notas (opcional)
                </Label>
                <Textarea
                  id="session-notes"
                  placeholder="¿Algo que destacar de este entrenamiento?"
                  value={finishData.notes}
                  onChange={(e) =>
                    setFinishData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsFinishDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleFinishSession}
                disabled={!finishData.rpe || isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
