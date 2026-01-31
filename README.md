# AI-Gym Planner: Sistema Inteligente de Planificación Deportiva

## Descripción General
AI-Gym Planner es una plataforma SaaS diseñada para democratizar el acceso a entrenamientos personalizados de alta calidad. Utilizando IA de última generación (Llama 3.1), la aplicación genera planificaciones mensuales (4 semanas) adaptadas al material disponible del usuario, su nivel de experiencia y objetivos específicos.

## Stack Tecnológico
* **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
* **Lenguaje:** TypeScript (strict mode)
* **Base de Datos:** Supabase (PostgreSQL con RLS)
* **Autenticación:** Supabase Auth (email/password + Google OAuth)
* **IA:** Groq Cloud SDK (Modelo Llama-3.1-70b-versatile) + Vercel AI SDK
* **Estilos:** Tailwind CSS v4 + Shadcn/ui (new-york style)
* **Validación:** Zod + React Hook Form
* **Testing:** Vitest + React Testing Library
* **CI/CD:** GitHub Actions
* **Despliegue:** Vercel
* **Package Manager:** pnpm

## Integración y Despliegue Continuo (CI/CD)
Para garantizar la calidad del software y cumplir con los estándares de desarrollo profesional del TFM, el proyecto utiliza **GitHub Actions**:

1. **Integración Continua (CI):** Ante cada *push* o *pull request*, se disparan automáticamente las pruebas unitarias e integración con Vitest. Si los tests fallan, el flujo se detiene para proteger la integridad de la rama principal.
2. **Despliegue Continuo (CD):** Una vez validados los tests y el linter, el código se despliega automáticamente en **Vercel**, asegurando que la versión pública esté siempre actualizada y funcional.

## Estructura del Proyecto
Siguiendo principios de **Clean Architecture** y **SOLID** para asegurar la mantenibilidad y escalabilidad:

```text
app/                    # Capa de Entrega: Rutas, Layouts y Server Actions (Next.js)
├── api/generate-plan/  # POST endpoint para generación con IA
├── auth/               # Login, registro, verificación
└── dashboard/          # Aplicación principal protegida

src/
├── core/               # Capa de Dominio: Entidades e interfaces base
│   ├── entities/       # Modelos de dominio (WorkoutPlan, Exercise, UserFitnessProfile)
│   └── interfaces/     # Abstracciones (IWorkoutGenerator, IRepository, IPlanExporter)
│
├── services/           # Capa de Infraestructura: Implementaciones externas
│   ├── ai/             # Groq workout generator, prompt builder
│   └── supabase/       # Auth actions, clientes client/server
│
├── use-cases/          # Capa de Aplicación: Orquestación de lógica de negocio
│   ├── generate-workout-plan.use-case.ts
│   └── export-workout-plan.use-case.ts
│
└── components/workout/ # Componentes de feature (formulario multi-step, display de plan)

components/             # Biblioteca UI compartida
├── landing/            # Componentes de landing page
└── ui/                 # Primitivos Shadcn/ui
```

## Funcionalidades Principales
- **Registro de Usuarios:** Gestión de cuentas privadas y seguras mediante Supabase Auth
- **Generador Inteligente:** Motor de IA que filtra ejercicios en función del equipamiento real del usuario
- **Planificación Mensual:** Diseño de una estructura de 4 semanas con progresión lógica de volumen e intensidad
- **Persistencia en la Nube:** Historial completo de rutinas generadas almacenado en Supabase
- **Interfaz Responsive:** Visualización optimizada para su uso en dispositivos móviles durante el entrenamiento

## Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/ai-gym-planner.git
   cd ai-gym-planner
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno** (`.env.local`):
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Groq
   GROQ_API_KEY=gsk_...
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   pnpm dev
   ```

5. **Build de producción:**
   ```bash
   pnpm build
   pnpm start
   ```

## Comandos Disponibles

```bash
pnpm dev          # Servidor de desarrollo (localhost:3000)
pnpm build        # Build de producción
pnpm start        # Iniciar servidor de producción
pnpm lint         # Ejecutar ESLint
pnpm test         # Ejecutar tests con Vitest
pnpm test:ui      # Tests con interfaz visual
pnpm test:coverage # Tests con reporte de cobertura
```

## Nota sobre Base de Datos
El proyecto usa el cliente Supabase directo con tipos generados mediante `supabase gen types typescript`. Los schemas Zod en el servicio de Groq proporcionan validación robusta de output de la IA.
