"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { goalOptions } from "../form-options"

interface GoalsStepProps {
  selected: string[]
  onChange: (goalId: string, checked: boolean) => void
}

export function GoalsStep({ selected, onChange }: GoalsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          ¿Cuáles son tus objetivos?
        </h2>
        <p className="text-muted-foreground">
          Puedes seleccionar múltiples objetivos.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goalOptions.map((goal) => (
          <label
            key={goal.id}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              selected.includes(goal.id)
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary/50 hover:border-primary/50'
            }`}
          >
            <Checkbox
              checked={selected.includes(goal.id)}
              onCheckedChange={(checked) => onChange(goal.id, checked as boolean)}
            />
            <span className="text-foreground">{goal.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
