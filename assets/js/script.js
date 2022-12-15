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
var geocodeUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=';
var forcastBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=';
var currentBaseUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=';
var weatherIconUrl = 'https://openweathermap.org/img/wn/';

var states = {
    Arizona: 'AZ',
    Alabama: 'AL',
    Alaska: 'AK',
    Arkansas: 'AR',
    California: 'CA',
    Colorado: 'CO',
    Connecticut: 'CT',
    Delaware: 'DE',
    Florida: 'FL',
    Georgia: 'GA',
    Hawaii: 'HI',
    Idaho: 'ID',
    Illinois: 'IL',
    Indiana: 'IN',
    Iowa: 'IA',
    Kansas: 'KS',
    Kentucky: 'KY',
    Louisiana: 'LA',
    Maine: 'ME',
    Maryland: 'MD',
    Massachusetts: 'MA',
    Michigan: 'MI',
    Minnesota: 'MN',
    Mississippi: 'MS',
    Missouri: 'MO',
    Montana: 'MT',
    Nebraska: 'NE',
    Nevada: 'NV',
    NewHampshire: 'NH',
    NewJersey: 'NJ',
    NewMexico: 'NM',
    NewYork: 'NY',
    NorthCarolina: 'NC',
    NorthDakota: 'ND',
    Ohio: 'OH',
    Oklahoma: 'OK',
    Oregon: 'OR',
    Pennsylvania: 'PA',
    RhodeIsland: 'RI',
    SouthCarolina: 'SC',
    SouthDakota: 'SD',
    Tennessee: 'TN',
    Texas: 'TX',
    Utah: 'UT',
    Vermont: 'VT',
    Virginia: 'VA',
    Washington: 'WA',
    WestVirginia: 'WV',
    Wisconsin: 'WI',
    Wyoming: 'WY',
}

var stateCode = [];
var countryCode = [];
var currentTemp
// defining global lat and lon variables to be adjusted
var coors
// sets localStorage variable to empty.. will later be filled if it already exists
var savedCities = {};

// takes unix timestamp and converts it to the day of the week it corresponds to
var dayConverter = function (date) {
    const unixTimestamp = date;
    const milliseconds = unixTimestamp * 1000
    const dateObject = new Date(milliseconds)

    dayOfWeek = dateObject.toLocaleString("en-US", { weekday: "long" }) //2019-12-9 10:30:15
    return dayOfWeek
}

// clears local storage and search history section of page
function removeHistory() {
    localStorage.removeItem('savedCities')
    localStorage.removeItem('lastSearch')
    searchesEl.innerHTML = ''
}

// removes city from local storage and last search if applicable
function removeCity(city) {
    savedCities = JSON.parse(localStorage.getItem('savedCities'))
    console.log(city)
    delete savedCities[city]
    
    localStorage.setItem('savedCities', JSON.stringify(savedCities))
   

    var lastSearch = JSON.parse(localStorage.getItem('lastSearch'))
    console.log(lastSearch)
    if (lastSearch !==null && lastSearch[0] == city) {
        
        localStorage.removeItem('lastSearch')
    }
    
}

// primary function that retrieves weather data for a searched or saved city
getWeather = function (cityName, stateName, countryName, onload) {

    var coordUrl = geocodeUrl + cityName + ',' + stateName + ',' + countryName + '&appid=' + apiId;

    // grabs city coordinates 
    fetch(coordUrl)
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            console.log(`geocode api:`)
            console.log(data)
            stateCode = data[0].state;
            countryCode = data[0].country;
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

// calls the 5 day weather forcast from openweather API
function getWeatherForcast(weather5DayUrl) {
    fetch(weather5DayUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("5 day weather call: ")
            console.log(data)

            var weatherList = data.list;
            // go through and extract datetime stamps 
            var dayStamps = [];
            var dateStamps = [];
            for (var i = 0; i < weatherList.length; i++) {
                dayStamps.push(dayConverter(weatherList[i].dt))
            }

            var uniqueDays = [... new Set(dayStamps)]

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
                        temp.push(Math.round(weatherProps.main.temp));
                        windSpeed.push(weatherProps.wind.speed);

                        humidity.push(weatherProps.main.humidity);
                        condition.push(weatherProps.weather.main);
                        conditionDescription.push(weatherProps.weather.description);

                        if (i > 0) {

                            // use weather icon for midday weather predictions
                            if (w == 4) {
                                forcastIconId.push(weatherProps.weather[0].icon)

                            } else if (i == 5 && u == dayStamps.length - 1 && forcastIconId.length < 5) {
                                // if the forecast doesn't extend to midday, use the farthest reaching prediction
                                // for the 5th day
                                forcastIconId.push(weatherProps.weather[0].icon)
                            }
                        }
                    }
                    
                }

                maxHumidity.push(Math.max(...humidity))
                maxTemp.push(Math.max(...temp));
                minTemp.push(Math.min(...temp));
                maxWindSpeed.push(Math.max(...windSpeed));

            }

            // fills in and creates new elements to display weather data for each day
            for (var i = 0; i < forcastDays.length; i++) {
                var divEl = document.getElementById(forcastDays[i]);

                if (i == 0) {

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

// loads current weather conditions from openweather api
loadWeatherConditions = function (coordinates) {

    var lat = coordinates.lat;
    var lon = coordinates.lon;
    var weather5DayUrl = forcastBaseUrl + lat + '&' + 'lon=' + lon + '&appid=' + apiId + '&units=imperial';
    var currentWeatherUrl = currentBaseUrl + lat + '&' + 'lon=' + lon + '&appid=' + apiId + '&units=imperial';

    fetch(currentWeatherUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("current weather call: ")
            console.log(data)

            var iconId = data.weather[0].icon;
            var currentWeatherIconUrl = weatherIconUrl + iconId + '@2x.png'

            $('#current-icon').attr('src', currentWeatherIconUrl)

            if (countryCode == "US") {
                var cityTitle = `${data.name}, ${states[stateCode.trim()]}`
            } else {
                var cityTitle = `${data.name}, ${countryCode}`
            }
            
            $('#city-name').text(cityTitle)

            currentTemp = Math.round(data.main.temp);
            $('#currentTemp').text(Math.round(data.main.temp) + '°F')
            $('#currentConditions').text(data.weather[0].main)
            $('#currentWind').text('Wind: ' + Math.round(data.wind.speed) + 'mph')
            $('#currentHumidity').text('Humidity: ' + Math.round(data.main.humidity) + "%")

            getWeatherForcast(weather5DayUrl)
        })

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
        getWeather(defaultCity[0], defaultCity[1], defaultCity[2], false)
        pastSearches()
    }

}

// fills past search history from local storage
var pastSearches = function () {
    savedCities = JSON.parse(localStorage.getItem("savedCities"));
    var cityKeys = Object.keys(savedCities)

    for (var i = 0; i < cityKeys.length; i++) {
        var thisCity = savedCities[cityKeys[i]];
        addButton(thisCity)
    }


}

// creates buttons that search saved city's weather forcast
var addButton = function (addCity) {

    if (document.getElementById(addCity[0]) === null) {

        var searchButton = document.createElement('button');

        searchButton.setAttribute('id', addCity[0]);
        searchButton.setAttribute('class', 'searchHistoryButton px-3');
        searchButton.setAttribute('type', "button")
        searchButton.setAttribute('aria-label', `load ${addCity[0]} weather`)
        

        searchButton.textContent = addCity[0];
        searchButton.dataset.city = addCity[0];
        searchButton.dataset.state = addCity[1];
        searchButton.dataset.country = addCity[2];

        var removeButton = document.createElement('button');
        removeButton.setAttribute('data-city', addCity[0]);
        removeButton.setAttribute('class', "btn-close mx-3")
        removeButton.setAttribute('aria-label', "Close")
        removeButton.setAttribute('type', "button")

        var searchesContainer = document.createElement('section')
        searchesContainer.setAttribute('class', 'btn btn-light d-flex flex-row justify-content-center align-items-center px-0 my-3 mx-1')

        var hrEl = document.createElement('hr');
        hrEl.setAttribute('class', 'vr my-0')
    
        searchesContainer.appendChild(searchButton)
        searchesContainer.appendChild(hrEl)
        searchesContainer.appendChild(removeButton)
        searchesEl.appendChild(searchesContainer)
    }

}

// function saves the new city as a button in search history and in local storage
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

    getWeather(cityEl.value, stateEl.value, countryEl.value, false);

    cityEl.value = '';
    stateEl.value = '';
    countryEl.value = '';
})

// when a city from the search history button is selected, searches the weather from that city
$('#search-history').on('click', '.searchHistoryButton', function (event) {
    event.preventDefault();
    event.stopPropagation();
    click++

    var thisButton = event.target;

    getWeather(thisButton.dataset.city, thisButton.dataset.state, thisButton.dataset.country, false)

})


// removes saved city
$('#search-history').on('click', '.btn-close', function (event) {
    event.preventDefault();
    event.stopPropagation();

    var thisCity = event.target.getAttribute('data-city');
    removeCity(thisCity)
    // getWeather(thisButton.dataset.city, thisButton.dataset.state, thisButton.dataset.country, false)
    var clearCityEl = event.target.parentElement;

    clearCityEl.remove()
})

// clears history and search history when button is clicked
document.getElementById('clear-history').addEventListener('click', function (event) {
    event.preventDefault()
    event.stopPropagation()
    removeHistory()
})

