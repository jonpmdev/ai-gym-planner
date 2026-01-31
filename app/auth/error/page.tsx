import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, AlertCircle, ArrowLeft } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            AI Gym Planner
          </span>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-foreground">Error de autenticación</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ha ocurrido un problema al procesar tu solicitud
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                Esto puede deberse a un enlace expirado, una sesión inválida o un problema temporal. 
                Por favor, intenta iniciar sesión de nuevo.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent border-border hover:bg-secondary">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
