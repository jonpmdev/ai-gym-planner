"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Dumbbell, Target, Calendar } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Impulsado por Llama 3.1</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="text-foreground">Tu entrenador personal</span>
          <br />
          <span className="text-primary">con IA avanzada</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Genera planes de entrenamiento personalizados de 4 semanas, adaptados a tu equipo disponible, nivel de experiencia y objetivos específicos.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            asChild
            size="lg" 
            className="text-lg px-8 py-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            <Link href="/auth/registro">
              Comenzar gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6 rounded-full border-border hover:bg-secondary transition-all bg-transparent"
          >
            Ver demo
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Adaptado a tu equipo</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Objetivos personalizados</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">4 semanas de plan</span>
          </div>
        </div>
      </div>
    </section>
  )
}
