/**
 * Prompt Builder - Constructs AI prompts from user profiles
 * Single Responsibility Principle (SOLID - S)
 */

import type { 
  UserFitnessProfile,
  Equipment,
  ExperienceLevel,
  FitnessGoal 
} from '@/src/core/entities/workout.entity'

// Translation maps for Spanish output
const equipmentLabels: Record<Equipment, string> = {
  "bodyweight": "peso corporal",
  "dumbbells": "mancuernas",
  "barbell": "barra olímpica",
  "kettlebell": "kettlebells",
  "resistance-bands": "bandas elásticas",
  "pull-up-bar": "barra de dominadas",
  "bench": "banco ajustable",
  "cables": "poleas y cables",
  "machines": "máquinas de gimnasio",
  "trx": "TRX/suspensión"
}

const levelLabels: Record<ExperienceLevel, string> = {
  "beginner": "principiante (menos de 6 meses)",
  "intermediate": "intermedio (6 meses - 2 años)",
  "advanced": "avanzado (más de 2 años)"
}

const goalLabels: Record<FitnessGoal, string> = {
  "muscle-gain": "ganar masa muscular",
  "fat-loss": "perder grasa",
  "strength": "aumentar fuerza",
  "endurance": "mejorar resistencia",
  "flexibility": "flexibilidad y movilidad",
  "general-fitness": "fitness general"
}

export function buildPrompt(profile: UserFitnessProfile): string {
  const equipmentList = profile.equipment
    .map(e => equipmentLabels[e])
    .join(", ")
  
  const levelText = levelLabels[profile.level]
  
  const goalsList = profile.goals
    .map(g => goalLabels[g])
    .join(", ")

  return `Eres un entrenador personal profesional y certificado con años de experiencia. Genera un plan de entrenamiento completo de 4 semanas con las siguientes características:

PERFIL DEL USUARIO:
- Equipo disponible: ${equipmentList}
- Nivel de experiencia: ${levelText}
- Objetivos: ${goalsList}
- Días de entrenamiento por semana: ${profile.daysPerWeek}
${profile.additionalInfo ? `- Información adicional: ${profile.additionalInfo}` : ''}

REQUISITOS DEL PLAN:
1. Debe ser de EXACTAMENTE 4 semanas
2. Cada semana debe tener EXACTAMENTE ${profile.daysPerWeek} días de entrenamiento
3. Cada día debe tener entre 5-8 ejercicios
4. Los ejercicios deben usar SOLO el equipo disponible mencionado
5. La progresión debe ser gradual: semana 1 (adaptación), semana 2-3 (desarrollo), semana 4 (intensificación)
6. Incluye notas técnicas breves para ejercicios complejos
7. Los tiempos de descanso deben ser apropiados para los objetivos
8. Los nombres de los días deben ser en español (Lunes, Martes, etc. o Día 1, Día 2, etc.)
9. El título y descripción deben ser motivadores y en español

IMPORTANTE: Genera un plan realista, científicamente fundamentado y seguro.`
}
