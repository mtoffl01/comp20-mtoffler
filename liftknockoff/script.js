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
            var infowindow = new google.maps.InfoWindow();
            function init() {
                map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
                getMyLocation();
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
            }
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
            }

            var weinermobile = false;
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
                        //for all the elements in the object
                        console.log ("There are " + Object.keys(rides).length+ "keys");
                        for (var i in rides){
                             console.log("obj "+ rides[0]["_id"]);
                            //create a position variable of each lat and long
                            var latLng = new google.maps.LatLng(rides[i].lat, rides[i].lng);
                            var marker = new google.maps.Marker({
                                position: latLng,
                                title: rides[i]._id,
                                //icon should be either weinermobile or car, depending on the data
                                icon: 'car.png'
                            })
                            marker.setMap(map);
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
            }
            