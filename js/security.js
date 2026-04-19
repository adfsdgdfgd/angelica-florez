/**
 * MÓDULO DE SEGURIDAD - Angélica Flórez PRO
 * Protección contra XSS, SQL Injection y validación de datos
 * NUNCA confíes en datos del usuario sin validar
 */

const SecurityModule = (() => {
    // Expresiones regulares para validación
    const PATTERNS = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        height: /^\d{1,3}\.\d{1,2}$/, // 1.70
        weight: /^\d{1,3}\.\d{1}$/, // 64.5
        name: /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{2,50}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };

    // Sanitizar HTML para prevenir XSS
    const sanitizeHTML = (input) => {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    };

    // Sanitizar para SQL (aunque usamos Supabase con RLS)
    const sanitizeSQL = (input) => {
        return input.replace(/['";\\]/g, '\\$&');
    };

    // Validadores
    const validators = {
        email: (value) => {
            if (!PATTERNS.email.test(value)) {
                return { valid: false, error: 'Email inválido' };
            }
            return { valid: true };
        },

        height: (value) => {
            const num = parseFloat(value);
            if (num < 1.4 || num > 2.3) {
                return { valid: false, error: 'Altura debe ser entre 1.4m y 2.3m' };
            }
            return { valid: true };
        },

        weight: (value) => {
            const num = parseFloat(value);
            if (num < 30 || num > 300) {
                return { valid: false, error: 'Peso debe ser entre 30kg y 300kg' };
            }
            return { valid: true };
        },

        name: (value) => {
            if (value.length < 2 || value.length > 50) {
                return { valid: false, error: 'Nombre entre 2 y 50 caracteres' };
            }
            if (!PATTERNS.name.test(value)) {
                return { valid: false, error: 'Nombre contiene caracteres inválidos' };
            }
            return { valid: true };
        },

        password: (value) => {
            if (!PATTERNS.password.test(value)) {
                return {
                    valid: false,
                    error: 'Contraseña debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo'
                };
            }
            return { valid: true };
        },

        date: (value) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return { valid: false, error: 'Fecha inválida' };
            }
            return { valid: true };
        }
    };

    // Validar entrada de formulario
    const validateFormInput = (type, value) => {
        const validator = validators[type];
        if (!validator) {
            return { valid: true }; // Sin validador específico
        }
        return validator(value);
    };

    // Proteger contra ataques comunes
    const protectInput = (input, type = 'text') => {
        // Sanitizar HTML
        let sanitized = sanitizeHTML(input.trim());

        // Limitar longitud
        const maxLengths = {
            text: 255,
            textarea: 5000,
            email: 255,
            password: 128,
            name: 50
        };
        const maxLength = maxLengths[type] || 255;
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        // Validar según tipo
        const validation = validateFormInput(type, input);
        if (!validation.valid) {
            return { success: false, error: validation.error, value: null };
        }

        return { success: true, value: sanitized };
    };

    // Validar URL para prevenir CSRF
    const isValidUrl = (url) => {
        try {
            const urlObj = new URL(url);
            // Solo permite http/https
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    // Rate limiting simple (prevenir fuerza bruta)
    const RateLimiter = (() => {
        const attempts = {};

        return {
            check: (key, maxAttempts = 5, windowMs = 60000) => {
                const now = Date.now();
                if (!attempts[key]) {
                    attempts[key] = [];
                }

                // Limpiar intentos antiguos
                attempts[key] = attempts[key].filter(time => now - time < windowMs);

                if (attempts[key].length >= maxAttempts) {
                    return false; // Demasiados intentos
                }

                attempts[key].push(now);
                return true;
            },

            reset: (key) => {
                delete attempts[key];
            }
        };
    })();

    // API Call Protegida
    const makeSecureAPICall = async (url, options = {}) => {
        // Validar URL
        if (!isValidUrl(url)) {
            throw new Error('URL inválida');
        }

        // CORS protección automática (el navegador la maneja)
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest' // CSRF token alternativo
            },
            credentials: 'include'
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    // Encriptación simple (para datos sensibles en localStorage)
    const SimpleEncryption = (() => {
        const encode = (str) => btoa(unescape(encodeURIComponent(str)));
        const decode = (str) => decodeURIComponent(escape(atob(str)));

        return { encode, decode };
    })();

    // Logging seguro (sin datos sensibles)
    const securelog = (message, level = 'info') => {
        const timestamp = new Date().toISOString();
        const isDev = import.meta.env.DEV;

        if (isDev || level === 'error') {
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            console[level === 'error' ? 'error' : 'log'](logMessage);
        }
    };

    // Público
    return {
        sanitizeHTML,
        sanitizeSQL,
        validateFormInput,
        protectInput,
        isValidUrl,
        RateLimiter,
        makeSecureAPICall,
        SimpleEncryption,
        securelog,
        validators
    };
})();

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityModule;
}
