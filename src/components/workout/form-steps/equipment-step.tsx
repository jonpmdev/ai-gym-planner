"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { equipmentOptions } from "../form-options"

interface EquipmentStepProps {
  selected: string[]
  onChange: (equipmentId: string, checked: boolean) => void
}

export function EquipmentStep({ selected, onChange }: EquipmentStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          ¿Qué equipo tienes disponible?
        </h2>
        <p className="text-muted-foreground">
          Selecciona todo el equipo con el que puedes entrenar.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {equipmentOptions.map((equipment) => (
          <label
            key={equipment.id}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              selected.includes(equipment.id)
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary/50 hover:border-primary/50'
            }`}
          >
            <Checkbox
              checked={selected.includes(equipment.id)}
              onCheckedChange={(checked) => onChange(equipment.id, checked as boolean)}
            />
            <span className="text-foreground">{equipment.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
