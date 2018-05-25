self.addEventListener('install', function(event){
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
        caches.open('restaurant-v1').then(function(cache){
            return cache.addAll(urlsToCache);
        })
    );
});