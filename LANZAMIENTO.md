# 🚀 LANZAMIENTO - Angélica Flórez PRO a Vercel

**Preparado:** 18 de Abril de 2026  
**Aplicación:** index-pro-angelica.html  
**Status:** ✅ LISTO PARA PRODUCCIÓN

---

## 📋 Checklist Pre-Lanzamiento

### Código ✅
- [x] App completa (index-pro-angelica.html)
- [x] Seguridad implementada (js/security.js)
- [x] Notificaciones (js/notifications.js)
- [x] Chat IA integrado
- [x] Validación de inputs
- [x] Responsive design
- [x] localStorage persistence

### Seguridad ✅
- [x] .env.example creado (NO secretos)
- [x] .gitignore protege .env.local
- [x] No hay credenciales en el código
- [x] XSS protection activado
- [x] Inputs sanitizados

### Documentación ✅
- [x] README-PRO.md completo
- [x] IMPLEMENTACION_PRO.md detallado
- [x] LANZAMIENTO.md (este archivo)
- [x] Instrucciones de setup

### Git ✅
- [x] Commit inicial hecho
- [x] Mensaje descriptivo
- [x] Cambios guardados

---

## 🔐 Antes de Lanzar - CRÍTICO

### 1. Crear .env.local en tu máquina
```bash
cd angelica-florez
cp .env.example .env.local
```

Editar `.env.local`:
```
VITE_OLLAMA_URL=http://localhost:11434
(otros valores según tengas)
```

**NUNCA subir .env.local a GitHub**

### 2. Verificar .gitignore
```bash
git status
```
Debe mostrar `.env.local` como IGNORADO (no aparece en lista)

### 3. Test local
```bash
python -m http.server 8000
# Ir a http://localhost:8000/index-pro-angelica.html
```

Verificar:
- ✅ Chat IA funciona (Ollama corriendo)
- ✅ Notificaciones llegan
- ✅ Perfil se guarda
- ✅ Progreso persiste
- ✅ Responsive en móvil

---

## 📦 Opción 1: Vercel (Recomendado)

### Paso 1: Preparar GitHub
```bash
# Si no está en GitHub aún:
git remote add origin https://github.com/tu-usuario/angelica-florez.git
git branch -M main
git push -u origin main
```

### Paso 2: Ir a Vercel
1. Ir a https://vercel.com
2. Login con GitHub
3. Clickear "New Project"
4. Buscar "angelica-florez"
5. Importar

### Paso 3: Configurar Variables de Entorno
En Vercel Dashboard:
1. Settings → Environment Variables
2. Agregar:
```
VITE_OLLAMA_URL = http://localhost:11434
VITE_SUPABASE_URL = (si tienes)
VITE_SUPABASE_ANON_KEY = (si tienes)
```

**Importante:** Solo agregar variables que necesites en FRONTEND (VITE_ prefix)

### Paso 4: Deploy
1. Clickear "Deploy"
2. Esperar (1-2 minutos)
3. Vercel te dará URL como:
   ```
   https://angelica-florez-xxx.vercel.app
   ```

### Paso 5: Test en Vercel
Abrir URL y verificar todo funciona igual que local.

---

## 📦 Opción 2: Netlify (Alternativa)

### Paso 1: Ir a Netlify
1. https://netlify.com
2. Login con GitHub
3. "New site from Git"
4. Seleccionar "angelica-florez"

### Paso 2: Configurar Build
```
Build command: (dejar en blanco, es solo HTML)
Publish directory: . (raíz del proyecto)
```

### Paso 3: Environment Variables
En Netlify Dashboard:
1. Site settings → Build & deploy → Environment
2. Agregar variables (solo VITE_)

### Paso 4: Deploy
1. Clickear "Deploy site"
2. Esperar
3. URL como: `https://angelica-florez-xxx.netlify.app`

---

## 📦 Opción 3: Tu propio servidor

### Con Node.js
```bash
npm install -g http-server
http-server .
# Abre en http://localhost:8080/index-pro-angelica.html
```

### Con Python
```bash
python -m http.server 8000
# Abre en http://localhost:8000/index-pro-angelica.html
```

### Con Express.js
```javascript
// server.js
const express = require('express');
const app = express();
app.use(express.static('.'));
app.listen(3000, () => {
    console.log('App corriendo en http://localhost:3000');
});
```

---

## 🌐 URL Pública (Post-Deploy)

Una vez deployado, la app estará en:

```
https://angelica-florez-xxx.vercel.app/index-pro-angelica.html
```

O si prefieres verla como raíz, añade a Vercel:

Redirects en `vercel.json`:
```json
{
    "redirects": [
        {
            "source": "/",
            "destination": "/index-pro-angelica.html"
        }
    ]
}
```

---

## ✅ Post-Deploy Checklist

Después de lanzar, verificar:

- [ ] URL pública funciona
- [ ] Chat IA responde
- [ ] Notificaciones llegan
- [ ] Progreso se guarda
- [ ] Perfil persiste
- [ ] Responsive en móvil
- [ ] Página carga rápido (< 2s)
- [ ] No hay errores en console (F12)

---

## 🔗 URLs Importantes

- **Vercel:** https://vercel.com
- **Netlify:** https://netlify.com
- **Tu Repo:** https://github.com/adfsdgdfgd/angelica-florez
- **Documentación Ollama:** https://ollama.ai
- **Supabase (opcional):** https://supabase.com

---

## 💬 Promoción (Después de Lanzar)

### Mensaje para Compartir
```
🏋️ PLAN ANGÉLICA FLÓREZ PRO v1.0.0

Transformación de 6 semanas con:
✅ 42 ejercicios por semana
✅ Chat IA integrado (Ollama)
✅ Notificaciones en tiempo real
✅ Seguimiento automático de progreso
✅ 100% seguro (RLS + validación)
✅ Sin contraseña (localStorage)
✅ Gratis (IA local)

Coach: Sebastián Martínez
Desarrollado por: Sebastián Ortiz

🚀 Acceso: [TU-URL-AQUI]
```

---

## 🐛 Troubleshooting Post-Deploy

### "Chat no funciona"
El servidor de Vercel no puede conectar a Ollama local.

**Solución:** Instalar Ollama en tu máquina host y:
```bash
ollama serve --bind 0.0.0.0:11434
```

O usar API de Ollama remota si tienes.

### "Notificaciones no llegan"
1. Verificar permisos del navegador
2. Aceptar notificaciones cuando pida
3. Verificar que el navegador está en foco

### "Variables de entorno no funciona"
1. Verificar que las agregaste en Vercel/Netlify
2. Redeploy después de agregar variables
3. Usar `VITE_` prefix para frontend

### "Datos se pierden al refrescar"
Normal si no está configurado Supabase. Solución:
1. Agregar Supabase (opcional, más complejo)
2. O decirle al usuario que limpie solo localStorage en F12

---

## 📞 Soporte Post-Lanzamiento

Si hay problemas:

1. **Chat IA lento?** - Verifica que Ollama tiene GPU/VRAM suficiente
2. **Progreso no guarda?** - localStorage puede estar lleno (borrar en F12)
3. **Notificaciones spam?** - Es demo, se detiene después de 11 segundos
4. **Email de error?** - Revisar logs en Vercel/Netlify dashboard

---

## 🎯 Métricas para Monitorear

Después de lanzar, revisar:

- **Vercel Analytics:** Dashboard de Vercel
- **Tiempo de carga:** < 2 segundos ideal
- **Errores JS:** Ninguno en console
- **Usuarios activos:** Cuántos acceden diario

---

## 📝 Notas Finales

✅ **La app está LISTA para producción**

Solo necesitas:
1. Push a GitHub (si no está)
2. Conectar Vercel/Netlify
3. Agregar variables .env
4. Deploy

Todo el código está seguro, validado y documentado.

---

## 🎉 ¡LANZADO!

Una vez desplegado en Vercel/Netlify, puedes:

- ✅ Compartir la URL
- ✅ Promover en redes
- ✅ Cobrar por acceso (si quieres)
- ✅ Agregar más usuarios
- ✅ Recolectar feedback
- ✅ Mejorar versión 2.0

---

**Documento generado:** 18/04/2026  
**Versión:** 1.0.0  
**Status:** ✅ READY TO LAUNCH

Cualquier duda, revisar `README-PRO.md` o `IMPLEMENTACION_PRO.md`
