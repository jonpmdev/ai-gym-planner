# WorkoutSessionTracker

Componente para registrar y trackear sesiones de entrenamiento en tiempo real durante la ejecución de una rutina.

## Características

✅ **Lista de ejercicios interactiva**
- Visualización de todos los ejercicios del día
- Indicadores visuales de progreso (completado vs pendiente)
- Cards expandibles/colapsables para cada ejercicio

✅ **Registro de sets**
- Inputs para peso (kg) y repeticiones
- Selector de RPE opcional (1-10)
- Guardado automático al completar cada set
- Visualización de sets previamente completados

✅ **Timer de descanso**
- Presets rápidos: 30s, 60s, 90s, 120s, 180s
- Controles de pausa/reanudar/cancelar
- Notificación cuando finaliza el timer
- Sugerencia automática basada en el tiempo de descanso del plan

✅ **Progreso visual**
- Barra de progreso de ejercicios completados
- Contador de sets totales vs completados
- Badges y estados visuales claros

✅ **Modal de finalización**
- RPE general de la sesión (obligatorio)
- Selector de mood/estado de ánimo
- Notas opcionales
- Guardado de todos los datos al finalizar

## Uso Básico

```tsx
import { WorkoutSessionTracker } from '@/src/components/workout'

function SessionPage() {
  const handleSessionComplete = () => {
    // Redirigir o actualizar UI
    router.push('/dashboard/history')
  }

  return (
    <WorkoutSessionTracker
      sessionId="uuid-de-sesion"
      routineDay={{
        day: "Día 1",
        focus: "Pecho y Tríceps",
        exercises: [
          {
            id: "ex-1",
            name: "Press de banca",
            sets: 4,
            reps: "8-12",
            rest: "90-120 seg",
            notes: "Mantén los codos a 45 grados"
          },
          // ... más ejercicios
        ]
      }}
      onSessionComplete={handleSessionComplete}
    />
  )
}
```

## Con Skeleton Loading

```tsx
import {
  WorkoutSessionTracker,
  WorkoutSessionTrackerSkeleton
} from '@/src/components/workout'

function SessionPage({ sessionId }: { sessionId: string }) {
  const { data: session, isLoading } = useSession(sessionId)

  if (isLoading) {
    return <WorkoutSessionTrackerSkeleton />
  }

  if (!session) {
    return <ErrorMessage />
  }

  return (
    <WorkoutSessionTracker
      sessionId={session.id}
      routineDay={session.routineDay}
      onSessionComplete={() => router.push('/dashboard')}
    />
  )
}
```

## APIs Requeridas

El componente espera que existan los siguientes endpoints:

### POST `/api/sessions/[id]/logs`
Registra un set completado.

**Request Body:**
```json
{
  "exerciseId": "string",
  "setNumber": 1,
  "weight": 80,
  "reps": 10,
  "rpe": 8
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logId": "uuid-del-log"
  }
}
```

### PATCH `/api/sessions/[id]`
Finaliza la sesión.

**Request Body:**
```json
{
  "rpe": 8,
  "mood": "good",
  "notes": "Buen entrenamiento, me sentí fuerte"
}
```

**Response:**
```json
{
  "success": true
}
```

## Props

### WorkoutSessionTrackerProps

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `sessionId` | `string` | ✅ | ID único de la sesión activa |
| `routineDay` | `RoutineDay` | ✅ | Información del día de rutina |
| `onSessionComplete` | `() => void` | ❌ | Callback al completar la sesión |

### RoutineDay

```typescript
interface RoutineDay {
  day: string           // Ej: "Día 1", "Lunes"
  focus: string         // Ej: "Pecho y Tríceps"
  exercises: Array<{
    id: string          // ID único del ejercicio
    name: string        // Nombre del ejercicio
    sets: number        // Sets recomendados
    reps: string        // Reps recomendadas (puede ser rango)
    rest: string        // Tiempo de descanso
    notes?: string      // Notas técnicas opcionales
  }>
}
```

## Estados de Carga

El componente maneja los siguientes estados:

- **Guardando set**: Deshabilita el botón "Guardar set" mientras se envía la petición
- **Finalizando sesión**: Deshabilita el modal de finalización durante el guardado
- **Timer activo**: Muestra card flotante con countdown

## Feedback al Usuario

### Toast Notifications

- ✅ Set registrado correctamente
- ❌ Error al guardar el set
- ⏱️ Timer de descanso iniciado
- 🎉 Timer completado
- ✅ Sesión finalizada correctamente
- ❌ Error al finalizar sesión
- ⚠️ Validación de campos requeridos

### Indicadores Visuales

- 🟢 Ejercicio completado (check verde)
- ⚪ Ejercicio pendiente (icono gris)
- 📊 Barra de progreso global
- 🔢 Badges con contadores de sets
- ⏱️ Timer flotante cuando está activo

## Diseño Mobile-First

El componente está optimizado para uso en el gimnasio:

- **Botones grandes** (h-12, h-14) fáciles de presionar
- **Inputs numéricos** con step decimal para peso
- **Grid responsive** que se adapta a cualquier pantalla
- **Botón flotante** siempre visible para finalizar
- **Texto legible** con tamaños grandes en elementos importantes

## Accesibilidad

- ✅ Labels asociados con `htmlFor`
- ✅ ARIA roles adecuados
- ✅ Navegación por teclado
- ✅ Focus visible en todos los elementos interactivos
- ✅ Contraste WCAG 2.1 AA

## Personalización

### Modificar Presets de Timer

Edita el array `TIMER_PRESETS` en `workout-session-tracker.types.ts`:

```typescript
export const TIMER_PRESETS = [45, 90, 120, 180] as const
```

### Modificar Opciones de Mood

Edita el array `MOOD_OPTIONS` en `workout-session-tracker.tsx`:

```typescript
const MOOD_OPTIONS = [
  { value: "great", label: "Excelente", icon: Smile },
  { value: "good", label: "Bien", icon: Smile },
  // ... tus opciones
]
```

## Mejoras Futuras

- [ ] Añadir sonido/vibración al completar timer
- [ ] Permitir editar sets ya guardados
- [ ] Autocompletar peso basado en sesión anterior
- [ ] Gráficos de progreso en tiempo real
- [ ] Modo offline con sincronización posterior
- [ ] Soporte para supersets y circuitos

## Troubleshooting

### "Error al guardar el set"

- Verifica que las APIs estén implementadas
- Revisa que el `sessionId` sea válido
- Confirma que los IDs de ejercicio coincidan con la BD

### El timer no suena al finalizar

- Verifica permisos de notificaciones del navegador
- Considera implementar Web Notifications API

### Los sets no se guardan

- Revisa la consola del navegador por errores
- Verifica que los campos requeridos (peso, reps) estén completos
- Confirma que el usuario tenga permisos en la sesión

## Contribuir

Al modificar este componente:

1. Mantén la consistencia de estilos con `workout-plan-display.tsx`
2. Usa siempre la función `cn()` para clases condicionales
3. Asegura accesibilidad en todos los nuevos elementos
4. Actualiza los tipos en `workout-session-tracker.types.ts`
5. Prueba en móvil antes de hacer commit
