/**
 * UI Layer - Form Options Constants
 * Extracted for maintainability and potential i18n
 */

export const equipmentOptions = [
  { id: "bodyweight", label: "Solo peso corporal" },
  { id: "dumbbells", label: "Mancuernas" },
  { id: "barbell", label: "Barra olímpica" },
  { id: "kettlebell", label: "Kettlebells" },
  { id: "resistance-bands", label: "Bandas elásticas" },
  { id: "pull-up-bar", label: "Barra de dominadas" },
  { id: "bench", label: "Banco ajustable" },
  { id: "cables", label: "Poleas / Cables" },
  { id: "machines", label: "Máquinas de gimnasio" },
  { id: "trx", label: "TRX / Suspensión" },
] as const

export const experienceLevels = [
  { id: "beginner", label: "Principiante", description: "Menos de 6 meses entrenando" },
  { id: "intermediate", label: "Intermedio", description: "6 meses - 2 años entrenando" },
  { id: "advanced", label: "Avanzado", description: "Más de 2 años entrenando" },
] as const

export const goalOptions = [
  { id: "muscle-gain", label: "Ganar masa muscular" },
  { id: "fat-loss", label: "Perder grasa" },
  { id: "strength", label: "Aumentar fuerza" },
  { id: "endurance", label: "Mejorar resistencia" },
  { id: "flexibility", label: "Flexibilidad y movilidad" },
  { id: "general-fitness", label: "Fitness general" },
] as const

export const daysPerWeekOptions = [
  { id: "3", label: "3 días" },
  { id: "4", label: "4 días" },
  { id: "5", label: "5 días" },
  { id: "6", label: "6 días" },
] as const
