import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Mail, ArrowLeft } from "lucide-react"

export default function VerificarPage() {
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
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Verifica tu email</CardTitle>
            <CardDescription className="text-muted-foreground">
              Te hemos enviado un enlace de confirmación a tu correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="mb-2">
                Haz clic en el enlace del email para activar tu cuenta y comenzar a generar planes de entrenamiento personalizados.
              </p>
              <p className="text-xs">
                Si no ves el email, revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>

            <Button asChild variant="outline" className="w-full bg-transparent border-border hover:bg-secondary">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a iniciar sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
