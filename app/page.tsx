import Link from "next/link"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      
      {/* How it Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl sm:text-4xl font-bold mb-4 text-foreground" 
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Cómo funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              En solo 3 simples pasos tendrás tu plan personalizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crea tu cuenta",
                description: "Regístrate con tu email o con Google en segundos."
              },
              {
                step: "02",
                title: "Cuéntanos sobre ti",
                description: "Indica tu equipo disponible, nivel de experiencia y objetivos de entrenamiento."
              },
              {
                step: "03",
                title: "Recibe tu plan",
                description: "La IA genera un plan optimizado de 4 semanas con ejercicios, series y descansos."
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div 
                  className="text-6xl font-bold text-primary/20 mb-4" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-3xl sm:text-4xl font-bold mb-4 text-foreground" 
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ¿Listo para transformar tu entrenamiento?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya entrenan de manera más inteligente con AI Gym Planner.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            Empezar ahora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              2026 AI Gym Planner. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
