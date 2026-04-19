# 💪 Plan Angélica Flórez - Transformación Avanzada

Aplicación web completa de fitness con IA integrada, tracking avanzado y análisis de progreso.

## 📋 Características

### Core Features
- **📅 Programa de 6 semanas** - 42 ejercicios distribuidos en 7 días
- **🔥 Heat Maps** - Visualiza tu actividad de los últimos 14 días
- **⏱️ Timers** - Cronómetro integrado para ejercicios
- **🤖 Chatbot IA** - Asistente personal con Ollama (local)
- **📊 Reportes** - Exporta tu progreso en PDF/Excel
- **🎯 Recomendaciones** - Sugerencias personalizadas basadas en tu progreso
- **💬 Chat History** - Historial de conversaciones guardado
- **📱 Responsive** - Funciona en móvil, tablet y desktop

### Seguridad & Privacidad
- ✅ Base de datos segura con Supabase + RLS
- ✅ Autenticación con credentials encriptadas
- ✅ Variables de entorno para APIs sensibles
- ✅ Validación de inputs en cliente y servidor
- ✅ IA corre localmente (sin enviar datos a cloud)

---

## 🚀 Quick Start

### Prerequisitos
- Node.js 18+ o Python 3.8+
- Ollama instalado y corriendo (para IA)
- Cuenta Supabase (para base de datos)
- Git

### 1️⃣ Clonar y Setup

```bash
# Clonar repo
git clone https://github.com/tuusername/plan-angelica-florez.git
cd plan-angelica-florez

# Instalar dependencias (si usas npm/yarn)
npm install

# O para desarrollo simple sin build tool
# Sirve con: python -m http.server 8000
```

### 2️⃣ Configurar Variables de Entorno

```bash
# Copiar el template
cp .env.example .env.local

# Editar .env.local con tus credenciales:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_OLLAMA_API_URL (http://localhost:11434)
```

### 3️⃣ Inicializar Supabase

```bash
# 1. Ir a https://supabase.com y crear proyecto
# 2. Ejecutar el script SQL en la consola SQL:
# - Copiar contenido de schema.sql
# - Ir a SQL Editor en Supabase
# - Pegar y ejecutar

# 3. Habilitarautenticación:
# - Auth > Settings > Enable signup
```

### 4️⃣ Iniciar Ollama

```bash
# En una terminal separada
ollama serve

# El chatbot funcionará en http://localhost:11434
```

### 5️⃣ Iniciar la App

```bash
# Opción A: Con npm/Vite
npm run dev

# Opción B: Con Python (simple)
python -m http.server 8000

# Visitar: http://localhost:8000 (o el puerto que uses)
```

---

## 📁 Estructura de Carpetas

```
plan-angelica-florez/
├── index.html                 # Versión original (6 semanas)
├── index-advanced.html        # Versión mejorada (todas features)
├── schema.sql                 # Definición de tablas Supabase
├── .env.example              # Template de variables
├── .env.local                # Tu configuración (NO COMMIT)
├── .gitignore                # Archivos a ignorar en git
├── README.md                 # Este archivo
│
├── js/                       # Código JavaScript
│   ├── config.js             # Configuración centralizada
│   ├── api-service.js        # Servicios (Ollama, Supabase, validación)
│   └── helpers.js            # Funciones de utilidad
│
├── css/                      # Estilos (opcional, si separas del HTML)
│   └── styles.css
│
└── docs/                     # Documentación adicional
    ├── SECURITY.md           # Guía de seguridad
    ├── SETUP.md              # Setup detallado
    └── API.md                # Documentación de APIs
```

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE: No Commitear `.env`

```bash
# ✅ BIEN - Estos archivos SÍ van a git
.env.example
.env.template

# ❌ NUNCA - Estos archivos NO van a git
.env
.env.local
.env.production
```

### Variables Seguras

**VITE_ (Frontend - Seguras)**
- `VITE_SUPABASE_URL` - URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave anonima (pública pero validada por RLS)
- `VITE_OLLAMA_API_URL` - URL de Ollama local

**Sin VITE_ (Backend - Sensibles)**
- `SUPABASE_SERVICE_ROLE_KEY` - NUNCA expongas en frontend
- `SMTP_PASS` - Contraseña de email
- `GOOGLE_SHEETS_API_KEY` - Solo en backend

### RLS (Row Level Security)

Todas las tablas en Supabase tienen RLS habilitado:

```sql
-- Usuarios solo pueden ver SUS PROPIOS datos
CREATE POLICY "Users can view own data"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);
```

Ver `schema.sql` para todas las políticas.

---

## 🔌 APIs Integradas

### Ollama (IA Local)

```javascript
import { OllamaService } from './js/api-service.js';

// Enviar mensaje
const response = await OllamaService.sendMessage(
  "¿Cómo me recupero mejor?",
  userContext
);

// Verificar disponibilidad
const isAvailable = await OllamaService.checkHealth();
```

### Supabase (Base de Datos)

```javascript
import { SupabaseService } from './js/api-service.js';

// Guardar perfil
await SupabaseService.saveProfile({
  user_id: userId,
  name: "Angélica",
  height_m: 1.70,
  weight_kg: 65
});

// Obtener histórico
const history = await SupabaseService.getWorkoutHistory(userId);

// Registrar entrenamiento
await SupabaseService.logWorkout({
  user_id: userId,
  day_name: "Lunes",
  week_number: 1,
  exercises_completed: 11,
  notes: "Excelente sesión"
});
```

---

## 📊 Datos Almacenados

### En Supabase (Persistente)
- Perfil del usuario
- Histórico de entrenamientos
- Mensajes de chat
- Recomendaciones personalizadas
- Reportes generados

### En localStorage (Local)
- Perfil (sincroniza con Supabase)
- Avatar (codificado como base64)
- Notas diarias
- Chat (backup local)

---

## 🛠️ Desarrollo

### Agregar Nueva Feature

1. **Crear archivo en `/js`**
   ```javascript
   // js/nueva-feature.js
   export async function miNuevaFuncion() {
     // Tu código
   }
   ```

2. **Importar en `index-advanced.html`**
   ```html
   <script type="module">
     import { miNuevaFuncion } from './js/nueva-feature.js';
   </script>
   ```

3. **Seguir patrones de seguridad**
   - Usar `sanitizeInput()` para datos del usuario
   - Validar con funciones de `api-service.js`
   - Loguear con `debugLog()` para desarrollo
   - Usar `CONFIG` para variables

### Testing

```bash
# Simular sin internet
# En DevTools: Network > Offline

# Ver logs de debug
# En index-advanced.html cambiar:
VITE_DEBUG_MODE=true

# Simular sin Ollama
# Comentar OllamaService en la sección de Chat
```

---

## 📦 Deploy

### Vercel (Recomendado)

```bash
# 1. Conectar repositorio a Vercel
# https://vercel.com/new

# 2. Configurar Environment Variables
# - Ir a Settings > Environment Variables
# - Agregar todas las VITE_* variables

# 3. Deploy
vercel deploy --prod
```

### Netlify

```bash
# 1. Conectar repo en https://netlify.com
# 2. Build settings:
# - Build command: npm run build (si usas)
# - Publish directory: . (raíz)
# 3. Environment variables en Settings
```

### Supabase Edge Functions (opcional)

Para ejecutar código backend sin servidor:

```bash
# supabase functions new generate-report
# supabase functions deploy generate-report
```

---

## 🐛 Troubleshooting

### "Ollama no responde"

```javascript
// 1. Verificar que está corriendo
// En PowerShell: ollama serve

// 2. Verificar URL
console.log(import.meta.env.VITE_OLLAMA_API_URL);

// 3. Test directo
fetch('http://localhost:11434/api/version')
  .then(r => r.json())
  .then(d => console.log(d));
```

### "Supabase error: 401"

```javascript
// 1. Verificar clave anonima
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);

// 2. Verificar RLS está habilitado
// En Supabase: Authentication > Policies

// 3. Verificar usuario está autenticado
// supabase.auth.getSession()
```

### "Variables de entorno no cargan"

```javascript
// Con Vite: variables DEBEN empezar con VITE_
// ✅ Bien: VITE_SUPABASE_URL
// ❌ Mal: SUPABASE_URL

// Recargar después de cambiar .env
// npm run dev (reinicia servidor)
```

---

## 📖 Documentación Adicional

- **[SECURITY.md](./docs/SECURITY.md)** - Guía completa de seguridad
- **[SETUP.md](./docs/SETUP.md)** - Setup paso a paso
- **[API.md](./docs/API.md)** - Documentación de funciones

---

## 📈 Roadmap

- [ ] Integración Google Fit
- [ ] Sincronización Apple Health
- [ ] Notificaciones push
- [ ] Exportar a Google Sheets
- [ ] Análisis de tendencias con gráficos
- [ ] Búddy system (invitar amigos)
- [ ] Retos y logros
- [ ] Video tutorials de ejercicios

---

## 📞 Soporte

¿Problemas? Revisa:
1. **Este README**
2. **[Troubleshooting](#-troubleshooting)**
3. **Documentación en `/docs`**
4. **Issues en GitHub**

---

## 📄 Licencia

Proyecto privado para Angélica Flórez. Todos los derechos reservados.

---

## 🎉 Credits

Construido con:
- **Vite** - Build tool
- **Supabase** - Backend
- **Ollama** - IA local
- **CSS3** - Styling moderno
- **Vanilla JS** - Sin frameworks

---

**Última actualización:** 2026-04-18  
**Versión:** 1.0.0  
**Ambiente:** Production-Ready ✅
