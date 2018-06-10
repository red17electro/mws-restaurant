let restaurant;var map;document.addEventListener("DOMContentLoaded",event=>{DBHelper.getDB()}),window.addEventListener("load",event=>{registerServiceWorker();const iframe=document.querySelector("iframe");iframe&&(iframe.title="Google Maps iframe")}),registerServiceWorker=(()=>{navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js").then(function(){console.log("Service Worker registered!")}).catch(function(){console.log("Registration of the Service Worker failed")})}),window.initMap=(()=>{fetchRestaurantFromURL((error,restaurant)=>{error?console.error(error):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:restaurant.latlng,scrollwheel:!1,mapTypeId:"hybrid"}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(callback=>{if(self.restaurant)return void callback(null,self.restaurant);const id=getParameterByName("id");id?DBHelper.fetchRestaurantById(id,(error,restaurant)=>{self.restaurant=restaurant,restaurant?(fillRestaurantHTML(),callback(null,restaurant)):console.error(error)}):(error="No restaurant id in URL",callback(error,null))}),fillRestaurantHTML=((restaurant=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=restaurant.name,document.getElementById("restaurant-address").innerHTML=restaurant.address;const image=document.getElementById("restaurant-img");image.className="restaurant-img",image.alt="Restaurant: "+restaurant.name,image.src=DBHelper.imageUrlForRestaurant(restaurant),image.srcset=DBHelper.imageSrcSetAttrForRestaurant(restaurant),document.getElementById("restaurant-cuisine").innerHTML=restaurant.cuisine_type,restaurant.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}),fillRestaurantHoursHTML=((operatingHours=self.restaurant.operating_hours)=>{const hours=document.getElementById("restaurant-hours");for(let key in operatingHours){const row=document.createElement("tr"),day=document.createElement("td");day.innerHTML=key,row.appendChild(day);const time=document.createElement("td");time.innerHTML=operatingHours[key],row.appendChild(time),hours.appendChild(row)}}),fillReviewsHTML=((reviews=self.restaurant.reviews)=>{const container=document.getElementById("reviews-container"),title=document.createElement("h3");if(title.innerHTML="Reviews",container.appendChild(title),!reviews){const noReviews=document.createElement("p");return noReviews.innerHTML="No reviews yet!",void container.appendChild(noReviews)}const ul=document.getElementById("reviews-list");reviews.forEach(review=>{ul.appendChild(createReviewHTML(review))}),container.appendChild(ul)}),createReviewHTML=(review=>{const li=document.createElement("li"),name=document.createElement("p");name.innerHTML=review.name,li.appendChild(name);const date=document.createElement("p");date.innerHTML=review.date,li.appendChild(date);const rating=document.createElement("p");rating.innerHTML=`Rating: ${review.rating}`,li.appendChild(rating);const comments=document.createElement("p");return comments.innerHTML=review.comments,li.appendChild(comments),li}),fillBreadcrumb=((restaurant=self.restaurant)=>{const breadcrumb=document.getElementById("breadcrumb"),li=document.createElement("li"),a=document.createElement("a");a.href=window.location.href,a.setAttribute("aria-current","page"),a.innerHTML=restaurant.name,li.appendChild(a),breadcrumb.appendChild(li)}),getParameterByName=((name,url)=>{url||(url=window.location.href),name=name.replace(/[\[\]]/g,"\\$&");const results=new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`).exec(url);return results?results[2]?decodeURIComponent(results[2].replace(/\+/g," ")):"":null});