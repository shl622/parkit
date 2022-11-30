let staticMap = true;
let map,infoWindow,poly;

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

function rendermap(lat,lng,index){
  const map = new google.maps.Map(document.getElementById(`map${index+1}`),{
    zoom: 17,
    center: {lat,lng},
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
//opencurb
function drawData(data,mapindex){
  data.features.forEach((feature,index)=>{
    let parkingStatus = feature.properties.rule_simplified;
    let additionalRule = feature.properties.addtl_info_parking_rule;
    const color = checkStatus(parkingStatus);
    let path = feature.geometry.coordinates.map(geometry=>{     
      return {lng: geometry[0], lat: geometry[1]};
    });
    const parkPath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    parkPath.setMap(mapindex);
    //base case content of infowindow
    let infoWindow = new google.maps.InfoWindow();
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
      infoWindow.open(mapindex); 
    });
    google.maps.event.addListener(map,"click",function(event){
      infoWindow.close();
    });
  });
}
google.maps.event.addListener(map,'idle', async function(){
  let bounds = this.getBounds();
  let center = this.getCenter();
  let ne = bounds.getNorthEast();
  let sw = bounds.getSouthWest();
  let data = await getCurbData(center.lat(),center.lng(),ne.lat(),ne.lng(),sw.lat(),sw.lng())
  drawData(data,map);
});
}
async function initializeMap(){
    console.log("called main");
    const response = await fetch('/api/recent');
    const {success, data} = await response.json();
    console.log("data",success,data);
    if (success){
        const searchContainerEl = document.getElementById("map-container");
        data.forEach((search,index)=>{
            rendermap(search.userlat,search.userlng,index);
            const searchEl = document.createElement("div");
            searchEl.innerHTML=`
            <p>${search.userlat}</p>
            <p>${search.userlng}</p>
            <p>${search.address}</p>
            <p>${search.time}</p>
            `
            searchContainerEl.append(searchEl);
        });
    }    
}