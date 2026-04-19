-- ============================================================================
-- SCHEMA: PLAN ANGÉLICA FLÓREZ - TRANSFORMACIÓN AVANZADA
-- Base de datos para la aplicación de fitness con histórico de entrenamientos
-- ============================================================================

-- ============================================================================
-- 1. TABLA: user_profiles
-- Almacena la información del perfil del usuario
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Información personal
  name TEXT NOT NULL,
  height_m DECIMAL(3,2),
  weight_kg DECIMAL(5,2),
  email TEXT,
  personal_goal TEXT,
  avatar_url TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index para búsqueda rápida
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);


-- ============================================================================
-- 2. TABLA: workout_history
-- Almacena el histórico completo de entrenamientos
-- ============================================================================
CREATE TABLE IF NOT EXISTS workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Información del entrenamiento
  day_name TEXT NOT NULL, -- Lunes, Martes, etc.
  day_number INT NOT NULL, -- 1-7
  week_number INT NOT NULL, -- 1-6
  focus_area TEXT, -- "Quadriceps + Glute", "Arms/Shoulders", etc.
  intensity_level TEXT, -- "Alta", "Media", "Baja"

  -- Ejercicios completados
  exercises_completed INT DEFAULT 0,
  exercises_total INT DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,

  -- Notas del usuario
  notes TEXT,

  -- Metadata
  date_trained DATE NOT NULL,
  duration_minutes INT,
  energy_level INT CHECK (energy_level >= 1 AND energy_level <= 5), -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, date_trained)
);

-- Enable RLS
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Usuarios solo pueden ver su propio histórico
CREATE POLICY "Users can view own workout history"
  ON workout_history FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden registrar sus entrenamientos
CREATE POLICY "Users can insert own workout history"
  ON workout_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden actualizar sus entrenamientos
CREATE POLICY "Users can update own workout history"
  ON workout_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes para búsquedas rápidas
CREATE INDEX idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX idx_workout_history_date ON workout_history(date_trained);
CREATE INDEX idx_workout_history_week ON workout_history(week_number);


-- ============================================================================
-- 3. TABLA: exercise_logs
-- Detalle específico de cada ejercicio completado
-- ============================================================================
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES workout_history(id) ON DELETE CASCADE,

  -- Información del ejercicio
  exercise_name TEXT NOT NULL,
  sets_planned INT,
  sets_completed INT,
  reps_planned TEXT, -- "10-12", "15", etc.
  reps_completed TEXT,
  weight_kg DECIMAL(5,2),
  duration_seconds INT,
  notes TEXT,

  -- Metadata
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Usuarios solo pueden ver sus propios ejercicios
CREATE POLICY "Users can view own exercise logs"
  ON exercise_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden registrar sus ejercicios
CREATE POLICY "Users can insert own exercise logs"
  ON exercise_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden actualizar sus ejercicios
CREATE POLICY "Users can update own exercise logs"
  ON exercise_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_exercise_logs_user_id ON exercise_logs(user_id);
CREATE INDEX idx_exercise_logs_workout ON exercise_logs(workout_id);


-- ============================================================================
-- 4. TABLA: personalized_recommendations
-- Recomendaciones personalizadas basadas en el progreso del usuario
-- ============================================================================
CREATE TABLE IF NOT EXISTS personalized_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Recomendación
  category TEXT NOT NULL, -- "nutrition", "rest", "technique", "progression"
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INT DEFAULT 3, -- 1 (alta) a 5 (baja)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Usuarios solo pueden ver sus recomendaciones
CREATE POLICY "Users can view own recommendations"
  ON personalized_recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden crear recomendaciones
CREATE POLICY "Users can insert own recommendations"
  ON personalized_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden descartar recomendaciones
CREATE POLICY "Users can update own recommendations"
  ON personalized_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_recommendations_user_id ON personalized_recommendations(user_id);
CREATE INDEX idx_recommendations_category ON personalized_recommendations(category);


-- ============================================================================
-- 5. TABLA: nutrition_logs
-- Registro de nutrición diaria
-- ============================================================================
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Macros
  protein_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  fat_g DECIMAL(5,1),
  calories DECIMAL(6,0),

  -- Agua y otros
  water_liters DECIMAL(3,1),
  notes TEXT,

  -- Metadata
  date_logged DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, date_logged)
);

-- Enable RLS
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Usuarios solo pueden ver su propio log
CREATE POLICY "Users can view own nutrition logs"
  ON nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden registrar nutrición
CREATE POLICY "Users can insert own nutrition logs"
  ON nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden actualizar su nutrición
CREATE POLICY "Users can update own nutrition logs"
  ON nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_date ON nutrition_logs(date_logged);


-- ============================================================================
-- 6. TABLA: chat_messages
-- Historial de mensajes con el chatbot IA
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Mensaje
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')), -- Quién envió
  content TEXT NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Usuarios solo pueden ver sus mensajes
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden enviar mensajes
CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index para búsqueda rápida
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);


-- ============================================================================
-- 7. TABLA: reports
-- Reportes generados y exportados
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Información del reporte
  report_type TEXT NOT NULL, -- "weekly", "monthly", "6week"
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Stats generales
  total_workouts INT,
  total_exercises INT,
  avg_duration_minutes DECIMAL(5,1),

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent_at TIMESTAMP WITH TIME ZONE,
  downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Usuarios solo pueden ver sus reportes
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Usuarios pueden crear reportes
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(report_type);


-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Actualizar el timestamp de updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para workout_history
CREATE TRIGGER update_workout_history_updated_at
  BEFORE UPDATE ON workout_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para exercise_logs
CREATE TRIGGER update_exercise_logs_updated_at
  BEFORE UPDATE ON exercise_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para nutrition_logs
CREATE TRIGGER update_nutrition_logs_updated_at
  BEFORE UPDATE ON nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================================================

-- Vista: Resumen semanal
CREATE OR REPLACE VIEW weekly_summary AS
SELECT
  user_id,
  week_number,
  COUNT(DISTINCT date_trained) as days_trained,
  SUM(exercises_completed) as total_exercises,
  AVG(completion_percentage) as avg_completion_pct,
  AVG(energy_level) as avg_energy
FROM workout_history
GROUP BY user_id, week_number;

-- Vista: Último mes de actividad
CREATE OR REPLACE VIEW last_30_days_activity AS
SELECT
  user_id,
  DATE(date_trained) as date,
  COUNT(*) as workouts_count,
  SUM(exercises_completed) as exercises_count,
  AVG(energy_level) as avg_energy
FROM workout_history
WHERE date_trained >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id, DATE(date_trained);

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
