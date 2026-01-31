-- 1. TABLA DE PERFILES (Extensión de auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fitness_level TEXT,
  equipment JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE RUTINAS (Cabecera)
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE DÍAS (Semanas/Días)
CREATE TABLE public.routine_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  day_label TEXT NOT NULL, -- Ej: "Lunes: Empuje"
  order_index INT NOT NULL
);

-- 4. TABLA DE EJERCICIOS (Detalle)
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.routine_days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INT,
  reps TEXT,
  rpe_target INT,
  rest_time TEXT,
  notes TEXT
);

-- CONFIGURACIÓN DE SEGURIDAD (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFILES
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS PARA ROUTINES (Y cascada lógica)
CREATE POLICY "Users can manage their own routines" ON public.routines 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage days of their routines" ON public.routine_days 
  USING (EXISTS (
    SELECT 1 FROM public.routines WHERE id = routine_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage exercises of their routines" ON public.exercises 
  USING (EXISTS (
    SELECT 1 FROM public.routine_days d 
    JOIN public.routines r ON d.routine_id = r.id 
    WHERE d.id = day_id AND r.user_id = auth.uid()
  ));