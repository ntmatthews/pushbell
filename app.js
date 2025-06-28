/**
 * PushBell Application Logic
 * Main application controller for the notification demo
 */

class PushBellApp {
    constructor() {
        this.notificationAPI = new NotificationAPI();
        this.logContainer = document.getElementById('logContainer');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.setupEventListeners();
        this.setupNotificationEventHandlers();
        this.updateUI();
        this.renderCompatibility();
        this.log('PushBell application initialized', 'info');
    }

    /**
     * Setup event listeners for UI elements
     */
    setupEventListeners() {
        // Permission request button
        document.getElementById('requestPermission').addEventListener('click', async () => {
            try {
                this.log('Requesting notification permission...', 'info');
                const permission = await this.notificationAPI.requestPermission();
                this.log(`Permission ${permission}`, permission === 'granted' ? 'success' : 'warning');
                this.updateUI();
            } catch (error) {
                this.log(`Error requesting permission: ${error.message}`, 'error');
            }
        });

        // Simple notification button
        document.getElementById('simpleNotification').addEventListener('click', async () => {
            try {
                this.log('Showing simple notification...', 'info');
                const notification = await this.notificationAPI.showBasicNotification(
                    'Simple Notification',
                    { body: 'This is a basic notification from PushBell demo!' }
                );
                this.log('Simple notification shown successfully', 'success');
            } catch (error) {
                this.log(`Error showing simple notification: ${error.message}`, 'error');
            }
        });

        // Rich notification button
        document.getElementById('richNotification').addEventListener('click', async () => {
            try {
                this.log('Showing rich notification...', 'info');
                const notification = await this.notificationAPI.showRichNotification(
                    'Rich Notification',
                    {
                        body: 'This notification has an image and enhanced styling!',
                        requireInteraction: document.getElementById('requireInteraction').checked,
                        silent: document.getElementById('silent').checked,
                        renotify: document.getElementById('renotify').checked
                    }
                );
                this.log('Rich notification shown successfully', 'success');
            } catch (error) {
                this.log(`Error showing rich notification: ${error.message}`, 'error');
            }
        });

        // Action notification button
        document.getElementById('actionNotification').addEventListener('click', async () => {
            try {
                this.log('Showing action notification...', 'info');
                const notification = await this.notificationAPI.showActionNotification(
                    'Action Notification',
                    {
                        body: 'This notification has action buttons you can click!',
                        requireInteraction: true,
                        silent: document.getElementById('silent').checked,
                        renotify: document.getElementById('renotify').checked
                    }
                );
                this.log('Action notification shown successfully', 'success');
            } catch (error) {
                this.log(`Error showing action notification: ${error.message}`, 'error');
            }
        });

        // Custom notification with user input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.showCustomNotification();
            }
        });

        // Add custom notification button functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('#customTitle') || e.target.closest('#customBody')) {
                // Add a temporary "Send Custom" button when user types in custom fields
                this.addCustomNotificationButton();
            }
        });

        // Clear log button
        document.getElementById('clearLog').addEventListener('click', () => {
            this.clearLog();
        });

        // Auto-update UI when permission changes
        setInterval(() => {
            const currentPermission = this.notificationAPI.getPermissionStatus();
            if (currentPermission !== this.lastPermission) {
                this.lastPermission = currentPermission;
                this.updateUI();
            }
        }, 1000);
    }

    /**
     * Setup notification event handlers
     */
    setupNotificationEventHandlers() {
        this.notificationAPI.onPermissionChange = (permission) => {
            this.log(`Permission changed to: ${permission}`, 'info');
            this.updateUI();
        };

        this.notificationAPI.onNotificationClick = (event, notification) => {
            this.log(`Notification clicked: ${notification.title}`, 'info');
            // Focus the window when notification is clicked
            if (window.focus) window.focus();
        };

        this.notificationAPI.onNotificationClose = (event, notification) => {
            this.log(`Notification closed: ${notification.title}`, 'info');
        };

        this.notificationAPI.onNotificationError = (event, notification) => {
            this.log(`Notification error: ${notification.title}`, 'error');
        };

        this.notificationAPI.onNotificationShow = (event, notification) => {
            this.log(`Notification displayed: ${notification.title}`, 'success');
        };

        this.notificationAPI.onFallbackNotification = (fallback) => {
            this.log(`Fallback notification: ${fallback.title}`, 'warning');
            this.showInAppNotification(fallback);
        };
    }

    /**
     * Update UI based on current state
     */
    updateUI() {
        const permission = this.notificationAPI.getPermissionStatus();
        const isSupported = this.notificationAPI.isSupported.basic;

        // Update status indicator
        this.statusIndicator.className = 'status-indicator';

        if (!isSupported) {
            this.statusIndicator.classList.add('status-unsupported');
            this.statusText.textContent = 'Notifications not supported in this browser';
        } else {
            switch (permission) {
                case 'granted':
                    this.statusIndicator.classList.add('status-granted');
                    this.statusText.textContent = 'Notifications are enabled';
                    break;
                case 'denied':
                    this.statusIndicator.classList.add('status-denied');
                    this.statusText.textContent = 'Notifications are blocked';
                    break;
                case 'default':
                    this.statusIndicator.classList.add('status-default');
                    this.statusText.textContent = 'Permission not requested yet';
                    break;
            }
        }

        // Update button states
        const requestBtn = document.getElementById('requestPermission');
        const simpleBtn = document.getElementById('simpleNotification');
        const richBtn = document.getElementById('richNotification');
        const actionBtn = document.getElementById('actionNotification');

        if (!isSupported) {
            requestBtn.disabled = true;
            simpleBtn.disabled = true;
            richBtn.disabled = true;
            actionBtn.disabled = true;
            requestBtn.textContent = 'Not Supported';
        } else {
            requestBtn.disabled = permission !== 'default';
            const canShow = permission === 'granted';
            simpleBtn.disabled = !canShow;
            richBtn.disabled = !canShow;
            actionBtn.disabled = !canShow;

            if (permission === 'granted') {
                requestBtn.innerHTML = '<i class="fas fa-check"></i> Permission Granted';
            } else if (permission === 'denied') {
                requestBtn.innerHTML = '<i class="fas fa-ban"></i> Permission Denied';
            } else {
                requestBtn.innerHTML = '<i class="fas fa-unlock"></i> Request Permission';
            }
        }
    }

    /**
     * Add custom notification button
     */
    addCustomNotificationButton() {
        if (document.getElementById('customNotificationBtn')) return;

        const button = document.createElement('button');
        button.id = 'customNotificationBtn';
        button.className = 'btn btn-info';
        button.innerHTML = '<i class="fas fa-paper-plane"></i> Send Custom';
        button.style.marginTop = '10px';
        button.style.width = '100%';

        button.addEventListener('click', () => this.showCustomNotification());

        const customBody = document.getElementById('customBody');
        customBody.parentNode.appendChild(button);
    }

    /**
     * Show custom notification with user input
     */
    async showCustomNotification() {
        const title = document.getElementById('customTitle').value.trim() || 'Custom Notification';
        const body = document.getElementById('customBody').value.trim() || 'This is a custom notification!';

        const options = {
            body,
            requireInteraction: document.getElementById('requireInteraction').checked,
            silent: document.getElementById('silent').checked,
            renotify: document.getElementById('renotify').checked
        };

        try {
            this.log(`Showing custom notification: "${title}"`, 'info');
            const notification = await this.notificationAPI.showCustomNotification(title, options);
            this.log('Custom notification shown successfully', 'success');
        } catch (error) {
            this.log(`Error showing custom notification: ${error.message}`, 'error');
        }
    }

    /**
     * Render browser compatibility information
     */
    renderCompatibility() {
        const compatibilityGrid = document.getElementById('compatibilityGrid');
        const browserInfo = this.notificationAPI.getBrowserInfo();
        const allBrowsers = [
            { key: 'chrome', name: 'Chrome', icon: 'fab fa-chrome' },
            { key: 'firefox', name: 'Firefox', icon: 'fab fa-firefox' },
            { key: 'safari', name: 'Safari', icon: 'fab fa-safari' },
            { key: 'edge', name: 'Edge', icon: 'fab fa-edge' },
            { key: 'opera', name: 'Opera', icon: 'fab fa-opera' }
        ];

        compatibilityGrid.innerHTML = '';

        allBrowsers.forEach(browser => {
            const isCurrentBrowser = browser.key === browserInfo.key;
            const support = isCurrentBrowser ? this.notificationAPI.isSupported : this.getExpectedSupport(browser.key);

            const item = document.createElement('div');
            item.className = `compatibility-item ${this.getCompatibilityClass(support)}`;

            const supportedFeatures = Object.entries(support)
                .filter(([key, value]) => value && key !== 'basic')
                .map(([key]) => this.formatFeatureName(key));

            const unsupportedFeatures = Object.entries(support)
                .filter(([key, value]) => !value && key !== 'basic')
                .map(([key]) => this.formatFeatureName(key));

            item.innerHTML = `
                <div class="compatibility-header">
                    <i class="${browser.icon}"></i>
                    <div>
                        <div class="compatibility-title">
                            ${browser.name}
                            ${isCurrentBrowser ? '(Current)' : ''}
                        </div>
                        <div class="compatibility-status">
                            ${support.basic ? 'Supported' : 'Not Supported'}
                        </div>
                    </div>
                </div>
                <div class="compatibility-features">
                    ${supportedFeatures.length > 0 ? `
                        <ul>
                            ${supportedFeatures.map(feature =>
                `<li><i class="fas fa-check" style="color: var(--success-color);"></i> ${feature}</li>`
            ).join('')}
                        </ul>
                    ` : ''}
                    ${unsupportedFeatures.length > 0 ? `
                        <ul>
                            ${unsupportedFeatures.slice(0, 3).map(feature =>
                `<li><i class="fas fa-times" style="color: var(--error-color);"></i> ${feature}</li>`
            ).join('')}
                            ${unsupportedFeatures.length > 3 ? '<li>+ more...</li>' : ''}
                        </ul>
                    ` : ''}
                </div>
            `;

            compatibilityGrid.appendChild(item);
        });
    }

    /**
     * Get expected support for different browsers
     */
    getExpectedSupport(browserKey) {
        const supportMatrix = {
            chrome: {
                basic: true, persistent: true, actions: true, badge: true, image: true,
                requireInteraction: true, silent: true, timestamp: true, vibrate: true
            },
            firefox: {
                basic: true, persistent: true, actions: true, badge: false, image: true,
                requireInteraction: true, silent: true, timestamp: true, vibrate: true
            },
            safari: {
                basic: true, persistent: false, actions: false, badge: false, image: false,
                requireInteraction: false, silent: true, timestamp: true, vibrate: false
            },
            edge: {
                basic: true, persistent: true, actions: true, badge: true, image: true,
                requireInteraction: true, silent: true, timestamp: true, vibrate: true
            },
            opera: {
                basic: true, persistent: true, actions: true, badge: true, image: true,
                requireInteraction: true, silent: true, timestamp: true, vibrate: true
            }
        };

        return supportMatrix[browserKey] || { basic: false };
    }

    /**
     * Get compatibility class based on support level
     */
    getCompatibilityClass(support) {
        const supportedCount = Object.values(support).filter(Boolean).length;
        const totalFeatures = Object.keys(support).length;

        if (supportedCount === totalFeatures) return 'supported';
        if (supportedCount > totalFeatures / 2) return 'partial';
        return 'unsupported';
    }

    /**
     * Format feature names for display
     */
    formatFeatureName(key) {
        const names = {
            basic: 'Basic Notifications',
            persistent: 'Persistent Notifications',
            actions: 'Action Buttons',
            badge: 'Badge Icon',
            image: 'Images',
            requireInteraction: 'Require Interaction',
            silent: 'Silent Mode',
            timestamp: 'Timestamps',
            vibrate: 'Vibration',
            serviceWorker: 'Service Worker',
            renotify: 'Re-notification'
        };
        return names[key] || key;
    }

    /**
     * Show in-app notification fallback
     */
    showInAppNotification(fallback) {
        const toast = document.createElement('div');
        toast.className = 'in-app-notification';
        toast.innerHTML = `
            <div class="toast-header">
                <i class="fas fa-bell"></i>
                <strong>${fallback.title}</strong>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-body">${fallback.body}</div>
        `;

        // Add styles for in-app notification
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                .in-app-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border: 2px solid var(--primary-color);
                    border-radius: 8px;
                    box-shadow: var(--shadow-lg);
                    max-width: 300px;
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                }
                .toast-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px 8px;
                    border-bottom: 1px solid var(--border-color);
                    font-weight: 600;
                }
                .toast-close {
                    margin-left: auto;
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: var(--text-secondary);
                }
                .toast-body {
                    padding: 8px 16px 12px;
                    color: var(--text-secondary);
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Auto-remove and click handler
        const removeToast = () => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', removeToast);
        setTimeout(removeToast, 5000);
    }

    /**
     * Log messages to the activity log
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;

        logEntry.innerHTML = `
            <span class="timestamp">${timestamp}</span>
            <span class="message">${message}</span>
        `;

        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;

        // Keep only last 50 entries
        const entries = this.logContainer.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
    }

    /**
     * Clear the activity log
     */
    clearLog() {
        this.logContainer.innerHTML = '';
        this.log('Activity log cleared', 'info');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pushBellApp = new PushBellApp();
});

// Service worker registration for enhanced features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    });
}
