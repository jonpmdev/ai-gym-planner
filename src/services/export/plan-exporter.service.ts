/**
 * Infrastructure Layer - Plan Export Service
 * Implements IPlanExporter interface
 */

import type { IPlanExporter } from '@/src/core/interfaces/workout-generator.interface'
import type { WorkoutPlan } from '@/src/core/entities/workout.entity'

export class TextPlanExporter implements IPlanExporter {
  toText(plan: WorkoutPlan): string {
    const separator = '═'.repeat(50)
    const subSeparator = '─'.repeat(50)
    
    let text = `${plan.title}\n${separator}\n\n${plan.description}\n\n`
    
    for (const week of plan.weeks) {
      text += `\n${subSeparator}\nSEMANA ${week.weekNumber}: ${week.theme}\n${subSeparator}\n\n`
      
      for (const day of week.days) {
        text += `📅 ${day.day} - ${day.focus} (${day.duration})\n`
        
        day.exercises.forEach((ex, i) => {
          text += `   ${i + 1}. ${ex.name}\n`
          text += `      → ${ex.sets} series x ${ex.reps} reps | Descanso: ${ex.rest}\n`
          if (ex.notes) {
            text += `      💡 ${ex.notes}\n`
          }
        })
        text += '\n'
      }
    }
    
    text += `\n${separator}\nGenerado por AI Gym Planner - Tu entrenador personal con IA\n${separator}`
    
    return text
  }
}

// Factory function
export function createPlanExporter(): IPlanExporter {
  return new TextPlanExporter()
}
