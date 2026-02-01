# Ejemplos de Uso de la API de Sesiones

Esta guía muestra cómo integrar los endpoints de sesiones en tu aplicación.

## Tabla de Contenidos

- [Cliente TypeScript](#cliente-typescript)
- [Componentes React](#componentes-react)
- [Server Actions](#server-actions)
- [Hooks Personalizados](#hooks-personalizados)

---

## Cliente TypeScript

### Servicio de Sesiones

Crea un servicio para encapsular las llamadas a la API:

```typescript
// src/services/sessions/session.service.ts

import type {
  WorkoutSession,
  WorkoutSessionWithLogs,
  ExerciseLog,
} from '@/src/core/interfaces/workout-session.interface'

export class SessionService {
  /**
   * Inicia una nueva sesión de entrenamiento
   */
  static async startSession(routineDayId: string): Promise<{
    success: boolean
    sessionId?: string
    error?: string
  }> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routineDayId }),
      })

      return await response.json()
    } catch (error) {
      console.error('Error starting session:', error)
      return {
        success: false,
        error: 'Error de red al iniciar sesión',
      }
    }
  }

  /**
   * Obtiene la sesión activa del usuario
   */
  static async getActiveSession(): Promise<{
    success: boolean
    active: boolean
    session?: WorkoutSession
    error?: string
  }> {
    try {
      const response = await fetch('/api/sessions/active')
      return await response.json()
    } catch (error) {
      console.error('Error fetching active session:', error)
      return {
        success: false,
        active: false,
        error: 'Error de red',
      }
    }
  }

  /**
   * Obtiene detalle completo de una sesión
   */
  static async getSession(sessionId: string): Promise<{
    success: boolean
    session?: WorkoutSessionWithLogs
    error?: string
  }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching session:', error)
      return {
        success: false,
        error: 'Error de red',
      }
    }
  }

  /**
   * Completa una sesión
   */
  static async completeSession(
    sessionId: string,
    data: {
      rpe?: number
      mood?: 'great' | 'good' | 'neutral' | 'tired' | 'exhausted'
      notes?: string
      actualDuration?: number
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error) {
      console.error('Error completing session:', error)
      return {
        success: false,
        error: 'Error de red',
      }
    }
  }

  /**
   * Abandona una sesión
   */
  static async abandonSession(sessionId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      return await response.json()
    } catch (error) {
      console.error('Error abandoning session:', error)
      return {
        success: false,
        error: 'Error de red',
      }
    }
  }

  /**
   * Registra un set de ejercicio
   */
  static async logExerciseSet(
    sessionId: string,
    data: {
      exerciseId: string
      setNumber: number
      weight?: number
      reps?: number
      rpe?: number
      notes?: string
    }
  ): Promise<{
    success: boolean
    logId?: string
    error?: string
  }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error) {
      console.error('Error logging set:', error)
      return {
        success: false,
        error: 'Error de red',
      }
    }
  }

  /**
   * Actualiza un log de ejercicio
   */
  static async updateExerciseLog(
    sessionId: string,
    logId: string,
    data: {
      weight?: number
      reps?: number
      rpe?: number
      notes?: string
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error) {
      console.error('Error updating log:', error)
      return {
        success: false,
        error: 'Error de red',
      }
    }
  }

  /**
   * Elimina un log de ejercicio
   */
  static async deleteExerciseLog(
    sessionId: string,
    logId: string
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/logs/${logId}`, {
        method: 'DELETE',
      })

      return await response.json()
    } catch (error) {
      console.error('Error deleting log:', error)
      return {
        success: false,
        error: 'Error de red',
      }
    }
  }

  /**
   * Lista sesiones del usuario
   */
  static async listSessions(options?: {
    status?: 'in_progress' | 'completed' | 'abandoned'
    limit?: number
    offset?: number
    fromDate?: Date
    toDate?: Date
  }): Promise<{
    success: boolean
    sessions?: WorkoutSession[]
    count?: number
    error?: string
  }> {
    try {
      const params = new URLSearchParams()

      if (options?.status) params.append('status', options.status)
      if (options?.limit) params.append('limit', options.limit.toString())
      if (options?.offset) params.append('offset', options.offset.toString())
      if (options?.fromDate) params.append('fromDate', options.fromDate.toISOString())
      if (options?.toDate) params.append('toDate', options.toDate.toISOString())

      const url = `/api/sessions${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)

      return await response.json()
    } catch (error) {
      console.error('Error listing sessions:', error)
      return {
        success: false,
        error: 'Error de red',
      }
    }
  }
}
```

---

## Componentes React

### Hook para gestionar sesión activa

```typescript
// src/hooks/useActiveSession.ts

'use client'

import { useState, useEffect } from 'react'
import { SessionService } from '@/src/services/sessions/session.service'
import type { WorkoutSession } from '@/src/core/interfaces/workout-session.interface'

export function useActiveSession() {
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)

    const result = await SessionService.getActiveSession()

    if (!result.success) {
      setError(result.error || 'Error desconocido')
      setSession(null)
    } else if (result.active && result.session) {
      setSession(result.session)
    } else {
      setSession(null)
    }

    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const startSession = async (routineDayId: string) => {
    const result = await SessionService.startSession(routineDayId)

    if (result.success) {
      await refresh()
    }

    return result
  }

  const completeSession = async (data: {
    rpe?: number
    mood?: 'great' | 'good' | 'neutral' | 'tired' | 'exhausted'
    notes?: string
    actualDuration?: number
  }) => {
    if (!session) return { success: false, error: 'No hay sesión activa' }

    const result = await SessionService.completeSession(session.id, data)

    if (result.success) {
      setSession(null)
    }

    return result
  }

  const abandonSession = async () => {
    if (!session) return { success: false, error: 'No hay sesión activa' }

    const result = await SessionService.abandonSession(session.id)

    if (result.success) {
      setSession(null)
    }

    return result
  }

  return {
    session,
    loading,
    error,
    hasActiveSession: session !== null,
    startSession,
    completeSession,
    abandonSession,
    refresh,
  }
}
```

### Componente de Inicio de Sesión

```typescript
// src/components/session/start-session-button.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useActiveSession } from '@/src/hooks/useActiveSession'
import { Loader2 } from 'lucide-react'

interface StartSessionButtonProps {
  routineDayId: string
  onSessionStarted?: (sessionId: string) => void
}

export function StartSessionButton({
  routineDayId,
  onSessionStarted,
}: StartSessionButtonProps) {
  const [isStarting, setIsStarting] = useState(false)
  const { hasActiveSession, startSession } = useActiveSession()

  const handleStart = async () => {
    setIsStarting(true)

    const result = await startSession(routineDayId)

    if (result.success && result.sessionId) {
      onSessionStarted?.(result.sessionId)
    } else {
      alert(result.error || 'Error al iniciar sesión')
    }

    setIsStarting(false)
  }

  if (hasActiveSession) {
    return (
      <Button disabled>
        Ya tienes una sesión activa
      </Button>
    )
  }

  return (
    <Button onClick={handleStart} disabled={isStarting}>
      {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isStarting ? 'Iniciando...' : 'Iniciar Entrenamiento'}
    </Button>
  )
}
```

---

## Server Actions

### Server Action para iniciar sesión

```typescript
// src/actions/session.actions.ts

'use server'

import { createSessionRepository } from '@/src/services/supabase/session-repository.factory'
import { createClient } from '@/src/services/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startWorkoutSession(routineDayId: string) {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'No autenticado',
      }
    }

    // Iniciar sesión
    const repo = await createSessionRepository()
    const result = await repo.startSession(user.id, routineDayId)

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      }
    }

    // Revalidar rutas relevantes
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/session/${result.data}`)

    return {
      success: true,
      sessionId: result.data,
    }
  } catch (error) {
    console.error('Error in startWorkoutSession:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}

export async function completeWorkoutSession(
  sessionId: string,
  data: {
    rpe?: number
    mood?: 'great' | 'good' | 'neutral' | 'tired' | 'exhausted'
    notes?: string
    actualDuration?: number
  }
) {
  try {
    const repo = await createSessionRepository()
    const result = await repo.completeSession(sessionId, data)

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/history')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error in completeWorkoutSession:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
}
```

---

## Hooks Personalizados

### Hook para tracking de sesión completa

```typescript
// src/hooks/useSessionTracker.ts

'use client'

import { useState, useEffect } from 'react'
import { SessionService } from '@/src/services/sessions/session.service'
import type {
  WorkoutSessionWithLogs,
  ExerciseLog,
} from '@/src/core/interfaces/workout-session.interface'

export function useSessionTracker(sessionId: string) {
  const [session, setSession] = useState<WorkoutSessionWithLogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)

    const result = await SessionService.getSession(sessionId)

    if (!result.success) {
      setError(result.error || 'Error desconocido')
      setSession(null)
    } else if (result.session) {
      setSession(result.session)
    }

    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [sessionId])

  const logSet = async (data: {
    exerciseId: string
    setNumber: number
    weight?: number
    reps?: number
    rpe?: number
    notes?: string
  }) => {
    const result = await SessionService.logExerciseSet(sessionId, data)

    if (result.success) {
      await refresh()
    }

    return result
  }

  const updateLog = async (
    logId: string,
    data: {
      weight?: number
      reps?: number
      rpe?: number
      notes?: string
    }
  ) => {
    const result = await SessionService.updateExerciseLog(sessionId, logId, data)

    if (result.success) {
      await refresh()
    }

    return result
  }

  const deleteLog = async (logId: string) => {
    const result = await SessionService.deleteExerciseLog(sessionId, logId)

    if (result.success) {
      await refresh()
    }

    return result
  }

  return {
    session,
    loading,
    error,
    logSet,
    updateLog,
    deleteLog,
    refresh,
  }
}
```

---

## Ejemplo de Flujo Completo

```typescript
// Componente que usa todo junto
'use client'

import { useActiveSession } from '@/src/hooks/useActiveSession'
import { useSessionTracker } from '@/src/hooks/useSessionTracker'
import { StartSessionButton } from '@/src/components/session/start-session-button'

export function WorkoutPage({ routineDayId }: { routineDayId: string }) {
  const { session: activeSession, hasActiveSession } = useActiveSession()

  if (!hasActiveSession) {
    return (
      <div>
        <h1>Iniciar Entrenamiento</h1>
        <StartSessionButton
          routineDayId={routineDayId}
          onSessionStarted={(sessionId) => {
            // Redirigir a página de tracking
            window.location.href = `/dashboard/session/${sessionId}`
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <SessionTracker sessionId={activeSession!.id} />
    </div>
  )
}

function SessionTracker({ sessionId }: { sessionId: string }) {
  const { session, logSet, updateLog, deleteLog } = useSessionTracker(sessionId)

  if (!session) return <div>Cargando...</div>

  return (
    <div>
      <h1>Sesión en Curso</h1>
      {/* Renderizar ejercicios y formularios para logging */}
    </div>
  )
}
```
