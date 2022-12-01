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
    styles: [
      {
          featureType: "poi",
          elementType: "labels",
          stylers: [
                { visibility: "off" }
          ]
      }
  ]
  });
  //-------------------------------------------Draw the lines on map-------------------------------------------//
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------
  //References to drawing PolyLines on Google Maps
  //https://developers.google.com/maps/documentation/javascript/shapes
  //References to infowindow
  //https://developers.google.com/maps/documentation/javascript/infowindows
  
  //boolean function to see if current time is within the bounds of the parking rule
   function checkTimeBounds(bounds,checkTime){
    const boundsObj = bounds.map(bound=>{
      const lower = parseInt(bound.slice(0,2));
      const minutes = parseInt(bound.slice(3,5));
      if (bound.includes("PM")){
        return {hour: lower+12, minutes};
      }
      if (bound.includes("12:00AM")){
        return {hour: lower-12, minutes};
      }
      return {hour: lower, minutes}
    });
    // console.log(boundsObj);
    // console.log("checkTime",checkTime);
    //check if current time is within the bounds inclusive (hour+minutes)
    //check if current time is within the bounds exclusive (hour)
    //check the corner case where parking is available for 24hr
    //***check weird corner cases*** 
    //---unit test these---
    if (boundsObj[0].hour===boundsObj[1].hour){
      if (checkTime.minutes>=boundsObj[0].minutes){
        return true;
      }
    }
    if (checkTime.hour>boundsObj[0].hour && checkTime.hour<boundsObj[1].hour){
      return true;
    }
    if (checkTime.hour===boundsObj[0].hour){
      if (checkTime.minutes>=boundsObj[0].minutes){
        return true;
      }
    }
    if (checkTime.hour===boundsObj[1].hour){
      if (checkTime.minutes<=boundsObj[1].minutes){
        return true;
      }
    }
  }

  //function to check the status of each street parking rules
  //use regexr: https://regexr.com/ to select time from fetched data
  function checkStatus(status){
    //base case when no parking is allowed anytime
    if (status==="No Parking Anytime"){
      return "red";
    }
    if (status ==="Parking Permitted All Week"){
      return "green";
    }
    const timenow = new Date();
    const regex = /\d{2}:\d{2}\w{2}/g;
    const timeBound = status.match(regex);
    const checkTime = {hour: timenow.getHours(), minutes: timenow.getMinutes()}; 
    const withinBounds = checkTimeBounds(timeBound,checkTime);
    // console.log("withinBounds?",withinBounds);
    if (status.includes("No Parking From")){
      if (!withinBounds){
        return "grey";
      }
    }
    else{
      if (withinBounds){
        return "green";
      }
        return "red";
    }
  }

  function drawData(data){
    data.features.forEach((feature,index)=>{
      let parkingStatus = feature.properties.rule_simplified;
      let additionalRule = feature.properties.addtl_info_parking_rule;
      const color = checkStatus(parkingStatus);
      let devPath = [];
      let path = feature.geometry.coordinates.map(geometry=>{     
        return {lng: geometry[0], lat: geometry[1]};
      });
      devPath.push(path);
      const parkPath = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      parkPath.setMap(map);
      //base case content of infowindow
      let infoWindow = new google.maps.InfoWindow();
      const feedbackformEl = document.getElementById("feedbackform");
      const feedbackforminnerEl = document.querySelector(".feedbackform-inner");
      //once feedback changed
      feedbackformEl.onsubmit = async (event) =>{
        event.preventDefault();
        const feedbackformState = {
          category:"",
          comment:"",
          location: "",
          pathData: []
        };
        const category = document.getElementById("feedbackform-category");
        const comment = document.getElementById("feedbackform-comment");
        const location = document.getElementById("feedbackform-location");
        feedbackformState.category= category.value;
        feedbackformState.comment = comment.value;
        feedbackformState.pathData = devPath[0];
        feedbackformState.location = location.value;
        try{
          const response = await fetch("/api/save-feedback",{
            method: "POST",
            headers: {
              "Content-Type":"application/json",
            },
            body: JSON.stringify(feedbackformState),
          });
          const data = await response.json();
          feedbackformEl.classList.add("hidden"); 
          if(!data.success){
            alert(data.error);
          }
          //look here if submit form doesn't work
          const content = `
        <div class ="overlay">
        <header>
        <h3 class="header">Parking Information</h3>
        <br>
        </header>
        <p class="parkingstatus-${color}">${parkingStatus}</p>
        <br>
        <p class="parkingaddrule ${!additionalRule?"hidden":""}">${additionalRule}</p>
        <div class ="overlay-feedback">
        <br>
        <p class="issue">Notice Issues? testing</p>
        <button class="button overlay-button" onclick = "document.getElementById('feedbackform').classList.remove('hidden')">Report</button>
        </div>
        </div>
        `;
        infoWindow.setContent(content);
        }catch(err){
          console.log(err.message);
          alert(err.message);
        }
      }
      
      feedbackforminnerEl.onclick = (event) =>{
        event.stopPropagation();
      }

      feedbackformEl.onclick= () =>{
       feedbackformEl.classList.add("hidden"); 
      };
      
      document.body.append(feedbackformEl);
      let lastStrokeWeight = null;
      google.maps.event.addListener(parkPath, 'mouseover', function(event){
        lastStrokeWeight = this.strokeWeight;
        this.setOptions({strokeWeight: 5});
      });
      google.maps.event.addListener(parkPath, 'mouseout', function(event){
        this.setOptions({strokeWeight: lastStrokeWeight || 2});
      });
      google.maps.event.addListener(parkPath, 'click', function(event){
        const content = `
        <div class ="overlay">
        <header>
        <h3 class="header">Parking Information</h3>
        <br>
        </header>
        <p class="parkingstatus-${color}">${parkingStatus}</p>
        <br>
        <p class="parkingaddrule ${!additionalRule?"hidden":""}">${additionalRule}</p>
        <div class ="overlay-feedback">
        <br>
        <p class="issue">Notice Issues?</p>
        <button class="button overlay-button" onclick = "document.getElementById('feedbackform').classList.remove('hidden')">Report</button>
        </div>
        </div>
        `
        infoWindow.setContent(content);
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map); 
      });
      google.maps.event.addListener(map,"click",function(event){
        infoWindow.close();
      });
    });
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
    //console.log("places",places);
    if (places.length == 0) {
      return;
    }
    const firstplace = [places[0]];

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    firstplace.forEach((place) => {
      saveSearch({address:input.value, userlat: place.geometry.location.lat(), userlng: place.geometry.location.lng()});
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

