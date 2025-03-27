const shellCache = 'shell-cache-v3';
const dynamicCache = 'dynamic-cache-v3';
const shellAssets = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/offline.html'
];

self.addEventListener('install', event => {
    console.log('Service worker instalado', event);
    event.waitUntil(
        caches.open(shellCache).then(cache => {
            return cache.addAll(shellAssets); // Cacheando los activos esenciales
        })
    );
    self.skipWaiting(); // Aseguramos que el Service Worker tome el control inmediatamente
});

self.addEventListener('activate', event => {
    console.log('Service worker activado', event);
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== shellCache && key !== dynamicCache)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // Asegura que los clientes (páginas) se actualicen inmediatamente
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return; // Solo manejar solicitudes GET

    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            // Si encontramos la respuesta en el cache, la servimos
            if (cacheResponse) {
                return cacheResponse;
            }

            // Si no está en cache, intentamos hacer la solicitud de red
            return fetch(event.request).then(fetchResponse => {
                // Si la solicitud es de un módulo dinámico, la cacheamos
                if (event.request.url.endsWith('.js')) {
                    return caches.open(dynamicCache).then(cache => {
                        cache.put(event.request, fetchResponse.clone()); // Guardamos el módulo JS en cache
                        return fetchResponse;
                    });
                }

                // Si no es un módulo JS, no lo cacheamos
                return fetchResponse;
            }).catch(() => {
                // Si la solicitud falla (como en modo offline), servimos la página offline
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html'); // Servir página offline si es navegación
                }
            });
        })
    );
});

// Escuchar el evento 'online' para manejar la reconexión
self.addEventListener('online', () => {
    console.log('El dispositivo ha vuelto a estar en línea');
    // Aquí puedes manejar la lógica adicional que desees, como sincronizar datos o actualizar caches
});
