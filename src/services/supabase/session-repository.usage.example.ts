/**
 * Session Repository Usage Examples
 *
 * This file demonstrates how to use the SupabaseWorkoutSessionRepository
 * in various scenarios. These are example patterns, not executable code.
 *
 * DO NOT import this file in production code.
 */

import { createSessionRepository } from './session-repository.factory'
import type { SessionCompletionData, ExerciseLogData } from '@/src/core/interfaces/workout-session.interface'

// ============================================================================
// Example 1: Start a new workout session
// ============================================================================

async function exampleStartSession(userId: string, routineDayId: string) {
  const repo = await createSessionRepository()

  const result = await repo.startSession(userId, routineDayId)

  if (!result.success) {
    console.error('Failed to start session:', result.error.message)
    return
  }

  const sessionId = result.data
  console.log('Session started:', sessionId)
  return sessionId
}

// ============================================================================
// Example 2: Log exercise sets during a session
// ============================================================================

async function exampleLogExercises(sessionId: string) {
  const repo = await createSessionRepository()

  // Log first set
  const set1Data: ExerciseLogData = {
    exerciseId: 'exercise-123',
    setNumber: 1,
    weight: 80, // kg
    reps: 10,
    rpe: 7, // RPE 1-10
    notes: 'Sintió bien, buena técnica'
  }

  const result1 = await repo.logExerciseSet(sessionId, set1Data)
  if (!result1.success) {
    console.error('Failed to log set 1:', result1.error.message)
    return
  }

  // Log second set
  const set2Data: ExerciseLogData = {
    exerciseId: 'exercise-123',
    setNumber: 2,
    weight: 80,
    reps: 9,
    rpe: 8,
  }

  const result2 = await repo.logExerciseSet(sessionId, set2Data)
  if (!result2.success) {
    console.error('Failed to log set 2:', result2.error.message)
    return
  }

  console.log('Logged 2 sets successfully')
}

// ============================================================================
// Example 3: Update an exercise log (correct a mistake)
// ============================================================================

async function exampleUpdateExerciseLog(logId: string) {
  const repo = await createSessionRepository()

  // User realizes they actually did 11 reps, not 10
  const result = await repo.updateExerciseLog(logId, {
    reps: 11,
    notes: 'Corregido: fueron 11 reps'
  })

  if (!result.success) {
    console.error('Failed to update log:', result.error.message)
    return
  }

  console.log('Log updated successfully')
}

// ============================================================================
// Example 4: Complete a session with feedback
// ============================================================================

async function exampleCompleteSession(sessionId: string) {
  const repo = await createSessionRepository()

  const completionData: SessionCompletionData = {
    rpe: 8, // Overall session RPE
    mood: 'great', // 'great' | 'good' | 'neutral' | 'tired' | 'exhausted'
    notes: 'Excelente sesión, sentí mucha energía',
    actualDuration: 65, // minutes
  }

  const result = await repo.completeSession(sessionId, completionData)

  if (!result.success) {
    console.error('Failed to complete session:', result.error.message)
    return
  }

  console.log('Session completed successfully')
}

// ============================================================================
// Example 5: Abandon a session (user had to stop early)
// ============================================================================

async function exampleAbandonSession(sessionId: string) {
  const repo = await createSessionRepository()

  const result = await repo.abandonSession(sessionId)

  if (!result.success) {
    console.error('Failed to abandon session:', result.error.message)
    return
  }

  console.log('Session abandoned')
}

// ============================================================================
// Example 6: Check for active session before starting a new one
// ============================================================================

async function exampleCheckActiveSession(userId: string, routineDayId: string) {
  const repo = await createSessionRepository()

  // Check if user already has an active session
  const activeResult = await repo.getActiveSession(userId)

  if (!activeResult.success) {
    console.error('Failed to check active session:', activeResult.error.message)
    return
  }

  if (activeResult.data) {
    console.log('User already has an active session:', activeResult.data.id)
    // Prompt user to complete or abandon the existing session
    return activeResult.data
  }

  // No active session, start a new one
  const startResult = await repo.startSession(userId, routineDayId)
  if (!startResult.success) {
    console.error('Failed to start session:', startResult.error.message)
    return
  }

  console.log('New session started:', startResult.data)
}

// ============================================================================
// Example 7: Get session with all exercise logs
// ============================================================================

async function exampleGetSessionWithLogs(sessionId: string) {
  const repo = await createSessionRepository()

  const result = await repo.getSessionWithLogs(sessionId)

  if (!result.success) {
    console.error('Failed to fetch session:', result.error.message)
    return
  }

  if (!result.data) {
    console.log('Session not found')
    return
  }

  const session = result.data
  console.log('Session:', session.id)
  console.log('Started:', session.startedAt)
  console.log('Completed:', session.completedAt)
  console.log('Total sets logged:', session.exerciseLogs.length)

  // Display each exercise log
  for (const log of session.exerciseLogs) {
    console.log(`  Set ${log.setNumber}: ${log.weight}kg x ${log.reps} reps (RPE ${log.rpe})`)
  }
}

// ============================================================================
// Example 8: Get user's recent sessions
// ============================================================================

async function exampleGetRecentSessions(userId: string) {
  const repo = await createSessionRepository()

  const result = await repo.getSessionsByUser(userId, {
    limit: 10,
    status: 'completed', // Only completed sessions
  })

  if (!result.success) {
    console.error('Failed to fetch sessions:', result.error.message)
    return
  }

  console.log(`Found ${result.data.length} completed sessions`)

  for (const session of result.data) {
    console.log(`Session ${session.id}:`, session.startedAt)
    if (session.rpe) {
      console.log(`  RPE: ${session.rpe}`)
    }
    if (session.mood) {
      console.log(`  Mood: ${session.mood}`)
    }
  }
}

// ============================================================================
// Example 9: Get session summaries for dashboard
// ============================================================================

async function exampleGetSessionSummaries(userId: string) {
  const repo = await createSessionRepository()

  const result = await repo.getSessionSummaries(userId, 5)

  if (!result.success) {
    console.error('Failed to fetch summaries:', result.error.message)
    return
  }

  console.log('Recent sessions summary:')

  for (const summary of result.data) {
    console.log(`Session ${summary.id}:`)
    console.log(`  Date: ${summary.startedAt.toLocaleDateString()}`)
    console.log(`  Exercises: ${summary.totalExercises}`)
    console.log(`  Sets: ${summary.totalSets}`)
    if (summary.averageRpe) {
      console.log(`  Avg RPE: ${summary.averageRpe.toFixed(1)}`)
    }
    if (summary.mood) {
      console.log(`  Mood: ${summary.mood}`)
    }
  }
}

// ============================================================================
// Example 10: Complete workflow (start → log → complete)
// ============================================================================

async function exampleCompleteWorkflow(userId: string, routineDayId: string) {
  const repo = await createSessionRepository()

  // 1. Start session
  const startResult = await repo.startSession(userId, routineDayId)
  if (!startResult.success) {
    console.error('Failed to start session:', startResult.error.message)
    return
  }

  const sessionId = startResult.data
  console.log('Session started:', sessionId)

  // 2. Log some exercises
  const exercises = [
    { exerciseId: 'ex1', setNumber: 1, weight: 100, reps: 8, rpe: 7 },
    { exerciseId: 'ex1', setNumber: 2, weight: 100, reps: 7, rpe: 8 },
    { exerciseId: 'ex1', setNumber: 3, weight: 100, reps: 6, rpe: 9 },
    { exerciseId: 'ex2', setNumber: 1, weight: 60, reps: 12, rpe: 6 },
    { exerciseId: 'ex2', setNumber: 2, weight: 60, reps: 10, rpe: 7 },
  ]

  for (const exerciseData of exercises) {
    const logResult = await repo.logExerciseSet(sessionId, exerciseData as ExerciseLogData)
    if (!logResult.success) {
      console.error('Failed to log exercise:', logResult.error.message)
      return
    }
  }

  console.log(`Logged ${exercises.length} sets`)

  // 3. Complete session
  const completeResult = await repo.completeSession(sessionId, {
    rpe: 8,
    mood: 'great',
    notes: 'Muy buena sesión',
    actualDuration: 60,
  })

  if (!completeResult.success) {
    console.error('Failed to complete session:', completeResult.error.message)
    return
  }

  console.log('Session completed successfully!')

  // 4. Get the complete session with logs
  const sessionResult = await repo.getSessionWithLogs(sessionId)
  if (sessionResult.success && sessionResult.data) {
    console.log('Total sets logged:', sessionResult.data.exerciseLogs.length)
  }
}

// ============================================================================
// Example 11: Filter sessions by date range
// ============================================================================

async function exampleGetSessionsByDateRange(userId: string) {
  const repo = await createSessionRepository()

  // Get sessions from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const result = await repo.getSessionsByUser(userId, {
    fromDate: thirtyDaysAgo,
    toDate: new Date(),
    status: 'completed',
    limit: 20,
  })

  if (!result.success) {
    console.error('Failed to fetch sessions:', result.error.message)
    return
  }

  console.log(`Found ${result.data.length} sessions in the last 30 days`)
}

// ============================================================================
// Example 12: Server Action integration
// ============================================================================

/**
 * Example server action for starting a session
 * This would be in app/api/sessions/start/route.ts or similar
 */
async function serverActionStartSession(formData: FormData) {
  'use server'

  const routineDayId = formData.get('routineDayId') as string

  // Get user from auth
  const { createServerClient } = await import('./server')
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Create repository and start session
  const repo = await createSessionRepository()
  const result = await repo.startSession(user.id, routineDayId)

  if (!result.success) {
    return { success: false, error: result.error.message }
  }

  return { success: true, sessionId: result.data }
}

/**
 * Example server action for logging an exercise set
 */
async function serverActionLogExerciseSet(
  sessionId: string,
  exerciseData: ExerciseLogData
) {
  'use server'

  const repo = await createSessionRepository()
  const result = await repo.logExerciseSet(sessionId, exerciseData)

  if (!result.success) {
    return { success: false, error: result.error.message }
  }

  return { success: true, logId: result.data }
}
