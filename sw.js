/*jshint esversion: 6 */

var CACHES_NAME = 'restaurant-v8';

self.addEventListener('install', function (event) {
    var urlsToCache = [
        '/',
        '/index.html',
        '/restaurant.html',
        '/js/all_main.js',
        '/js/all_rest.js',
        '/img/1.webp',
        '/img/1@2x.webp',
        '/img/2.webp',
        '/img/2@2x.webp',
        '/img/3.webp',
        '/img/3@2x.webp',
        '/img/4.webp',
        '/img/4@2x.webp',
        '/img/5.webp',
        '/img/5@2x.webp',
        '/img/6.webp',
        '/img/6@2x.webp',
        '/img/7.webp',
        '/img/7@2x.webp',
        '/img/8.webp',
        '/img/8@2x.webp',
        '/img/9.webp',
        '/img/9@2x.webp',
        '/img/10.webp',
        '/img/10@2x.webp',
        '/img/No_image.svg',
        '/restaurant.html?id=1',
        '/restaurant.html?id=2',
        '/restaurant.html?id=3',
        '/restaurant.html?id=4',
        '/restaurant.html?id=5',
        '/restaurant.html?id=6',
        '/restaurant.html?id=7',
        '/restaurant.html?id=8',
        '/restaurant.html?id=9',
        '/restaurant.html?id=10',
        '/img/icons-192.webp',
        '/img/icons-512.webp',
        '/manifest.json'
    ];

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