/*jshint esversion: 6 */

var CACHES_NAME = 'restaurant-v13';

self.addEventListener('install', function (event) {
    var urlsToCache = [
        '/',
        '/index.html',
        '/restaurant.html',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/idb.js',
        '/js/restaurant_info.js',
        '/img/1.webp',
        '/img/2.webp',
        '/img/3.webp',
        '/img/4.webp',
        '/img/5.webp',
        '/img/6.webp',
        '/img/7.webp',
        '/img/8.webp',
        '/img/9.webp',
        '/img/10.webp',
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
        '/restaurant.html?id=10'
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

self.addEventListener('sync', function (event) {
    if (event.tag === 'syncReviews') {
        event.waitUntil(pushReviewsToTheServer());
    }
});

function pushReviewsToTheServer() {
    if (typeof idb === "undefined" || typeof DBHelper === "undefined") {
        self.importScripts('js/dbhelper.js', 'js/idb.js');
    }

    let promiseArray = [];
    DBHelper.getDB();
    DBHelper.restaurantDBPromise.then(function (db) {
        if (!db) return;

        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');

        return store.openCursor();
    }).then(function addReview(cursor) {

        if (!cursor) return;

        var restaurant = cursor.value;
        var reviews = restaurant.reviews;

        if (reviews) {
            reviews.forEach(element => {
                if (element.offline) {
                    delete element.offline;
                    promiseArray.push(fetch(`${DBHelper.SERVER_URL}/reviews/`, {
                        method: 'post',
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                        },
                        body: JSON.stringify(element)
                    }).then(response => response.json()));
                }
            });
        }

        return cursor.continue().then(addReview);
    }).then(function () {
        return Promise.all(promiseArray).then(function () {
            console.log(`Success! Promise all`);
        }).catch(function (error) {
            throw 'Silenced Exception! ' + error;
        });
    });
}