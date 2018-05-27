self.addEventListener('install', function (event) {
    var urlsToCache = [
        '/',
        '/css/styles.css',
        '/data/restaurants.json',
        '/img',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js'
    ];

    event.waitUntil(
        caches.open('restaurant-v1').then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) return response;
            return fetch(event.request);
        })
    );
});