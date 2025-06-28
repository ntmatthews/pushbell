/**
 * PushBell Notification API Module
 * Cross-browser compatible notification system with fallbacks
 */

class NotificationAPI {
    constructor() {
        this.isSupported = this.checkSupport();
        this.permission = this.getPermissionStatus();
        this.fallbackQueue = [];
        this.serviceWorkerRegistration = null;

        this.init();
    }

    /**
     * Initialize the notification system
     */
    async init() {
        // Register service worker for enhanced functionality
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }

        // Listen for permission changes
        this.watchPermissionChanges();

        // WebKit and Safari compatibility enhancements
        await this.initWebKitSupport();
    }

    /**
     * Check if notifications are supported
     */
    checkSupport() {
        const support = {
            basic: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            persistent: 'serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype,
            actions: 'actions' in Notification.prototype || ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype),
            badge: 'badge' in Notification.prototype,
            image: 'image' in Notification.prototype,
            renotify: 'renotify' in Notification.prototype,
            requireInteraction: 'requireInteraction' in Notification.prototype,
            silent: 'silent' in Notification.prototype,
            timestamp: 'timestamp' in Notification.prototype,
            vibrate: 'vibrate' in Notification.prototype
        };

        return support;
    }

    /**
     * Get current permission status
     */
    getPermissionStatus() {
        if (!this.isSupported.basic) return 'unsupported';
        return Notification.permission;
    }

    /**
     * Watch for permission changes
     */
    watchPermissionChanges() {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'notifications' }).then(permissionStatus => {
                permissionStatus.onchange = () => {
                    this.permission = this.getPermissionStatus();
                    this.onPermissionChange(this.permission);
                };
            }).catch(error => {
                console.warn('Permission query not supported:', error);
            });
        }
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isSupported.basic) {
            throw new Error('Notifications are not supported in this browser');
        }

        try {
            // Use the modern promise-based API if available
            if (Notification.requestPermission.length === 0) {
                this.permission = await Notification.requestPermission();
            } else {
                // Fallback for older browsers
                this.permission = await new Promise(resolve => {
                    Notification.requestPermission(resolve);
                });
            }

            this.onPermissionChange(this.permission);
            return this.permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            throw error;
        }
    }

    /**
     * Show a basic notification
     */
    async showBasicNotification(title, options = {}) {
        if (!this.canShowNotifications()) {
            return this.showFallback(title, options);
        }

        const defaultOptions = {
            body: 'This is a basic notification from PushBell',
            icon: this.getDefaultIcon(),
            badge: this.getDefaultBadge(),
            tag: 'pushbell-basic',
            timestamp: Date.now(),
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);
            this.setupNotificationEvents(notification);
            return notification;
        } catch (error) {
            console.error('Error showing basic notification:', error);
            return this.showFallback(title, options);
        }
    }

    /**
     * Show a rich notification with image and additional options
     */
    async showRichNotification(title, options = {}) {
        if (!this.canShowNotifications()) {
            return this.showFallback(title, options);
        }

        const defaultOptions = {
            body: 'This is a rich notification with enhanced features',
            icon: this.getDefaultIcon(),
            badge: this.getDefaultBadge(),
            image: this.getDefaultImage(),
            tag: 'pushbell-rich',
            timestamp: Date.now(),
            requireInteraction: false,
            silent: false,
            ...options
        };

        try {
            // Use service worker for rich notifications if available
            if (this.serviceWorkerRegistration && this.isSupported.persistent) {
                await this.serviceWorkerRegistration.showNotification(title, defaultOptions);
                return { type: 'service-worker', title, options: defaultOptions };
            } else {
                const notification = new Notification(title, defaultOptions);
                this.setupNotificationEvents(notification);
                return notification;
            }
        } catch (error) {
            console.error('Error showing rich notification:', error);
            return this.showFallback(title, options);
        }
    }

    /**
     * Show notification with action buttons
     */
    async showActionNotification(title, options = {}) {
        if (!this.canShowNotifications()) {
            return this.showFallback(title, options);
        }

        const defaultOptions = {
            body: 'This notification has action buttons you can interact with',
            icon: this.getDefaultIcon(),
            badge: this.getDefaultBadge(),
            tag: 'pushbell-actions',
            timestamp: Date.now(),
            requireInteraction: true,
            actions: [
                {
                    action: 'yes',
                    title: 'Yes',
                    icon: '✅'
                },
                {
                    action: 'no',
                    title: 'No',
                    icon: '❌'
                },
                {
                    action: 'later',
                    title: 'Remind Later',
                    icon: '⏰'
                }
            ],
            ...options
        };

        try {
            // Actions only work with service worker notifications
            if (this.serviceWorkerRegistration && this.isSupported.persistent) {
                await this.serviceWorkerRegistration.showNotification(title, defaultOptions);
                return { type: 'service-worker', title, options: defaultOptions };
            } else {
                // Fall back to basic notification without actions
                const { actions, ...basicOptions } = defaultOptions;
                const notification = new Notification(title, basicOptions);
                this.setupNotificationEvents(notification);
                return notification;
            }
        } catch (error) {
            console.error('Error showing action notification:', error);
            return this.showFallback(title, options);
        }
    }

    /**
     * Show custom notification with user-defined options
     */
    async showCustomNotification(title, customOptions = {}) {
        if (!this.canShowNotifications()) {
            return this.showFallback(title, customOptions);
        }

        const options = {
            icon: this.getDefaultIcon(),
            badge: this.getDefaultBadge(),
            tag: 'pushbell-custom',
            timestamp: Date.now(),
            ...customOptions
        };

        try {
            if (this.serviceWorkerRegistration && this.isSupported.persistent && (options.actions || options.image)) {
                await this.serviceWorkerRegistration.showNotification(title, options);
                return { type: 'service-worker', title, options };
            } else {
                const notification = new Notification(title, options);
                this.setupNotificationEvents(notification);
                return notification;
            }
        } catch (error) {
            console.error('Error showing custom notification:', error);
            return this.showFallback(title, options);
        }
    }

    /**
     * Setup event listeners for notifications
     */
    setupNotificationEvents(notification) {
        notification.onclick = (event) => {
            console.log('Notification clicked:', event);
            this.onNotificationClick(event, notification);
            notification.close();
        };

        notification.onclose = (event) => {
            console.log('Notification closed:', event);
            this.onNotificationClose(event, notification);
        };

        notification.onerror = (event) => {
            console.error('Notification error:', event);
            this.onNotificationError(event, notification);
        };

        notification.onshow = (event) => {
            console.log('Notification shown:', event);
            this.onNotificationShow(event, notification);
        };
    }

    /**
     * Check if notifications can be shown
     */
    canShowNotifications() {
        return this.isSupported.basic && this.permission === 'granted';
    }

    /**
     * Fallback for unsupported browsers or denied permissions
     */
    showFallback(title, options = {}) {
        const fallback = {
            title,
            body: options.body || 'Notification fallback',
            timestamp: Date.now(),
            type: 'fallback'
        };

        this.fallbackQueue.push(fallback);
        this.onFallbackNotification(fallback);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const index = this.fallbackQueue.indexOf(fallback);
            if (index > -1) {
                this.fallbackQueue.splice(index, 1);
            }
        }, 5000);

        return fallback;
    }

    /**
     * Get default icon
     */
    getDefaultIcon() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNFY3LjVDMTcgOS41IDE5IDEyLjM0IDE5IDE2VjE4SDIxVjIwSDNWMThINVYxNkM1IDEyLjM0IDggOS41IDEwIDcuNVY0QzEwIDIuOSAxMC45IDIgMTIgMlpNMTIgMjJDMTMuMSAyMiAxNCAyMS4xIDE0IDIwSDEwQzEwIDIxLjEgMTAuOSAyMiAxMiAyMloiLz4KPC9zdmc+Cjwvc3ZnPg==';
    }

    /**
     * Get default badge
     */
    getDefaultBadge() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmNTY1NjUiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkMxMy4xIDIgMTQgMi45IDE0IDRWNy41QzE3IDkuNSAxOSAxMi4zNCAxOSAxNlYxOEgyMVYyMEgzVjE4SDVWMTZDNSAxMi4zNCA4IDkuNSAxMCA3LjVWNEMxMCAyLjkgMTAuOSAyIDEyIDJaTTEyIDIyQzEzLjEgMjIgMTQgMjEuMSAxNCAyMEgxMEMxMCAyMS4xIDEwLjkgMjIgMTIgMjJaIi8+Cjwvc3ZnPgo8L3N2Zz4=';
    }

    /**
     * Get default image
     */
    getDefaultImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8Y2lyY2xlIGN4PSIxNjAiIGN5PSI5MCIgcj0iNDAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8Y2lyY2xlIGN4PSIxNjAiIGN5PSI5MCIgcj0iMjAiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCIgeTE9IjAiIHgyPSIzMjAiIHkyPSIxODAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2N2VlYSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=';
    }

    /**
     * Browser compatibility detection
     */
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        const browsers = {
            chrome: {
                name: 'Chrome',
                icon: 'fab fa-chrome',
                detect: () => /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
                support: {
                    basic: true,
                    persistent: true,
                    actions: true,
                    badge: true,
                    image: true,
                    requireInteraction: true,
                    silent: true,
                    timestamp: true,
                    vibrate: true
                }
            },
            firefox: {
                name: 'Firefox',
                icon: 'fab fa-firefox',
                detect: () => /Firefox/.test(userAgent),
                support: {
                    basic: true,
                    persistent: true,
                    actions: true,
                    badge: false,
                    image: true,
                    requireInteraction: true,
                    silent: true,
                    timestamp: true,
                    vibrate: true
                }
            },
            safari: {
                name: 'Safari',
                icon: 'fab fa-safari',
                detect: () => /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
                support: {
                    basic: true,
                    persistent: false,
                    actions: false,
                    badge: false,
                    image: false,
                    requireInteraction: false,
                    silent: true,
                    timestamp: true,
                    vibrate: false
                }
            },
            edge: {
                name: 'Edge',
                icon: 'fab fa-edge',
                detect: () => /Edg/.test(userAgent),
                support: {
                    basic: true,
                    persistent: true,
                    actions: true,
                    badge: true,
                    image: true,
                    requireInteraction: true,
                    silent: true,
                    timestamp: true,
                    vibrate: true
                }
            },
            opera: {
                name: 'Opera',
                icon: 'fab fa-opera',
                detect: () => /OPR/.test(userAgent),
                support: {
                    basic: true,
                    persistent: true,
                    actions: true,
                    badge: true,
                    image: true,
                    requireInteraction: true,
                    silent: true,
                    timestamp: true,
                    vibrate: true
                }
            }
        };

        for (const [key, browser] of Object.entries(browsers)) {
            if (browser.detect()) {
                return { key, ...browser };
            }
        }

        return {
            key: 'unknown',
            name: 'Unknown Browser',
            icon: 'fas fa-globe',
            support: this.isSupported
        };
    }

    /**
     * WebKit and Safari compatibility enhancements
     */
    async initWebKitSupport() {
        // Safari-specific notification permission handling
        if (this.isSafari()) {
            // Override permission check for Safari
            this.originalRequestPermission = Notification.requestPermission;

            // Add Safari-specific permission request
            Notification.requestPermission = async () => {
                return new Promise((resolve) => {
                    if (this.originalRequestPermission.length === 0) {
                        this.originalRequestPermission().then(resolve);
                    } else {
                        this.originalRequestPermission(resolve);
                    }
                });
            };
        }

        // WebKit mobile detection and handling
        if (this.isWebKitMobile()) {
            this.setupWebKitMobileFallbacks();
        }
    }

    /**
     * Check if browser is Safari
     */
    isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    /**
     * Check if browser is WebKit mobile (iOS Safari, etc.)
     */
    isWebKitMobile() {
        return /WebKit/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent);
    }

    /**
     * Setup WebKit mobile-specific fallbacks
     */
    setupWebKitMobileFallbacks() {
        // iOS doesn't support many notification features
        this.isSupported.persistent = false;
        this.isSupported.actions = false;
        this.isSupported.badge = false;
        this.isSupported.image = false;
        this.isSupported.requireInteraction = false;
        this.isSupported.vibrate = false;

        // Add touch feedback for mobile
        document.addEventListener('touchstart', () => {
            // Enable notifications on first touch for iOS
            this.userInteracted = true;
        });
    }

    // Event handlers (to be overridden by the app)
    onPermissionChange(permission) { }
    onNotificationClick(event, notification) { }
    onNotificationClose(event, notification) { }
    onNotificationError(event, notification) { }
    onNotificationShow(event, notification) { }
    onFallbackNotification(fallback) { }
}

// Export for use in other files
window.NotificationAPI = NotificationAPI;
