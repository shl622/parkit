# Parkit!

## Overview

Parking in NYC can get very expensive and finding a street parking spot is difficult. Even worse, checking the signs on every street for available parking times and rules makes it even worse. With Parkit!, checking these rules is no longer difficult.

Parkit! is a web app that will allow users to search street parking rules for each street. Users can register and login to save recent searches as well as search parking rules for any street nearby or far in Manhattan, NYC. 


## Deployment
The application was deployed via Heroku- visit [here](https://parkitapp.herokuapp.com/)<br/>

### Milestone 1
Successful sketch/brainstorm
### Milestone 2
##### Important note regarding deployment of form: </br>
1. Currently, in localhost, able to successfully bring in API data from opencurb with flexible GeoJSON values. <br>
2. However, needs resolving Mixed Error in Heroku in order to show this data in console. <br>
3. Currently able to receive GeoJSON, specifically lat,long,center from user actions on google maps such as dragging, zooming out (changing bounds/places). Please check the console on browser to confirm this data fetching successful.
<br>
##### Important note regarding change in research topics: <br>
 ArcGIS was costly and Google Maps API is free (to an extent) and for the purposes of this project, Google Maps was deemed more suitable.


## Data Model

The application will store Users and Passwords and a list of data per user.</br>
The data will store the accessed address, time, username and user location.

An Example User:

```javascript
{
  username: "username"
  password: "password"
  list: "data"
}
```

An Example Data:

```javascript
{
  address: "address"
  time: "time-searched"
  userid: "username"
  usercoordinate: "coordinate"
}
```


## [Link to Commented First Draft Schema](db.mjs) 

## Wireframes

Login Page

![list create](documentation/login.png)

Signup Page

![list](documentation/sign-up.png)

Main Page (Map Page)

![list](documentation/main.png)

Main Page Overlay (onclick, search)

![list](documentation/main-overlay.png)

Recent search Page

![list](documentation/recent-searches.png)

## Site map

[Site Map](documentation/site-map.png)

## User Stories or Use Cases

1. As a non-registered user, I can sign up and create an account.
2. As a user, I can navigate through the map.
3. As a user, I can search addresses or click specific areas on map to access parking limit data.
4. As a user, I can access a list of recent searches and access them again.
5. As a user, I can add comments to each parking limits data in case they are faulty.

## Research Topics

* (3 points) dotenv
  * use dotenv to store credentials for URI
* (5 points) React
  * use React.js as the frontend framework
  * (~11/08/22) reviewed [official docs and tutorials](https://reactjs.org/tutorial/tutorial.html)
* (5 points) OpenCurb API
  * use opencurb.nyc API to poll in NYC Street Parking Data
  * (~11/08/22) Successful in fetching data with different lat,long values and radius

    `http://www.opencurb.nyc/search.php?coord=${lat},${long}&v_type=PASSENGER&a_type=PARK&meter=2&radius=${radius}&StartDate=${fulldate}&StartTime=06:25&EndDate=${fulldate}&EndTime=07:25&action_allowed=1`
  * v_type limited to PASSENGER as app intended for passenger vehicles only (excluding commercial or load/pickups)
* (3 points) Google Maps API
    * Google Maps API to render map and fetch coordinate Data
    * (~11/08/22) Heavily Reviewed [official document and tutorials](https://developers.google.com/maps/documentation/javascript/overview)
    * Need to implement Maps to keep radius in 50 meters to coordinate with Opencurb API data, which has strict base of 50 meter radius for polling in parking data.
    

16 points total out of 8 required points 


## [Link to Initial Main Project File](app.mjs) 

## Annotations / References Used

1. [OpenCurb NYC API](http://www.opencurb.nyc/doc.html) 
2. [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/overview)
3. [React.js Documentation](https://reactjs.org/tutorial/tutorial.html)
