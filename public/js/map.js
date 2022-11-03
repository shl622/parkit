let map, infoWindow;

async function getCurbData(lat=40.7323,long=-73.9941,radius=50){
    //get today's date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0'); 
    const fulldate = `${yyyy}-${mm}-${dd}`

    // api takes coordinate (user variable), 
    // vehicle type preset to passenger, 
    // parking info limited to free AND metered, 
    // map view radius flexible (user variable), 
    // date fetched from locale
    const openCurb_Endpoint = `http://www.opencurb.nyc/search.php?coord=${lat},${long}&v_type=PASSENGER&a_type=PARK&meter=2&radius=${radius}&StartDate=${fulldate}&StartTime=06:25&EndDate=${fulldate}&EndTime=07:25&action_allowed=1`
    const response = await fetch(openCurb_Endpoint);
    const result = await response.json();
    console.log(result);
}

// function initMap() {
//     map = new google.maps.Map(document.getElementById("map"), {
//       center: { lat: 40.7323, lng:-73.9941 },
//       zoom: 20,
//     });
// }

function initMap() {
    const myLatlng = { lat: 40.7323, lng: -73.9941 };
  
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 17,
      center: myLatlng,
    });
    //https://www.drupal.org/node/2512882
    //https://stackoverflow.com/questions/25539734/get-center-coords-after-drag-pan-finished
    //References to using Google Maps Event Listeners
    google.maps.event.addListener(map,'idle',function(){
        if(!this.get('dragging') && this.get('oldCenter') && this.get('oldCenter')!==this.getCenter()) {
            console.log("lat",map.getCenter().lat());
            console.log("lng",map.getCenter().lng());
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
  }



getCurbData();
initMap();
