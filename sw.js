//shell cache 
const shellCache = 'shell-cache-v2';
const dynamicCache = 'dynamic-cache-v2';
const shellAssets = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/src/index.jsx',
    '/src/App.jsx',
    '/src/config.js',
    '/offline.html'
];


//install
self.addEventListener('install', event => {
    console.log('Service worker installed', event);
    //pre cache shell assets
    console.log('App shell cache')
    event.waitUntil(
        caches.open(shellCache).then(cache => {
             cache.addAll(shellAssets);
        })
    );
    self.skipWaiting();
})

//activate event
self.addEventListener('activate', event => {
    console.log('Service worker activated', event);
    //delete old caches
    event.waitUntil(
        caches.keys().then( keys => {
            return Promise.all(keys
                .filter(key => key !== shellCache && key !== dynamicCache)
                .map(key => caches.delete(key))
            )
        })
    );
    self.clients.claim();
})

//fetch
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            return cacheResponse || fetch(event.request).then(fetchResponse => {
                return caches.open(dynamicCache).then(cache => {
                    cache.put(event.request.url, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => {
            if (event.request.mode === 'navigate' || event.request.destination === 'document') {
                return caches.match('/offline.html');
            }
            return caches.match(event.request);
        })
    );
});