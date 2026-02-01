-- ============================================================================
-- AI-GYM PLANNER - ESQUEMA COMPLETO DE BASE DE DATOS
-- ============================================================================
--
-- Este archivo contiene el esquema completo para inicializar la base de datos
-- del proyecto AI-Gym Planner en Supabase.
--
-- INSTRUCCIONES DE USO:
-- 1. Crear un nuevo proyecto en Supabase
-- 2. Ir a SQL Editor
-- 3. Copiar y ejecutar este archivo completo
-- 4. Verificar que no hay errores en la ejecución
--
-- El script es IDEMPOTENTE: puede ejecutarse múltiples veces sin errores
-- usando CREATE TABLE IF NOT EXISTS y DROP POLICY IF EXISTS.
--
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: TABLAS
-- ============================================================================
-- Orden por dependencias de Foreign Keys

-- 1.1 PROFILES - Extensión de auth.users con datos de fitness
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    fitness_level TEXT,
    equipment JSONB DEFAULT '[]'::jsonb,
    goals JSONB DEFAULT '[]'::jsonb,
    days_per_week INTEGER DEFAULT 3,
    additional_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 ROUTINES - Planes de entrenamiento (cabecera)
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    profile_snapshot JSONB,
    status TEXT DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT routines_status_check CHECK (status IN ('active', 'completed', 'archived'))
);

-- 1.3 ROUTINE_WEEKS - Semanas dentro de una rutina
CREATE TABLE IF NOT EXISTS public.routine_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    theme TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(routine_id, week_number)
);

-- 1.4 ROUTINE_DAYS - Días dentro de una semana/rutina
CREATE TABLE IF NOT EXISTS public.routine_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    week_id UUID REFERENCES public.routine_weeks(id) ON DELETE CASCADE,
    day_number INTEGER,
    day_name TEXT,
    day_label TEXT NOT NULL,
    focus TEXT,
    estimated_duration INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- 1.5 EXERCISES - Ejercicios individuales
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID REFERENCES public.routine_days(id) ON DELETE CASCADE,
    routine_day_id UUID REFERENCES public.routine_days(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sets INTEGER,
    reps TEXT,
    rpe_target INTEGER,
    rest_time TEXT,
    rest_seconds INTEGER,
    notes TEXT,
    order_index INTEGER DEFAULT 0
);

-- 1.6 WORKOUT_SESSIONS - Sesiones de entrenamiento realizadas
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_day_id UUID NOT NULL REFERENCES public.routine_days(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    actual_duration INTEGER,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'tired', 'exhausted')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 EXERCISE_LOGS - Registro de sets/reps por ejercicio en cada sesión
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight_kg DECIMAL(5,2),
    reps_completed INTEGER,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 EXERCISE_LIBRARY - Biblioteca de ejercicios (referencia)
CREATE TABLE IF NOT EXISTS public.exercise_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    name_normalized TEXT NOT NULL,
    muscle_groups JSONB DEFAULT '[]'::jsonb,
    equipment_required JSONB DEFAULT '[]'::jsonb,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECCIÓN 2: ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_routine_weeks_routine ON public.routine_weeks(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_days_week ON public.routine_days(week_id);
CREATE INDEX IF NOT EXISTS idx_routine_days_routine ON public.routine_days(routine_id);
CREATE INDEX IF NOT EXISTS idx_exercises_day ON public.exercises(day_id);
CREATE INDEX IF NOT EXISTS idx_exercises_routine_day ON public.exercises(routine_day_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_day ON public.workout_sessions(routine_day_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session ON public.exercise_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_routines_user_status ON public.routines(user_id, status);
CREATE INDEX IF NOT EXISTS idx_exercise_library_name ON public.exercise_library(name_normalized);

-- ============================================================================
-- SECCIÓN 3: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECCIÓN 3.1: POLÍTICAS PARA PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================================
-- SECCIÓN 3.2: POLÍTICAS PARA ROUTINES
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own routines" ON public.routines;
CREATE POLICY "Users can manage their own routines"
    ON public.routines
    USING (auth.uid() = user_id);

-- ============================================================================
-- SECCIÓN 3.3: POLÍTICAS PARA ROUTINE_WEEKS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view weeks of their routines" ON public.routine_weeks;
CREATE POLICY "Users can view weeks of their routines"
    ON public.routine_weeks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.routines r
        WHERE r.id = routine_id AND r.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert weeks to their routines" ON public.routine_weeks;
CREATE POLICY "Users can insert weeks to their routines"
    ON public.routine_weeks FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.routines r
        WHERE r.id = routine_id AND r.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update weeks of their routines" ON public.routine_weeks;
CREATE POLICY "Users can update weeks of their routines"
    ON public.routine_weeks FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.routines r
        WHERE r.id = routine_id AND r.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete weeks of their routines" ON public.routine_weeks;
CREATE POLICY "Users can delete weeks of their routines"
    ON public.routine_weeks FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.routines r
        WHERE r.id = routine_id AND r.user_id = auth.uid()
    ));

-- ============================================================================
-- SECCIÓN 3.4: POLÍTICAS PARA ROUTINE_DAYS
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage days of their routines" ON public.routine_days;
CREATE POLICY "Users can manage days of their routines"
    ON public.routine_days
    USING (EXISTS (
        SELECT 1 FROM public.routines r
        WHERE r.id = routine_id AND r.user_id = auth.uid()
    ));

-- ============================================================================
-- SECCIÓN 3.5: POLÍTICAS PARA EXERCISES
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage exercises of their routines" ON public.exercises;
CREATE POLICY "Users can manage exercises of their routines"
    ON public.exercises
    USING (EXISTS (
        SELECT 1 FROM public.routine_days d
        JOIN public.routines r ON d.routine_id = r.id
        WHERE (d.id = day_id OR d.id = routine_day_id) AND r.user_id = auth.uid()
    ));

-- ============================================================================
-- SECCIÓN 3.6: POLÍTICAS PARA WORKOUT_SESSIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can view their own sessions"
    ON public.workout_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can insert their own sessions"
    ON public.workout_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can update their own sessions"
    ON public.workout_sessions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can delete their own sessions"
    ON public.workout_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- SECCIÓN 3.7: POLÍTICAS PARA EXERCISE_LOGS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view logs of their sessions" ON public.exercise_logs;
CREATE POLICY "Users can view logs of their sessions"
    ON public.exercise_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = session_id AND ws.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert logs to their sessions" ON public.exercise_logs;
CREATE POLICY "Users can insert logs to their sessions"
    ON public.exercise_logs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = session_id AND ws.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update logs of their sessions" ON public.exercise_logs;
CREATE POLICY "Users can update logs of their sessions"
    ON public.exercise_logs FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = session_id AND ws.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete logs of their sessions" ON public.exercise_logs;
CREATE POLICY "Users can delete logs of their sessions"
    ON public.exercise_logs FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = session_id AND ws.user_id = auth.uid()
    ));

-- ============================================================================
-- SECCIÓN 3.8: POLÍTICAS PARA EXERCISE_LIBRARY (lectura pública)
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view exercise library" ON public.exercise_library;
CREATE POLICY "Anyone can view exercise library"
    ON public.exercise_library FOR SELECT
    USING (true);

-- No hay políticas INSERT/UPDATE/DELETE - solo administradores pueden modificar

-- ============================================================================
-- SECCIÓN 4: FUNCIONES Y TRIGGERS
-- ============================================================================

-- 4.1 Función para auto-crear perfil cuando un usuario se registra
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- 4.2 Trigger que se ejecuta después de insertar en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SECCIÓN 5: FUNCIONES RPC
-- ============================================================================

-- 5.1 SAVE_WORKOUT_PLAN - Guardar un plan de entrenamiento completo
DROP FUNCTION IF EXISTS public.save_workout_plan(UUID, TEXT, TEXT, JSONB, JSONB);

CREATE OR REPLACE FUNCTION public.save_workout_plan(
    p_user_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_profile_snapshot JSONB,
    p_weeks JSONB
) RETURNS UUID AS $$
DECLARE
    v_routine_id UUID;
    v_week_id UUID;
    v_day_id UUID;
    v_week JSONB;
    v_day JSONB;
    v_exercise JSONB;
    v_exercise_index INTEGER;
BEGIN
    -- Verificar que el usuario está autenticado y coincide
    IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: user_id does not match authenticated user';
    END IF;

    -- Crear la rutina
    INSERT INTO public.routines (user_id, title, description, profile_snapshot, status, started_at, created_at)
    VALUES (p_user_id, p_title, p_description, p_profile_snapshot, 'active', NOW(), NOW())
    RETURNING id INTO v_routine_id;

    -- Iterar semanas
    FOR v_week IN SELECT * FROM jsonb_array_elements(p_weeks)
    LOOP
        INSERT INTO public.routine_weeks (routine_id, week_number, theme)
        VALUES (v_routine_id, (v_week->>'weekNumber')::INTEGER, v_week->>'theme')
        RETURNING id INTO v_week_id;

        -- Iterar días dentro de la semana
        FOR v_day IN SELECT * FROM jsonb_array_elements(v_week->'days')
        LOOP
            INSERT INTO public.routine_days (
                routine_id,
                week_id,
                day_number,
                day_name,
                day_label,
                focus,
                estimated_duration,
                order_index
            )
            VALUES (
                v_routine_id,
                v_week_id,
                COALESCE((v_day->>'day')::INTEGER, (v_day->>'dayNumber')::INTEGER),
                v_day->>'dayName',
                COALESCE(v_day->>'dayName', v_day->>'focus', 'Dia'),
                v_day->>'focus',
                COALESCE((v_day->>'duration')::INTEGER, (v_day->>'estimatedDuration')::INTEGER),
                COALESCE((v_day->>'day')::INTEGER, (v_day->>'dayNumber')::INTEGER, 0)
            )
            RETURNING id INTO v_day_id;

            -- Iterar ejercicios dentro del día
            v_exercise_index := 0;
            FOR v_exercise IN SELECT * FROM jsonb_array_elements(v_day->'exercises')
            LOOP
                INSERT INTO public.exercises (
                    routine_day_id,
                    day_id,
                    name,
                    sets,
                    reps,
                    rest_seconds,
                    rest_time,
                    notes,
                    order_index
                )
                VALUES (
                    v_day_id,
                    v_day_id,
                    v_exercise->>'name',
                    (v_exercise->>'sets')::INTEGER,
                    v_exercise->>'reps',
                    COALESCE((v_exercise->>'rest')::INTEGER, (v_exercise->>'restSeconds')::INTEGER),
                    COALESCE((v_exercise->>'rest')::TEXT, (v_exercise->>'restTime')::TEXT),
                    v_exercise->>'notes',
                    COALESCE((v_exercise->>'orderIndex')::INTEGER, v_exercise_index)
                );
                v_exercise_index := v_exercise_index + 1;
            END LOOP;
        END LOOP;
    END LOOP;

    RETURN v_routine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.save_workout_plan(UUID, TEXT, TEXT, JSONB, JSONB) TO authenticated;

-- 5.2 GET_USER_PROGRESS_CONTEXT - Obtener contexto de progreso del usuario
DROP FUNCTION IF EXISTS public.get_user_progress_context(UUID);

CREATE OR REPLACE FUNCTION public.get_user_progress_context(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Verificar que el usuario está autenticado y coincide
    IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: user_id does not match authenticated user';
    END IF;

    SELECT jsonb_build_object(
        'totalRoutines', (
            SELECT COUNT(*)
            FROM public.routines
            WHERE user_id = p_user_id
        ),
        'completedRoutines', (
            SELECT COUNT(*)
            FROM public.routines
            WHERE user_id = p_user_id AND status = 'completed'
        ),
        'activeRoutines', (
            SELECT COUNT(*)
            FROM public.routines
            WHERE user_id = p_user_id AND status = 'active'
        ),
        'totalSessions', (
            SELECT COUNT(*)
            FROM public.workout_sessions
            WHERE user_id = p_user_id
        ),
        'completedSessions', (
            SELECT COUNT(*)
            FROM public.workout_sessions
            WHERE user_id = p_user_id AND completed_at IS NOT NULL
        ),
        'averageRpe', (
            SELECT ROUND(AVG(rpe)::numeric, 1)
            FROM public.workout_sessions
            WHERE user_id = p_user_id AND rpe IS NOT NULL
        ),
        'averageDuration', (
            SELECT ROUND(AVG(actual_duration)::numeric, 0)
            FROM public.workout_sessions
            WHERE user_id = p_user_id AND actual_duration IS NOT NULL
        ),
        'lastSession', (
            SELECT jsonb_build_object(
                'id', ws.id,
                'date', ws.completed_at,
                'duration', ws.actual_duration,
                'rpe', ws.rpe,
                'mood', ws.mood
            )
            FROM public.workout_sessions ws
            WHERE ws.user_id = p_user_id AND ws.completed_at IS NOT NULL
            ORDER BY ws.completed_at DESC
            LIMIT 1
        ),
        'currentRoutine', (
            SELECT jsonb_build_object(
                'id', r.id,
                'title', r.title,
                'startedAt', r.started_at,
                'weeksCount', (
                    SELECT COUNT(*)
                    FROM public.routine_weeks rw
                    WHERE rw.routine_id = r.id
                )
            )
            FROM public.routines r
            WHERE r.user_id = p_user_id AND r.status = 'active'
            ORDER BY r.created_at DESC
            LIMIT 1
        ),
        'recentExercises', (
            SELECT COALESCE(jsonb_agg(DISTINCT e.name), '[]'::jsonb)
            FROM public.exercises e
            JOIN public.routine_days rd ON e.routine_day_id = rd.id OR e.day_id = rd.id
            JOIN public.routines r ON rd.routine_id = r.id
            WHERE r.user_id = p_user_id
        ),
        'moodDistribution', (
            SELECT jsonb_object_agg(mood, count)
            FROM (
                SELECT mood, COUNT(*) as count
                FROM public.workout_sessions
                WHERE user_id = p_user_id AND mood IS NOT NULL
                GROUP BY mood
            ) mood_counts
        )
    ) INTO v_result;

    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_user_progress_context(UUID) TO authenticated;

-- 5.3 GET_ROUTINE_DETAILS - Obtener detalles completos de una rutina
DROP FUNCTION IF EXISTS public.get_routine_details(UUID);

CREATE OR REPLACE FUNCTION public.get_routine_details(p_routine_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_user_id UUID;
BEGIN
    -- Obtener el user_id de la rutina
    SELECT user_id INTO v_user_id
    FROM public.routines
    WHERE id = p_routine_id;

    -- Verificar propiedad
    IF v_user_id IS NULL OR auth.uid() != v_user_id THEN
        RAISE EXCEPTION 'Unauthorized or routine not found';
    END IF;

    SELECT jsonb_build_object(
        'id', r.id,
        'title', r.title,
        'description', r.description,
        'status', r.status,
        'startedAt', r.started_at,
        'completedAt', r.completed_at,
        'createdAt', r.created_at,
        'profileSnapshot', r.profile_snapshot,
        'weeks', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', rw.id,
                    'weekNumber', rw.week_number,
                    'theme', rw.theme,
                    'days', (
                        SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                                'id', rd.id,
                                'dayNumber', rd.day_number,
                                'dayName', rd.day_name,
                                'focus', rd.focus,
                                'estimatedDuration', rd.estimated_duration,
                                'exercises', (
                                    SELECT COALESCE(jsonb_agg(
                                        jsonb_build_object(
                                            'id', e.id,
                                            'name', e.name,
                                            'sets', e.sets,
                                            'reps', e.reps,
                                            'restSeconds', e.rest_seconds,
                                            'notes', e.notes,
                                            'orderIndex', e.order_index
                                        ) ORDER BY e.order_index
                                    ), '[]'::jsonb)
                                    FROM public.exercises e
                                    WHERE e.routine_day_id = rd.id OR e.day_id = rd.id
                                )
                            ) ORDER BY rd.day_number, rd.order_index
                        ), '[]'::jsonb)
                        FROM public.routine_days rd
                        WHERE rd.week_id = rw.id
                    )
                ) ORDER BY rw.week_number
            ), '[]'::jsonb)
            FROM public.routine_weeks rw
            WHERE rw.routine_id = r.id
        )
    ) INTO v_result
    FROM public.routines r
    WHERE r.id = p_routine_id;

    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_routine_details(UUID) TO authenticated;

-- ============================================================================
-- SECCIÓN 6: BACKFILL (Opcional)
-- ============================================================================
-- Crear perfiles para usuarios existentes que no tengan uno

INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT
    au.id,
    au.email,
    COALESCE(au.created_at, NOW()),
    NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
--
-- Para verificar la instalación:
--
-- 1. Verificar tablas creadas:
--    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--
-- 2. Verificar RLS habilitado:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--
-- 3. Verificar políticas:
--    SELECT * FROM pg_policies WHERE schemaname = 'public';
--
-- 4. Verificar trigger:
--    SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--
-- 5. Verificar funciones RPC:
--    SELECT proname FROM pg_proc WHERE proname IN
--    ('save_workout_plan', 'get_user_progress_context', 'get_routine_details', 'handle_new_user');
--
-- ============================================================================
