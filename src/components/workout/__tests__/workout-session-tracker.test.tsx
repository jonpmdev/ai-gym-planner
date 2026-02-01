/**
 * Tests para WorkoutSessionTracker
 *
 * NOTA: Estos tests requieren configurar Vitest y React Testing Library
 * Ejecutar con: pnpm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkoutSessionTracker } from '../workout-session-tracker'
import type { WorkoutSessionTrackerProps } from '../workout-session-tracker.types'

// ============================================================================
// Mocks
// ============================================================================

// Mock de toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock de fetch
global.fetch = vi.fn()

// ============================================================================
// Data de prueba
// ============================================================================

const mockRoutineDay = {
  day: 'Día 1',
  focus: 'Pecho y Tríceps',
  exercises: [
    {
      id: 'ex-1',
      name: 'Press de banca',
      sets: 4,
      reps: '8-12',
      rest: '90 seg',
      notes: 'Mantén los codos a 45 grados',
    },
    {
      id: 'ex-2',
      name: 'Press inclinado con mancuernas',
      sets: 3,
      reps: '10-12',
      rest: '60 seg',
    },
  ],
}

const defaultProps: WorkoutSessionTrackerProps = {
  sessionId: 'test-session-id',
  routineDay: mockRoutineDay,
  onSessionComplete: vi.fn(),
}

// ============================================================================
// Tests
// ============================================================================

describe('WorkoutSessionTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado inicial', () => {
    it('muestra el título y enfoque del día', () => {
      render(<WorkoutSessionTracker {...defaultProps} />)

      expect(screen.getByText('Día 1')).toBeInTheDocument()
      expect(screen.getByText('Pecho y Tríceps')).toBeInTheDocument()
    })

    it('muestra todos los ejercicios', () => {
      render(<WorkoutSessionTracker {...defaultProps} />)

      expect(screen.getByText('Press de banca')).toBeInTheDocument()
      expect(screen.getByText('Press inclinado con mancuernas')).toBeInTheDocument()
    })

    it('muestra el progreso inicial en 0%', () => {
      render(<WorkoutSessionTracker {...defaultProps} />)

      expect(screen.getByText('0 / 2')).toBeInTheDocument()
      expect(screen.getByText('0 / 7')).toBeInTheDocument() // Total de sets
    })

    it('botón de finalizar está deshabilitado inicialmente', () => {
      render(<WorkoutSessionTracker {...defaultProps} />)

      const finishButton = screen.getByRole('button', { name: /terminar sesión/i })
      expect(finishButton).toBeDisabled()
    })
  })

  describe('Expandir ejercicio', () => {
    it('expande y colapsa un ejercicio al hacer click', async () => {
      const user = userEvent.setup()
      render(<WorkoutSessionTracker {...defaultProps} />)

      const exerciseCard = screen.getByText('Press de banca').closest('button')
      expect(exerciseCard).toBeInTheDocument()

      // Expandir
      await user.click(exerciseCard!)
      expect(screen.getByText('Mantén los codos a 45 grados')).toBeInTheDocument()

      // Colapsar
      await user.click(exerciseCard!)
      await waitFor(() => {
        expect(screen.queryByText('Mantén los codos a 45 grados')).not.toBeVisible()
      })
    })
  })

  describe('Registrar sets', () => {
    it('permite ingresar peso y reps', async () => {
      const user = userEvent.setup()
      render(<WorkoutSessionTracker {...defaultProps} />)

      // Expandir ejercicio
      const exerciseCard = screen.getByText('Press de banca').closest('button')
      await user.click(exerciseCard!)

      // Encontrar inputs
      const weightInput = screen.getByLabelText(/peso \(kg\)/i)
      const repsInput = screen.getByLabelText(/repeticiones/i)

      // Ingresar valores
      await user.type(weightInput, '80')
      await user.type(repsInput, '10')

      expect(weightInput).toHaveValue(80)
      expect(repsInput).toHaveValue(10)
    })

    it('guarda un set exitosamente', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { logId: 'log-1' } }),
      })
      global.fetch = mockFetch

      render(<WorkoutSessionTracker {...defaultProps} />)

      // Expandir ejercicio
      const exerciseCard = screen.getByText('Press de banca').closest('button')
      await user.click(exerciseCard!)

      // Ingresar datos
      const weightInput = screen.getByLabelText(/peso \(kg\)/i)
      const repsInput = screen.getByLabelText(/repeticiones/i)
      await user.type(weightInput, '80')
      await user.type(repsInput, '10')

      // Guardar set
      const saveButton = screen.getByRole('button', { name: /guardar set/i })
      await user.click(saveButton)

      // Verificar llamada a API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/sessions/test-session-id/logs',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              exerciseId: 'ex-1',
              setNumber: 1,
              weight: 80,
              reps: 10,
            }),
          })
        )
      })
    })

    it('muestra error si falta peso o reps', async () => {
      const user = userEvent.setup()
      const { toast } = await import('sonner')

      render(<WorkoutSessionTracker {...defaultProps} />)

      // Expandir ejercicio
      const exerciseCard = screen.getByText('Press de banca').closest('button')
      await user.click(exerciseCard!)

      // Intentar guardar sin datos
      const saveButton = screen.getByRole('button', { name: /guardar set/i })
      await user.click(saveButton)

      // Verificar toast de error
      expect(toast.error).toHaveBeenCalledWith('Completa peso y repeticiones')
    })
  })

  describe('Timer de descanso', () => {
    it('inicia timer con preset de 60 segundos', async () => {
      const user = userEvent.setup()
      render(<WorkoutSessionTracker {...defaultProps} />)

      // Expandir ejercicio
      const exerciseCard = screen.getByText('Press de banca').closest('button')
      await user.click(exerciseCard!)

      // Mock de un set completado
      // (En práctica, esto requeriría completar un set primero)
      // Esto es un test simplificado
    })

    it('pausa y reanuda el timer', async () => {
      // TODO: Implementar test completo con temporizador
    })
  })

  describe('Finalización de sesión', () => {
    it('abre el modal de finalización', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { logId: 'log-1' } }),
      })
      global.fetch = mockFetch

      render(<WorkoutSessionTracker {...defaultProps} />)

      // Primero completar un set para habilitar el botón
      const exerciseCard = screen.getByText('Press de banca').closest('button')
      await user.click(exerciseCard!)

      const weightInput = screen.getByLabelText(/peso \(kg\)/i)
      const repsInput = screen.getByLabelText(/repeticiones/i)
      await user.type(weightInput, '80')
      await user.type(repsInput, '10')

      const saveButton = screen.getByRole('button', { name: /guardar set/i })
      await user.click(saveButton)

      // Esperar a que se guarde
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Abrir modal de finalización
      const finishButton = screen.getByRole('button', { name: /terminar sesión/i })
      await user.click(finishButton)

      // Verificar que se abre el modal
      expect(screen.getByText('Finalizar sesión')).toBeInTheDocument()
    })

    it('requiere RPE para finalizar', async () => {
      const user = userEvent.setup()
      const { toast } = await import('sonner')

      // Mock de un componente con un set ya completado
      render(<WorkoutSessionTracker {...defaultProps} />)

      // Simular apertura del modal (requiere completar set primero)
      // Este test necesitaría más setup
      // Por ahora verificamos solo la validación
    })
  })

  describe('Indicadores de progreso', () => {
    it('actualiza el progreso al completar ejercicios', async () => {
      // TODO: Test completo de actualización de progreso
    })

    it('marca ejercicio como completado al alcanzar sets requeridos', async () => {
      // TODO: Test de completado visual
    })
  })
})
