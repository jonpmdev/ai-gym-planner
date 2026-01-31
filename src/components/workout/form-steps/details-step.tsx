"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { daysPerWeekOptions } from "../form-options"

interface DetailsStepProps {
  daysPerWeek: string
  additionalInfo: string
  onDaysChange: (value: string) => void
  onInfoChange: (value: string) => void
}

export function DetailsStep({ 
  daysPerWeek, 
  additionalInfo, 
  onDaysChange, 
  onInfoChange 
}: DetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Detalles finales
        </h2>
        <p className="text-muted-foreground">
          Configura tu disponibilidad y añade información adicional.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-foreground">¿Cuántos días por semana puedes entrenar?</Label>
        <RadioGroup 
          value={daysPerWeek} 
          onValueChange={onDaysChange}
          className="flex flex-wrap gap-3"
        >
          {daysPerWeekOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                daysPerWeek === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/50 hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={option.id} />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional" className="text-foreground">
          Información adicional (opcional)
        </Label>
        <Textarea
          id="additional"
          placeholder="Lesiones, limitaciones, preferencias específicas..."
          value={additionalInfo}
          onChange={(e) => onInfoChange(e.target.value)}
          className="min-h-[100px] bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}
