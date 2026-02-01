/**
 * Profile Validator Service Tests
 *
 * Unit tests for the ProfileValidator service.
 * Tests cover all validation rules for UserFitnessProfile.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  ProfileValidator,
  ValidationError,
  createProfileValidator,
} from '@/src/services/validation/profile-validator.service'
import type { UserFitnessProfile, Equipment, ExperienceLevel, FitnessGoal, DaysPerWeek } from '@/src/core/entities/workout.entity'

/**
 * Fixture: Perfil de usuario valido
 */
const createValidProfile = (overrides?: Partial<UserFitnessProfile>): UserFitnessProfile => ({
  equipment: ['dumbbells', 'barbell'],
  level: 'intermediate',
  goals: ['strength', 'muscle-gain'],
  daysPerWeek: 4,
  ...overrides,
})

describe('ProfileValidator', () => {
  let validator: ProfileValidator

  beforeEach(() => {
    validator = createProfileValidator() as ProfileValidator
  })

  describe('validate() - Perfil valido', () => {
    it('deberia validar un perfil completo correctamente', () => {
      const profile = createValidProfile()

      const result = validator.validate(profile)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(profile)
      }
    })

    it('deberia validar perfil con solo equipo bodyweight', () => {
      const profile = createValidProfile({ equipment: ['bodyweight'] })

      const result = validator.validate(profile)

      expect(result.success).toBe(true)
    })

    it('deberia validar perfil con todo el equipamiento disponible', () => {
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
      const profile = createValidProfile({ equipment: allEquipment })

      const result = validator.validate(profile)

      expect(result.success).toBe(true)
    })

    it('deberia validar todos los niveles de experiencia validos', () => {
      const levels: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced']

      for (const level of levels) {
        const profile = createValidProfile({ level })
        const result = validator.validate(profile)
        expect(result.success).toBe(true)
      }
    })

    it('deberia validar todos los objetivos validos', () => {
      const goals: FitnessGoal[] = [
        'muscle-gain',
        'fat-loss',
        'strength',
        'endurance',
        'flexibility',
        'general-fitness',
      ]

      for (const goal of goals) {
        const profile = createValidProfile({ goals: [goal] })
        const result = validator.validate(profile)
        expect(result.success).toBe(true)
      }
    })

    it('deberia validar todos los dias por semana validos', () => {
      const validDays: DaysPerWeek[] = [3, 4, 5, 6]

      for (const daysPerWeek of validDays) {
        const profile = createValidProfile({ daysPerWeek })
        const result = validator.validate(profile)
        expect(result.success).toBe(true)
      }
    })

    it('deberia validar perfil con additionalInfo opcional', () => {
      const profile = createValidProfile({
        additionalInfo: 'Tengo una lesion en la rodilla izquierda',
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(true)
    })
  })

  describe('validate() - Validacion de equipment', () => {
    it('deberia rechazar perfil sin equipamiento', () => {
      const profile = createValidProfile({ equipment: [] })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError)
        expect((result.error as ValidationError).field).toBe('equipment')
        expect(result.error.message).toContain('al menos un equipo')
      }
    })

    it('deberia rechazar equipamiento invalido', () => {
      const profile = createValidProfile({
        equipment: ['invalid-equipment' as Equipment],
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError)
        expect((result.error as ValidationError).field).toBe('equipment')
        expect(result.error.message).toContain('invalid-equipment')
      }
    })

    it('deberia rechazar si alguno de los equipamientos es invalido', () => {
      const profile = createValidProfile({
        equipment: ['dumbbells', 'wrong-equipment' as Equipment, 'barbell'],
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('wrong-equipment')
      }
    })
  })

  describe('validate() - Validacion de level', () => {
    it('deberia rechazar nivel de experiencia invalido', () => {
      const profile = createValidProfile({
        level: 'expert' as ExperienceLevel,
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError)
        expect((result.error as ValidationError).field).toBe('level')
        expect(result.error.message).toContain('Nivel de experiencia no válido')
      }
    })

    it('deberia rechazar nivel vacio', () => {
      const profile = createValidProfile({
        level: '' as ExperienceLevel,
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect((result.error as ValidationError).field).toBe('level')
      }
    })
  })

  describe('validate() - Validacion de goals', () => {
    it('deberia rechazar perfil sin objetivos', () => {
      const profile = createValidProfile({ goals: [] })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError)
        expect((result.error as ValidationError).field).toBe('goals')
        expect(result.error.message).toContain('al menos un objetivo')
      }
    })

    it('deberia rechazar objetivo invalido', () => {
      const profile = createValidProfile({
        goals: ['become-superhero' as FitnessGoal],
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError)
        expect((result.error as ValidationError).field).toBe('goals')
        expect(result.error.message).toContain('become-superhero')
      }
    })

    it('deberia rechazar si alguno de los objetivos es invalido', () => {
      const profile = createValidProfile({
        goals: ['strength', 'invalid-goal' as FitnessGoal, 'fat-loss'],
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('invalid-goal')
      }
    })

    it('deberia aceptar multiples objetivos validos', () => {
      const profile = createValidProfile({
        goals: ['muscle-gain', 'strength', 'endurance', 'flexibility'],
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(true)
    })
  })

  describe('validate() - Validacion de daysPerWeek', () => {
    it('deberia rechazar dias por semana menor a 3', () => {
      const profile = createValidProfile({
        daysPerWeek: 2 as DaysPerWeek,
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError)
        expect((result.error as ValidationError).field).toBe('daysPerWeek')
        expect(result.error.message).toContain('Días por semana no válido')
      }
    })

    it('deberia rechazar dias por semana mayor a 6', () => {
      const profile = createValidProfile({
        daysPerWeek: 7 as DaysPerWeek,
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect((result.error as ValidationError).field).toBe('daysPerWeek')
      }
    })

    it('deberia rechazar dias por semana igual a 0', () => {
      const profile = createValidProfile({
        daysPerWeek: 0 as DaysPerWeek,
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
    })

    it('deberia rechazar dias por semana igual a 1', () => {
      const profile = createValidProfile({
        daysPerWeek: 1 as DaysPerWeek,
      })

      const result = validator.validate(profile)

      expect(result.success).toBe(false)
    })
  })

  describe('ValidationError', () => {
    it('deberia tener el nombre correcto', () => {
      const error = new ValidationError('equipment', 'Mensaje de error')

      expect(error.name).toBe('ValidationError')
    })

    it('deberia almacenar el campo como propiedad', () => {
      const error = new ValidationError('level', 'Nivel invalido')

      expect(error.field).toBe('level')
    })

    it('deberia heredar de Error', () => {
      const error = new ValidationError('goals', 'Objetivos invalidos')

      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('Factory function', () => {
    it('deberia crear una instancia de ProfileValidator', () => {
      const instance = createProfileValidator()

      expect(instance).toBeInstanceOf(ProfileValidator)
    })

    it('deberia crear instancias independientes', () => {
      const instance1 = createProfileValidator()
      const instance2 = createProfileValidator()

      expect(instance1).not.toBe(instance2)
    })
  })
})
