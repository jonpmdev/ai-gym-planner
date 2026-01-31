"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { EquipmentStep, LevelStep, GoalsStep, DetailsStep } from "./form-steps"
import type { WorkoutFormData, WorkoutFormProps } from "./types"

const TOTAL_STEPS = 4

export function WorkoutForm({ onSubmit, onBack, isLoading }: WorkoutFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<WorkoutFormData>({
    equipment: [],
    level: "",
    goals: [],
    daysPerWeek: "4",
    additionalInfo: "",
  })

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipmentId]
        : prev.equipment.filter(e => e !== equipmentId)
    }))
  }

  const handleGoalChange = (goalId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      goals: checked 
        ? [...prev.goals, goalId]
        : prev.goals.filter(g => g !== goalId)
    }))
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return formData.equipment.length > 0
      case 2: return formData.level !== ""
      case 3: return formData.goals.length > 0
      case 4: return formData.daysPerWeek !== ""
      default: return true
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      onSubmit(formData)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onBack()
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <EquipmentStep
            selected={formData.equipment}
            onChange={handleEquipmentChange}
          />
        )
      case 2:
        return (
          <LevelStep
            selected={formData.level}
            onChange={(level) => setFormData(prev => ({ ...prev, level }))}
          />
        )
      case 3:
        return (
          <GoalsStep
            selected={formData.goals}
            onChange={handleGoalChange}
          />
        )
      case 4:
        return (
          <DetailsStep
            daysPerWeek={formData.daysPerWeek}
            additionalInfo={formData.additionalInfo}
            onDaysChange={(daysPerWeek) => setFormData(prev => ({ ...prev, daysPerWeek }))}
            onInfoChange={(additionalInfo) => setFormData(prev => ({ ...prev, additionalInfo }))}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-card border-border">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div 
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-border mt-8">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            className="border-border bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Volver' : 'Anterior'}
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : step === TOTAL_STEPS ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generar plan
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
