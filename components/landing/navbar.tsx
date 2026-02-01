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

          {/* Auth Button */}
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
          >
            <Link href="/auth/login">Iniciar sesión / Registrarse</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
