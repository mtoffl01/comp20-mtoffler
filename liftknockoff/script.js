var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
    zoom: 13,
    center: me,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    //the code below is from google maps api website - makes the map "midnight"
    //themed - for fun!
    styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
};

var map;
var marker;

ridesLatLng = []; /*array of LatLng positions for "rides" - either
vehicles or passengers, depending on the mode*/
weinerLatLng = []; /*array of LatLng positions for weinermobile - sometimes
two weinermobiles appear in the data, but will always just be accessing
weinerLatLng[0]*/

//container of all icons
var icons = 
{
    self :{
        icon: 'betty_icon.jpg'
    },
    passenger: {
        icon: 'passenger.png'
    },
    vehicle: {
        icon: 'car.png'
    },
    weinermobile: {
        icon: 'weinermobile.png'
    }
};

var clients; //container variable for passengers or vehicles

var infowindow = new google.maps.InfoWindow();

function init() {
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    getMyLocation();
};

function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            renderMap();
        });
    }
    else {
        alert("Geolocation is not supported by your web browser")
        }
};

function renderMap() {
    me = new google.maps.LatLng(myLat, myLng);
    map.panTo(me);
                
    // ME marker
    marker = new google.maps.Marker({
        position: me,
        title: "My icon",
        icon: 'betty_icon.jpg'
    });
    marker.setMap(map);
    
    //get data (vehicles/passengers) from source...                
    getRides();
};

//send request
var request = new XMLHttpRequest();
function getRides(){
    request.open("POST", "https://pure-wave-37513.herokuapp.com/rides", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            data = request.responseText;
            //console.log(data);
            rides = JSON.parse(data);
            if (rides.hasOwnProperty("vehicles")){ //vehicles mode
                clients = rides.vehicles;
                for (count = 0; count< clients.length; count++){ //for all elts
                    if (clients[count].username == "WEINERMOBILE"){
                        makeWeinerMarker(clients[count]);
                    }
                    else {
                        makeCarMarker(clients[count]);
                    }
                }
                constructInfoWindow("vehicle"); //info window for vehicle mode
            }
            else { //passengers mode
                clients = rides.passengers;
                for (count = 0; count< clients.length; count++){
                    if (clients[count].username == "WEINERMOBILE"){
                        makeWeinerMarker(clients[count]);
                    }
                    else{
                        makePassengerMarker(clients[count]);
                    }
                }
                constructInfoWindow("passenger"); //info window passenger mode
            }
        }
        else if (request.readyState==4 && request.status != 200){
            console.log("Something went wrong!");
        }
        else {
            console.log("In progress");
        }
    };
    request.send("username=j3YRjYyc&lat=" + myLat + "&lng=" + myLng);
};

//takes in parameter of specific element which holds username, lat, lng...
function makeWeinerMarker(vehicle)
{
    var latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
    var weinerMarker = new google.maps.Marker({
        position: latLng,
        title: vehicle._id,
        icon: 'weinermobile.png'
    })
    weinerMarker.setMap(map);
    weinerLatLng.push(latLng);
    //compute distance between weinermobile and ME icon
    var dist = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, latLng));
    //on click of weinermobile icon, display distance away from ME
    google.maps.event.addListener(weinerMarker, 'click', function()
    {
        infowindow.setContent(vehicle.username+" is "+dist+" miles away from you.")
        infowindow.open(map, weinerMarker);
    });
};

//takes in parameter of specific element which holds username, lat, lng...
function makeCarMarker(vehicle)
{
    var latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
    var carMarker = new google.maps.Marker({
        position: latLng,
        title: vehicle._id,
        icon: 'car.png'
    })
    carMarker.setMap(map);
    ridesLatLng.push(latLng);
    //compute distance between car and ME icon
    var dist = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, latLng));
    //on click of car icon, display distance away from ME
    google.maps.event.addListener(carMarker, 'click', function()
    {
        infowindow.setContent(vehicle.username+" is "+dist+" miles away from you.")
        infowindow.open(map, carMarker);
    });
};

function makePassengerMarker(pass)
{
    var latLng = new google.maps.LatLng(pass.lat, pass.lng);
    var passengerMarker = new google.maps.Marker({
        position: latLng,
        title: pass._id,
        icon: 'passenger.png'
    })
    passengerMarker.setMap(map);
    ridesLatLng.push(latLng);
    var dist = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, latLng));
    google.maps.event.addListener(passengerMarker, 'click', function()
    {
        infowindow.setContent(pass.username+" is "+dist+" miles away from you.")
        infowindow.open(map, passengerMarker);
    });
};

function constructInfoWindow(mode)
{
    google.maps.event.addListener(marker, 'click', function() {
        if (ridesLatLng.length > 0){ //if vehicles/passengers exist
            var dist = getNearest(); //call function to find distance to nearest car
            if (weinerLatLng.length >0) //if weinermobile exists 
            {
                var w_dist = getWeinerDist();
                infowindow.setContent("Hello, j3YRjYyc. The nearest "+mode+" is "+dist+" miles away. The weinermobile is "+w_dist+"miles away.");
            }
            else{ //weinermobile doesn't exist, but vehicles/passengers do
                infowindow.setContent("Hello, j3YRjYyc. The nearest "+mode+" is "+dist+" miles away. There is no weinermobile!")
            }
        }
        else if (weinerLatLng.length>0) //vehicles/passengers don't exist, but weinermobile does
        {
            var w_dist = getWeinerDist();
            infowindow.setContent("Hello, j3YRjYyc. The weinermobile is "+w_dist +" miles away.");
        }
        else //no weinermobile or clients
        {
            infowindow.setContent("Hello, j3YRjYyc. No clients or weinermobile around!");
        }   
        infowindow.open(map, marker);
    });
};

//calculate distance to nearest vehicle or passenger
function getNearest()
{
    var dist = Number.MAX_VALUE;
    for (count = 0; count<ridesLatLng.length; count++){
        var temp = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, ridesLatLng[count]));
        if (temp < dist){
            dist = temp;
        }
    }
    return dist;
};

//calculate distance to weinermobile
function getWeinerDist()
{
    dist = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, weinerLatLng[0]));
    return dist;
};

//convert google.maps.geometry.spherical.computeDistanceBetween value from meters to miles
function toMiles(dist)
{
    return (0.000621371192 * dist).toFixed(2);
};
            