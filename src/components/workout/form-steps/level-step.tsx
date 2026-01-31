"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { experienceLevels } from "../form-options"

interface LevelStepProps {
  selected: string
  onChange: (value: string) => void
}

export function LevelStep({ selected, onChange }: LevelStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          ¿Cuál es tu nivel de experiencia?
        </h2>
        <p className="text-muted-foreground">
          Esto nos ayuda a ajustar la intensidad y complejidad de los ejercicios.
        </p>
      </div>
      <RadioGroup 
        value={selected} 
        onValueChange={onChange}
        className="space-y-3"
      >
        {experienceLevels.map((level) => (
          <label
            key={level.id}
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              selected === level.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary/50 hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value={level.id} className="mt-0.5" />
            <div>
              <div className="font-medium text-foreground">{level.label}</div>
              <div className="text-sm text-muted-foreground">{level.description}</div>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
