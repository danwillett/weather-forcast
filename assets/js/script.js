var searchButton = document.getElementById('city-form');
console.log(searchButton)
var cityEl = document.getElementById('inputCity');
var stateEl = document.getElementById('inputState');
var countryEl = document.getElementById('inputCountry');

var forcastDays = ["#forcast-day-1", "#forcast-day-2", "#forcast-day-3", "#forcast-day-4", "#forcast-day-5"]

var apiId = '9248d00e4b49eb3d83939e35c0de038f';
var geocodeUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=';
var forcastBaseUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat=';
var currentBaseUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=';

// defining global lat and lon variables to be adjusted
var coors

getWeather = function () {

    var coordUrl = geocodeUrl + cityEl.value + ',' + stateEl.value + ',' + countryEl.value + '&appid=' + apiId;
    console.log(coordUrl);

    // grabs city coordinates 
    fetch(coordUrl).then(function (response) {
        return response.json()
            .then(function (data) {
                console.log(data)
                lon = data[0].lon;
                lat = data[0].lat;
                coors = {
                    lon: lon,
                    lat: lat,
                }
                return coors
            })
            // plugs city coordinates and grabs weather data
            .then(function (coors) {
                loadWeatherConditions(coors)
            })
    })
}

loadWeatherConditions = function (coordinates) {
    var lat = coordinates.lat;
    var lon = coordinates.lon;
    var weather5DayUrl = forcastBaseUrl + lat + '&' + 'lon=' + lon + '&appid=' + apiId + '&units=imperial';
    var currentWeatherUrl = currentBaseUrl + lat + '&' + 'lon=' + lon + '&appid=' + apiId + '&units=imperial';
    console.log(weather5DayUrl);

    fetch(currentWeatherUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data)

            $('#currentTemp').text('Temp: ' + data.main.temp)
            $('#currentWind').text('Wind: ' + data.wind.speed)
            $('#currentHumidity').text('Humidity: ' + data.main.humidity)

            console.log(data.dt)
            // var currentConditionsEl = document.getElementById('current-weather');
            
            // var currentWind = document.createElement('li');
            // var currentHumidity = document.createElement('li');
            return
        })
        .catch(function (error) {
            alert('Unable to connect to GitHub');
        });

    fetch(weather5DayUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data)

            var weatherList = data.list;
            // go through and extract datetime stamps 
            var dayStamps = [];
            for (var i = 0; i < weatherList.length; i++) {
                dayStamps.push(dateConverter(weatherList[i].dt));
            }
            console.log(dayStamps)

            var uniqueDays = [... new Set(dayStamps)]
            
            console.log(uniqueDays)

            // sort through weather data from each forcast day
            for (var i = 0; i < uniqueDays.length; i++){
                var theDay = uniqueDays[i];

                var temp = [];
                var windSpeed = [];
                var humidity = [];
                var condition = [];
                var conditionDescription = [];
                for (var u = 0; u < dayStamps.length; u++){
                    if (theDay == dayStamps[u]) {
                        var weatherProps = weatherList[u];
                        temp.push(weatherProps.main.temp);
                        windSpeed.push(weatherProps.wind.speed);
                        humidity.push(weatherProps.main.humidity);
                        condition.push(weatherProps.weather.main);
                        conditionDescription.push(weatherProps.weather.description);
                    }
                    // need a function to sort through conditions, find maxes, and write them
                }
                
                
            }
            
           


            return
        })
        .catch(function (error) {
            alert('Unable to connect to GitHub');
        });
}

// var toFahrenheit = function(kelvin){
//     const far = ((kelvin-273.15)*1.8)+32
//     return Math.round(far * 10) / 10
    
// }

// when we submit a valid city, get the weather
searchButton.addEventListener('submit', function (event) {
    event.preventDefault()
    console.log('hi')

    console.log(cityEl)
    var cityName = cityEl.value;
    console.log(cityName)

    getWeather()


})


var dateConverter = function(date){

    const unixTimestamp = date

const milliseconds = unixTimestamp * 1000 // 1575909015000

const dateObject = new Date(milliseconds)

const humanDateFormat = dateObject.toLocaleString("en-US", {weekday: "long"}) //2019-12-9 10:30:15

return humanDateFormat
// dateObject.toLocaleString("en-US", {weekday: "long"}) // Monday
// dateObject.toLocaleString("en-US", {month: "long"}) // December
// dateObject.toLocaleString("en-US", {day: "numeric"}) // 9
// dateObject.toLocaleString("en-US", {year: "numeric"}) // 2019
// dateObject.toLocaleString("en-US", {hour: "numeric"}) // 10 AM
// dateObject.toLocaleString("en-US", {minute: "numeric"}) // 30
// dateObject.toLocaleString("en-US", {second: "numeric"}) // 15
// dateObject.toLocaleString("en-US", {timeZoneName: "short"}) // 12/9/2019, 10:30:15 AM CST
}