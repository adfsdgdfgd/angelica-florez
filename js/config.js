// ============================================================================
// CONFIGURACIÓN CENTRALIZADA - PLAN ANGÉLICA FLÓREZ
// ============================================================================
// Este archivo centraliza todas las variables de configuración
// Las variables se cargan desde .env (desarrollo) o variables de entorno
// ============================================================================

export const CONFIG = {
  // ========================================================================
  // SUPABASE
  // ========================================================================
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  },

  // ========================================================================
  // OLLAMA - IA LOCAL
  // ========================================================================
  ollama: {
    apiUrl: import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434',
    model: import.meta.env.VITE_OLLAMA_MODEL || 'qwen3:8b',
    timeout: parseInt(import.meta.env.VITE_OLLAMA_TIMEOUT || '60000'),
  },

  // ========================================================================
  // APLICACIÓN
  // ========================================================================
  app: {
    env: import.meta.env.VITE_ENV || 'development',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_DEBUG_MODE === 'true',
  },

  // ========================================================================
  // EMAIL
  // ========================================================================
  email: {
    smtpHost: import.meta.env.VITE_SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
    smtpSecure: import.meta.env.VITE_SMTP_SECURE === 'true',
    from: import.meta.env.VITE_SMTP_FROM || 'noreply@plan-angelica.com',
    adminEmail: import.meta.env.VITE_ADMIN_EMAIL || '',
  },

  // ========================================================================
  // GOOGLE SHEETS
  // ========================================================================
  googleSheets: {
    apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',
    projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID || '',
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID || '',
  },
};

// ============================================================================
// VALIDACIÓN DE CONFIGURACIÓN
// ============================================================================

export function validateConfig() {
  const errors = [];

  // Validar Supabase (requerido)
  if (!CONFIG.supabase.url || CONFIG.supabase.url.includes('your-project')) {
    errors.push('❌ VITE_SUPABASE_URL no configurado en .env');
  }
  if (!CONFIG.supabase.anonKey || CONFIG.supabase.anonKey.includes('your-anon')) {
    errors.push('❌ VITE_SUPABASE_ANON_KEY no configurado en .env');
  }

  // Validar Ollama (requerido para chatbot)
  if (!CONFIG.ollama.apiUrl || CONFIG.ollama.apiUrl.includes('localhost:11434')) {
    if (CONFIG.app.env !== 'development') {
      errors.push('⚠️  VITE_OLLAMA_API_URL no configurado (chatbot IA no funcionará)');
    }
  }

  // Logs
  if (CONFIG.app.debug) {
    console.log('🔧 Configuración cargada:', CONFIG);
  }

  if (errors.length > 0) {
    console.error('⚠️  Errores de configuración:');
    errors.forEach(err => console.error(err));
    return false;
  }

  console.log('✅ Configuración validada correctamente');
  return true;
}

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

/**
 * Obtener variable de entorno de forma segura
 */
export function getEnv(key, defaultValue = null) {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
}

/**
 * Verificar si está en desarrollo
 */
export const isDevelopment = () => CONFIG.app.env === 'development';

/**
 * Verificar si está en producción
 */
export const isProduction = () => CONFIG.app.env === 'production';

/**
 * Log condicional (solo en debug mode)
 */
export function debugLog(...args) {
  if (CONFIG.app.debug) {
    console.log('[DEBUG]', ...args);
  }
}

export default CONFIG;
