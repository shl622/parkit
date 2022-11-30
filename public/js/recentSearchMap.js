let staticMap = true;
let map,infoWindow,poly;

function initializeMap(){
    //initialize 3 maps by getting the lat and lng values from stored db search
    //let dbLat = [] store latitudein array by timestamp latest>third 
    //let dbLng = [] store longitude in array by timestamp latest>third 
    //ex) testlatlang1 = {lat: dbLat[0], lng: dbLng[0]}
    //const latlng = { lat:dbLat, lng:dbLng }

    const testlatlng1 = {lat: 40.7295971136735, lng: -73.99710405};
    const testlatlng2 = {lat: 40.7323, lng: -73.9941};
    const testlatlng3 = {lat: 40.73094768743841, lng: -73.99650293797403};

    const map1 = new google.maps.Map(document.getElementById("map1"),{
        zoom: 17,
        center: testlatlng1,
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
    const map2 = new google.maps.Map(document.getElementById("map2"),{
        zoom: 17,
        center: testlatlng2,
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
    const map3 = new google.maps.Map(document.getElementById("map3"),{
        zoom: 17,
        center: testlatlng3,
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
    //-------------------------------------------Draw the lines on map-------------------------------------------//
    //--------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------
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
          google.maps.event.addListener(map1,"click",function(event){
            infoWindow.close();
          });
        });
    }

    google.maps.event.addListener(map1,'idle', async function(){
        let bounds = this.getBounds();
        let center = this.getCenter();
        let ne = bounds.getNorthEast();
        let sw = bounds.getSouthWest();
        let data = await getCurbData(center.lat(),center.lng(),ne.lat(),ne.lng(),sw.lat(),sw.lng())
        drawData(data,map1);
    });

    google.maps.event.addListener(map2,'idle', async function(){
        let bounds = this.getBounds();
        let center = this.getCenter();
        let ne = bounds.getNorthEast();
        let sw = bounds.getSouthWest();
        let data = await getCurbData(center.lat(),center.lng(),ne.lat(),ne.lng(),sw.lat(),sw.lng())
        drawData(data,map2);
    });

    google.maps.event.addListener(map3,'idle', async function(){
        let bounds = this.getBounds();
        let center = this.getCenter();
        let ne = bounds.getNorthEast();
        let sw = bounds.getSouthWest();
        let data = await getCurbData(center.lat(),center.lng(),ne.lat(),ne.lng(),sw.lat(),sw.lng())
        drawData(data,map3);
    });
}
