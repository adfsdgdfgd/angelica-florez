# 🏋️ Angélica Flórez - Plan PRO v1.0.0

> Aplicación de transformación de 6 semanas con IA integrada, notificaciones en tiempo real y máxima seguridad.

**Coach:** Sebastián Martínez  
**Desarrollo:** Sebastián Ortiz  
**Stack:** Vanilla JS + Ollama (IA Local) + Supabase (Base de Datos)

---

## ✨ Características

- ✅ **42 ejercicios/semana** - Rutinas detalladas para 6 semanas
- ✅ **Chat IA Gratis** - Integración con Ollama (qwen3:8b local)
- ✅ **Notificaciones Push** - Actualizaciones en tiempo real
- ✅ **Perfil Personalizado** - Altura, peso, objetivos
- ✅ **Seguimiento de Progreso** - Estadísticas completas
- ✅ **Exportar Reportes** - Descargar progreso en PDF
- ✅ **Máxima Seguridad** - RLS, validación, protección XSS
- ✅ **Sin Frameworks** - Vanilla JS puro, super rápido
- ✅ **Responsive Design** - Funciona en móvil/tablet/desktop

---

## 🔐 SEGURIDAD (CRÍTICO)

### 3 Reglas Fundamentales

**1. NUNCA en el código - SIEMPRE en .env**
```
❌ MALO:
const SUPABASE_KEY = 'sk-abc123...';

✅ CORRECTO:
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
```

**2. Validar TODOS los inputs**
```javascript
// Usar SecurityModule
const result = SecurityModule.protectInput(userInput, 'email');
if (!result.success) {
    showError(result.error);
    return;
}
```

**3. Row Level Security (RLS) en Supabase**
```sql
-- Cada usuario solo ve SUS datos
CREATE POLICY "Users can only access own data"
ON workout_data
FOR SELECT
USING (auth.uid() = user_id);
```

### Estructura de Archivos Seguros

```
angelica-florez/
├── index-pro-angelica.html      ← APP PRINCIPAL (todo lo necesario)
├── .env.local                   ← PRIVADO (nunca subir)
├── .env.example                 ← PÚBLICO (template)
├── .gitignore                   ← Excluye .env
├── js/
│   ├── security.js              ← Validación + XSS protection
│   ├── notifications.js         ← Notificaciones push
│   ├── config.js                ← Carga variables de .env
│   └── api-service.js           ← Calls a APIs externas
├── docs/
│   ├── SECURITY.md              ← Guía de seguridad completa
│   └── SETUP.md                 ← Instrucciones de instalación
└── schema.sql                   ← Estructura Supabase con RLS
```

---

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Clonar y Preparar
```bash
git clone https://github.com/adfsdgdfgd/angelica-florez.git
cd angelica-florez
cp .env.example .env.local
```

### Paso 2: Instalar Ollama (IA Gratis Local)
```bash
# Descargar desde https://ollama.ai
# Instalar y ejecutar:
ollama serve

# En otra terminal, descargar el modelo:
ollama pull qwen3:8b
```

### Paso 3: Abrir la App
```bash
# Con Python
python -m http.server 8000

# O con Node
npx http-server

# Luego ir a: http://localhost:8000/index-pro-angelica.html
```

### Paso 4: Configurar (Opcional)
Para usar Supabase en lugar de localStorage:

1. Crear cuenta en https://supabase.com
2. Crear nuevo proyecto
3. Ir a SQL Editor y ejecutar `schema.sql`
4. Copiar URL y keys a `.env.local`

---

## 📋 Variables de Entorno

**Públicas (Frontend - VITE_ prefix):**
```
VITE_OLLAMA_URL=http://localhost:11434
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

**Privadas (Backend - Backend only):**
```
SUPABASE_SERVICE_ROLE_KEY=xxx
GOOGLE_SHEETS_API_KEY=xxx
SMTP_PASSWORD=xxx
```

---

## 💬 Chat IA (Ollama Gratis)

El chat automáticamente:
1. Se conecta a Ollama en `localhost:11434`
2. Usa el modelo `qwen3:8b` (8GB RAM, muy rápido)
3. Inyecta contexto del usuario (altura, peso, objetivo)
4. Responde en 3-15 segundos (GTX 1050 o mejor)

Si no tienes GPU, usa CPU - solo es más lento.

---

## 📊 Estructura de Datos

### Usuarios (localStorage o Supabase)
```javascript
{
    name: "Angélica",
    height: 1.70,           // metros
    weight: 64,             // kg
    goal: "Músculo y definición",
    email: "angelica@email.com",
    createdAt: "2026-04-18"
}
```

### Progreso del Entrenamiento
```javascript
{
    weekNumber: 1,
    dayName: "Lunes",
    completedExercises: ["Sentadilla", "Press"],
    percentage: 50,
    notes: "Sentí mucho pump",
    timestamp: "2026-04-18T10:30:00Z"
}
```

---

## 🔗 APIs Integradas

### Ollama (IA Local)
```javascript
// El chat usa automáticamente:
POST http://localhost:11434/api/generate
{
    "model": "qwen3:8b",
    "prompt": "...",
    "stream": false
}
```

### Supabase (Base de Datos - OPCIONAL)
```javascript
// Crear tabla con RLS:
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(50),
    height DECIMAL(3,2),
    weight DECIMAL(5,2),
    UNIQUE(user_id)
);

-- Proteger con RLS:
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven solo su perfil"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);
```

---

## 🎯 Módulos JavaScript

### SecurityModule
```javascript
// Sanitizar inputs
const safe = SecurityModule.sanitizeHTML(userInput);

// Validar email
const check = SecurityModule.validateFormInput('email', email);

// Proteger completamente
const protected = SecurityModule.protectInput(input, 'text');
```

### NotificationsModule
```javascript
// Notificación push
NotificationsModule.sendPushNotification('Camilo', {
    body: 'Acaba de guardar su rutina'
});

// Toast en pantalla
NotificationsModule.showToast('Progreso guardado', 'success');

// Logro desbloqueado
NotificationsModule.showAchievementNotification('first_week');
```

---

## ✅ Pre-Producción Checklist

- [ ] **Seguridad**
  - [ ] `.env.local` NO está en git
  - [ ] `VITE_` variables para frontend
  - [ ] RLS habilitado en Supabase
  - [ ] Todos los inputs validados
  - [ ] No hay `console.log()` en production

- [ ] **Performance**
  - [ ] Ollama responde en < 30s
  - [ ] Página carga en < 2s
  - [ ] Notificaciones no spamean

- [ ] **Testing**
  - [ ] Chat IA funciona
  - [ ] Notificaciones llegan
  - [ ] Progreso se guarda
  - [ ] Perfil persiste
  - [ ] Responsive en móvil

---

## 🐛 Troubleshooting

### "No puedo conectar con Ollama"
```bash
# Verificar que Ollama corre:
curl http://localhost:11434/api/tags

# Si no funciona, instalar Ollama desde https://ollama.ai
ollama serve
```

### "Las notificaciones no llegan"
1. Verificar permisos en navegador
2. Aceptar notificaciones cuando pida
3. Verificar que el navegador está en foco

### "localStorage está lleno"
1. Limpiar datos antiguos: `localStorage.clear()`
2. O migrar a Supabase

---

## 📈 Próximos Pasos

1. **Email Automático** - Enviar reportes semanales
2. **Google Sheets** - Sincronizar datos a hoja de cálculo
3. **Análisis** - Dashboard con gráficos de progreso
4. **Comunidad** - Feed social de usuarios
5. **App Mobile** - Versión nativa iOS/Android

---

## 📝 Licencia

Privado - Uso exclusivo de Angélica Flórez

## 👥 Soporte

- **Coach:** Sebastián Martínez
- **Desarrollo:** Sebastián Ortiz
- **Email:** angelica@florez.fit

---

**Última actualización:** 18 de Abril de 2026  
**Versión:** 1.0.0 PRO  
**Status:** ✅ Production Ready
