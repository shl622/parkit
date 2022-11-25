//flag for bootup fetch request
let hasinitSearch = false;
let map, infoWindow, poly;

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
  const myLatlng = { lat: 40.7309, lng: -73.9973 };
  
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: myLatlng,
    disableDefaultUI: true,
  });
  //-------------------------------------------Draw the lines on map-------------------------------------------//
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //References to drawing PolyLines on Google Maps
  //https://developers.google.com/maps/documentation/javascript/shapes
  
  function drawData(data){
    data.features.forEach(feature=>{
      let path = feature.geometry.coordinates.map(geometry=>{     
        return {lng: geometry[0], lat: geometry[1]};
      })
      const parkPath = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      parkPath.setMap(map);
    })
  }

  //-------------------------------------------Drag,Bounds Changed LatLng Returns-------------------------------------------
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //References to using Google Maps Event Listeners
  //https://www.drupal.org/node/2512882
  //https://stackoverflow.com/questions/25539734/get-center-coords-after-drag-pan-finished
  //References to using Google Maps Radius Fetch
  //https://stackoverflow.com/questions/3525670/radius-of-viewable-region-in-google-maps-v3
  google.maps.event.addListener(map,'idle', async function(){
    let bounds = map.getBounds();
    let center = map.getCenter();
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();
    if(!hasinitSearch){
      //default bootup fetch data
      let data = await getCurbData(center.lat(),center.lng(),ne.lat(),ne.lng(),sw.lat(),sw.lng())
      hasinitSearch = true;
      drawData(data);
    }
      if(!this.get('dragging') && this.get('oldCenter') && this.get('oldCenter')!==this.getCenter()) {
          bounds = map.getBounds();
          center = map.getCenter();
          ne = bounds.getNorthEast();
          sw = bounds.getSouthWest();
          console.log("lat",center.lat());
          console.log("lng",center.lng());
          drawData(await getCurbData(center.lat(),center.lng(),ne.lat(),ne.lng(),sw.lat(),sw.lng()));
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

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
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

