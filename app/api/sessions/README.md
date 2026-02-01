# API de Sesiones de Entrenamiento

Documentación de los endpoints para el sistema de tracking de sesiones de entrenamiento.

## Tabla de Contenidos

- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
  - [Gestión de Sesiones](#gestión-de-sesiones)
  - [Logs de Ejercicios](#logs-de-ejercicios)
- [Modelos de Datos](#modelos-de-datos)
- [Códigos de Error](#códigos-de-error)

---

## Autenticación

Todos los endpoints requieren autenticación mediante Supabase Auth.
El usuario debe estar autenticado y la sesión debe pertenecer al usuario actual.

---

## Endpoints

### Gestión de Sesiones

#### `POST /api/sessions`
Inicia una nueva sesión de entrenamiento.

**Request Body:**
```json
{
  "routineDayId": "uuid-del-dia-de-rutina"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "sessionId": "uuid-de-la-sesion-creada"
}
```

**Error Responses:**
- `400` - Datos inválidos
- `401` - No autenticado
- `403` - No tienes acceso a esta rutina
- `404` - Día de rutina no encontrado
- `409` - Ya tienes una sesión activa

**Reglas de Negocio:**
- Solo puede haber una sesión activa por usuario
- El día de rutina debe pertenecer a una rutina del usuario
- La sesión se crea en estado `in_progress`

---

#### `GET /api/sessions`
Lista las sesiones del usuario con filtros opcionales.

**Query Parameters:**
- `status` (opcional): `in_progress` | `completed` | `abandoned`
- `limit` (opcional): Número de resultados (default: 10, max: 100)
- `offset` (opcional): Offset para paginación (default: 0)
- `fromDate` (opcional): Fecha inicio (ISO 8601)
- `toDate` (opcional): Fecha fin (ISO 8601)

**Success Response (200):**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "routineDayId": "uuid",
      "startedAt": "2025-01-15T10:30:00Z",
      "completedAt": "2025-01-15T11:15:00Z",
      "actualDuration": 45,
      "rpe": 7,
      "mood": "good",
      "notes": "Buena sesión",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400` - Parámetros de consulta inválidos
- `401` - No autenticado

---

#### `GET /api/sessions/active`
Obtiene la sesión activa del usuario (si existe).

**Success Response (200):**

Con sesión activa:
```json
{
  "success": true,
  "active": true,
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "routineDayId": "uuid",
    "startedAt": "2025-01-15T10:30:00Z",
    "completedAt": null,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

Sin sesión activa:
```json
{
  "success": true,
  "active": false
}
```

**Error Responses:**
- `401` - No autenticado

---

#### `GET /api/sessions/{id}`
Obtiene el detalle completo de una sesión incluyendo todos sus logs.

**Success Response (200):**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "routineDayId": "uuid",
    "startedAt": "2025-01-15T10:30:00Z",
    "completedAt": "2025-01-15T11:15:00Z",
    "actualDuration": 45,
    "rpe": 7,
    "mood": "good",
    "notes": "Buena sesión",
    "createdAt": "2025-01-15T10:30:00Z",
    "exerciseLogs": [
      {
        "id": "uuid",
        "sessionId": "uuid",
        "exerciseId": "uuid",
        "setNumber": 1,
        "weight": 50,
        "reps": 10,
        "rpe": 7,
        "notes": "Buen peso",
        "createdAt": "2025-01-15T10:35:00Z"
      }
    ]
  }
}
```

**Error Responses:**
- `400` - ID de sesión inválido
- `401` - No autenticado
- `403` - No tienes acceso a esta sesión
- `404` - Sesión no encontrada

---

#### `PATCH /api/sessions/{id}`
Completa una sesión con datos opcionales de finalización.

**Request Body:**
```json
{
  "rpe": 7,
  "mood": "good",
  "notes": "Excelente entrenamiento",
  "actualDuration": 45
}
```

Todos los campos son opcionales.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sesión completada exitosamente"
}
```

**Error Responses:**
- `400` - ID inválido o datos inválidos
- `401` - No autenticado
- `403` - No tienes acceso a esta sesión
- `404` - Sesión no encontrada
- `409` - La sesión ya está completada

**Validaciones:**
- `rpe`: Entero entre 1 y 10
- `mood`: `'great'` | `'good'` | `'neutral'` | `'tired'` | `'exhausted'`
- `notes`: Máximo 500 caracteres
- `actualDuration`: Entero positivo, máximo 300 minutos

---

#### `DELETE /api/sessions/{id}`
Abandona una sesión en curso.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sesión abandonada exitosamente"
}
```

**Error Responses:**
- `400` - ID de sesión inválido
- `401` - No autenticado
- `403` - No tienes acceso a esta sesión
- `404` - Sesión no encontrada
- `409` - La sesión ya está completada

**Notas:**
- Marca la sesión como completada con una nota especial `[Sesión abandonada]`
- No se puede abandonar una sesión ya completada

---

### Logs de Ejercicios

#### `POST /api/sessions/{id}/logs`
Registra un set de ejercicio durante una sesión activa.

**Request Body:**
```json
{
  "exerciseId": "uuid",
  "setNumber": 1,
  "weight": 50,
  "reps": 10,
  "rpe": 7,
  "notes": "Buen set"
}
```

**Campos requeridos:**
- `exerciseId`: UUID del ejercicio
- `setNumber`: Número de serie (entero positivo)

**Campos opcionales:**
- `weight`: Peso usado en kg (≥ 0, máx 1000)
- `reps`: Repeticiones completadas (entero positivo, máx 1000)
- `rpe`: Rate of Perceived Exertion (1-10)
- `notes`: Notas del set (máx 200 caracteres)

**Success Response (201):**
```json
{
  "success": true,
  "logId": "uuid-del-log-creado"
}
```

**Error Responses:**
- `400` - ID inválido o datos inválidos
- `401` - No autenticado
- `403` - No tienes acceso a esta sesión
- `404` - Sesión no encontrada
- `409` - No se pueden agregar logs a una sesión completada

---

#### `GET /api/sessions/{id}/logs`
Obtiene todos los logs de ejercicios de una sesión.

**Success Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "exerciseId": "uuid",
      "setNumber": 1,
      "weight": 50,
      "reps": 10,
      "rpe": 7,
      "notes": "Buen set",
      "createdAt": "2025-01-15T10:35:00Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400` - ID de sesión inválido
- `401` - No autenticado
- `403` - No tienes acceso a esta sesión
- `404` - Sesión no encontrada

---

#### `PATCH /api/sessions/{id}/logs/{logId}`
Actualiza un log de ejercicio existente.

**Request Body:**
```json
{
  "weight": 52.5,
  "reps": 12,
  "rpe": 8,
  "notes": "Incrementé el peso"
}
```

Todos los campos son opcionales, pero debe incluir al menos uno.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Log actualizado exitosamente"
}
```

**Error Responses:**
- `400` - ID inválido, datos inválidos, o sin campos para actualizar
- `401` - No autenticado
- `403` - No tienes acceso a esta sesión
- `404` - Sesión o log no encontrado

---

#### `DELETE /api/sessions/{id}/logs/{logId}`
Elimina un log de ejercicio (para correcciones).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Log eliminado exitosamente"
}
```

**Error Responses:**
- `400` - ID inválido
- `401` - No autenticado
- `403` - No tienes acceso a esta sesión
- `404` - Sesión o log no encontrado

---

## Modelos de Datos

### WorkoutSession
```typescript
{
  id: string              // UUID
  userId: string          // UUID del usuario
  routineDayId: string    // UUID del día de rutina
  startedAt: Date         // Timestamp de inicio
  completedAt?: Date      // Timestamp de finalización (null si activa)
  actualDuration?: number // Duración en minutos
  rpe?: number            // 1-10 escala de esfuerzo percibido
  mood?: WorkoutMood      // Estado de ánimo
  notes?: string          // Notas de la sesión
  createdAt: Date         // Timestamp de creación
}
```

### ExerciseLog
```typescript
{
  id: string            // UUID
  sessionId: string     // UUID de la sesión
  exerciseId: string    // UUID del ejercicio
  setNumber: number     // Número de serie
  weight?: number       // Peso en kg
  reps?: number         // Repeticiones completadas
  rpe?: number          // 1-10 escala de esfuerzo
  notes?: string        // Notas del set
  createdAt: Date       // Timestamp de creación
}
```

### Enums

**WorkoutMood:**
- `'great'` - Excelente
- `'good'` - Bien
- `'neutral'` - Neutral
- `'tired'` - Cansado
- `'exhausted'` - Agotado

**SessionStatus:**
- `'in_progress'` - En curso (completed_at = null)
- `'completed'` - Completada (completed_at != null, sin nota de abandono)
- `'abandoned'` - Abandonada (completed_at != null, con nota `[Sesión abandonada]`)

**RPE (Rate of Perceived Exertion):**
- `1-2`: Muy ligero
- `3-4`: Ligero
- `5-6`: Moderado
- `7-8`: Difícil
- `9-10`: Esfuerzo máximo

---

## Códigos de Error

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 400 | Bad Request | Datos inválidos o parámetros incorrectos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No tienes acceso al recurso |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto de estado (ej: sesión ya activa) |
| 500 | Internal Server Error | Error del servidor |

---

## Ejemplos de Uso

### Flujo completo de una sesión

```typescript
// 1. Verificar si hay sesión activa
const activeRes = await fetch('/api/sessions/active')
const { active, session } = await activeRes.json()

if (active) {
  console.log('Ya hay una sesión activa:', session.id)
} else {
  // 2. Iniciar nueva sesión
  const startRes = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routineDayId: 'uuid-del-dia' })
  })
  const { sessionId } = await startRes.json()

  // 3. Registrar sets de ejercicios
  await fetch(`/api/sessions/${sessionId}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      exerciseId: 'uuid-ejercicio',
      setNumber: 1,
      weight: 50,
      reps: 10,
      rpe: 7
    })
  })

  // 4. Completar sesión
  await fetch(`/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rpe: 7,
      mood: 'good',
      notes: 'Excelente entrenamiento',
      actualDuration: 45
    })
  })
}
```

---

## Notas de Implementación

1. **Autenticación:** Todos los endpoints verifican que el usuario esté autenticado y que tenga acceso a los recursos solicitados.

2. **Validación:** Se usa Zod para validar todos los inputs en los schemas definidos en `/src/core/schemas/session.schemas.ts`.

3. **Patrón Repository:** Todos los endpoints usan el patrón Repository (`IWorkoutSessionRepository`) para abstraer la lógica de persistencia.

4. **Manejo de Errores:** Se usa el patrón `Result<T, E>` internamente y se retornan respuestas consistentes con `{ success: boolean, ... }`.

5. **RLS (Row Level Security):** Las políticas de RLS en Supabase garantizan que los usuarios solo puedan acceder a sus propios datos.

6. **Transaccionalidad:** Las operaciones críticas (como logging de sets) se realizan de forma atómica.
