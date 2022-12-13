var searchButton = document.getElementById('city-form');
console.log(searchButton)
var cityEl = document.getElementById('inputCity');
var stateEl = document.getElementById('inputState');
var countryEl = document.getElementById('inputCountry');
var searchesEl = document.getElementById('search-history');
var errorEl = document.getElementById('error-message');
var todayDateEl = document.getElementById('today-date');
todayDateEl.textContent += dayjs().format('dddd') + ", " + dayjs().format('MMMM DD YYYY');

var forcastDays = ["today-weather", "forcast-day-1", "forcast-day-2", "forcast-day-3", "forcast-day-4", "forcast-day-5"]
var forcastDates = ["todate-weather", "forcast-date-1", "forcast-date-2", "forcast-date-3", "forcast-date-4", "forcast-date-5"]

var apiId = '9248d00e4b49eb3d83939e35c0de038f';
var geocodeUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=';
var forcastBaseUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat=';
var currentBaseUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=';
var weatherIconUrl = 'http://openweathermap.org/img/wn/';

var currentTemp
// defining global lat and lon variables to be adjusted
var coors
// sets localStorage variable to empty.. will later be filled if it already exists
var savedCities = {};

getWeather = function (cityName, stateName, countryName, onload) {

    var coordUrl = geocodeUrl + cityName + ',' + stateName + ',' + countryName + '&appid=' + apiId;
    console.log(coordUrl);

    // grabs city coordinates 
    fetch(coordUrl)
        .then(function (response) {
            return response.json()
        })
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

            if (!onload) {
                saveSearch(cityName, stateName, countryName)
            }
            // saves search history API call works

        })
        .catch(function (error) {
            errorEl.style.display = 'block';
        });
}

function getWeatherForcast(weather5DayUrl) {
    fetch(weather5DayUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data)

            var weatherList = data.list;
            // go through and extract datetime stamps 
            var dayStamps = [];
            var dateStamps = [];
            for (var i = 0; i < weatherList.length; i++) {
                dayStamps.push(dayConverter(weatherList[i].dt))
            }
            console.log(dayStamps)

            var uniqueDays = [... new Set(dayStamps)]

            console.log(uniqueDays)

            var maxTemp = [];
            var minTemp = [];
            var maxHumidity = [];
            var maxWindSpeed = [];
            var forcastIconId = [];
            // sort through weather data from each forcast day
            for (var i = 0; i < uniqueDays.length; i++) {
                var theDay = uniqueDays[i];

                var temp = [];
                var windSpeed = [];
                var humidity = [];
                var condition = [];
                var conditionDescription = [];
                var w = -1
                for (var u = 0; u < dayStamps.length; u++) {

                    if (theDay == dayStamps[u]) {
                        w++
                        var weatherProps = weatherList[u];
                        // console.log(weatherProps)
                        temp.push(Math.round(weatherProps.main.temp));
                        windSpeed.push(weatherProps.wind.speed);

                        humidity.push(weatherProps.main.humidity);
                        condition.push(weatherProps.weather.main);
                        conditionDescription.push(weatherProps.weather.description);

                        if (i > 0) {

                            if (w == 4) {
                                console.log(weatherProps.dt_txt)
                                forcastIconId.push(weatherProps.weather[0].icon)
                                console.log(forcastIconId)
                            } else if (i == 6 && u == dayStamps.length - 1 && forcastIconId.length < 5) {
                                forcastIconId.push(weatherProps.weather[0].icon)
                                console.log(weatherProps.dt_txts)
                            }
                        }
                    }
                    // need a function to sort through conditions, find maxes, and write them
                }

                maxHumidity.push(Math.max(...humidity))
                maxTemp.push(Math.max(...temp));
                minTemp.push(Math.min(...temp));
                maxWindSpeed.push(Math.max(...windSpeed));

            }

            console.log(forcastIconId)
            console.log(maxTemp)

            for (var i = 0; i < forcastDays.length; i++) {
                var divEl = document.getElementById(forcastDays[i]);

                if (i == 0) {
                    console.log(currentTemp)
                    console.log(maxTemp[0])
                    if (document.getElementById('today-hi') !== null) {
                        document.getElementById('today-hi').remove()
                    }
                    if (document.getElementById('today-lo') !== null) {
                        document.getElementById('today-lo').remove()
                    }

                    if (currentTemp < maxTemp[i]) {

                        var todayEl = document.createElement('p');
                        todayEl.setAttribute('id', 'today-hi')
                        todayEl.textContent = "Today's High: " + maxTemp[i] + "°F";
                        divEl.appendChild(todayEl)
                    }
                    tonightEl = document.createElement('p');
                    tonightEl.setAttribute('id', 'today-lo')
                    tonightEl.textContent = "Tonight's Low: " + minTemp[i] + "°F";
                    divEl.appendChild(tonightEl)
                } else {

                    var weekDayEl = document.getElementById(forcastDates[i]);
                    weekDayEl.setAttribute('class', 'd-flex flex-column justify-content-between align-items-center')
                    console.log(weekDayEl)

                    if (click > 0) {
                        console.log('another click')
                        divEl.innerHTML = '';
                        weekDayEl.innerHTML = '';
                    }

                    var dayEl = document.createElement('h3');
                    dayEl.textContent = uniqueDays[i];
                    dayEl.setAttribute('class', 'py-3')
                    weekDayEl.appendChild(dayEl);

                    var forcastWeatherIconUrl = weatherIconUrl + forcastIconId[i - 1] + '@2x.png'
                    console.log(forcastIconId[i - 1])
                    var forcastIcon = document.createElement('img');
                    forcastIcon.setAttribute('src', forcastWeatherIconUrl)
                    forcastIcon.setAttribute('class', "icon-forcast")
                    weekDayEl.appendChild(forcastIcon)

                    var maxTempEl = document.createElement('p');
                    var minTempEl = document.createElement('p');
                    var maxWindEl = document.createElement('p');
                    var maxHumidityEl = document.createElement('p');

                    maxTempEl.textContent = "High: " + maxTemp[i] + "°F";
                    minTempEl.textContent = "Low: " + minTemp[i] + "°F";
                    maxWindEl.textContent = "Wind: " + maxWindSpeed[i] + " mph";
                    maxHumidityEl.textContent = "Humidity: " + maxHumidity[i] + "%";

                    divEl.appendChild(maxTempEl);
                    divEl.appendChild(minTempEl);
                    divEl.appendChild(maxWindEl)
                    divEl.appendChild(maxHumidityEl);
                }
            }

            return
        })
    .catch(function (error) {
        alert('Unable to connect to GitHub');
    });
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

            var iconId = data.weather[0].icon;
            console.log(iconId)
            var currentWeatherIconUrl = weatherIconUrl + iconId + '@2x.png'
            console.log(currentWeatherIconUrl)
            $('#current-icon').attr('src', currentWeatherIconUrl)

            $('#city-name').text(data.name)

            currentTemp = Math.round(data.main.temp);
            $('#currentTemp').text(Math.round(data.main.temp) + '°F')
            $('#currentConditions').text(data.weather[0].main)
            $('#currentWind').text('Wind: ' + Math.round(data.wind.speed) + 'mph')
            $('#currentHumidity').text('Humidity: ' + Math.round(data.main.humidity) + "%")


            console.log(data.dt)
            getWeatherForcast(weather5DayUrl)
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
        getWeather("Oakland", "CA", "USA", true)
        removeHistory()

    } else {
        var defaultCity = JSON.parse(localStorage.getItem("lastSearch"));
        console.log(defaultCity)
        getWeather(defaultCity[0], defaultCity[1], defaultCity[2], false)
        pastSearches()
    }

}

var pastSearches = function () {
    savedCities = JSON.parse(localStorage.getItem("savedCities"));
    var cityKeys = Object.keys(savedCities)

    for (var i = 0; i < cityKeys.length; i++) {
        var thisCity = savedCities[cityKeys[i]];
        console.log(thisCity)
        addButton(thisCity)
    }


}

var addButton = function (addCity) {
    if (document.getElementById(addCity[0]) === null) {
        var searchButton = document.createElement('button');

        searchButton.setAttribute('id', addCity[0]);
        searchButton.setAttribute('class', 'searchHistoryButton btn btn-light');

        searchButton.textContent = addCity[0];
        searchButton.dataset.city = addCity[0];
        searchButton.dataset.state = addCity[1];
        searchButton.dataset.country = addCity[2];

        console.log(searchButton)
        searchesEl.appendChild(searchButton)
    }

}

var saveSearch = function (city, state, country) {
    savedCities[cityEl.value] = [city, state, country]
    var lastSearch = [city, state, country]
    localStorage.setItem("savedCities", JSON.stringify(savedCities))
    localStorage.setItem("lastSearch", JSON.stringify(lastSearch));

    addButton(lastSearch)
}

startUpWeather()

// when we submit a valid city, get the weather
var click = 0;
searchButton.addEventListener('submit', function (event) {
    errorEl.style.display = 'none';
    click++
    event.preventDefault()
    event.stopPropagation()
    console.log('hi')

    console.log(cityEl)
    var cityName = cityEl.value;
    console.log(cityName)
    getWeather(cityEl.value, stateEl.value, countryEl.value, false);
})

$('#search-history').on('click', '.searchHistoryButton', function (event) {
    console.log('hey')
    event.preventDefault();
    event.stopPropagation();
    click++

    var thisButton = event.target;

    getWeather(thisButton.dataset.city, thisButton.dataset.state, thisButton.dataset.country, false)

})

var dayConverter = function (date) {

    const unixTimestamp = date

    console.log(unixTimestamp)
    const milliseconds = unixTimestamp * 1000
    const dateObject = new Date(milliseconds)

    dayOfWeek = dateObject.toLocaleString("en-US", { weekday: "long" }) //2019-12-9 10:30:15
    console.log(dayOfWeek)
    // const currentTime = dateObject.toTimeString().format() //2019-12-9 10:30:15
    return dayOfWeek

}

function removeHistory() {
    localStorage.removeItem('savedCities')
    localStorage.removeItem('lastSearch')
    searchesEl.innerHTML = ''
}

document.getElementById('clear-history').addEventListener('click', function (event) {
    event.preventDefault()
    event.stopPropagation()
    removeHistory()


})

