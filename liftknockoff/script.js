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
            var vehiclesLatLng = [];
            var weinerLatLng = new google.maps.LatLng(0,0);
            var infowindow = new google.maps.InfoWindow();
            function init() {
                map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
                getMyLocation();
            }

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
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.setContent(marker.title);
                    infowindow.open(map, marker);
                });
                getRides();
                constructInfoWindow();
            }

            var icons = 
            {
                self :{
                    icon: 'betty_icon.jpg'
                },
                passenger: {
                    icon: 'man.png'
                },
                vehicle: {
                    icon: 'car.png'
                },
                weinermobile: {
                    icon: 'weinermobile.png'
                }
            };
            var vehicles;

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
                        vehicles = rides.vehicles;
                        //for all the elements in the object
                        for (count = 0; count< vehicles.length; count++){
                            if (vehicles[count].username == "WEINERMOBILE"){
                                console.log("weiner found");
                                makeWeinerMarker(vehicles[count]);
                            }
                            else{
                                console.log("No weiner");
                                makeCarMarker(vehicles[count]);
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
                                var marker = new google.maps.Marker({
                                    position: latLng,
                                    title: vehicle._id,
                                    //icon should be either weinermobile or car, depending on the data
                                    icon: 'weinermobile.png'
                                })
                                marker.setMap(map);
                weinerLatLng = latLng;


            };

            function makeCarMarker(vehicle)
            {
                var latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
                                var marker = new google.maps.Marker({
                                    position: latLng,
                                    title: vehicle._id,
                                    //icon should be either weinermobile or car, depending on the data
                                    icon: 'car.png'
                                })
                                marker.setMap(map);
                vehiclesLatLng.push(latLng);
            };

            function constructInfoWindow()
            {
                console.log("constructInfoWindow");
                var dist = getNearestVehicle();
                var w_dist = getWeinerDist();
            };

            function getNearestVehicle()
            {
                var dist = Number.MAX_VALUE;
                for (count = 0; count<vehiclesLatLng.length; count++){
                    var temp = google.maps.geometry.spherical.computeDistanceBetween(me, vehiclesLatLng[count]);
                    if (temp < dist)
                        dist = temp;
                }
                console.log("vehicle dist = "+ dist);
                return dist;
            };

            function getWeinerDist()
            {
                dist = google.maps.geometry.spherical.computeDistanceBetween(me, weinerLatLng);
                console.log("weiner dist "+ dist);
                return dist;
            };
            