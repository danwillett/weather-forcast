var searchButton = document.getElementById('city-form');
console.log(searchButton)
var cityEl = document.getElementById('inputCity')
var weatherUrl = 
// 9248d00e4b49eb3d83939e35c0de038f

// function that calls weather api

getWeather = function(){

    fetch()
}

// when we submit a valid city, get the weather
searchButton.addEventListener('submit', function(event){
    event.preventDefault()
    console.log('hi')
    
    console.log(cityEl)
    var cityName = cityEl.value;
    console.log(cityName)


})
