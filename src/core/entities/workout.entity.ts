/**
 * Core Domain Entities - Workout Plan
 * Following Domain-Driven Design principles
 */

// Value Objects
export interface Exercise {
  readonly name: string
  readonly sets: number
  readonly reps: string
  readonly rest: string
  readonly notes: string | null
}

export interface WorkoutDay {
  readonly day: string
  readonly focus: string
  readonly exercises: ReadonlyArray<Exercise>
  readonly duration: string
}

export interface Week {
  readonly weekNumber: number
  readonly theme: string
  readonly days: ReadonlyArray<WorkoutDay>
}

// Aggregate Root
export interface WorkoutPlan {
  readonly title: string
  readonly description: string
  readonly weeks: ReadonlyArray<Week>
}

// User Input Value Objects
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type Equipment = 
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'resistance-bands'
  | 'pull-up-bar'
  | 'bench'
  | 'cables'
  | 'machines'
  | 'trx'

export type FitnessGoal = 
  | 'muscle-gain'
  | 'fat-loss'
  | 'strength'
  | 'endurance'
  | 'flexibility'
  | 'general-fitness'

export type DaysPerWeek = 3 | 4 | 5 | 6

// Aggregate for User Profile
export interface UserFitnessProfile {
  readonly equipment: ReadonlyArray<Equipment>
  readonly level: ExperienceLevel
  readonly goals: ReadonlyArray<FitnessGoal>
  readonly daysPerWeek: DaysPerWeek
  readonly additionalInfo?: string
}
