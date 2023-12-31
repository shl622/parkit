async function getCurbData(lat=40.7323,long=-73.9941,nelat,nelng,swlat,swlng){
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
    // modified endpoint with viewport restriction based on the google maps api fetching lat/lng of sw and ne.
    // const openCurb_Endpoint = `https://www.opencurb.nyc/search.php?coord=${lat},${long}&v_type=PASSENGER&a_type=PARK&meter=2&radius=${radius}&StartDate=${fulldate}&StartTime=06:25&EndDate=${fulldate}&EndTime=07:25&action_allowed=2`
    const test_endpoint = `https://www.opencurb.nyc/search.php?address=&coord=${lat},${long}&dest_coord=&bbox_coord=${nelat},${nelng},${swlat},${swlng}&v_type=PASSENGER&a_type=PARK&meter=2&StartDate=${fulldate}&StartTime=00:00&EndDate=${fulldate}&EndTime=23:59&action_allowed=2&zoomLevel=17&device_type=mobile`
    const response = await fetch(test_endpoint);
    const result = await response.json();
    return result;
}



