// ============================================================================
// INTEGRACIÓN OLLAMA PARA CHATBOT IA
// ============================================================================
// Maneja la comunicación con el servidor Ollama local
// ============================================================================

import { OllamaService } from './api-service.js';
import CONFIG from './config.js';

/**
 * Contexto del usuario que se envía a Ollama
 */
function buildUserContext() {
  // Cargar datos del usuario desde localStorage
  const SK = 'af_v4_adv';
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem(SK)) || {};
  } catch (e) {
    data = {};
  }

  // Construir contexto
  return `
PERFIL DEL USUARIO:
- Nombre: ${data.userName || 'Angélica Flórez'}
- Altura: ${data.userHeight || '1.70'} m
- Peso: ${data.userWeight || '64'} kg
- Objetivo: ${data.userGoal || 'Transformación física y salud'}
- Email: ${data.userEmail || 'no especificado'}

PLAN DE ENTRENAMIENTO:
- Duración: 6 semanas
- Tipo: Fuerza e hipertrofia
- Sesiones: 6 días/semana + 1 descanso
- Días de entrenamiento: Lunes-Sábado
- Domingo: Descanso y recuperación

MACROS NUTRICIONALES RECOMENDADOS:
- Proteína: 102-141g/día
- Carbohidratos: 192-320g/día
- Grasas: 51-77g/día
- Agua: 3-4 litros/día

OBJETIVO: Ser un asistente personalizado que ayude con:
- Preguntas sobre ejercicios y técnica
- Recomendaciones de nutrición
- Motivación y consejos de entrenamiento
- Información sobre el programa de 6 semanas
`;
}

/**
 * Enviar mensaje al chatbot y obtener respuesta de Ollama
 */
export async function sendOllamaMessage(userMessage) {
  try {
    // Mostrar estado "pensando"
    const widget = document.getElementById('chatWidget');
    const thinkingMsg = document.createElement('div');
    thinkingMsg.className = 'chat-msg bot';
    thinkingMsg.id = 'thinking-msg';
    thinkingMsg.textContent = 'Pensando • ';
    widget.appendChild(thinkingMsg);
    widget.scrollTop = widget.scrollHeight;

    // Obtener contexto del usuario
    const context = buildUserContext();

    // Enviar a Ollama
    console.log('🤖 Enviando a Ollama:', { modelUrl: CONFIG.ollama.apiUrl, model: CONFIG.ollama.model });
    const response = await OllamaService.sendMessage(userMessage, context);

    // Remover mensaje de "pensando"
    const thinking = document.getElementById('thinking-msg');
    if (thinking) thinking.remove();

    // Mostrar respuesta
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot';
    botMsg.textContent = response;
    widget.appendChild(botMsg);
    widget.scrollTop = widget.scrollHeight;

    // Guardar en chat history (opcional: Supabase)
    saveChat Locally('assistant', response);

    return response;
  } catch (error) {
    console.error('❌ Error en Ollama:', error);

    // Mostrar error al usuario
    const widget = document.getElementById('chatWidget');
    const thinking = document.getElementById('thinking-msg');
    if (thinking) thinking.remove();

    const errorMsg = document.createElement('div');
    errorMsg.className = 'chat-msg bot';
    errorMsg.textContent = '❌ Error: ' + error.message + '\n\nAsegúrate de que Ollama esté corriendo en ' + CONFIG.ollama.apiUrl;
    widget.appendChild(errorMsg);
    widget.scrollTop = widget.scrollHeight;

    return null;
  }
}

/**
 * Guardar mensaje de chat localmente
 */
export function saveChatLocally(role, content) {
  const SK = 'af_v4_adv_chat';
  let chatHistory = [];
  try {
    chatHistory = JSON.parse(localStorage.getItem(SK)) || [];
  } catch (e) {
    chatHistory = [];
  }

  chatHistory.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  });

  // Mantener últimos 50 mensajes
  if (chatHistory.length > 50) {
    chatHistory = chatHistory.slice(-50);
  }

  try {
    localStorage.setItem(SK, JSON.stringify(chatHistory));
  } catch (e) {
    console.warn('⚠️  No se pudo guardar el chat en localStorage:', e);
  }
}

/**
 * Cargar histórico de chat desde localStorage
 */
export function loadChatHistory() {
  const SK = 'af_v4_adv_chat';
  try {
    return JSON.parse(localStorage.getItem(SK)) || [];
  } catch (e) {
    return [];
  }
}

/**
 * Mostrar histórico de chat al abrir
 */
export function displayChatHistory() {
  const history = loadChatHistory();
  const widget = document.getElementById('chatWidget');

  // Limpiar widget
  widget.innerHTML = '';

  // Mostrar últimos 10 mensajes
  const recentMessages = history.slice(-10);
  for (const msg of recentMessages) {
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg ' + msg.role;
    msgEl.textContent = msg.content;
    widget.appendChild(msgEl);
  }

  // Scroll al final
  widget.scrollTop = widget.scrollHeight;
}

/**
 * Limpiar histórico de chat
 */
export function clearChatHistory() {
  if (confirm('¿Limpiar todo el historial de chat?')) {
    localStorage.removeItem('af_v4_adv_chat');
    const widget = document.getElementById('chatWidget');
    widget.innerHTML = '<div class="chat-msg bot">Chat limpiado. ¿En qué puedo ayudarte?</div>';
    console.log('✅ Chat limpiado');
  }
}

/**
 * Verificar disponibilidad de Ollama
 */
export async function checkOllamaAvailability() {
  try {
    const isAvailable = await OllamaService.checkHealth();
    if (isAvailable) {
      console.log('✅ Ollama disponible en ' + CONFIG.ollama.apiUrl);
      return true;
    } else {
      console.warn('⚠️  Ollama no está disponible en ' + CONFIG.ollama.apiUrl);
      return false;
    }
  } catch (error) {
    console.error('❌ Error verificando Ollama:', error);
    return false;
  }
}

export default {
  sendOllamaMessage,
  saveChatLocally,
  loadChatHistory,
  displayChatHistory,
  clearChatHistory,
  checkOllamaAvailability,
  buildUserContext,
};
