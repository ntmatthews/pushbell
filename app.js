/**
 * PushBell Application Logic
 * Main application controller for the notification demo
 */

class PushBellApp {
    constructor() {
        this.notificationAPI = new NotificationAPI();
        this.isMobile = this.detectMobile();
        this.isIOS = this.detectIOS();
        this.hasTouch = 'ontouchstart' in window;
        this.logContainer = document.getElementById('logContainer');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.splashScreen = document.getElementById('splashScreen');
        this.loadingText = document.querySelector('.loading-text');
        this.isInitialized = false;

        this.init();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
            window.innerWidth <= 768;
    }

    detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    /**
     * Initialize the application with splash screen
     */
    async init() {
        console.log('PushBell App initializing...', {
            mobile: this.isMobile,
            iOS: this.isIOS,
            hasTouch: this.hasTouch,
            userAgent: navigator.userAgent
        });

        try {
            // Update splash screen loading text
            this.updateSplashStatus('Setting up notification system...');

            // Initialize core features
            await this.initializeCore();

            // Show splash for minimum time on mobile for better UX
            const minSplashTime = this.isMobile ? 2000 : 1500;
            const startTime = Date.now();

            this.updateSplashStatus('Checking permissions...');
            await this.checkInitialPermissions();
            
            // Force status text update immediately
            this.updateSplashStatus('Permissions checked');
            
            // Update UI status immediately after checking permissions
            this.updateUI();

            this.updateSplashStatus('Setting up interface...');
            this.setupEventListeners();
            this.setupNotificationEventHandlers();

            this.updateSplashStatus('Loading compatibility info...');
            this.renderCompatibility();

            // Add mobile-specific initialization
            if (this.isMobile) {
                this.updateSplashStatus('Optimizing for mobile...');
                await this.initMobileFeatures();
            }

            // iOS specific initialization
            if (this.isIOS) {
                this.updateSplashStatus('Configuring iOS features...');
                await this.initIOSFeatures();
            }

            this.updateSplashStatus('Finalizing setup...');

            // Defer browser info update until DOM is ready
            setTimeout(() => {
                this.updateBrowserInfo();
            }, 100);

            this.log('PushBell application initialized', 'info');

            // Ensure minimum splash time for smooth experience
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minSplashTime - elapsedTime);

            this.updateSplashStatus('Ready!');

            setTimeout(() => {
                this.hideSplashScreen();
                console.log('Setting isInitialized to true');
                this.isInitialized = true; // Set this BEFORE updateUI()
                console.log('Calling updateUI() after initialization');
                this.updateUI();
                
                // Ensure status text is updated immediately and repeatedly
                this.updateStatusText();
                
                // Multiple attempts to ensure status text is updated
                setTimeout(() => {
                    console.log('First status text update attempt');
                    this.updateStatusText();
                }, 100);
                
                setTimeout(() => {
                    console.log('Second status text update attempt');  
                    this.updateStatusText();
                    this.updateUI();
                }, 500);
                
                setTimeout(() => {
                    console.log('Final status text update attempt');
                    this.updateStatusText();
                }, 1000);
            }, remainingTime);

        } catch (error) {
            console.error('Initialization error:', error);
            this.updateSplashStatus('Error during initialization');

            // Enhanced mobile error handling
            if (this.isMobile) {
                console.log('Mobile initialization error - providing fallback');
                this.updateSplashStatus('Loading basic features...');
            }

            setTimeout(() => {
                this.hideSplashScreen();
                this.log(`Initialization error: ${error.message}`, 'error');
                this.isInitialized = true; // Mark as initialized even with errors
                this.updateUI();
                this.updateStatusText(); // Ensure status is updated even with errors
            }, 1000);
        }
    }

    async initializeCore() {
        // Wait for notification API to be ready
        if (this.notificationAPI && typeof this.notificationAPI.init === 'function') {
            await this.notificationAPI.init();
        }
    }

    updateSplashStatus(message) {
        if (this.loadingText) {
            this.loadingText.textContent = message;
        }
        console.log(`Splash: ${message}`);
    }

    hideSplashScreen() {
        if (this.splashScreen) {
            this.splashScreen.classList.add('fade-out');

            // Remove splash screen from DOM after animation
            setTimeout(() => {
                if (this.splashScreen && this.splashScreen.parentNode) {
                    this.splashScreen.parentNode.removeChild(this.splashScreen);
                }
            }, 500);
        }
    }

    async initMobileFeatures() {
        console.log('Initializing mobile features...');

        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Add visual feedback for touch
        this.addTouchFeedback();

        // Optimize for mobile performance
        this.optimizeForMobile();
    }

    async initIOSFeatures() {
        console.log('Initializing iOS features...');

        // iOS-specific notification handling
        if ('safari' in window && 'pushNotification' in window.safari) {
            console.log('iOS Safari push notifications detected');
        }

        // Handle iOS viewport issues
        this.handleIOSViewport();
    }

    addTouchFeedback() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.opacity = '0.7';
            }, { passive: true });

            button.addEventListener('touchend', () => {
                setTimeout(() => {
                    button.style.opacity = '1';
                }, 150);
            }, { passive: true });
        });
    }

    optimizeForMobile() {
        // Add loading states for better UX
        this.addLoadingStates();

        // Improve error messages for mobile
        this.enhanceErrorMessages();
    }

    handleIOSViewport() {
        // Fix iOS Safari viewport height issues
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 500);
        });
    }

    addLoadingStates() {
        // Enhanced loading states for mobile
        this.showStatus = (message, type = 'info', persistent = false) => {
            if (!this.isInitialized) return; // Don't show status during splash

            const status = document.getElementById('status');
            if (status) {
                status.textContent = message;
                status.className = `status ${type}`;

                if (type === 'loading') {
                    status.classList.add('loading');
                }

                if (!persistent && type !== 'loading') {
                    setTimeout(() => {
                        status.textContent = 'Ready';
                        status.className = 'status';
                    }, this.isMobile ? 4000 : 3000); // Longer on mobile
                }
            }
        };
    }

    enhanceErrorMessages() {
        // More detailed error messages for mobile debugging
        this.originalShowStatus = this.showStatus;
    }

    /**
     * Update status text explicitly (fixes stuck "Checking permissions..." issue)
     */
    updateStatusText() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateStatusText());
            return;
        }

        // Force re-query the element to ensure we have it
        this.statusText = document.getElementById('statusText');

        if (!this.statusText) {
            console.warn('statusText element not found, trying again in 100ms');
            setTimeout(() => this.updateStatusText(), 100);
            return;
        }

        const permission = this.lastPermission || (this.notificationAPI ? this.notificationAPI.getPermissionStatus() : 'default');
        const isSupported = this.notificationAPI && this.notificationAPI.isSupported ? 
            this.notificationAPI.isSupported.basic : 
            ('Notification' in window);

        console.log('Updating status text:', { permission, isSupported, currentText: this.statusText.textContent });

        if (!isSupported) {
            this.statusText.textContent = 'Notifications not supported in this browser';
        } else {
            switch (permission) {
                case 'granted':
                    this.statusText.textContent = 'Notifications are enabled';
                    break;
                case 'denied':
                    this.statusText.textContent = 'Notifications are blocked';
                    break;
                case 'default':
                default:
                    this.statusText.textContent = this.isMobile ?
                        'Tap "Request Permission" to enable notifications' :
                        'Permission not requested yet';
                    break;
            }
        }

        console.log('Status text updated to:', this.statusText.textContent);
        
        // Force a visual update to ensure the change is reflected
        this.statusText.style.display = 'none';
        this.statusText.offsetHeight; // Force reflow
        this.statusText.style.display = '';
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

        // Auto-update UI when permission changes (only after initialization)
        setInterval(() => {
            if (!this.isInitialized) return;

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
        // Allow updates during splash screen for status text updates
        console.log('updateUI() called - isInitialized:', this.isInitialized);

        // Get current permission status
        let permission = this.lastPermission;
        if (!permission && this.notificationAPI) {
            permission = this.notificationAPI.getPermissionStatus();
        }
        
        const isSupported = this.notificationAPI && this.notificationAPI.isSupported ? 
            this.notificationAPI.isSupported.basic : 
            ('Notification' in window);

        console.log('updateUI() status:', { 
            permission, 
            isSupported, 
            lastPermission: this.lastPermission,
            statusText: this.statusText ? 'element found' : 'element missing'
        });

        // Always update status indicator and text (even during splash)
        if (this.statusIndicator) {
            this.statusIndicator.className = 'status-indicator';

            if (!isSupported) {
                this.statusIndicator.classList.add('status-unsupported');
                if (this.statusText) {
                    this.statusText.textContent = 'Notifications not supported in this browser';
                    console.log('Status text updated: not supported');
                }
            } else {
                switch (permission) {
                    case 'granted':
                        this.statusIndicator.classList.add('status-granted');
                        if (this.statusText) {
                            this.statusText.textContent = 'Notifications are enabled';
                            console.log('Status text updated: granted');
                        }
                        break;
                    case 'denied':
                        this.statusIndicator.classList.add('status-denied');
                        if (this.statusText) {
                            this.statusText.textContent = 'Notifications are blocked';
                            console.log('Status text updated: denied');
                        }
                        break;
                    case 'default':
                    default:
                        this.statusIndicator.classList.add('status-default');
                        if (this.statusText) {
                            this.statusText.textContent = this.isMobile ?
                                'Tap "Request Permission" to enable notifications' :
                                'Permission not requested yet';
                            console.log('Status text updated: default/permission not requested');
                        }
                        break;
                }
            }
        } else {
            console.warn('statusIndicator element not found');
        }

        // Only update buttons after initialization to avoid interference with splash screen
        if (!this.isInitialized) {
            console.log('Skipping button updates - not initialized yet');
            return;
        }

        // Update button states
        const requestBtn = document.getElementById('requestPermission');
        const simpleBtn = document.getElementById('simpleNotification');
        const richBtn = document.getElementById('richNotification');
        const actionBtn = document.getElementById('actionNotification');

        if (!isSupported) {
            if (requestBtn) {
                requestBtn.disabled = true;
                requestBtn.innerHTML = '<i class="fas fa-times"></i> Not Supported';
            }
            [simpleBtn, richBtn, actionBtn].forEach(btn => {
                if (btn) btn.disabled = true;
            });
        } else {
            if (requestBtn) {
                requestBtn.disabled = permission !== 'default';
                const canShow = permission === 'granted';

                [simpleBtn, richBtn, actionBtn].forEach(btn => {
                    if (btn) btn.disabled = !canShow;
                });

                if (permission === 'granted') {
                    requestBtn.innerHTML = '<i class="fas fa-check"></i> Permission Granted';
                } else if (permission === 'denied') {
                    requestBtn.innerHTML = '<i class="fas fa-ban"></i> Permission Denied';
                } else {
                    requestBtn.innerHTML = '<i class="fas fa-unlock"></i> Request Permission';
                }
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

        // Null check to prevent errors during initialization
        if (!compatibilityGrid) {
            console.warn('compatibilityGrid element not found, skipping compatibility render');
            return;
        }

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
        // Null check to prevent errors during initialization
        if (!this.logContainer) {
            console.log(`[${type}] ${message}`);
            return;
        }

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
        // Null check to prevent errors during initialization
        if (!this.logContainer) {
            console.log('Activity log cleared');
            return;
        }

        this.logContainer.innerHTML = '';
        this.log('Activity log cleared', 'info');
    }

    async checkInitialPermissions() {
        try {
            console.log('Checking initial permissions...');

            let permission;
            
            // Use direct Notification.permission for immediate results
            if ('Notification' in window) {
                permission = Notification.permission;
                console.log('Direct permission check:', permission);
            } else {
                console.log('Notifications not supported in this browser');
                permission = 'unsupported';
            }

            console.log('Initial permission status:', permission);
            this.lastPermission = permission;

            // Force immediate status text update
            this.updateStatusText();

        } catch (error) {
            console.error('Error checking initial permissions:', error);

            // Set default state for fallback
            console.log('Fallback: assuming default permission state');
            this.lastPermission = 'default';
            
            // Force immediate status text update
            this.updateStatusText();
        }
    }

    async requestPermission() {
        try {
            this.showStatus('Requesting notification permission...', 'loading');

            // Enhanced mobile permission handling
            if (this.isMobile && this.isIOS) {
                // iOS requires user gesture for permission request
                this.showStatus('Please allow notifications when prompted', 'info', true);
            }

            const permission = await this.notificationAPI.requestPermission();
            console.log('Permission request result:', permission);

            this.updatePermissionStatus(permission);

            if (permission === 'granted') {
                this.showStatus('✅ Notifications enabled! Try the demos below.', 'success');

                // Register service worker after permission granted (mobile optimization)
                if ('serviceWorker' in navigator && !this.swRegistered) {
                    this.registerServiceWorker();
                }
            } else if (permission === 'denied') {
                this.showStatus('❌ Notifications blocked. Check browser settings to enable.', 'error');
                this.showBrowserInstructions();
            } else {
                this.showStatus('⚠️ Permission request dismissed. Click again to retry.', 'warning');
            }

        } catch (error) {
            console.error('Permission request error:', error);
            this.showStatus(`Error requesting permission: ${error.message}`, 'error');

            // Mobile-specific fallback guidance
            if (this.isMobile) {
                setTimeout(() => {
                    this.showStatus('On mobile, notifications may need to be enabled in browser settings', 'info');
                }, 3000);
            }
        }
    }

    showBrowserInstructions() {
        if (this.isMobile) {
            if (this.isIOS) {
                this.showStatus('💡 iOS: Go to Settings > Safari > Website Settings > Notifications', 'info');
            } else {
                this.showStatus('💡 Android: Tap the lock icon in address bar, then enable notifications', 'info');
            }
        } else {
            this.showStatus('💡 Click the lock icon in your address bar to manage notification settings', 'info');
        }
    }

    async registerServiceWorker() {
        try {
            if (!('serviceWorker' in navigator)) {
                console.log('Service Worker not supported');
                return;
            }

            console.log('Registering Service Worker...');
            const registration = await navigator.serviceWorker.register('./sw.js');

            this.swRegistration = registration;
            this.swRegistered = true;

            console.log('Service Worker registered:', registration);

            // Mobile-optimized status message
            if (this.isMobile) {
                this.showStatus('📱 Enhanced features enabled for mobile', 'success');
            }

        } catch (error) {
            console.error('Service Worker registration failed:', error);
            // Don't show error to user as it's not critical for basic functionality
        }
    }

    async sendNotification(type) {
        try {
            // Check permission first
            const permission = await this.notificationAPI.getPermission();
            if (permission !== 'granted') {
                this.showStatus('Please enable notifications first!', 'warning');
                return;
            }

            this.showStatus(`Sending ${type} notification...`, 'loading');

            // Add haptic feedback for mobile
            if (this.isMobile && 'vibrate' in navigator) {
                navigator.vibrate(100);
            }

            let notification;
            const baseOptions = {
                icon: this.createNotificationIcon(),
                badge: this.createNotificationIcon(),
                tag: `pushbell-${type}-${Date.now()}`,
                requireInteraction: false, // Don't require interaction on mobile
                silent: false
            };

            // Mobile-optimized notification options
            if (this.isMobile) {
                baseOptions.requireInteraction = false; // Don't persist on mobile
                baseOptions.renotify = true; // Allow renotification
            }

            switch (type) {
                case 'basic':
                    notification = await this.notificationAPI.show('PushBell Demo', {
                        ...baseOptions,
                        body: this.isMobile ?
                            '📱 Basic notification working on mobile!' :
                            '🔔 Basic notification is working!',
                        tag: 'pushbell-basic'
                    });
                    break;

                case 'rich':
                    notification = await this.notificationAPI.show('Rich Notification', {
                        ...baseOptions,
                        body: this.isMobile ?
                            '✨ Rich notifications with image support on mobile' :
                            '🎨 Rich notification with image and custom styling',
                        image: this.createNotificationImage(),
                        tag: 'pushbell-rich',
                        data: { type: 'rich', timestamp: Date.now() }
                    });
                    break;

                case 'action':
                    const actions = this.isMobile ? [
                        { action: 'view', title: '👀 View', icon: this.createActionIcon('view') },
                        { action: 'dismiss', title: '❌ Dismiss', icon: this.createActionIcon('dismiss') }
                    ] : [
                        { action: 'view', title: '👀 View Details', icon: this.createActionIcon('view') },
                        { action: 'share', title: '📤 Share', icon: this.createActionIcon('share') },
                        { action: 'dismiss', title: '❌ Dismiss', icon: this.createActionIcon('dismiss') }
                    ];

                    notification = await this.notificationAPI.show('Action Notification', {
                        ...baseOptions,
                        body: this.isMobile ?
                            '⚡ Interactive notification - tap to respond!' :
                            '⚡ Interactive notification with action buttons',
                        actions: actions,
                        tag: 'pushbell-action',
                        data: { type: 'action', timestamp: Date.now() }
                    });
                    break;

                default:
                    throw new Error(`Unknown notification type: ${type}`);
            }

            if (notification) {
                this.setupNotificationHandlers(notification, type);
                this.showStatus(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} notification sent!`, 'success');

                // Track notification for analytics
                this.trackNotification(type);
            }

        } catch (error) {
            console.error(`Error sending ${type} notification:`, error);

            let errorMessage = `Failed to send ${type} notification: ${error.message}`;

            // Mobile-specific error handling
            if (this.isMobile) {
                if (error.message.includes('permission')) {
                    errorMessage = 'Notifications blocked. Check your browser settings.';
                } else if (error.message.includes('quota')) {
                    errorMessage = 'Too many notifications. Please wait a moment.';
                } else if (error.message.includes('not supported')) {
                    errorMessage = 'This notification type is not supported on your device.';
                }
            }

            this.showStatus(errorMessage, 'error');
        }
    }

    trackNotification(type) {
        // Simple analytics tracking
        const timestamp = new Date().toISOString();
        console.log(`Notification sent: ${type} at ${timestamp}`, {
            userAgent: navigator.userAgent,
            mobile: this.isMobile,
            iOS: this.isIOS,
            hasTouch: this.hasTouch
        });
    }

    updateBrowserInfo() {
        const browserInfo = document.getElementById('browser-info');

        // Null check to prevent errors during initialization
        if (!browserInfo) {
            console.warn('browser-info element not found, skipping browser info update');
            return;
        }

        const userAgent = navigator.userAgent;

        // Enhanced browser detection for mobile
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';
        let deviceInfo = '';

        // Mobile-specific detection
        if (this.isMobile) {
            if (this.isIOS) {
                if (/iPhone/.test(userAgent)) {
                    deviceInfo = '📱 iPhone';
                } else if (/iPad/.test(userAgent)) {
                    deviceInfo = '📱 iPad';
                } else {
                    deviceInfo = '📱 iOS Device';
                }

                if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
                    browserName = 'Safari';
                    const safariMatch = userAgent.match(/Version\/([0-9.]+)/);
                    browserVersion = safariMatch ? safariMatch[1] : 'Unknown';
                } else if (/Chrome/.test(userAgent)) {
                    browserName = 'Chrome';
                    const chromeMatch = userAgent.match(/Chrome\/([0-9.]+)/);
                    browserVersion = chromeMatch ? chromeMatch[1] : 'Unknown';
                }
            } else if (/Android/.test(userAgent)) {
                deviceInfo = '📱 Android Device';
                if (/Chrome/.test(userAgent)) {
                    browserName = 'Chrome';
                    const chromeMatch = userAgent.match(/Chrome\/([0-9.]+)/);
                    browserVersion = chromeMatch ? chromeMatch[1] : 'Unknown';
                } else if (/Firefox/.test(userAgent)) {
                    browserName = 'Firefox';
                    const firefoxMatch = userAgent.match(/Firefox\/([0-9.]+)/);
                    browserVersion = firefoxMatch ? firefoxMatch[1] : 'Unknown';
                }
            }
        } else {
            // Desktop detection
            if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
                browserName = 'Chrome';
                const chromeMatch = userAgent.match(/Chrome\/([0-9.]+)/);
                browserVersion = chromeMatch ? chromeMatch[1] : 'Unknown';
            } else if (/Firefox/.test(userAgent)) {
                browserName = 'Firefox';
                const firefoxMatch = userAgent.match(/Firefox\/([0-9.]+)/);
                browserVersion = firefoxMatch ? firefoxMatch[1] : 'Unknown';
            } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
                browserName = 'Safari';
                const safariMatch = userAgent.match(/Version\/([0-9.]+)/);
                browserVersion = safariMatch ? safariMatch[1] : 'Unknown';
            } else if (/Edge/.test(userAgent)) {
                browserName = 'Edge';
                const edgeMatch = userAgent.match(/Edge\/([0-9.]+)/);
                browserVersion = edgeMatch ? edgeMatch[1] : 'Unknown';
            }
            deviceInfo = '💻 Desktop';
        }

        // Check notification support
        const hasNotifications = 'Notification' in window;
        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasPushManager = 'PushManager' in window;

        // Enhanced support detection for mobile
        const supportLevel = this.determineSupportLevel(hasNotifications, hasServiceWorker, hasPushManager);

        browserInfo.innerHTML = `
            <h3>🌐 Browser Information</h3>
            <p><strong>Device:</strong> ${deviceInfo}</p>
            <p><strong>Browser:</strong> ${browserName} ${browserVersion}</p>
            <p><strong>Mobile:</strong> ${this.isMobile ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Touch:</strong> ${this.hasTouch ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Notifications:</strong> ${hasNotifications ? '✅ Supported' : '❌ Not supported'}</p>
            <p><strong>Service Worker:</strong> ${hasServiceWorker ? '✅ Supported' : '❌ Not supported'}</p>
            <p><strong>Push Manager:</strong> ${hasPushManager ? '✅ Supported' : '❌ Not supported'}</p>
            <p><strong>Support Level:</strong> ${supportLevel}</p>
            ${this.isMobile ? this.getMobileSpecificInfo() : ''}
        `;
    }

    determineSupportLevel(hasNotifications, hasServiceWorker, hasPushManager) {
        if (hasNotifications && hasServiceWorker && hasPushManager) {
            return '🟢 Full Support';
        } else if (hasNotifications) {
            return '🟡 Basic Support';
        } else {
            return '🔴 No Support';
        }
    }

    getMobileSpecificInfo() {
        let mobileInfo = '<h4>📱 Mobile Features</h4>';

        if (this.isIOS) {
            mobileInfo += `
                <p><strong>iOS Features:</strong></p>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    <li>Add to Home Screen: ${('standalone' in window.navigator) ? '✅' : '❌'}</li>
                    <li>Web App Capable: ${window.navigator.standalone ? '✅ Active' : '⚠️ Available'}</li>
                    <li>Viewport Support: ✅ Optimized</li>
                </ul>
            `;
        }

        if ('vibrate' in navigator) {
            mobileInfo += '<p><strong>Haptic Feedback:</strong> ✅ Supported</p>';
        }

        if ('orientation' in window || 'onorientationchange' in window) {
            mobileInfo += '<p><strong>Orientation:</strong> ✅ Supported</p>';
        }

        return mobileInfo;
    }
}

// Enhanced error handling and debugging for mobile
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.app && window.app.isMobile) {
        window.app.showStatus('An error occurred. Check console for details.', 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Handle timeout errors gracefully
    if (event.reason && event.reason.message && event.reason.message.includes('timeout')) {
        console.log('Timeout error caught and handled gracefully');
        event.preventDefault(); // Prevent the error from being reported to console
        
        // Update status if app is available
        if (window.app && window.app.updateStatusText) {
            window.app.updateStatusText();
        }
    } else {
        // Handle other promise errors
        if (window.app && window.app.isMobile) {
            window.app.showStatus('Promise error occurred. Check console for details.', 'error');
        }
    }
});

// Mobile debugging helper
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    console.log('Mobile device detected, enabling enhanced logging');

    // Log touch events for debugging
    document.addEventListener('touchstart', (e) => {
        console.log('Touch start:', e.touches.length, 'touches');
    }, { passive: true });

    // Log orientation changes
    window.addEventListener('orientationchange', () => {
        console.log('Orientation changed:', window.orientation);
        setTimeout(() => {
            console.log('New dimensions:', window.innerWidth, 'x', window.innerHeight);
        }, 100);
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, initializing PushBell App...');
    try {
        window.app = new PushBellApp();
        console.log('PushBell App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize PushBell App:', error);
        const status = document.getElementById('status');
        if (status) {
            status.textContent = `Initialization failed: ${error.message}`;
            status.className = 'status error';
        }
    }
});

// Fallback initialization
if (document.readyState === 'loading') {
    // DOM is still loading
    console.log('DOM is loading, waiting for DOMContentLoaded...');
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing immediately...');
    if (!window.app) {
        try {
            window.app = new PushBellApp();
        } catch (error) {
            console.error('Failed to initialize PushBell App:', error);
        }
    }
}

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
