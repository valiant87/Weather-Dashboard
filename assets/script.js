var apiKey = "d0be1a0283dc9c0c9c8884c1eaa793db";
var date = moment().format(" DD/MM/YYYY");
var card = $("<div>").attr("class", "card-group");
var dataDaily = $("<div>").attr("class", "dataDaily");
var display = $("#currentWeather");
var cityClick = "";
var cityStorage = ["Chicago", "New York", "Los Angeles"];

// add event listener onClick function take the input and save local storage
//Check if the same city exist in storage
$("#searchBtn").on("click", function (event) {
  $("#search-input").empty();
  event.preventDefault();
  var citySearch = $("#search-input").val().trim();
  var cityIsAdd = false;
  for (var i = 0; i < cityStorage.length; i++) {
    if (cityStorage[i].toLowerCase() === citySearch.toLowerCase()) {
      cityIsAdd = true;
    }
  }
  if (cityIsAdd === false) {
    localStorage.setItem("citySearch", citySearch);
    cityStorage.push(citySearch);
    localStorage.setItem("cityStorage", JSON.stringify(cityStorage));
    // The city from the textbox is then added to our array
  }
});

// Function for displaying city
function renderButtons() {
  // Deleting the city prior to adding new city
  $("#cityListBtn").empty();

  var cityDisplay = JSON.parse(localStorage.getItem("cityStorage"));
  // Looping through the array of city
  for (var i = 0; i < cityDisplay.length; i++) {
    // Then dynamically generating buttons for each city in the array
    var a = $("<button>");
    // Adding a class of city-btn to our button
    a.addClass("city-btn");
    // Adding a data-attribute
    a.attr("data-city", cityDisplay[i]);
    // Providing the initial button text
    a.text(cityDisplay[i]);
    // Adding the button to the buttons-view div
    $("#cityListBtn").append(a);
  }
}

//Display the list of cities from local storage and call for the last city searched when page is loaded
$(document).ready(function () {
  if (typeof localStorage.cityStorage === "undefined") {
    localStorage.setItem("cityStorage", JSON.stringify(cityStorage));
    var cityClick = cityStorage[cityStorage.length - 1];
    UrlWeather(cityClick);
    renderButtons;
  } else {
    cityStorage = JSON.parse(localStorage.getItem("cityStorage"));
    var cityClick = cityStorage[cityStorage.length - 1];
    UrlWeather(cityClick);
  }
});

//Search the weather when past cities button is clicked
$(document).on("click", ".city-btn", function (event) {
  cityClick = $(this).attr("data-city");
  UrlWeather(cityClick);
});
//Search the weather when user input search the city
$(document).on("click", "#searchBtn", function () {
  cityClick = localStorage.getItem("citySearch");
  UrlWeather(cityClick);
});

function UrlWeather(cityClick) {
  // Constructing a URL to search for weather
  var weatherURl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityClick +
    "&units=imperial&appid=" +
    apiKey;

  // Performing our AJAX GET request
  $.ajax({
    url: weatherURl,
    method: "GET",
  })
    // After the data comes back from the API
    .then(function weather(APIresponse) {
      console.log(APIresponse);
      currentWeather(APIresponse);
      var lon = APIresponse.coord.lon;
      var lat = APIresponse.coord.lat;
      console.log(lon, lat);
      // Storing the data in local storage
      localStorage.setItem("APIresponse", JSON.stringify(APIresponse));

      //Display current date weather
      function currentWeather(APIresponse) {
        display.empty();
        var icon =
          "https://openweathermap.org/img/wn/" +
          APIresponse.weather[0].icon +
          ".png";
        //Display data weather in id
        display.append(
          $("<h3>").html(
            APIresponse.name + "(" + date + ")" + "<img src=" + icon + ">"
          )
        );
        display.append(
          $("<h6>").text("Temperature: " + APIresponse.main.temp + "°F")
        );
        display.append(
          $("<h6>").text("Humidity: " + APIresponse.main.humidity + "%")
        );
        display.append(
          $("<h6>").text(
            "Wind Speed: " + APIresponse.wind.speed.toFixed(0) + " MPH"
          )
        );
      }

      //Call for 5 days forecast
      var weatherURl5days =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        lon +
        "&exclude=hourly,minutely,alerts&appid=" +
        apiKey;
      $.ajax({
        url: weatherURl5days,
        method: "GET",
      })
        // After the data comes back from the API
        .then(function (APIresponse5days) {
          console.log(APIresponse5days);
          currentWeather5days(APIresponse5days);
          // Data stored in local storage
          localStorage.setItem(
            "APIresponse5days",
            JSON.stringify(APIresponse5days)
          );

          //add UV index with color that indicates whether conditions
          var UVindex = APIresponse5days.current.uvi;
          display.append(
            $('<h6 class="card-text w-25 p-1">').text("UVindex: " + UVindex)
          );
          console.log(UVindex);
          if (UVindex < 3) {
            $(".card-text").addClass("green");
          } else if (UVindex >= 3 || UVindex < 6) {
            $(".card-text").addClass("yellow");
          } else if (UVindex >= 6 || UVindex < 8) {
            $(".card-text").addClass("orange");
          } else if (UVindex >= 8 || UVindex < 1) {
            $(".card-text").addClass("red");
          } else if (UVindex >= 11) {
            $(".card-text").addClass("violet");
          }
        });
    });
  renderButtons();
}

//Display current date weather 5 days
function currentWeather5days(APIresponse5days) {
  //Display data weather in id
  var display5days = $("#5daysWeather");
  var diplay5dayForecast = $("#5daysForecast");
  display5days.empty();
  diplay5dayForecast.empty();
  diplay5dayForecast.append($("<h4>").text("5 Day Forecast :"));
  for (var i = 0; i < 5; i++) {
    var num = (
      Math.round(APIresponse5days.daily[i].wind_speed) * 2.237
    ).toFixed(0);
    var date = $("<h5>").text(formatDate(APIresponse5days.daily[i].dt));
    var temperature = $("<p>").text(
      "Temperature: " +
        (Math.round(APIresponse5days.daily[i].temp.day - 273.15) * 1.8 + 32)
    );
    var humidity = $("<p>").text(
      "Humidity: " + APIresponse5days.daily[i].humidity + "%"
    );
    var wind = $("<p>").text("Wind Speed: " + num + " MPH");
    var icon = $("<img>").attr(
      "src",
      "https://openweathermap.org/img/wn/" +
        APIresponse5days.daily[i].weather[0].icon +
        ".png"
    );

    var card = $("<div>").attr("class", "card m-1");
    var cardbody = $("<div>").attr("class", "card-body p-1");
    cardbody
      .append(date)
      .append(icon)
      .append(temperature)
      .append(humidity)
      .append(wind);
    card.append(cardbody);
    display5days.append(card);
  }
}

//Convert current date
function formatDate(unix_timestamp) {
  var date = new Date(unix_timestamp * 1000);
  return date.toLocaleDateString();
}
renderButtons();
