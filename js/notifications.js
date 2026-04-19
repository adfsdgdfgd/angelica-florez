/**
 * MÓDULO DE NOTIFICACIONES - Angélica Flórez PRO
 * Push notifications, toast messages y alertas en tiempo real
 */

const NotificationsModule = (() => {
    // Solicitar permisos para notificaciones push
    const requestPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    };

    // Enviar notificación push
    const sendPushNotification = (title, options = {}) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const defaultOptions = {
                icon: '💪',
                badge: '🏋️',
                requireInteraction: false,
                tag: 'angelica-florez', // Evita múltiples notificaciones iguales
                ...options
            };

            new Notification(title, defaultOptions);
        }
    };

    // Toast notifications (en pantalla)
    const showToast = (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;

        // Estilos inline si no existen en CSS
        if (!document.querySelector('style[data-toast]')) {
            const style = document.createElement('style');
            style.setAttribute('data-toast', 'true');
            style.textContent = `
                .toast {
                    position: fixed;
                    bottom: 1rem;
                    left: 1rem;
                    padding: 1rem 1.5rem;
                    background: var(--bg-card, #141f1a);
                    color: var(--text-light, #e0e0e0);
                    border: 2px solid var(--primary, #4fffb0);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    z-index: 10000;
                    animation: slideInLeft 0.3s ease;
                }
                .toast-error {
                    border-color: #ff6b6b;
                }
                .toast-warning {
                    border-color: #ffd166;
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    };

    // Notificaciones en tiempo real (similar a Discord)
    const showRealTimeNotification = (user, action, details = {}) => {
        const notifications = [
            { user: 'Camilo', action: 'guardó su rutina', icon: '💪' },
            { user: 'Andrés', action: 'compró el plan PRO', icon: '💳' },
            { user: 'María', action: 'completó la semana 2', icon: '✓' },
            { user: 'Carlos', action: 'realizó nuevo record', icon: '🏆' }
        ];

        const notification = notifications[Math.floor(Math.random() * notifications.length)];

        // Push notification
        sendPushNotification(`${notification.user} - ${notification.action}`, {
            body: details.body || 'Mira lo que está logrando en el plan',
            icon: notification.icon
        });

        // Toast notification
        showToast(`${notification.icon} ${notification.user} ${notification.action}`);
    };

    // Notificación de progreso
    const showProgressNotification = (weekNumber, dayName, percentage) => {
        sendPushNotification(`Semana ${weekNumber} - ${dayName}`, {
            body: `Progreso: ${percentage}%`,
            icon: '📈'
        });

        showToast(`✓ Guardaste progreso en ${dayName}`, 'success');
    };

    // Notificación de logro
    const showAchievementNotification = (achievement) => {
        const achievements = {
            'first_week': { title: 'Primera Semana Completada 🎉', icon: '🎉' },
            'streak_7': { title: '7 Días Seguidos 🔥', icon: '🔥' },
            'all_weeks': { title: 'Plan Completado 🏆', icon: '🏆' },
            'referral': { title: 'Referencia Exitosa 💚', icon: '💚' }
        };

        const ach = achievements[achievement] || { title: 'Logro Desbloqueado 🌟', icon: '🌟' };

        sendPushNotification(ach.title, {
            body: '¡Sigue así con tu transformación!',
            icon: ach.icon,
            requireInteraction: true // Requiere interacción del usuario
        });

        showToast(`${ach.icon} ${ach.title}`, 'success', 5000);
    };

    // Notificación de recordatorio
    const showReminderNotification = (type) => {
        const reminders = {
            workout: {
                title: 'Recordatorio de Entrenamiento',
                body: 'Es hora de tu sesión de hoy',
                icon: '💪'
            },
            nutrition: {
                title: 'Recordatorio de Nutrición',
                body: 'No olvides tomar agua y comer proteína',
                icon: '🥗'
            },
            rest: {
                title: 'Recordatorio de Descanso',
                body: 'Es importante dormir 7-8 horas',
                icon: '😴'
            }
        };

        const reminder = reminders[type] || reminders.workout;

        sendPushNotification(reminder.title, {
            body: reminder.body,
            icon: reminder.icon,
            requireInteraction: true
        });
    };

    // Notificación de error
    const showErrorNotification = (message) => {
        sendPushNotification('Error', {
            body: message,
            icon: '❌'
        });

        showToast(`Error: ${message}`, 'error', 5000);
    };

    // Badge API (icono de app con contador)
    const updateBadge = (count) => {
        if ('setAppBadge' in navigator) {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        }
    };

    // Service Worker para notificaciones en background
    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);
                requestPermission();
            } catch (error) {
                console.error('Error registrando Service Worker:', error);
            }
        }
    };

    // Auto-notificaciones (demostrativas)
    const startDemoNotifications = () => {
        const demoSequence = [
            {
                delay: 2000,
                fn: () => showRealTimeNotification('Camilo', 'guardó su rutina')
            },
            {
                delay: 5000,
                fn: () => showRealTimeNotification('Andrés', 'compró el plan PRO')
            },
            {
                delay: 8000,
                fn: () => showProgressNotification(1, 'Lunes', 50)
            },
            {
                delay: 11000,
                fn: () => showAchievementNotification('first_week')
            }
        ];

        demoSequence.forEach(item => {
            setTimeout(item.fn, item.delay);
        });
    };

    // Public API
    return {
        requestPermission,
        sendPushNotification,
        showToast,
        showRealTimeNotification,
        showProgressNotification,
        showAchievementNotification,
        showReminderNotification,
        showErrorNotification,
        updateBadge,
        registerServiceWorker,
        startDemoNotifications
    };
})();

// Auto-inicializar en carga
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        NotificationsModule.registerServiceWorker();
        NotificationsModule.startDemoNotifications();
    });
} else {
    NotificationsModule.registerServiceWorker();
    NotificationsModule.startDemoNotifications();
}
