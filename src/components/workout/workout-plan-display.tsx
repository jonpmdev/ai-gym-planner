"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Calendar, Dumbbell, Clock, RotateCcw } from "lucide-react"
import { createPlanExporter } from "@/src/services"
import type { WorkoutPlanProps } from "./types"

export function WorkoutPlanDisplay({ plan, onBack, onReset }: WorkoutPlanProps) {
  const [selectedWeek, setSelectedWeek] = useState("1")

  const handleDownload = () => {
    const exporter = createPlanExporter()
    const content = exporter.toText(plan)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plan-entrenamiento-fitai.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="mb-2 -ml-3 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 
              className="text-3xl font-bold text-foreground" 
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {plan.title}
            </h1>
            <p className="text-muted-foreground mt-1">{plan.description}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onReset} 
              className="border-border bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Nuevo plan
            </Button>
            <Button 
              onClick={handleDownload} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          </div>
        </div>

        {/* Week Tabs */}
        <Tabs value={selectedWeek} onValueChange={setSelectedWeek}>
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-6 bg-secondary">
            {plan.weeks.map(week => (
              <TabsTrigger 
                key={week.weekNumber} 
                value={week.weekNumber.toString()}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Semana {week.weekNumber}
              </TabsTrigger>
            ))}
          </TabsList>

          {plan.weeks.map(week => (
            <TabsContent key={week.weekNumber} value={week.weekNumber.toString()}>
              {/* Week Theme Card */}
              <Card className="p-4 mb-6 bg-primary/10 border-primary/30">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Enfoque de la semana:</span>
                  <span className="text-muted-foreground">{week.theme}</span>
                </div>
              </Card>

              {/* Training Days */}
              <div className="space-y-4">
                {week.days.map((day, dayIndex) => (
                  <Card key={dayIndex} className="p-6 bg-card border-border">
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{day.day}</h3>
                          <p className="text-sm text-muted-foreground">{day.focus}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-fit bg-secondary text-secondary-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {day.duration}
                      </Badge>
                    </div>

                    {/* Exercises Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground">
                            <th className="pb-2 font-medium">Ejercicio</th>
                            <th className="pb-2 font-medium text-center">Series</th>
                            <th className="pb-2 font-medium text-center">Reps</th>
                            <th className="pb-2 font-medium text-center">Descanso</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {day.exercises.map((exercise, exIndex) => (
                            <tr key={exIndex} className="text-foreground">
                              <td className="py-3">
                                <div>
                                  <span className="font-medium">{exercise.name}</span>
                                  {exercise.notes && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                      {exercise.notes}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-center">{exercise.sets}</td>
                              <td className="py-3 text-center">{exercise.reps}</td>
                              <td className="py-3 text-center text-muted-foreground">
                                {exercise.rest}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
