"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dumbbell } from "lucide-react"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              AI Gym Planner
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Características
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cómo funciona
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              asChild
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
            <Button 
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
            >
              <Link href="/auth/registro">Comenzar gratis</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
