/**
 * Test Setup Configuration
 * 
 * This file contains the base configuration for tests.
 * Add any global test utilities, mocks, or setup here.
 */

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

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
