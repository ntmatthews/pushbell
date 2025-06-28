/**
 * PushBell Service Worker
 * Handles background notifications and enhanced features
 */

const CACHE_NAME = 'pushbell-v4';

// Local resources to cache
const localResources = [
    '/pushbell/',
    '/pushbell/index.html',
    '/pushbell/styles.css',
    '/pushbell/app.js',
    '/pushbell/notification-api.js',
    '/pushbell/manifest.json'
];

// External resources to cache (handle separately for better error handling)
const externalResources = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            // Cache local resources
            caches.open(CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching local files');
                return cache.addAll(localResources).catch(error => {
                    console.warn('Service Worker: Failed to cache some local resources:', error);
                    // Try to cache them individually
                    return Promise.allSettled(
                        localResources.map(url => 
                            cache.add(url).catch(err => {
                                console.warn(`Service Worker: Failed to cache local ${url}:`, err);
                                return null;
                            })
                        )
                    );
                });
            }),
            // Cache external resources (with error handling)
            caches.open(CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching external resources');
                return Promise.allSettled(
                    externalResources.map(url => 
                        cache.add(url).catch(error => {
                            console.warn(`Service Worker: Failed to cache ${url}:`, error);
                            return null; // Continue with other resources
                        })
                    )
                );
            })
        ]).catch(error => {
            console.error('Service Worker: Install failed:', error);
            // Don't prevent installation even if caching fails
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    const requestUrl = new URL(event.request.url);
    
    // Handle local resources
    if (requestUrl.origin === self.location.origin) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        console.log('Service Worker: Serving from cache:', event.request.url);
                        return response;
                    }
                    
                    // Not in cache, fetch from network and cache it
                    return fetch(event.request)
                        .then(response => {
                            // Only cache successful responses
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                            }
                            return response;
                        })
                        .catch(() => {
                            // Fallback for offline scenarios
                            if (event.request.destination === 'document') {
                                return caches.match('/index.html');
                            }
                        });
                })
                .catch(error => {
                    console.error('Service Worker: Local fetch failed', error);
                })
        );
    }
    // Handle external resources (CDN, etc.)
    else if (externalResources.includes(event.request.url)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        console.log('Service Worker: Serving external resource from cache:', event.request.url);
                        return response;
                    }
                    
                    // Try to fetch from network and cache it
                    return fetch(event.request, { mode: 'cors' })
                        .then(response => {
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(event.request, responseClone).catch(err => {
                                        console.warn('Service Worker: Failed to cache external resource:', err);
                                    });
                                });
                            }
                            return response;
                        })
                        .catch(error => {
                            console.warn('Service Worker: External resource fetch failed:', error);
                            // Return a basic fallback or let it fail gracefully
                            return new Response('', { status: 404 });
                        });
                })
        );
    }
    // For all other requests, just let them pass through
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked', event);

    const notification = event.notification;
    const action = event.action;

    // Handle action button clicks
    if (action === 'yes') {
        console.log('User clicked Yes');
        // Handle yes action
    } else if (action === 'no') {
        console.log('User clicked No');
        // Handle no action
    } else if (action === 'later') {
        console.log('User clicked Remind Later');
        // Schedule a reminder
        scheduleReminder();
    } else {
        // Regular notification click
        console.log('User clicked notification body');
    }

    // Close the notification
    notification.close();

    // Focus or open the app window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // If a window is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Notification close event
self.addEventListener('notificationclose', event => {
    console.log('Service Worker: Notification closed', event);

    const notification = event.notification;
    // Track notification dismissal analytics here if needed
});

// Push event - handle push messages
self.addEventListener('push', event => {
    console.log('Service Worker: Push received', event);

    let notificationData = {
        title: 'PushBell Notification',
        body: 'You have a new notification!',
        icon: getDefaultIcon(),
        badge: getDefaultBadge(),
        tag: 'pushbell-push',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '👁️'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '❌'
            }
        ]
    };

    // Parse push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = { ...notificationData, ...data };
        } catch (error) {
            console.warn('Service Worker: Failed to parse push data', error);
            notificationData.body = event.data.text() || notificationData.body;
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Background sync event
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event);

    if (event.tag === 'notification-queue') {
        event.waitUntil(processNotificationQueue());
    }
});

// Message event - communicate with main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);

    const { type, data } = event.data;

    switch (type) {
        case 'SHOW_NOTIFICATION':
            showNotificationFromMessage(data);
            break;
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage({ type: 'CACHE_STATUS', data: status });
            });
            break;
        case 'CLEAR_CACHE':
            clearCache().then(() => {
                event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
            });
            break;
        default:
            console.warn('Service Worker: Unknown message type', type);
    }
});

// Utility functions

function getDefaultIcon() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNFY3LjVDMTcgOS41IDE5IDEyLjM0IDE5IDE2VjE4SDIxVjIwSDNWMThINVYxNkM1IDEyLjM0IDggOS41IDEwIDcuNVY0QzEwIDIuOSAxMC45IDIgMTIgMlpNMTIgMjJDMTMuMSAyMiAxNCAyMS4xIDE0IDIwSDEwQzEwIDIxLjEgMTAuOSAyMiAxMiAyMloiLz4KPC9zdmc+Cjwvc3ZnPg==';
}

function getDefaultBadge() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmNTY1NjUiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkMxMy4xIDIgMTQgMi45IDE0IDRWNy41QzE3IDkuNSAxOSAxMi4zNCAxOSAxNlYxOEgyMVYyMEgzVjE4SDVWMTZDNSAxMi4zNCA4IDkuNSAxMCA3LjVWNEMxMCAyLjkgMTAuOSAyIDEyIDJaTTEyIDIyQzEzLjEgMjIgMTQgMjEuMSAxNCAyMEgxMEMxMCAyMS4xIDEwLjkgMjIgMTIgMjJaIi8+Cjwvc3ZnPgo8L3N2Zz4=';
}

async function showNotificationFromMessage(data) {
    try {
        await self.registration.showNotification(data.title, data.options);
        console.log('Service Worker: Notification shown from message');
    } catch (error) {
        console.error('Service Worker: Failed to show notification from message', error);
    }
}

async function scheduleReminder() {
    // Schedule a reminder notification for 5 minutes later
    setTimeout(() => {
        self.registration.showNotification('Reminder', {
            body: 'This is your scheduled reminder from PushBell',
            icon: getDefaultIcon(),
            badge: getDefaultBadge(),
            tag: 'pushbell-reminder',
            requireInteraction: true
        });
    }, 5 * 60 * 1000); // 5 minutes
}

async function processNotificationQueue() {
    // Process any queued notifications
    console.log('Service Worker: Processing notification queue');

    // This would typically read from IndexedDB or another storage
    // and send any queued notifications

    return Promise.resolve();
}

async function getCacheStatus() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        return {
            name: CACHE_NAME,
            size: keys.length,
            urls: keys.map(request => request.url)
        };
    } catch (error) {
        console.error('Service Worker: Failed to get cache status', error);
        return { error: error.message };
    }
}

async function clearCache() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Service Worker: All caches cleared');
    } catch (error) {
        console.error('Service Worker: Failed to clear cache', error);
        throw error;
    }
}

// Periodic background sync for notifications (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', event => {
        console.log('Service Worker: Periodic sync', event);

        if (event.tag === 'notification-check') {
            event.waitUntil(checkForNewNotifications());
        }
    });
}

async function checkForNewNotifications() {
    // This would typically check with a server for new notifications
    // For demo purposes, we'll just log
    console.log('Service Worker: Checking for new notifications');
    return Promise.resolve();
}

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker: Global error', event);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled promise rejection', event);
});

console.log('Service Worker: PushBell service worker loaded');
