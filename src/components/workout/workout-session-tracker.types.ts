/**
 * Tipos específicos para el componente WorkoutSessionTracker
 *
 * Complementa las interfaces del dominio con tipos específicos
 * para el estado de la UI del tracker.
 */

import type { RPE, WorkoutMood } from "@/src/core/interfaces/workout-session.interface"

/**
 * Estado de un set individual en la UI
 */
export interface ExerciseSet {
  readonly setNumber: number
  readonly weight?: number
  readonly reps?: number
  readonly rpe?: RPE
  readonly isCompleted: boolean
  readonly logId?: string // ID del log guardado en la API
}

/**
 * Estado completo de un ejercicio en la sesión
 */
export interface ExerciseState {
  readonly id: string
  readonly name: string
  readonly plannedSets: number
  readonly plannedReps: string
  readonly plannedRest: string
  readonly notes?: string
  readonly completedSets: ExerciseSet[]
  readonly isExpanded: boolean
}

/**
 * Props del componente WorkoutSessionTracker
 */
export interface WorkoutSessionTrackerProps {
  /** ID de la sesión activa */
  sessionId: string

  /** Información del día de rutina que se está ejecutando */
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

  /** Callback cuando se completa la sesión */
  onSessionComplete?: () => void
}

/**
 * Estado del timer de descanso
 */
export interface RestTimerState {
  readonly isActive: boolean
  readonly timeLeft: number // segundos restantes
  readonly totalTime: number // duración total configurada
}

/**
 * Datos del formulario de finalización de sesión
 */
export interface SessionFinishFormData {
  rpe?: RPE
  mood?: WorkoutMood
  notes: string
}

/**
 * Inputs del formulario para un nuevo set
 */
export interface NewSetInputs {
  weight: string
  reps: string
  rpe?: RPE
}

/**
 * Presets de tiempo para el timer de descanso (en segundos)
 */
export const TIMER_PRESETS = [30, 60, 90, 120, 180] as const
export type TimerPreset = typeof TIMER_PRESETS[number]

/**
 * Configuración visual para las opciones de mood
 */
export interface MoodOption {
  readonly value: WorkoutMood
  readonly label: string
  readonly icon: React.ComponentType<{ className?: string }>
}
