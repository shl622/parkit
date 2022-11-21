let map, infoWindow;

async function saveSearch(search) {
  try{
    const response = await fetch("/api/save-search",{
      method:"POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(search)
    });
    const data = await response.json();
    console.log(data);
  }catch(err){
    console.log(err.message);
  }

};

function initMap() {
  const myLatlng = { lat: 40.7323, lng: -73.9941 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 17,
    center: myLatlng,
    disableDefaultUI: true,
  });

  //-------------------------------------------Drag,Bounds Changed LatLng Returns-------------------------------------------
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //https://www.drupal.org/node/2512882
  //https://stackoverflow.com/questions/25539734/get-center-coords-after-drag-pan-finished
  //References to using Google Maps Event Listeners

  google.maps.event.addListener(map,'idle',function(){
      if(!this.get('dragging') && this.get('oldCenter') && this.get('oldCenter')!==this.getCenter()) {
          console.log("lat",map.getCenter().lat());
          console.log("lng",map.getCenter().lng());
          getCurbData(map.getCenter().lat(),map.getCenter().lng())
      }
      if(!this.get('dragging')){
          this.set('oldCenter',this.getCenter())
      }
  });

  google.maps.event.addListener(map,'dragstart',function(){
      this.set('dragging',true);          
  });

  google.maps.event.addListener(map,'dragend',function(){
      this.set('dragging',false);
      google.maps.event.trigger(this,'idle',{});
  });

  //----------------------------Search Bar-------------------------------------------
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();
    saveSearch({address:input.value, userlat: map.getCenter().lat(), userlng: map.getCenter().lng()})
    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

window.initMap = initMap;

