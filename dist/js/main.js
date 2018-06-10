let restaurants,neighborhoods,cuisines;var map,markers=[];document.addEventListener("DOMContentLoaded",event=>{DBHelper.getDB(),fetchNeighborhoods(),fetchCuisines()}),window.addEventListener("load",event=>{registerServiceWorker(),centreDetailsButton();const iframe=document.querySelector("iframe");iframe&&(iframe.title="Google Maps iframe");const images=document.querySelectorAll(".js-lazy-image");"IntersectionObserver"in window?(observer=new IntersectionObserver(onIntersection,{rootMargin:"50px 0px",threshold:.01}),images.forEach(image=>{observer.observe(image)})):Array.from(images).forEach(image=>preloadImage(image))}),onIntersection=(entries=>{entries.forEach(entry=>{entry.intersectionRatio>0&&(observer.unobserve(entry.target),preloadImage(entry.target))})}),preloadImage=(image=>{image.src=DBHelper.imageUrlForRestaurant(image.getAttribute("data-src")),image.srcset=DBHelper.imageSrcSetAttrForRestaurant(image.getAttribute("data-src"))}),registerServiceWorker=(()=>{navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js").then(function(){console.log("Service Worker registered!")}).catch(function(){console.log("Registration of the Service Worker failed")})}),centreDetailsButton=(()=>{const buttons=document.getElementById("restaurants-list").getElementsByTagName("a");for(var i=0;i<buttons.length;i++)buttons[i].style.left="calc(50% - "+buttons[i].clientWidth+"px / 2)"}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((error,neighborhoods)=>{error?console.error(error):(self.neighborhoods=neighborhoods,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((neighborhoods=self.neighborhoods)=>{const select=document.getElementById("neighborhoods-select");neighborhoods.forEach(neighborhood=>{const option=document.createElement("option");option.setAttribute("role","option"),option.innerHTML=neighborhood,option.value=neighborhood,select.append(option)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((error,cuisines)=>{error?console.error(error):(self.cuisines=cuisines,fillCuisinesHTML())})}),fillCuisinesHTML=((cuisines=self.cuisines)=>{const select=document.getElementById("cuisines-select");cuisines.forEach(cuisine=>{const option=document.createElement("option");option.innerHTML=cuisine,option.value=cuisine,select.append(option)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1,mapTypeId:"hybrid"}),updateRestaurants()}),updateRestaurants=(()=>{const cSelect=document.getElementById("cuisines-select"),nSelect=document.getElementById("neighborhoods-select"),cIndex=cSelect.selectedIndex,nIndex=nSelect.selectedIndex,cuisine=cSelect[cIndex].value,neighborhood=nSelect[nIndex].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine,neighborhood,(error,restaurants)=>{error?console.error(error):(resetRestaurants(restaurants),fillRestaurantsHTML())})}),resetRestaurants=(restaurants=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(m=>m.setMap(null)),self.markers=[],self.restaurants=restaurants}),fillRestaurantsHTML=((restaurants=self.restaurants)=>{const ul=document.getElementById("restaurants-list");restaurants.forEach(restaurant=>{ul.append(createRestaurantHTML(restaurant))}),addMarkersToMap()}),createRestaurantHTML=(restaurant=>{const li=document.createElement("li"),figure=document.createElement("figure"),figCaption=document.createElement("figcaption"),image=document.createElement("img");figure.className="restaurant-img",image.alt="Restaurant: "+restaurant.name,image.setAttribute("data-src",restaurant.photograph),image.className="js-lazy-image",figure.append(image),figure.append(figCaption),li.append(figure);const name=document.createElement("h2");name.innerHTML=restaurant.name,figCaption.append(name);const neighborhood=document.createElement("p");neighborhood.innerHTML=restaurant.neighborhood,figCaption.append(neighborhood);const address=document.createElement("p");address.innerHTML=restaurant.address,figCaption.append(address);const more=document.createElement("a");return more.innerHTML="View Details",more.href=DBHelper.urlForRestaurant(restaurant),figCaption.append(more),li}),addMarkersToMap=((restaurants=self.restaurants)=>{restaurants.forEach(restaurant=>{const marker=DBHelper.mapMarkerForRestaurant(restaurant,self.map);google.maps.event.addListener(marker,"click",()=>{window.location.href=marker.url}),self.markers.push(marker)})});