//shell cache 
const shellCache = 'shell-cache-v4';
const dynamicCache = 'dynamic-cache-v4';

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
    //pre cache shel assets
    console.log('App shell cache')
    event.waitUntil(
        caches.open(shellCache).then(cache => {
             cache.addAll(shellAssets);
        })
    );
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
    )
})

//fetch
self.addEventListener('fetch', event => {
    console.log('Fetch event', event);
    //saves the cache if its not prev save
    event.respondWith(
        caches.match(event.request).then( cacheResponse => {
            return cacheResponse || fetch(event.request).then(fetchResponse => {
                return caches.open(dynamicCache).then(cache => {
                    cache.put(event.request.url, fetchResponse.clone());
                    return fetchResponse;
                })
            });
        })
        .catch(() => { return caches.match('/offline.html');})
    );
})