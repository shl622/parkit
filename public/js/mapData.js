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
    const openCurb_Endpoint = `https://www.opencurb.nyc/search.php?coord=${lat},${long}&v_type=PASSENGER&a_type=PARK&meter=2&radius=${radius}&StartDate=${fulldate}&StartTime=06:25&EndDate=${fulldate}&EndTime=07:25&action_allowed=1`
    const response = await fetch(openCurb_Endpoint);
    const result = await response.json();
    console.log(result);
}

getCurbData();

