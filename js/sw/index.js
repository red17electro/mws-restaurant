self.addEventListener('install', function(event){
    var urlsToCache = [
        '/',
        '/css/styles.css',
        '/data/restaurants.json',
        '/img',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyBTdzmtC0LLnlXCT8Pj-kO1CshADh04DxQ&libraries=places&callback=initMap'
    ];
    
    event.waitUntil(
        caches.open('restaurant-v1').then(function(cache){
            return cache.addAll(urlsToCache);
        })
    );
});