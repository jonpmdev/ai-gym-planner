/**
 * Prompt Builder Service Tests
 *
 * Unit tests for the buildPrompt function.
 * Tests cover all combinations of user profile attributes.
 */

import { describe, it, expect } from 'vitest'
import { buildPrompt } from '@/src/services/ai/prompt-builder'
import type {
  UserFitnessProfile,
  Equipment,
  ExperienceLevel,
  FitnessGoal,
} from '@/src/core/entities/workout.entity'

/**
 * Fixture: Perfil de usuario basico
 */
const createProfile = (overrides?: Partial<UserFitnessProfile>): UserFitnessProfile => ({
  equipment: ['dumbbells'],
  level: 'beginner',
  goals: ['strength'],
  daysPerWeek: 3,
  ...overrides,
})

describe('buildPrompt', () => {
  describe('Estructura del prompt', () => {
    it('deberia generar un prompt no vacio', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toBeTruthy()
      expect(prompt.length).toBeGreaterThan(100)
    })

    it('deberia incluir seccion de perfil del usuario', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('PERFIL DEL USUARIO')
    })

    it('deberia incluir seccion de requisitos del plan', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('REQUISITOS DEL PLAN')
    })

    it('deberia incluir la estructura JSON esperada', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('"title"')
      expect(prompt).toContain('"description"')
      expect(prompt).toContain('"weeks"')
      expect(prompt).toContain('"exercises"')
    })

    it('deberia requerir exactamente 4 semanas', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('EXACTAMENTE 4 semanas')
    })
  })

  describe('Traduccion de equipamiento', () => {
    it('deberia traducir bodyweight a peso corporal', () => {
      const profile = createProfile({ equipment: ['bodyweight'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('peso corporal')
    })

    it('deberia traducir dumbbells a mancuernas', () => {
      const profile = createProfile({ equipment: ['dumbbells'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('mancuernas')
    })

    it('deberia traducir barbell a barra olimpica', () => {
      const profile = createProfile({ equipment: ['barbell'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('barra olímpica')
    })

    it('deberia traducir kettlebell correctamente', () => {
      const profile = createProfile({ equipment: ['kettlebell'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('kettlebells')
    })

    it('deberia traducir resistance-bands a bandas elasticas', () => {
      const profile = createProfile({ equipment: ['resistance-bands'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('bandas elásticas')
    })

    it('deberia traducir pull-up-bar a barra de dominadas', () => {
      const profile = createProfile({ equipment: ['pull-up-bar'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('barra de dominadas')
    })

    it('deberia traducir bench a banco ajustable', () => {
      const profile = createProfile({ equipment: ['bench'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('banco ajustable')
    })

    it('deberia traducir cables a poleas y cables', () => {
      const profile = createProfile({ equipment: ['cables'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('poleas y cables')
    })

    it('deberia traducir machines a maquinas de gimnasio', () => {
      const profile = createProfile({ equipment: ['machines'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('máquinas de gimnasio')
    })

    it('deberia traducir trx a TRX/suspension', () => {
      const profile = createProfile({ equipment: ['trx'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('TRX/suspensión')
    })

    it('deberia listar multiples equipos separados por comas', () => {
      const profile = createProfile({
        equipment: ['dumbbells', 'barbell', 'bench'],
      })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('mancuernas')
      expect(prompt).toContain('barra olímpica')
      expect(prompt).toContain('banco ajustable')
      expect(prompt).toMatch(/mancuernas,.*barra olímpica|barra olímpica,.*mancuernas/)
    })

    it('deberia incluir todo el equipamiento disponible', () => {
      const allEquipment: Equipment[] = [
        'bodyweight',
        'dumbbells',
        'barbell',
        'kettlebell',
        'resistance-bands',
        'pull-up-bar',
        'bench',
        'cables',
        'machines',
        'trx',
      ]
      const profile = createProfile({ equipment: allEquipment })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('peso corporal')
      expect(prompt).toContain('mancuernas')
      expect(prompt).toContain('barra olímpica')
      expect(prompt).toContain('kettlebells')
      expect(prompt).toContain('bandas elásticas')
      expect(prompt).toContain('barra de dominadas')
      expect(prompt).toContain('banco ajustable')
      expect(prompt).toContain('poleas y cables')
      expect(prompt).toContain('máquinas de gimnasio')
      expect(prompt).toContain('TRX/suspensión')
    })
  })

  describe('Traduccion de nivel de experiencia', () => {
    it('deberia traducir beginner con descripcion temporal', () => {
      const profile = createProfile({ level: 'beginner' })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('principiante')
      expect(prompt).toContain('menos de 6 meses')
    })

    it('deberia traducir intermediate con descripcion temporal', () => {
      const profile = createProfile({ level: 'intermediate' })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('intermedio')
      expect(prompt).toContain('6 meses - 2 años')
    })

    it('deberia traducir advanced con descripcion temporal', () => {
      const profile = createProfile({ level: 'advanced' })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('avanzado')
      expect(prompt).toContain('más de 2 años')
    })
  })

  describe('Traduccion de objetivos', () => {
    it('deberia traducir muscle-gain a ganar masa muscular', () => {
      const profile = createProfile({ goals: ['muscle-gain'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('ganar masa muscular')
    })

    it('deberia traducir fat-loss a perder grasa', () => {
      const profile = createProfile({ goals: ['fat-loss'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('perder grasa')
    })

    it('deberia traducir strength a aumentar fuerza', () => {
      const profile = createProfile({ goals: ['strength'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('aumentar fuerza')
    })

    it('deberia traducir endurance a mejorar resistencia', () => {
      const profile = createProfile({ goals: ['endurance'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('mejorar resistencia')
    })

    it('deberia traducir flexibility a flexibilidad y movilidad', () => {
      const profile = createProfile({ goals: ['flexibility'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('flexibilidad y movilidad')
    })

    it('deberia traducir general-fitness a fitness general', () => {
      const profile = createProfile({ goals: ['general-fitness'] })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('fitness general')
    })

    it('deberia listar multiples objetivos separados por comas', () => {
      const profile = createProfile({
        goals: ['strength', 'muscle-gain', 'fat-loss'],
      })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('aumentar fuerza')
      expect(prompt).toContain('ganar masa muscular')
      expect(prompt).toContain('perder grasa')
    })

    it('deberia incluir todos los objetivos disponibles', () => {
      const allGoals: FitnessGoal[] = [
        'muscle-gain',
        'fat-loss',
        'strength',
        'endurance',
        'flexibility',
        'general-fitness',
      ]
      const profile = createProfile({ goals: allGoals })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('ganar masa muscular')
      expect(prompt).toContain('perder grasa')
      expect(prompt).toContain('aumentar fuerza')
      expect(prompt).toContain('mejorar resistencia')
      expect(prompt).toContain('flexibilidad y movilidad')
      expect(prompt).toContain('fitness general')
    })
  })

  describe('Dias de entrenamiento por semana', () => {
    it('deberia incluir 3 dias de entrenamiento', () => {
      const profile = createProfile({ daysPerWeek: 3 })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('Días de entrenamiento por semana: 3')
      expect(prompt).toContain('EXACTAMENTE 3 días de entrenamiento')
    })

    it('deberia incluir 4 dias de entrenamiento', () => {
      const profile = createProfile({ daysPerWeek: 4 })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('Días de entrenamiento por semana: 4')
      expect(prompt).toContain('EXACTAMENTE 4 días de entrenamiento')
    })

    it('deberia incluir 5 dias de entrenamiento', () => {
      const profile = createProfile({ daysPerWeek: 5 })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('Días de entrenamiento por semana: 5')
      expect(prompt).toContain('EXACTAMENTE 5 días de entrenamiento')
    })

    it('deberia incluir 6 dias de entrenamiento', () => {
      const profile = createProfile({ daysPerWeek: 6 })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('Días de entrenamiento por semana: 6')
      expect(prompt).toContain('EXACTAMENTE 6 días de entrenamiento')
    })
  })

  describe('Informacion adicional', () => {
    it('deberia incluir additionalInfo cuando esta presente', () => {
      const profile = createProfile({
        additionalInfo: 'Tengo una lesion en la rodilla izquierda',
      })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('Información adicional')
      expect(prompt).toContain('Tengo una lesion en la rodilla izquierda')
    })

    it('deberia no incluir seccion de additionalInfo cuando esta ausente', () => {
      const profile = createProfile({ additionalInfo: undefined })

      const prompt = buildPrompt(profile)

      expect(prompt).not.toContain('Información adicional:')
    })

    it('deberia no incluir seccion cuando additionalInfo es string vacio', () => {
      const profile = createProfile({ additionalInfo: '' })

      const prompt = buildPrompt(profile)

      // Con string vacio, el template literal genera linea pero sin contenido util
      expect(prompt).not.toMatch(/Información adicional:\s*\n/)
    })
  })

  describe('Requisitos del plan en el prompt', () => {
    it('deberia especificar entre 5-8 ejercicios por dia', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('5-8 ejercicios')
    })

    it('deberia mencionar progresion gradual', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('progresión')
      expect(prompt).toContain('adaptación')
      expect(prompt).toContain('intensificación')
    })

    it('deberia requerir uso solo del equipo disponible', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('SOLO el equipo disponible')
    })

    it('deberia mencionar nombres en espanol', () => {
      const profile = createProfile()

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('español')
    })
  })

  describe('Escenarios combinados', () => {
    it('deberia generar prompt para principiante con bodyweight', () => {
      const profile = createProfile({
        equipment: ['bodyweight'],
        level: 'beginner',
        goals: ['general-fitness'],
        daysPerWeek: 3,
      })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('peso corporal')
      expect(prompt).toContain('principiante')
      expect(prompt).toContain('fitness general')
      expect(prompt).toContain('3 días')
    })

    it('deberia generar prompt para avanzado con gimnasio completo', () => {
      const profile = createProfile({
        equipment: ['barbell', 'dumbbells', 'cables', 'machines', 'bench'],
        level: 'advanced',
        goals: ['muscle-gain', 'strength'],
        daysPerWeek: 6,
        additionalInfo: 'Preparacion para competencia de powerlifting',
      })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('barra olímpica')
      expect(prompt).toContain('mancuernas')
      expect(prompt).toContain('avanzado')
      expect(prompt).toContain('ganar masa muscular')
      expect(prompt).toContain('aumentar fuerza')
      expect(prompt).toContain('6 días')
      expect(prompt).toContain('powerlifting')
    })

    it('deberia generar prompt para intermedio con equipo de casa', () => {
      const profile = createProfile({
        equipment: ['dumbbells', 'resistance-bands', 'pull-up-bar'],
        level: 'intermediate',
        goals: ['fat-loss', 'endurance'],
        daysPerWeek: 4,
      })

      const prompt = buildPrompt(profile)

      expect(prompt).toContain('mancuernas')
      expect(prompt).toContain('bandas elásticas')
      expect(prompt).toContain('barra de dominadas')
      expect(prompt).toContain('intermedio')
      expect(prompt).toContain('perder grasa')
      expect(prompt).toContain('mejorar resistencia')
      expect(prompt).toContain('4 días')
    })
  })
})
