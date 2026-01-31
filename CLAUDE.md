# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Gym Planner is a SaaS web application that generates personalized 4-week workout plans using AI. Users input their available equipment, experience level, fitness goals, and training frequency, and the app generates a complete training program using Llama 3.1 70B via Groq.

**Language Note:** User-facing text and generated workout plans are in Spanish.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Language:** TypeScript (strict mode)
- **Database & Auth:** Supabase (PostgreSQL with RLS, Auth with email/password + Google OAuth)
- **AI:** Groq Cloud SDK (Llama 3.1 70B) + Vercel AI SDK for structured output
- **UI:** Tailwind CSS v4 + Shadcn/ui (new-york style)
- **Forms:** React Hook Form + Zod validation
- **Package Manager:** pnpm

## Commands

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

Testing is configured with Vitest but scripts are not yet added to package.json.

## Architecture (Clean Architecture)

```
app/                    # Delivery Layer - Next.js routes, layouts, API routes
├── api/generate-plan/  # POST endpoint for AI plan generation
├── auth/               # Login, registration, verification pages
└── dashboard/          # Protected main application

src/
├── core/               # Domain Layer - Pure business logic, no dependencies
│   ├── entities/       # Domain models (WorkoutPlan, Exercise, UserFitnessProfile)
│   └── interfaces/     # Abstractions (IWorkoutGenerator, IRepository, IPlanExporter)
│
├── services/           # Infrastructure Layer - External implementations
│   ├── ai/             # Groq workout generator, prompt builder
│   └── supabase/       # Auth actions, client/server clients, middleware
│
├── use-cases/          # Application Layer - Business orchestration
│   ├── generate-workout-plan.use-case.ts
│   └── export-workout-plan.use-case.ts
│
└── components/workout/ # Feature components (multi-step form, plan display)

components/             # Shared UI library
├── landing/            # Landing page components
└── ui/                 # Shadcn/ui primitives
```

**Key Patterns:**
- Dependency injection via factories
- Result<T, E> pattern for error handling
- Zod schemas for AI output validation
- Server actions for auth operations

## Domain Model

Core entities in `src/core/entities/workout.entity.ts`:
- `WorkoutPlan`: title, description, weeks[]
- `Week`: weekNumber, theme, days[]
- `WorkoutDay`: day, focus, exercises[], duration
- `Exercise`: name, sets, reps, rest, notes
- `UserFitnessProfile`: equipment[], level, goals[], daysPerWeek

Equipment types: bodyweight, dumbbells, barbell, kettlebell, resistance-bands, pull-up-bar, bench, cables, machines, trx

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The app gracefully handles missing Supabase config (returns null from `createClient()`).

## Database Schema

Tables with RLS policies (users can only access their own data):
- `profiles` - User fitness profiles (extends auth.users)
- `routines` - Workout plans (header)
- `routine_days` - Days within routines
- `exercises` - Individual exercises

Schema initialization: `bd_sql_inid.sql`

## Key Implementation Details

1. **Multi-step Form:** 4 steps (equipment → level → goals → details) in `src/components/workout/workout-form.tsx`

2. **AI Generation Flow:**
   - Form submission → POST `/api/generate-plan`
   - API route calls `GenerateWorkoutPlanUseCase`
   - Use case validates profile via `ProfileValidator`
   - `GroqWorkoutGenerator` builds prompt and calls Llama 3.1 70B
   - Response validated against Zod schema

3. **Auth Middleware:** `middleware.ts` handles session refresh on all routes

4. **Supabase Clients:**
   - `src/services/supabase/client.ts` - Browser client
   - `src/services/supabase/server.ts` - Server client (async, uses cookies)
