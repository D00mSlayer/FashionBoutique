const CACHE_NAME = 'boutique-cache-v1';
const CACHED_URLS = [
  '/api/products',
  '/api/products/new-collection'
];

// Install service worker (unchanged from original)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHED_URLS))
  );
});

// Cache first, then network strategy for images and API (significantly enhanced from original)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache GET requests for images, videos, and API calls (added video support)
  if (event.request.method === 'GET' && 
      (url.pathname.startsWith('/api/') || 
       event.request.url.startsWith('data:image/') || 
       event.request.url.startsWith('data:video/'))) {

    event.respondWith(
      // Try cache first (unchanged logic)
      caches.match(event.request)
        .then((response) => {
          if (response) {
            // Return cached response immediately (unchanged logic)
            return response;
          }

          // If not in cache, fetch from network and cache for future (enhanced logic)
          return fetch(event.request).then((networkResponse) => {
            // Only cache successful responses (added error handling)
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Cache the response for future use (added size check)
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // Only cache smaller responses (< 50MB) (added size limitation)
              responseToCache.blob().then(blob => {
                if (blob.size < 50 * 1024 * 1024) {
                  cache.put(event.request, responseToCache);
                }
              });
            });

            return networkResponse;
          });
        })
    );
  }
});

// Clean up old caches (unchanged from original)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});