# AI-Gym Planner: Sistema Inteligente de Planificación Deportiva

[![CI](https://github.com/jonpmdev/ai-gym-planner/actions/workflows/ci.yml/badge.svg)](https://github.com/jonpmdev/ai-gym-planner/actions/workflows/ci.yml)
[![Deploy](https://github.com/jonpmdev/ai-gym-planner/actions/workflows/deploy.yml/badge.svg)](https://github.com/jonpmdev/ai-gym-planner/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚀 **App en Producción:** [https://ai-gym-planner-theta.vercel.app/](https://ai-gym-planner-theta.vercel.app/)

📊 **Presentación del Proyecto:** [Ver Slides en Google Slides](URL_GOOGLE_SLIDES_PLACEHOLDER)

---

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
   git clone https://github.com/jonpmdev/ai-gym-planner.git
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

## Base de Datos
El proyecto usa el cliente Supabase directo con tipos generados mediante `supabase gen types typescript`. Los schemas Zod en el servicio de Groq proporcionan validación robusta de output de la IA.

El schema de base de datos se encuentra en `supabase/schema.sql`.

---

## Deployment a Producción

### Requisitos Previos
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [GitHub](https://github.com) con acceso al repositorio
- Cuenta en [Groq](https://console.groq.com) para la API de AI
- Proyecto de [Supabase](https://supabase.com) configurado

### Paso 1: Vincular con Vercel

```bash
pnpm dlx vercel link
```

Esto creará `.vercel/project.json` con los IDs necesarios:
```json
{
  "orgId": "team_xxx",      // VERCEL_ORG_ID
  "projectId": "prj_xxx"    // VERCEL_PROJECT_ID
}
```

### Paso 2: Generar Token de Vercel

1. Ir a [Vercel Dashboard > Account Settings > Tokens](https://vercel.com/account/tokens)
2. Crear token con nombre `github-actions-ai-gym-planner`
3. Copiar el token generado (solo se muestra una vez)

### Paso 3: Configurar GitHub Secrets

En **Repository Settings > Secrets and variables > Actions**, agregar:

| Secret | Descripción |
|--------|-------------|
| `VERCEL_TOKEN` | Token de API de Vercel |
| `VERCEL_ORG_ID` | ID de organización (de `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | ID del proyecto (de `.vercel/project.json`) |
| `GROQ_API_KEY` | API key de [Groq Console](https://console.groq.com/keys) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase |

### Paso 4: Variables de Entorno en Vercel

En **Vercel Dashboard > Project > Settings > Environment Variables**:

| Variable | Entornos |
|----------|----------|
| `GROQ_API_KEY` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | Production |

### Verificación

```bash
# Verificar build local
pnpm build

# Verificar lint
pnpm lint

# Ejecutar tests
pnpm test
```

Los workflows de GitHub Actions se ejecutarán automáticamente:
- **CI** (`.github/workflows/ci.yml`): En cada push y PR
- **Deploy** (`.github/workflows/deploy.yml`): Al hacer push a main
- **Preview** (`.github/workflows/preview.yml`): En cada PR
