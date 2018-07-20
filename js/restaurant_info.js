/*jshint esversion: 6 */
let restaurant;
var map;

/**
 * Initialize the database
 */
document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.getDB();
});


/**
 * Register Service Worker as soon as the page is loaded.
 */
window.addEventListener('load', (event) => {
  registerServiceWorker();

  /* add the title to the iframe of Google Maps*/
  const iframe = document.querySelector('iframe')
  if (iframe) {
    iframe.title = 'Google Maps iframe';
  }
});

/**
 * Register a service worker 
 */

registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/sw.js').then(function () {
    console.log("Service Worker registered!");
    requestSync();
  }).catch(function () {
    console.log("Registration of the Service Worker failed");
  });
};

/*
 * Subscribe for the sync event
 */

requestSync = () => {
  navigator.serviceWorker.ready.then(function (swRegistration) {
    return swRegistration.sync.register('syncReviews');
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false,
        mapTypeId: 'hybrid'
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = 'Restaurant: ' + restaurant.name;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcSetAttrForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

  // create adding reviews form
  addReviewsForm();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create the form for adding reviews
 */

addReviewsForm = (rest_id = self.restaurant.id) => {
  const container = document.getElementById('reviews-container');
  const form = document.createElement('form');

  const submit = document.createElement('input');
  submit.type = "submit";
  submit.value = "Submit";

  const name = document.createElement('input');
  name.type = "text";
  name.name = "name";
  name.id = "name-field";
  name.placeholder = "Enter first name";

  const labelName = document.createElement('label');
  labelName.setAttribute('for', name.id);
  labelName.innerHTML = "Name";

  const restId = document.createElement('input');
  restId.type = "text";
  restId.name = "restaurant_id";
  restId.value = rest_id;
  restId.style.display = 'none';

  const rating = document.createElement('input');
  rating.className = "slider";
  rating.type = "range";
  rating.id = "id-field";
  rating.name = "rating";
  rating.min = "1";
  rating.max = "5";

  const labelRating = document.createElement('label');
  labelRating.setAttribute('for', rating.id);
  labelRating.innerHTML = "Rating";

  const comments = document.createElement('textarea');
  comments.name = "comments";
  comments.placeholder = "Enter your review about the restaurant here";
  comments.rows = "15";
  comments.cols = "30";
  comments.id = "comments-field";
  comments.required = true;
  comments.setAttribute('aria-required', true);

  const labelComments = document.createElement('label');
  labelComments.setAttribute('for', comments.id);
  labelComments.innerHTML = "Comments";

  form.onsubmit = function (ev) {
    ev.preventDefault();

    var item = {
      "restaurant_id": parseInt(restId.value),
      "date": new Date().toDateString(),
      "name": name.value,
      "rating": rating.value,
      "comments": comments.value
    };

    DBHelper.restaurantDBPromise.then(function (db) {
      if (!db) return;

      var tx = db.transaction('restaurants', 'readwrite');
      var restaurantsStore = tx.objectStore('restaurants');

      return restaurantsStore.get(rest_id);
    }).then(function (val) {
      var temp = val;
      DBHelper.restaurantDBPromise.then(function (db) {
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');

        if (!temp.reviews) {
          temp.reviews = [];
        }

        item.offline = true;

        temp.reviews.push(item);

        store.put(temp);
        return tx.complete;
      }).then(function () {
        fetch(`${DBHelper.SERVER_URL}/reviews/`, {
          method: 'post',
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify(item)
        }).then(response => response.json()).then(function (response) {
          window.location.href = `/restaurant.html?id=${rest_id}`;
        }).catch(function () {
          alert("Unfortunately, the connection is lost. Therefore, the submitted review will be sent to the server once the connection is re-established.");
          window.location.href = `/restaurant.html?id=${rest_id}`;
        })
      });
    });
  };

  form.appendChild(name);
  form.appendChild(labelName);
  form.appendChild(restId);
  form.appendChild(rating);
  form.appendChild(labelRating);
  form.appendChild(comments);
  form.appendChild(labelComments);
  form.appendChild(submit);

  container.appendChild(form);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  if (review.date) {
    const date = document.createElement('p');
    date.innerHTML = review.date;
    li.appendChild(date);
  }

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = window.location.href;
  a.setAttribute('aria-current', 'page');
  a.innerHTML = restaurant.name;
  li.appendChild(a);
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};