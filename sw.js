// sw.js - Service Worker para SuperSpuma
const CACHE_NAME = 'superspuma-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo-insso.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache SuperSpuma abierto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Si falla la red, devolver la página offline
          return caches.match('/index.html');
        });
      })
  );
});

// Notificaciones push
self.addEventListener('push', function(event) {
  const title = '🔔 SuperSpuma Extintores';
  const options = {
    body: event.data ? event.data.text() : 'Revisá los extintores con vencimiento próximo',
    icon: 'logo-insso.png',
    badge: 'logo-insso.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Click en notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
