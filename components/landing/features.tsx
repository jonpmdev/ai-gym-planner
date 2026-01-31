import { Brain, Zap, Clock, Users, BarChart3, Shield } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "IA de última generación",
    description: "Llama 3.1 analiza tu perfil para crear entrenamientos científicamente optimizados."
  },
  {
    icon: Zap,
    title: "Generación instantánea",
    description: "Obtén tu plan mensual completo en segundos, listo para empezar a entrenar."
  },
  {
    icon: Clock,
    title: "Planificación de 4 semanas",
    description: "Progresión estructurada con periodización inteligente para maximizar resultados."
  },
  {
    icon: Users,
    title: "Para todos los niveles",
    description: "Desde principiantes hasta atletas avanzados, adaptamos cada ejercicio a tu nivel."
  },
  {
    icon: BarChart3,
    title: "Progresión inteligente",
    description: "El plan evoluciona semana a semana para mantener el desafío y evitar estancamientos."
  },
  {
    icon: Shield,
    title: "Ejercicios seguros",
    description: "Indicaciones detalladas de técnica y alternativas para prevenir lesiones."
  }
]

export function Features() {
  return (
    <section className="py-24 bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            ¿Por qué elegir <span className="text-primary">AI Gym Planner</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Democratizamos el acceso a entrenamientos personalizados de calidad profesional.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
