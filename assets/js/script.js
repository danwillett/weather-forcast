var searchButton = document.getElementById('city-form');
console.log(searchButton)
var cityEl = document.getElementById('inputCity');
var stateEl = document.getElementById('inputState');
var countryEl = document.getElementById('inputCountry');
var searchesEl = document.getElementById('search-history');
var todayDateEl = document.getElementById('today-date');
todayDateEl.textContent += dayjs().format('dddd') + ", " + dayjs().format('MMMM DD YYYY');

var forcastDays = ["today-weather", "forcast-day-1", "forcast-day-2", "forcast-day-3", "forcast-day-4", "forcast-day-5"]

var apiId = '9248d00e4b49eb3d83939e35c0de038f';
var geocodeUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=';
var forcastBaseUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat=';
var currentBaseUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=';

// defining global lat and lon variables to be adjusted
var coors
// sets localStorage variable to empty.. will later be filled if it already exists
var savedCities = {}; 

getWeather = function (cityName, stateName, countryName) {

    var coordUrl = geocodeUrl + cityName + ',' + stateName + ',' + countryName + '&appid=' + apiId;
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
                // load weather conditions
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
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data)
            $('#city-name').text(data.name)
            $('#currentTemp').text('Temp: ' + data.main.temp)
            $('#currentWind').text('Wind: ' + data.wind.speed)
            $('#currentHumidity').text('Humidity: ' + data.main.humidity + "%")

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

            var maxTemp = [];
            var minTemp = [];
            var maxHumidity = [];
            // sort through weather data from each forcast day
            for (var i = 0; i < uniqueDays.length; i++) {
                var theDay = uniqueDays[i];

                var temp = [];
                var windSpeed = [];
                var humidity = [];
                var condition = [];
                var conditionDescription = [];
                for (var u = 0; u < dayStamps.length; u++) {
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


                maxHumidity.push(Math.max(...humidity))
                maxTemp.push(Math.max(...temp));
                minTemp.push(Math.min(...temp));
            }
            console.log(maxTemp)

            for (var i = 0; i < forcastDays.length; i++) {
                var ulEl = document.getElementById(forcastDays[i]);
                if (click > 0) {
                    console.log('another click')
                    ulEl.innerHTML = '';
                }

                var maxTempEl = document.createElement('li');
                var minTempEl = document.createElement('li');
                var maxHumidityEl = document.createElement('li');

                maxTempEl.textContent = "High: " + maxTemp[i];
                minTempEl.textContent = "Low: " + minTemp[i];
                maxHumidityEl.textContent = "Humidity: " + maxHumidity[i] + "%";

                ulEl.appendChild(maxTempEl);
                ulEl.appendChild(minTempEl);
                ulEl.appendChild(maxHumidityEl);

            }

            return
        })
    // .catch(function (error) {
    //     alert('Unable to connect to GitHub');
    // });
}

// when the webpage first loads, page defaults to last search entry saved in local storage,
// If nothing is saved, show weather in Oakland

var startUpWeather = function () {

    // check if savedCities object is saved in local storage
    // if isn't saved, creates new empty variable and shows Oakland weather
    if (localStorage.getItem("lastSearch") === null) {
        getWeather("Oakland", "CA", "USA")
    } else {
        var defaultCity = JSON.parse(localStorage.getItem("lastSearch"));
        console.log(defaultCity)
        getWeather(defaultCity[0], defaultCity[1], defaultCity[2])
        pastSearches()
    }

}

var pastSearches = function(){
    savedCities = JSON.parse(localStorage.getItem("savedCities"));
    var cityKeys = Object.keys(savedCities)

    for (var i = 0; i < cityKeys.length; i++) {
        var thisCity = savedCities[cityKeys[i]];
        console.log(thisCity)
        addButton(thisCity)
    }
    

}

var addButton = function(addCity) {
    if (document.getElementById(addCity[0])===null) {
    var searchButton = document.createElement('button');
        
        searchButton.setAttribute('id', addCity[0]);
        searchButton.setAttribute('class', 'searchButton btn btn-light');

        searchButton.textContent = addCity[0];
        searchButton.dataset.city = addCity[0];
        searchButton.dataset.state = addCity[1];
        searchButton.dataset.country = addCity[2];

        console.log(searchButton)
        searchesEl.appendChild(searchButton) }

}

startUpWeather()

// when we submit a valid city, get the weather
var click = 0;
searchButton.addEventListener('submit', function (event) {
    click++
    event.preventDefault()
    console.log('hi')

    console.log(cityEl)
    var cityName = cityEl.value;
    console.log(cityName)
    getWeather(cityEl.value, stateEl.value, countryEl.value);

    // save search history to local storage
    savedCities[cityEl.value] = [cityEl.value, stateEl.value, countryEl.value]
    var lastSearch = [cityEl.value, stateEl.value, countryEl.value]
    localStorage.setItem("savedCities", JSON.stringify(savedCities))
    localStorage.setItem("lastSearch", JSON.stringify(lastSearch));

    addButton(lastSearch)

    
    // add new search to search history element


})


var dateConverter = function (date) {

    const unixTimestamp = date
    const milliseconds = unixTimestamp * 1000 
    const dateObject = new Date(milliseconds)
    const humanDateFormat = dateObject.toLocaleString("en-US", { weekday: "long" }) //2019-12-9 10:30:15
    return humanDateFormat

}