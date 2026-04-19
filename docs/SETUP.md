# 🚀 SETUP DETALLADO - Plan Angélica Flórez

Guía paso a paso para poner la aplicación funcionando en 15 minutos.

---

## ⏱️ REQUISITOS PREVIOS (5 minutos)

### 1. Ollama Instalado

```bash
# Ver si Ollama está instalado
ollama --version

# Si NO está instalado:
# Windows: https://ollama.ai/download/windows
# macOS: https://ollama.ai/download/mac
# Linux: curl https://ollama.ai/install.sh | sh
```

### 2. Modelo Descargado

```bash
# Verificar modelo
ollama list

# Deberías ver:
# NAME         ID          SIZE
# qwen3:8b     bf1bf5c08b96  5.5 GB

# Si NO está, descargarlo:
ollama pull qwen3:8b
# (Toma ~5 minutos en buena conexión)
```

### 3. Ollama Corriendo

```bash
# Abrir PowerShell y ejecutar:
ollama serve

# Deberías ver algo como:
# 2026/04/18 14:30:00 Listening on 127.0.0.1:11434 (http)
# (Dejar esta terminal abierta)
```

### 4. Verificar Conectividad

```bash
# En otra terminal, verificar que Ollama responde:
curl http://localhost:11434/api/version

# Resultado esperado:
# {"version":"0.21.0"}

# Si falla: ✅ Asegúrate que `ollama serve` está corriendo
```

---

## 📁 CONFIGURAR VARIABLES DE ENTORNO (3 minutos)

### Paso 1: Crear Archivo `.env.local`

En la raíz del proyecto (`F:\PAGINAS-WED-VIRALES\angelica-florez\`):

```bash
# Opción A: Desde terminal
cd F:\PAGINAS-WED-VIRALES\angelica-florez
cp .env.example .env.local

# Opción B: Manual
# 1. Copiar .env.example
# 2. Renombrar copia a .env.local
# 3. Guardar en F:\PAGINAS-WED-VIRALES\angelica-florez\
```

### Paso 2: Editar `.env.local`

```bash
# Abrir con editor de texto
# Dejar así (para desarrollo local):

VITE_OLLAMA_API_URL=http://localhost:11434
VITE_OLLAMA_MODEL=qwen3:8b
VITE_DEBUG_MODE=true
VITE_ENV=development

# OPCIONAL - Si usas Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Guardar archivo
```

### ✅ Verificar

```bash
# Comprobar que el archivo existe
ls -la F:\PAGINAS-WED-VIRALES\angelica-florez\.env.local

# Comprobar que NO está en git
git status | grep env
# (No debería aparecer .env.local)
```

---

## 🌐 EJECUTAR LA APLICACIÓN (5 minutos)

### Opción A: Con Python (Recomendado para desarrollo)

```bash
# 1. Abrir PowerShell en la carpeta del proyecto
cd F:\PAGINAS-WED-VIRALES\angelica-florez

# 2. Iniciar servidor local
python -m http.server 8000

# 3. Abrir navegador
# http://localhost:8000/index-advanced.html

# 4. Deberías ver:
# ✅ Página cargada
# ✅ Heat map visible
# ✅ Timer widget funcionando
# ✅ Chat ready (dice "Asistente IA conectado" si Ollama OK)
```

### Opción B: Con Node/Vite (Si tienes npm)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir navegador
# http://localhost:5173/index-advanced.html
```

### Opción C: Abrir HTML Directo (Sin servidor)

```bash
# ⚠️ SOLO funciona para features locales
# NO funciona para Ollama (CORS issues)

# Abrir archivo:
F:\PAGINAS-WED-VIRALES\angelica-florez\index-advanced.html
```

---

## 🤖 PROBAR CHATBOT IA (2 minutos)

### Pasos

1. **Abrir la aplicación**
   - Ve a http://localhost:8000/index-advanced.html

2. **Ir a sección Chat**
   - Busca el botón "💬 Chat IA"
   - O hace scroll hasta encontrar el chat widget

3. **Verificar Ollama conectado**
   - Deberías ver: "✅ Asistente IA conectado"
   - Si ves error: Verifica que `ollama serve` está corriendo

4. **Hacer primera pregunta**
   - Escribir: "Hola, ¿cómo funciona el programa de 6 semanas?"
   - Presionar Enter o botón "Enviar"
   - Esperar respuesta (~3-15 segundos)

5. **Si funciona ✅**
   ```
   Usuario: Hola, ¿cómo funciona el programa?
   IA: El programa consta de 6 semanas...
   ```

6. **Si falla ❌**
   - Ver sección Troubleshooting

---

## 💾 SUPABASE (OPCIONAL - 10 minutos)

### Si quieres sincronizar a la nube

1. **Crear cuenta en Supabase**
   - https://supabase.com

2. **Crear proyecto**
   - New Project
   - Seleccionar región (USA o Europa)
   - Crear

3. **Obtener credenciales**
   - Settings > API
   - Copiar `Project URL`
   - Copiar `anon public` key

4. **Actualizar `.env.local`**
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

5. **Crear tablas**
   - En Supabase: SQL Editor
   - Copiar contenido de `schema.sql`
   - Ejecutar (⏱️ ~30 segundos)

6. **Habilitar Auth**
   - Authentication > Settings
   - Enable signup: ON
   - Email verification: OFF (desarrollo)

7. **Verificar RLS**
   - Authentication > Policies
   - Todas las tablas deben tener RLS: ON

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### Checklist

```
CONFIGURACIÓN
☐ .env.local creado en carpeta correcta
☐ Variables de entorno correctas
☐ .env.local NO está en git

OLLAMA
☐ ollama serve ejecutando (en terminal separada)
☐ curl http://localhost:11434/api/version → {"version":"0.21.0"}
☐ Modelo qwen3:8b descargado (ollama list)

APLICACIÓN
☐ Servidor corriendo (python -m http.server 8000)
☐ Página carga: http://localhost:8000/index-advanced.html
☐ Todos los widgets visibles

CHAT IA
☐ Chat conectado: "✅ Asistente IA conectado"
☐ Puedo hacer preguntas
☐ IA responde (3-15 segundos)

FEATURES
☐ Heat map visible con días
☐ Timer funciona (start/stop)
☐ Botón "Marcar como completado" por día
☐ Perfil se puede editar
☐ Avatar se puede subir
☐ Reporte se descarga
```

---

## 🐛 TROUBLESHOOTING

### "Ollama no está disponible"

```
Error: "Ollama no está disponible en http://localhost:11434"

Solución:
1. Verificar que Ollama esté corriendo:
   - Abrir PowerShell nueva
   - Ejecutar: ollama serve
   - Deberías ver: "Listening on 127.0.0.1:11434"

2. Verificar puerto no está bloqueado:
   - netstat -ano | find "11434"
   - Si sale resultado = algo está usando puerto
   - Cambiar VITE_OLLAMA_API_URL en .env.local

3. Verificar firewall:
   - Windows Defender Firewall
   - Permitir Python acceso a red
```

### "¿De dónde descargo Ollama?"

```
https://ollama.ai/download

- Windows: .exe installer
- macOS: .dmg installer  
- Linux: curl script

Instalación:
1. Descargar
2. Instalar (next, next, finish)
3. Abrir PowerShell
4. Ejecutar: ollama serve
```

### "¿Cuánto espacio ocupa qwen3?"

```
Tamaño: ~5.5 GB
Tiempo descarga: 5-15 min (depende internet)

Primera vez que lo descargas:
ollama pull qwen3:8b

Luego está en cache, muy rápido.
```

### "Chat muy lento"

```
Posibles causas:
1. GPU no acelerada:
   - Ollama usa GPU si está disponible
   - Sin GPU: ~5-15 seg por respuesta
   - Con GPU: ~1-3 seg

2. CPU saturada:
   - Cerrar otras aplicaciones
   - Esperar a que Ollama termine proceso anterior

3. Modelo muy grande:
   - Cambiar a modelo más pequeño:
   VITE_OLLAMA_MODEL=mistral (4B - más rápido)
   VITE_OLLAMA_MODEL=neural-chat (7B)
   VITE_OLLAMA_MODEL=qwen3:8b (8B - balance)
```

### "El .env.local no funciona"

```
Verificar:
1. Está en la carpeta CORRECTA:
   F:\PAGINAS-WED-VIRALES\angelica-florez\.env.local
   
   NO AQUÍ:
   F:\PAGINAS-WED-VIRALES\.env.local  ❌
   C:\Users\erick\.env.local  ❌

2. No tiene extensión extra:
   .env.local  ✅
   .env.local.txt  ❌
   .env.local.bak  ❌

3. Formato correcto:
   VITE_KEY=value  ✅
   VITE_KEY = value  ❌ (espacios)
   VITE_KEY="value"  ❌ (comillas)

4. Si usas Vite:
   npm run dev
   (Debe recargar servidor después de cambios en .env)
```

---

## 📞 SOPORTE

### Si aún falla

1. **Ver console del navegador**
   - F12 > Console
   - ¿Hay errores rojos?
   - Copiar error exacto

2. **Ver logs de Ollama**
   - Terminal donde corre ollama serve
   - ¿Hay errores?

3. **Verificar archivos**
   - ¿Existe schema.sql?
   - ¿Existe .env.local?
   - ¿Existe js/config.js?
   - ¿Existe js/api-service.js?

4. **Reinicar todo**
   - Cerrar navegador
   - Cerrar terminal Ollama
   - Cerrar servidor Python
   - Esperar 5 segundos
   - Iniciar nuevamente en orden

---

## ✅ SUCCESS CHECKLIST

Cuando veas esto, ¡está 100% funcionando!

```
✅ Página cargada correctamente
✅ Heat map muestra días
✅ Timer inicia y cuenta atrás
✅ Chat dice "✅ Asistente IA conectado"
✅ Puedo escribir preguntas en chat
✅ Ollama responde en 3-15 segundos
✅ Puedo marcar días como completados
✅ Puedo subir foto de perfil
✅ Puedo descargar reporte
✅ Todo se guarda en localStorage
```

---

## 🚀 NEXT STEPS

### Después del setup

1. **Personalizar perfil**
   - Botón "👤 Mi Perfil"
   - Agregar tu información

2. **Hacer preguntas al chat**
   - "¿Cómo mejoro la forma en sentadillas?"
   - "¿Qué debo comer post-entrenamiento?"
   - "¿Cuándo descanso?"

3. **Usar programa**
   - Marcar días completados
   - Tomar notas
   - Seguir nutrición

4. **Sincronizar con Supabase** (opcional)
   - Setup de Supabase
   - Habilitar autenticación
   - Datos en la nube

---

**¿Necesitas ayuda?** Revisa [SECURITY.md](./SECURITY.md) o [README.md](../README.md)

Última actualización: 2026-04-18  
Versión: 1.0.0
