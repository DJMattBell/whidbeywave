// WhidbeyWave Service Worker — offline cache + push notifications
// Cache version: bump to invalidate old caches
var CACHE_VERSION = 'ww-v1';

// Static assets to precache on install (offline shell)
var PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
];

// ── Install: precache the offline shell ────────────────────────────
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// ── Activate: clean up old caches ──────────────────────────────────
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_VERSION; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// ── Fetch: stale-while-revalidate for GET requests ─────────────────
self.addEventListener('fetch', function (event) {
  var request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip API routes and Supabase calls — always go to network
  var url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;
  if (url.hostname.includes('supabase')) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.match(request).then(function (cachedResponse) {
        // Fire off network fetch to update cache (revalidate)
        var networkFetch = fetch(request).then(function (networkResponse) {
          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(function () {
          // Network failed — return nothing (cachedResponse used below)
          return undefined;
        });

        // Return cached immediately if available, otherwise wait for network
        return cachedResponse || networkFetch;
      });
    })
  );
});

// ── Push notifications ─────────────────────────────────────────────
self.addEventListener('push', function (event) {
  if (!event.data) return;

  var payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: 'WhidbeyWave', body: event.data.text() };
  }

  var options = {
    body: payload.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: payload.url || '/' },
    tag: payload.tag || 'whidbeywave',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'WhidbeyWave', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
