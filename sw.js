/*jshint esversion: 6 */

var CACHES_NAME = 'restaurant-v1';

self.addEventListener('install', function (event) {
    var urlsToCache = [
        '/',
        '/index.html',
        '/restaurant.html',
        '/css/styles.css',
        '/data/restaurants.json',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js'
    ];

    for (let i=1; i<=10; i++){
        urlsToCache.push('/img/' + i + '.jpg');
        urlsToCache.push('/restaurant.html?id=' + i);
    }

    event.waitUntil(
        caches.open(CACHES_NAME).then(function (cache) {
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