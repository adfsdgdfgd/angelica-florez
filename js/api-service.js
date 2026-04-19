// ============================================================================
// SERVICIO DE APIs - PLAN ANGÉLICA FLÓREZ
// ============================================================================
// Maneja todas las comunicaciones con:
// - Ollama (chatbot IA local)
// - Supabase (base de datos)
// - Servicios externos
// ============================================================================

import CONFIG, { debugLog, isDevelopment } from './config.js';

// ============================================================================
// SERVICIO: OLLAMA (IA LOCAL)
// ============================================================================

export class OllamaService {
  /**
   * Enviar mensaje al chatbot Ollama
   * @param {string} userMessage - Mensaje del usuario
   * @param {string} context - Contexto adicional (perfil, servicios, etc)
   * @returns {Promise<string>} - Respuesta del modelo
   */
  static async sendMessage(userMessage, context = '') {
    debugLog('🤖 Ollama: Enviando mensaje', { userMessage, contextLength: context.length });

    try {
      // Construir el prompt con contexto
      const systemPrompt = `Eres un asistente de fitness personalizado para Angélica Flórez.
Tu objetivo es ayudar con:
- Preguntas sobre ejercicios y form
- Recomendaciones de nutrición
- Motivación y consejos de entrenamiento
- Responder dudas sobre el programa de 6 semanas

Sé amable, específico y usa datos reales del usuario cuando sea posible.
Responde siempre en español.

CONTEXTO DEL USUARIO:
${context}`;

      const response = await fetch(`${CONFIG.ollama.apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: CONFIG.ollama.model,
          prompt: `${systemPrompt}\n\nUsuario: ${userMessage}\n\nAsistente:`,
          stream: false,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
        }),
        signal: AbortSignal.timeout(CONFIG.ollama.timeout),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
      debugLog('🤖 Ollama: Respuesta recibida', { responseLength: data.response.length });

      return data.response || 'No pude generar una respuesta.';
    } catch (error) {
      console.error('❌ Error en Ollama:', error);

      // Fallback message si falla Ollama
      if (error.name === 'AbortError') {
        return 'La respuesta tomó demasiado tiempo. Por favor intenta de nuevo.';
      }

      return `Error: ${error.message}. Asegúrate de que Ollama esté corriendo en ${CONFIG.ollama.apiUrl}`;
    }
  }

  /**
   * Verificar si Ollama está disponible
   */
  static async checkHealth() {
    try {
      const response = await fetch(`${CONFIG.ollama.apiUrl}/api/version`, {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        debugLog('✅ Ollama está disponible', data);
        return true;
      }

      return false;
    } catch (error) {
      debugLog('❌ Ollama no disponible:', error.message);
      return false;
    }
  }

  /**
   * Generar recomendación basada en datos del usuario
   */
  static async generateRecommendation(userStats, category) {
    const prompt = `Basándote en estos datos de entrenamiento:
- Ejercicios completados: ${userStats.exercisesCompleted}
- Semana: ${userStats.week}
- Energía promedio: ${userStats.avgEnergy}/5

Genera una recomendación específica para: ${category}
Sé conciso y actionable.`;

    return await this.sendMessage(prompt);
  }
}

// ============================================================================
// SERVICIO: SUPABASE (BASE DE DATOS)
// ============================================================================

export class SupabaseService {
  static client = null;

  /**
   * Inicializar cliente Supabase
   */
  static async initialize() {
    if (typeof window === 'undefined') {
      throw new Error('Supabase Service requiere ambiente de navegador');
    }

    // Dinámicamente importar Supabase solo cuando se necesite
    if (!this.client) {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');

      this.client = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
      debugLog('✅ Supabase inicializado');
    }

    return this.client;
  }

  /**
   * Guardar perfil del usuario
   */
  static async saveProfile(profileData) {
    try {
      const client = await this.initialize();

      const { data, error } = await client
        .from('user_profiles')
        .upsert(profileData)
        .select();

      if (error) throw error;

      debugLog('✅ Perfil guardado en Supabase', data);
      return data;
    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario
   */
  static async getProfile(userId) {
    try {
      const client = await this.initialize();

      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      debugLog('✅ Perfil obtenido', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      return null;
    }
  }

  /**
   * Registrar entrenamiento en la base de datos
   */
  static async logWorkout(workoutData) {
    try {
      const client = await this.initialize();

      const { data, error } = await client
        .from('workout_history')
        .insert(workoutData)
        .select();

      if (error) throw error;

      debugLog('✅ Entrenamiento registrado', data);
      return data;
    } catch (error) {
      console.error('❌ Error registrando entrenamiento:', error);
      throw error;
    }
  }

  /**
   * Obtener histórico de entrenamientos
   */
  static async getWorkoutHistory(userId, limit = 30) {
    try {
      const client = await this.initialize();

      const { data, error } = await client
        .from('workout_history')
        .select('*')
        .eq('user_id', userId)
        .order('date_trained', { ascending: false })
        .limit(limit);

      if (error) throw error;

      debugLog('✅ Histórico obtenido', { count: data?.length });
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo histórico:', error);
      return [];
    }
  }

  /**
   * Guardar mensaje de chat
   */
  static async saveChatMessage(userId, role, content) {
    try {
      const client = await this.initialize();

      const { data, error } = await client
        .from('chat_messages')
        .insert({
          user_id: userId,
          role,
          content,
        })
        .select();

      if (error) throw error;

      debugLog('✅ Mensaje guardado', { role });
      return data;
    } catch (error) {
      console.error('❌ Error guardando mensaje:', error);
      // No falla la app si el chat no se guarda
      return null;
    }
  }

  /**
   * Obtener histórico de chat
   */
  static async getChatHistory(userId, limit = 50) {
    try {
      const client = await this.initialize();

      const { data, error } = await client
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      debugLog('✅ Chat histórico obtenido', { count: data?.length });
      return data?.reverse() || [];
    } catch (error) {
      console.error('❌ Error obteniendo chat:', error);
      return [];
    }
  }

  /**
   * Crear o actualizar recomendación
   */
  static async saveRecommendation(userId, recommendation) {
    try {
      const client = await this.initialize();

      const { data, error } = await client
        .from('personalized_recommendations')
        .insert({
          user_id: userId,
          ...recommendation,
        })
        .select();

      if (error) throw error;

      debugLog('✅ Recomendación guardada');
      return data;
    } catch (error) {
      console.error('❌ Error guardando recomendación:', error);
      return null;
    }
  }

  /**
   * Obtener recomendaciones activas
   */
  static async getRecommendations(userId) {
    try {
      const client = await this.initialize();

      const { data, error } = await client
        .from('personalized_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('dismissed', false)
        .order('priority', { ascending: true })
        .limit(5);

      if (error) throw error;

      debugLog('✅ Recomendaciones obtenidas', { count: data?.length });
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones:', error);
      return [];
    }
  }
}

// ============================================================================
// SERVICIO: VALIDACIÓN Y SANITIZACIÓN
// ============================================================================

/**
 * Sanitizar input del usuario (prevenir XSS)
 */
export function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validar email
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validar que un número esté en rango
 */
export function validateRange(value, min, max) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validar altura (1.40 - 2.30 metros)
 */
export function validateHeight(height) {
  return validateRange(height, 1.4, 2.3);
}

/**
 * Validar peso (30 - 300 kg)
 */
export function validateWeight(weight) {
  return validateRange(weight, 30, 300);
}

/**
 * Validar fecha
 */
export function validateDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// ============================================================================
// SERVICIO: UTILIDADES
// ============================================================================

/**
 * Hacer retry en una operación async
 */
export async function withRetry(asyncFn, maxRetries = 3, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await asyncFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      debugLog(`⚠️  Reintentando... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
    }
  }
}

/**
 * Debounce para funciones frecuentes
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default {
  OllamaService,
  SupabaseService,
  sanitizeInput,
  validateEmail,
  validateHeight,
  validateWeight,
  validateDate,
  withRetry,
  debounce,
};
