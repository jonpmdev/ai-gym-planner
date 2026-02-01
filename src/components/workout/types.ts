/**
 * UI Layer - Component Types
 */

import type { WorkoutPlan, UserFitnessProfile } from '@/src/core/entities/workout.entity'

export interface WorkoutFormData {
  equipment: string[]
  level: string
  goals: string[]
  daysPerWeek: string
  additionalInfo: string
}

export interface WorkoutFormProps {
  onSubmit: (data: WorkoutFormData) => void
  onBack: () => void
  isLoading: boolean
}

export interface WorkoutPlanProps {
  plan: WorkoutPlan
  profile: UserFitnessProfile
  onBack: () => void
  onReset: () => void
}

export type { WorkoutPlan }
