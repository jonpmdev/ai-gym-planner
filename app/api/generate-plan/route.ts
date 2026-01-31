/**
 * Delivery Layer - API Route Handler
 * Clean Architecture: Thin controller that delegates to use cases
 */

import { getWorkoutGenerator } from '@/src/services'
import { 
  createGenerateWorkoutPlanUseCase,
  type GenerateWorkoutPlanInput,
  ValidationError
} from '@/src/use-cases'

export async function POST(req: Request) {
  try {
    // Parse request body
    const input: GenerateWorkoutPlanInput = await req.json()

    // Create use case with injected dependencies
    const generator = getWorkoutGenerator()
    const useCase = createGenerateWorkoutPlanUseCase(generator)

    // Execute use case
    const result = await useCase.execute(input)

    if (!result.success) {
      const statusCode = result.error instanceof ValidationError ? 400 : 500
      return Response.json(
        { error: result.error.message },
        { status: statusCode }
      )
    }

    return Response.json(result.data)
  } catch (error) {
    console.error('[API /generate-plan] Error:', error)
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
