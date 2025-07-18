// Service Worker for Prism of Torah
const CACHE_NAME = 'prism-torah-v1';
const STATIC_CACHE = 'prism-static-v1';
const DYNAMIC_CACHE = 'prism-dynamic-v1';

// Files to cache immediately - only include files that definitely exist
const STATIC_FILES = [
    '/',
    '/index.html',
    '/about.html',
    '/books.html',
    '/contact.html',
    '/podcast.html',
    '/privacy.html',
    '/terms.html',
    '/404.html',
    '/styles/main.css',
    '/js/app.js',
    '/js/analytics.js',
    '/js/form-handler.js',
    '/js/heatmap.js',
    '/Images/prism-logo-main.webp',
    '/Images/favicon.ico',
    '/sitemap.xml',
    '/robots.txt'
];

// API endpoints to cache
const API_CACHE = [
    '/Data/Bamidbar.json',
    '/Data/Bereishis.json',
    '/Data/Chagim.json',
    '/Data/Devarim.json',
    '/Data/Shemos.json',
    '/Data/Vayikra.json'
];

// Install event - cache static files with better error handling
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(async (cache) => {
                console.log('Caching static files');
                
                // Cache files individually to avoid failures from missing files
                const cachePromises = STATIC_FILES.map(async (file) => {
                    try {
                        const response = await fetch(file);
                        if (response.ok) {
                            await cache.put(file, response);
                            console.log(`✓ Cached: ${file}`);
                        } else {
                            console.warn(`⚠ Skipped (${response.status}): ${file}`);
                        }
                    } catch (error) {
                        console.warn(`⚠ Failed to cache: ${file}`, error.message);
                    }
                });
                
                await Promise.allSettled(cachePromises);
                console.log('Static files caching completed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Error during service worker installation:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.pathname.endsWith('.json')) {
        // API requests - cache first, then network
        event.respondWith(handleApiRequest(request));
    } else if (url.pathname.endsWith('.html') || 
               url.pathname.endsWith('.css') || 
               url.pathname.endsWith('.js') ||
               url.pathname.endsWith('.webp') ||
               url.pathname.endsWith('.jpg') ||
               url.pathname.endsWith('.png') ||
               url.pathname.endsWith('.ico')) {
        // Static files - cache first, then network
        event.respondWith(handleStaticRequest(request));
    } else {
        // Other requests - network first, then cache
        event.respondWith(handleNetworkFirst(request));
    }
});

// Handle API requests (cache first, then network)
async function handleApiRequest(request) {
    // Skip service worker for analytics/heatmap APIs on Netlify
    if (request.url.includes('/api/analytics') || request.url.includes('/api/heatmap')) {
        // Let these requests fail naturally without service worker intervention
        return fetch(request);
    }
    
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Return cached response and update in background
            fetch(request).then(response => {
                if (response.ok) {
                    updateCache(request, response);
                }
            }).catch(() => {
                // Ignore fetch errors for background updates
            });
            return cachedResponse;
        }
        
        // If not in cache, try network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache the response
            updateCache(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network request failed');
    } catch (error) {
        console.error('API request failed:', error);
        // Return a generic error response for API requests
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle static file requests (cache first, then network)
async function handleStaticRequest(request) {
    // For Data directory JSON files, use network first to ensure fresh data
    if (request.url.includes('/Data/') && request.url.endsWith('.json')) {
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                // Cache the response
                updateCache(request, networkResponse.clone());
                return networkResponse;
            }
            throw new Error('Network request failed');
        } catch (error) {
            console.error('Data file request failed:', error);
            // Try cache as fallback
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            throw error;
        }
    }
    
    try {
        // Try cache first for other static files
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If not in cache, try network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache the response
            updateCache(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network request failed');
    } catch (error) {
        console.error('Static request failed:', error);
        // Return a fallback for HTML pages
        if (request.url.endsWith('.html')) {
            return caches.match('/404.html');
        }
        throw error;
    }
}

// Handle other requests (network first, then cache)
async function handleNetworkFirst(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache the response
            updateCache(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network request failed');
    } catch (error) {
        console.error('Network first request failed:', error);
        // Try cache as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Not available offline', { status: 503 });
    }
}

// Update cache with new response
async function updateCache(request, response) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, response);
    } catch (error) {
        console.error('Error updating cache:', error);
    }
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Get stored form data
        const formData = await getStoredFormData();
        if (formData) {
            // Send form data to server
            await sendFormData(formData);
            // Clear stored data
            await clearStoredFormData();
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Store form data for offline submission
async function storeFormData(formData) {
    try {
        const cache = await caches.open('form-data');
        await cache.put('pending-submissions', new Response(JSON.stringify(formData)));
    } catch (error) {
        console.error('Error storing form data:', error);
    }
}

// Get stored form data
async function getStoredFormData() {
    try {
        const cache = await caches.open('form-data');
        const response = await cache.match('pending-submissions');
        if (response) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error getting stored form data:', error);
        return null;
    }
}

// Clear stored form data
async function clearStoredFormData() {
    try {
        const cache = await caches.open('form-data');
        await cache.delete('pending-submissions');
    } catch (error) {
        console.error('Error clearing stored form data:', error);
    }
}

// Send form data to server
async function sendFormData(formData) {
    // Replace with your actual form submission endpoint
    const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
        throw new Error('Form submission failed');
    }
    
    return response;
}

// Push notification handling
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/Images/favicon.ico',
            badge: '/Images/favicon.ico',
            vibrate: [100, 50, 100],
            data: {
                url: data.url
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'STORE_FORM_DATA') {
        storeFormData(event.data.formData);
    }
}); 