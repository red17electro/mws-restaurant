/*jshint esversion: 6 */

let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];

/**
 * Initialize the database, Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.getDB();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Register Service Worker and manipulate the content on load
 */
window.addEventListener('load', (event) => {
  registerServiceWorker();
  centreDetailsButton();

  /* add the title to the iframe of Google Maps*/
  const iframe = document.querySelector('iframe')
  if (iframe) {
    iframe.title = 'Google Maps iframe';
  }


  // Get all of the images that are marked up to lazy load
  const images = document.querySelectorAll('.js-lazy-image');
  const config = {
    // If the image gets within 50px in the Y axis, start the download.
    rootMargin: '50px 0px',
    threshold: 0.01
  };

  // If intersection observer is not supported 
  if (!('IntersectionObserver' in window)) {
    Array.from(images).forEach(image => preloadImage(image));
  } else {
    // It is supported, load the images
    observer = new IntersectionObserver(onIntersection, config);
    images.forEach(image => {

      observer.observe(image);
    });
  }
});

onIntersection = (entries) => {
  // Loop through the entries
  entries.forEach(entry => {
    // Are we in viewport?
    if (entry.intersectionRatio > 0) {

      // Stop watching and load the image
      observer.unobserve(entry.target);
      preloadImage(entry.target);
    }
  });
};


preloadImage = (image) => {
  image.src = DBHelper.imageUrlForRestaurant(image.getAttribute('data-src'));
  image.srcset = DBHelper.imageSrcSetAttrForRestaurant(image.getAttribute('data-src'));
}

/**
 * Register a service worker 
 */

registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/sw.js').then(function () {
    console.log("Service Worker registered!");
  }).catch(function () {
    console.log("Registration of the Service Worker failed");
  });
};

/**
 * This function is centering the 'View Details' button
 */

centreDetailsButton = () => {
  const list = document.getElementById('restaurants-list');
  const buttons = list.getElementsByTagName('a');

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.left = 'calc(50% - ' + buttons[i].clientWidth + 'px / 2)'; // calculating the left coordinate, where the button should locate itself
  }
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.setAttribute('role', 'option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false,
    mapTypeId: 'hybrid'
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  checkFavouriteRestaurants();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const figure = document.createElement('figure');
  const figCaption = document.createElement('figcaption');
  const favButton = document.createElement('button');
  const favDiv = document.createElement('div');

  favDiv.className = "iconicfill-star";
  favButton.disabled = false;
  favButton.addEventListener("click", function () {
    favButton.disabled = true;
    makeFav(restaurant.id);
  });

  favButton.append(favDiv);

  const image = document.createElement('img');
  figure.className = 'restaurant-img';
  image.alt = 'Restaurant: ' + restaurant.name;
  image.setAttribute('data-src', restaurant.photograph);
  image.className = 'js-lazy-image';
  figure.append(image);
  figure.append(figCaption);

  li.append(favButton);
  li.append(figure);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  figCaption.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  figCaption.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  figCaption.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  figCaption.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

/** 
 * Make restaurant a favourite 
 */

makeFav = (restaurant_id) => {
  fetch(`${DBHelper.SERVER_URL}/restaurants/${restaurant_id}`).then(response => response.json()).then(function (restaurant) {
    fetch(`${DBHelper.SERVER_URL}/restaurants/${restaurant.id}/?is_favorite=${!JSON.parse(restaurant.is_favorite)}`, {
        method: "PUT",
      }).then(response => response.json()).then(function (restaurant) {
        const ul = document.getElementById('restaurants-list');
        const child = ul.childNodes[restaurant.id - 1];
        child.className = "";
        checkFavouriteRestaurants();
        const favButton = child.querySelector('button');
        favButton.disabled = false;
      })
      .catch(error => console.error(`Fetch Error =\n`, error));
  }).catch(error => console.error(`Fetch Error = \n`, error));
}

/** 
 * Mark restaurants with specific class if they are set as favourite by users
 */

checkFavouriteRestaurants = () => {
  fetch(`${DBHelper.SERVER_URL}/restaurants/?is_favorite=true`).then(response => response.json()).then(function (favRestaurants) {
      favRestaurants.forEach(function (restaurant) {
        const ul = document.getElementById('restaurants-list');
        const child = ul.childNodes[restaurant.id - 1];
        child.className = "favourite";
      })
    })
    .catch(error => console.error(`Fetch Error =\n`, error));
}