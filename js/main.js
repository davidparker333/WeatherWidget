let map;
let lat;
let lng;
let openWeatherKey = 'OPEN_WEATHER_API_KEY';
let timeZoneKey = 'TIME_ZONE_API_KEY';

/**
 * This function is called by an onload() event on the body html tag.
 * It check for geolocation support and then calls the 3 main function threads
 */
function initCoords() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap);
        navigator.geolocation.getCurrentPosition(getWeatherData);
        navigator.geolocation.getCurrentPosition(getTimeData);
    } else {
        showError("Your browser does not support location")
    }
};


// Google Maps API

/**
 * @param position 
 * This function takes the position from the initCoords() function and
 * initializes the lat and long. It then initializes the Google Map
 * widget using the 'map' id and centers the map on the aforementioned
 * lat and long. It then initializes the geocoder and infowindow which are
 * passed through to another function
 */
function initMap(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: { lat: lat, lng: lng },
    });
    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow();
    geocodeLatLng(geocoder, map, infowindow, lat, lng);
    
};

/**
 * @param geocoder 
 * @param map 
 * @param infowindow 
 * @param lat 
 * @param lng 
 * This function takes in the objects created in the initMap
 * function as well as the lat and long from that function. It first
 * creates an object with the lat and long, then passes that through to
 * Google's geocoder stuff, which puts a marker on the map at your location
 * and (most importantly) displays the address on the map
 */
function geocodeLatLng(geocoder, map, infowindow, lat, lng) {
    const latlng = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
    };
    
    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                map.setZoom(11);
                const marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                });
                infowindow.setContent(results[0].formatted_address);
                infowindow.open(map, marker);
            } else {
                window.alert("No results found");
            }
        } else {
            window.alert("Geocoder failed due to: " + status);
        }
    });
}


// Open Weather API

/**
 * @param position 
 * This function takes position from the geolocation position object
 * and initializes the lat and long within the local scope. It uses axios
 * to hit the OpenWeather API using the lat and long as parameters
 * then passes the response to another function to be parsed
 */
async function getWeatherData(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;

    let response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherKey}`);
    parseWeatherData(response.data);
}

/**
 * @param data 
 * This function takes the response object from the getWeatherData
 * function and parses out the temp (converting it to F), weather
 * conditions (converting to to title case) and weather icon, then
 * passes it to another function to be inserted into HTML
 */
function parseWeatherData(data) {
    let temp = data.main.temp;
    temp = (((temp-273.15)*1.8)+32).toFixed(1);
    let weather = data.weather[0].description;
    weather = weather.charAt(0).toUpperCase() + weather.slice(1);
    let weatherIcon = data.weather[0].icon;
    weatherIcon = `https://openweathermap.org/img/wn/${weatherIcon}.png`

    insertWeatherData(temp, weather, weatherIcon);
}

/**
 * @param temp 
 * @param weather 
 * @param weatherIcon
 * This function grabs the parsed and formatted data from parseWeatherData and
 * insert it into the HTML document using the ID of the target area
 */
function insertWeatherData(temp, weather, weatherIcon) {
    document.getElementById('temp').innerHTML = `Temp: ${temp}°F`;
    document.getElementById('weather').innerHTML = `Current Weather: ${weather}`;
    document.getElementById('weather-icon').innerHTML = `<img src=${weatherIcon}>`;
}


//TimeZoneDB

/**
 * @param position
 * This function is takes in a geolocation objects as an argument
 * and initializes the lat and long int the local scope. It then uses
 * axios to hit the TimeZoneDB API using the lat and long as parameters.
 * It passes the response to another function to be parsed
 */
async function getTimeData(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;

    let response = await axios.get(`http://api.timezonedb.com/v2.1/get-time-zone?key=${timeZoneKey}&by=position&lat=${lat}&lng=${lng}&format=json`);
    parseTimeData(response.data);
}

/**
 * @param data 
 * This function takes the response data from the TimeZoneDB API and parses
 * out the local time. It passes it to another function for formatting
 * and then to another function to be inserted into the document
 */
function parseTimeData(data) {
    let time = data.formatted.split(' ')[1];
    time = convertTime(time);

    insertTimeData(time)
}

/**
 * @param time 
 * @returns
 * This function takes the 24-hour format time from the
 * API data and converts it into 12-hour time then returns
 * it back to that function
 */
function convertTime(time) {
    let hours = time.slice(0,2);
    hours %= 12;
    let minutes = time.slice(3,5);
    let new_time = String(hours + ':' + minutes);

    return new_time
}

/**
 * @param time
 * This function inserts the formatted time into the HTML document 
 */
function insertTimeData(time) {
    document.getElementById('time').innerHTML = `Current Time: ${time}`
}
