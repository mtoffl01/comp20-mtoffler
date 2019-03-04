var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
    zoom: 13, // The larger the zoom number, the bigger the zoom
    center: me,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var marker;
ridesLatLng = [];
weiner_exists = false;
weinerLatLng = [];
var infowindow = new google.maps.InfoWindow();

function init() {
    console.log("Begin");
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    getMyLocation();
};

function getMyLocation() {
    if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
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
    // Update map and go there...
    map.panTo(me);
                
    // Create a marker
    marker = new google.maps.Marker({
        position: me,
        title: "Here I Am!",
        icon: 'betty_icon.jpg'
    });
    marker.setMap(map);
                    
    // Open info window on click of marker
    getRides();
    constructInfoWindow();
};

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
            
var clients;

//var weinermobile = false;
var request = new XMLHttpRequest();
function getRides(){
    request.open("POST", "https://hans-moleman.herokuapp.com/rides", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            console.log("Retrieved data!");
            data = request.responseText;
            console.log(data);
            rides = JSON.parse(data);
            if (rides.hasOwnProperty("vehicles")){
                console.log("hayyy");
                clients = rides.vehicles;
            }
            else { //passengers 
                console.log("pass");
                clients = rides.passengers;
            }
            //for all the elements in the object
            for (count = 0; count< clients.length; count++){
                if (clients[count].username == "WEINERMOBILE"){
                    weiner_exists = true;
                    //console.log("weiner found");
                    makeWeinerMarker(clients[count]);
                }
                else{
                    if (rides.hasOwnProperty("vehicles")){
                        makeCarMarker(clients[count]);
                    }
                    else{
                        makePassengerMarker(clients[count]);
                    }
                }
                //create a position variable of each lat and long
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

function makeWeinerMarker(vehicle)
{
    var latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
    var weinerMarker = new google.maps.Marker({
        position: latLng,
        title: vehicle._id,
        //icon should be either weinermobile or car, depending on the data
        icon: 'weinermobile.png'
    })
    weinerMarker.setMap(map);
    weinerLatLng.push(latLng);
};

function makeCarMarker(vehicle)
{
    var latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
    var carMarker = new google.maps.Marker({
        position: latLng,
        title: vehicle._id,
        //icon should be either weinermobile or car, depending on the data
        icon: 'car.png' //'car.png'
    })
    carMarker.setMap(map);
    ridesLatLng.push(latLng);
};

function makePassengerMarker(pass)
{
    var latLng = new google.maps.LatLng(pass.lat, pass.lng);
    var passengerMarker = new google.maps.Marker({
        position: latLng,
        title: pass._id,
        //icon should be either weinermobile or car, depending on the data
        icon: 'passenger.png'
    })
    passengerMarker.setMap(map);
    ridesLatLng.push(latLng);
};

function constructInfoWindow()
{
    google.maps.event.addListener(marker, 'click', function() {
        console.log("constructInfoWindow");
        if (ridesLatLng.length > 0){
            var dist = getNearestVehicle();
            if (weinerLatLng.length >0)
            {
                var w_dist = getWeinerDist();
                infowindow.setContent("My username: j3YRjYyc. The nearest vehicle is "+dist+" miles away. The WEINERMOBILE is "+w_dist+"miles away.");
            }
            else{
                infowindow.setContent("My username: j3YRjYyc. The nearest vehicle is "+dist+" miles away. There is no weinermobile!")
            }
        }
        else if (weinerLatLng.length>0)
        {
            var w_dist = getWeinerDist();
            infowindow.setContent("The weinermobile is "+w_dist +" miles away.");
        }
        else 
        {
            infowindow.setContent("Whoops! No clients or weinermobile around!");
        }   
        infowindow.open(map, marker);
    });
};

function getNearestVehicle(c)
{
    var dist = Number.MAX_VALUE;
    for (count = 0; count<ridesLatLng.length; count++){
        var temp = google.maps.geometry.spherical.computeDistanceBetween(me, ridesLatLng[count]);
        if (temp < dist){
            console.log("temp is "+temp);
            dist = temp;
        }
    }
    console.log(" vehicle dist = "+ dist);
    return dist;
};

function getWeinerDist()
{
    dist = google.maps.geometry.spherical.computeDistanceBetween(me, weinerLatLng[0]);
    console.log("weiner dist "+ dist);
    return dist;
};
            