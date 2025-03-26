/**
 * LiftMate - Service Worker
 * Provides offline support and caching
 */

const CACHE_NAME = 'liftmate-md3-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './js/data.js',
    './js/ui.js',
    './js/templates.js',
    './js/exercises.js',
    './js/workout.js',
    './js/stats.js',
    './js/progress.js',
    './js/history.js',
    './js/weight.js',
    './js/progress-pics.js',
    './js/app.js',
    'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    // Skip non-HTTP(S) requests
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response to store in cache and return
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                try {
                                    cache.put(event.request, responseToCache);
                                } catch (e) {
                                    console.error('Cache put error:', e);
                                }
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If network request fails, try to return a fallback page
                        if (event.request.url.indexOf('.html') > -1) {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});