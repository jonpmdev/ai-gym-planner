/**
 * Test Setup Configuration
 *
 * This file contains the base configuration for tests.
 * Add any global test utilities, mocks, or setup here.
 */

import '@testing-library/jest-dom/vitest'
import { vi, afterEach } from 'vitest'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.GROQ_API_KEY = 'test-groq-api-key'

// Mock global de Supabase para evitar inicializacion real
vi.mock('@/src/services/supabase/client', () => ({
  createClient: () => null
}))

vi.mock('@/src/services/supabase/server', () => ({
  createClient: () => Promise.resolve(null)
}))

// Mock de ResizeObserver para componentes que lo usan (ej: Radix UI)
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock

// Mock de matchMedia para tests de componentes con media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Limpiar todos los mocks despues de cada test
afterEach(() => {
  vi.clearAllMocks()
})

// Export test utilities
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
}

export const mockWorkoutPlan = {
  id: 'test-plan-id',
  name: 'Test Workout Plan',
  description: 'A test workout plan',
  duration: 4,
  level: 'intermediate' as const,
  goals: ['strength'],
  equipment: ['dumbbells'],
  weeks: [],
  createdAt: new Date().toISOString(),
}
