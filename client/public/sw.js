const CACHE_NAME = 'boutique-cache-v1';
const CACHED_URLS = [
  '/api/products',
  '/api/products/new-collection'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHED_URLS))
  );
});

// Cache first, then network strategy for images
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only cache image requests and API calls
  if (event.request.method === 'GET' && 
      (url.pathname.startsWith('/api/') || event.request.url.startsWith('data:image/'))) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            // Return cached response
            return response;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request).then((networkResponse) => {
            // Cache the network response for future
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });
        })
    );
  }
});

// Clean up old caches
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
