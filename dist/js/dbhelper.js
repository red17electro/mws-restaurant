/**
 * Common database helper functions.
 */
/* jshint esversion: 6 */
class DBHelper {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    return `${this.SERVER_URL}/restaurants`;
  }

  /**
   * Server URL.
   */
  static get SERVER_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   *  Store the promise of the database
   *
   */
  static getDB() {
    this.restaurantDBPromise = idb.open('restaurants-db', 1, function (upgradeDB) {
      switch (upgradeDB.oldVersion) {
        case 0:
          var keyValStore = upgradeDB.createObjectStore('restaurants', {
            keyPath: 'id'
          });
          keyValStore.createIndex('id', 'id');
      }
    });
  }

  /**
   * Process the response of the fetch request
   */
  static status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(new Error(`Request failed. Returned status of ${response.statusText}`));
    }
  }

  /**
   * Parse the received JSON data
   */
  static json(response) {
    return response.json();
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL).then(DBHelper.status).then(DBHelper.json).then(function (restaurants) {
      DBHelper.restaurantDBPromise.then(function (db) {
        if (!db) return;

        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');
        restaurants.forEach(function (restaurant) {
          store.put(restaurant);
        });
      });
      callback(null, restaurants);
    }).catch(function (error) {
      // When fetch fails, try to get the data from the database
      DBHelper.restaurantDBPromise.then(function (db) {
        if (!db) return;

        var index = db.transaction('restaurants').objectStore('restaurants');

        return index.getAll().then(function (restaurants) {
          callback(null, restaurants);
        });
      }).catch(function () {
        callback(error, null);
      });
    });
  }

  /** 
   * Fetch all reviews.
   */

  static fetchReviews(id, callback) {
    fetch(`${DBHelper.SERVER_URL}/reviews/?restaurant_id=${id}`).then(DBHelper.status).then(DBHelper.json).then(function (reviews) {
      DBHelper.restaurantDBPromise.then(function (db) {
        if (!db) return;

        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');

        return store.openCursor();
      }).then(function addReview(cursor) {
        var restaurant = cursor.value;
        if (!cursor || restaurant.id !== id) return;

        reviews.forEach(function (review) {
          if (!restaurant.reviews) {
            restaurant.reviews = [];
          }

          restaurant.reviews.push(review);
          cursor.update(restaurant);
        });
        return cursor.continue().then(addReview);
      });

      callback(null, reviews);
    }).catch(function () {
      DBHelper.restaurantDBPromise.then(function (db) {
        if (!db) return;

        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');

        return store.openCursor();
        /*           return index.getAll().then(function (restaurants) {
                    callback(null, restaurants);
                  }); */
      }).then(function addReview(cursor) {
        var restaurant = cursor.value;
        if (!cursor || restaurant.id !== id) return;

        callback(null, restaurant.reviews);

        return cursor.continue().then(addReview);
      }).catch(function () {
        callback(error, null);
      });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    var id = parseInt(id);
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          DBHelper.fetchReviews(id, (error, reviews) => {
            if (error) {
              callback(error, null);
            } else {
              const foundReviews = [];
              reviews.forEach(function (review) {
                if (review.restaurant_id === parseInt(id)) {
                  foundReviews.push(review);
                }
              });
              restaurant.reviews = foundReviews;
              callback(null, restaurant);
            }
          });
        } else {
          // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    var fileName;
    if (typeof restaurant === 'object') {
      fileName = restaurant.photograph;
    } else {
      fileName = restaurant;
    }
    // TODO add check for Safari, Firefox, IE, regarding webp
    return `/img/${fileName === 'undefined' || !fileName ? 'No_image.svg' : fileName + '.webp'}`;
  }

  /**
   * Restaurant image srcset
   */
  static imageSrcSetAttrForRestaurant(restaurant) {
    var fileName;
    if (typeof restaurant === 'object') {
      fileName = restaurant.photograph;
    } else {
      fileName = restaurant;
    }

    return fileName === 'undefined' || !fileName ? '' : `/img/${fileName}.webp 1x, /img/${fileName}@2x.webp 2x`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}