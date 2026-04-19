# 🔒 Guía de Seguridad - Plan Angélica Flórez

Documento completo sobre seguridad, protección de datos y best practices.

---

## 📋 Tabla de Contenidos

1. [Variables de Entorno](#-variables-de-entorno)
2. [Autenticación](#-autenticación)
3. [Row Level Security (RLS)](#-row-level-security)
4. [Validación de Inputs](#-validación-de-inputs)
5. [Encriptación](#-encriptación)
6. [API Security](#-api-security)
7. [Checklist de Seguridad](#-checklist-de-seguridad)

---

## 🔐 Variables de Entorno

### Clasificación

```
SEGURIDAD ALTA (No exponer nunca)
├─ Claves privadas (*.pem, *.key)
├─ Contraseñas
├─ Tokens de servicio
└─ SUPABASE_SERVICE_ROLE_KEY

SEGURIDAD MEDIA (Solo frontend con validación)
├─ VITE_SUPABASE_ANON_KEY (pública pero validada por RLS)
├─ VITE_SUPABASE_URL (pública)
└─ VITE_OLLAMA_API_URL (pública si es local)

SEGURIDAD BAJA (Públicas)
├─ Versión de app
├─ URLs públicas
└─ Configuración general
```

### Setup Correcto

```bash
# ✅ ARCHIVO: .env.local (GITIGNORED)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OLLAMA_API_URL=http://localhost:11434

# ✅ ARCHIVO: .env.example (TRACKED en git)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OLLAMA_API_URL=http://localhost:11434

# ❌ NUNCA GUARDES EN CÓDIGO
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Rotación de Claves

```javascript
// Cada mes, rotar claves sensibles:
// 1. En Supabase: Settings > API Tokens > Regenerate
// 2. Actualizar .env.local
// 3. Redeploy aplicación
// 4. Invalidar tokens antiguos en backend
```

---

## 🛡️ Autenticación

### Flujo de Autenticación

```
Usuario → Formulario Login
       ↓
Supabase Auth (encriptado)
       ↓
JWT Token generado
       ↓
Guardado en localStorage (SEGURO: Supabase lo maneja)
       ↓
Enviado en cada request (header Authorization)
```

### Implementación Segura

```javascript
// ✅ CORRECTO: Usar cliente de Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password-123' // NUNCA log esto
});

// ❌ INCORRECTO: Guardar contraseña
localStorage.setItem('password', userPassword); // NUNCA!
```

### Password Best Practices

```javascript
// ✅ Validar contraseña en cliente (UX)
function isStrongPassword(password) {
  return password.length >= 12 && // Mínimo 12 caracteres
         /[A-Z]/.test(password) && // Mayúscula
         /[a-z]/.test(password) && // Minúscula
         /[0-9]/.test(password) && // Número
         /[^A-Za-z0-9]/.test(password); // Especial
}

// ✅ Servidor valida además (seguridad)
// Supabase hace esto automáticamente
```

---

## 🔑 Row Level Security (RLS)

### Qué es RLS

RLS es una política de base de datos que **fuerza seguridad a nivel SQL**. Incluso si alguien tiene acceso directo a la DB, no puede leer datos ajenos.

```sql
-- Tabla de perfiles
CREATE POLICY "Users can only see own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- auth.uid() = ID del usuario autenticado
-- user_id = dueño del registro
-- Solo SI son iguales, permite el SELECT
```

### Políticas Implementadas

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| user_profiles | Solo propio | Solo propio | Solo propio | No |
| workout_history | Solo propio | Solo propio | Solo propio | No |
| exercise_logs | Solo propio | Solo propio | Solo propio | No |
| chat_messages | Solo propio | Solo propio | No | No |
| nutrition_logs | Solo propio | Solo propio | Solo propio | No |

### Verificar RLS está Habilitado

```sql
-- En Supabase SQL Editor, ejecutar:

-- 1. Ver todas las políticas
SELECT * FROM pg_policies
WHERE schemaname = 'public';

-- 2. Ver si RLS está habilitado en tabla
SELECT * FROM pg_tables
WHERE tablename = 'user_profiles';
-- result: row_security = true ✅

-- 3. Probar acceso no autorizado
SET request.jwt.claims = '{"sub": "user-2"}';
SELECT * FROM user_profiles
WHERE user_id = 'user-1';
-- result: (0 rows) - Correcto, no ve datos ajenos ✅
```

---

## ✅ Validación de Inputs

### En el Cliente

```javascript
// Siempre sanitizar datos del usuario
import { sanitizeInput, validateEmail } from './js/api-service.js';

// Función: sanitizeInput()
const userInput = sanitizeInput(document.querySelector('input').value);
// Previene XSS: <script>alert('xss')</script> → &lt;script&gt;...

// Función: validateEmail()
if (!validateEmail(email)) {
  showError('Email inválido');
  return;
}

// Función: validateRange()
if (!validateRange(weight, 30, 300)) {
  showError('Peso debe estar entre 30 y 300 kg');
  return;
}
```

### En Supabase (RLS + Check Constraints)

```sql
-- Base de datos rechaza valores inválidos
ALTER TABLE user_profiles
ADD CONSTRAINT valid_height
CHECK (height_m >= 1.4 AND height_m <= 2.3);

ALTER TABLE user_profiles
ADD CONSTRAINT valid_weight
CHECK (weight_kg >= 30 AND weight_kg <= 300);

-- Intenta insertar valor inválido → ERROR
INSERT INTO user_profiles (user_id, height_m, weight_kg)
VALUES ('user-1', 3.5, 25);
-- ERROR: new row violates check constraint "valid_height"
```

### Lista de Validaciones

```javascript
// Email
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Altura (metros)
1.4 <= height && height <= 2.3

// Peso (kg)
30 <= weight && weight <= 300

// Energía (1-5)
1 <= energy && energy <= 5

// Fecha válida
new Date(dateString) instanceof Date && !isNaN(dateString)

// Sin caracteres especiales peligrosos
!/[<>\"']/g.test(text)
```

---

## 🔐 Encriptación

### Datos en Tránsito (Transport Security)

```
HTTPS (TLS 1.3)
└─ Supabase ✅
└─ Vercel ✅
└─ Ollama local (no necesita, es localhost)
```

### Datos en Reposo (Storage)

```
localStorage (NO ENCRIPTADO - browser)
└─ Perfil (no sensible)
└─ Avatar (imagen base64)
└─ Notas (texto plano)

Supabase PostgreSQL (ENCRIPTADO)
└─ Tablas con RLS
└─ Backups encriptados automáticos
└─ Datos en reposo encriptados
```

### Implementar Encriptación Adicional (Opcional)

```javascript
// Si necesitas encriptar en cliente
import { AES } from 'https://cdn.jsdelivr.net/npm/crypto-js/crypto-js.min.js';

function encryptData(data, secretKey) {
  return AES.encrypt(JSON.stringify(data), secretKey).toString();
}

function decryptData(encrypted, secretKey) {
  const decrypted = AES.decrypt(encrypted, secretKey).toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}

// Guardar encriptado
const encrypted = encryptData(profileData, import.meta.env.VITE_ENCRYPTION_KEY);
localStorage.setItem('profile_encrypted', encrypted);
```

---

## 🌐 API Security

### Ollama (IA Local)

```javascript
// ✅ SEGURO: Corre localmente
// - No envía datos a servidores externos
// - Solo procesa en tu máquina
// - Conexión HTTP (OK porque es localhost)

const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    model: 'qwen3:8b',
    prompt: 'Tu pregunta aquí',
    stream: false
  })
});

// ❌ PELIGRO: Exponer Ollama en internet sin auth
// No hacer: listen 0.0.0.0:11434 sin proxy + auth
```

### Supabase API

```javascript
// ✅ SEGURO: Usa RLS + JWT
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId);
// Supabase valida JWT automáticamente + RLS

// ❌ PELIGRO: SQL Injection
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .filter('name', 'eq', userInput); // ¡SÍ! Parametrizado
  // NO HACER: .filter('name', 'eq', `'${userInput}'`) - Vulnerable!
```

### CORS (Cross-Origin)

```javascript
// Supabase maneja CORS automáticamente
// ✅ Permite requests desde https://yoursite.com
// ❌ Rechaza requests desde sitios maliciosos

// Verificar headers CORS en console
fetch('https://xxxx.supabase.co/rest/v1/user_profiles')
  .then(r => {
    console.log(r.headers.get('access-control-allow-origin'));
  });
```

---

## 🚨 CHECKLIST DE SEGURIDAD

### Antes de Producción

- [ ] **Variables de Entorno**
  - [ ] `.env.local` existe (GITIGNORED)
  - [ ] `.env.example` existe sin valores secretos
  - [ ] `.gitignore` incluye `.env*`
  - [ ] Todas las APIs están en `.env`

- [ ] **Base de Datos**
  - [ ] RLS habilitado en todas las tablas
  - [ ] Políticas correctas en cada tabla
  - [ ] Check constraints en datos numéricos
  - [ ] Backups configurados en Supabase
  - [ ] Logs habilitados

- [ ] **Autenticación**
  - [ ] Usuarios requieren password fuerte
  - [ ] Session timeout configurado
  - [ ] Email verification habilitado
  - [ ] 2FA recomendado (opcional)

- [ ] **Validación**
  - [ ] Todos los inputs se validan
  - [ ] sanitizeInput() usado en datos del usuario
  - [ ] Limites de tamaño en uploads
  - [ ] Rate limiting en endpoints

- [ ] **Código**
  - [ ] No hay console.log() con datos sensibles
  - [ ] No hay hardcoded API keys
  - [ ] No hay eval() o similar
  - [ ] Dependencias actualizadas

- [ ] **Deploy**
  - [ ] HTTPS habilitado
  - [ ] Headers de seguridad configurados
  - [ ] CSP (Content Security Policy) setup
  - [ ] Error handling no expone details

- [ ] **Monitoreo**
  - [ ] Logs de errores configurados
  - [ ] Alertas para actividad sospechosa
  - [ ] Backups testeados
  - [ ] Plan de recuperación ante desastres

---

## 🔄 Respuesta ante Incidentes

### Si detectas una brecha

```bash
# 1. INMEDIATO
# - Cambiar contraseña
# - Regenerar API keys en Supabase
# - Revocar tokens antiguos

# 2. DENTRO DE 1 HORA
# - Revisar logs en Supabase
# - Audit de qué datos se accedieron
# - Notificar a usuarios afectados

# 3. DENTRO DE 24 HORAS
# - Análisis de causa raíz
# - Implementar fix
# - Redeploy con seguridad mejorada

# 4. DOCUMENTAR
# - Qué pasó
# - Por qué pasó
# - Qué cambió para prevenir
```

---

## 📚 Referencias

- [Supabase Security](https://supabase.com/docs/guides/database/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Security](https://tools.ietf.org/html/rfc7519)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Última actualización:** 2026-04-18  
**Versión:** 1.0.0
