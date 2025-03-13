const API_KEY = '5dae7f999739062c07ce5897f8f02583'; // Replace with your OpenWeather API Key

// Function to fetch weather by area name
function getWeather() {
    let area = document.getElementById('cityInput').value.trim();
    if (area === '') {
        alert("Please enter a location");
        return;
    }
    fetchWeatherData(area);
}

// Function to fetch weather using Geolocation
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            // Use reverse geocoding to get the location name
            let reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

            fetch(reverseGeoUrl)
                .then(response => response.json())
                .then(geoData => {
                    if (geoData.length > 0) {
                        let areaName = geoData[0].name; // Get the detected location name
                        fetchWeatherByCoords(lat, lon, areaName);
                    } else {
                        fetchWeatherByCoords(lat, lon, "Unknown Location");
                    }
                })
                .catch(error => {
                    console.error("Error fetching location name:", error);
                    fetchWeatherByCoords(lat, lon, "Unknown Location");
                });

        }, error => {
            alert("Location access denied. Please enter a location manually.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Fetch weather using city name
function fetchWeatherData(area) {
  let geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${area}&limit=1&appid=${API_KEY}`;

  fetch(geoUrl)
      .then(response => response.json())
      .then(geoData => {
          if (geoData.length === 0) {
              document.getElementById('weatherResult').innerHTML = `<p>Location not found. Try another.</p>`;
              return;
          }

          let lat = geoData[0].lat;
          let lon = geoData[0].lon;
          let country = geoData[0].country || "";  // Get country code safely
          let state = geoData[0].state ? `, ${geoData[0].state}` : ""; // Get state if available

          fetchWeatherByCoords(lat, lon, `${geoData[0].name}${state}, ${country}`);
      })
      .catch(error => console.error("Error:", error));
}

function fetchWeatherByCoords(lat, lon, areaName = "Your Location") {
  let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  fetch(weatherUrl)
      .then(response => response.json())
      .then(weatherData => {
          let formattedLocation = `${areaName}`.replace(/, (\w+), \1$/, ", $1"); // Fix duplicate country issue

          let currentWeather = `
              <h2>${formattedLocation}</h2>
              <p><b>Temperature:</b> ${weatherData.main.temp}°C</p>
              <p><b>Humidity:</b> ${weatherData.main.humidity}%</p>
              <p><b>Wind Speed:</b> ${weatherData.wind.speed} m/s</p>
              <p><b>Weather:</b> ${weatherData.weather[0].description}</p>
          `;

          document.getElementById('weatherResult').innerHTML = currentWeather;
      });

  fetch(forecastUrl)
      .then(response => response.json())
      .then(forecastData => {
          let forecastHtml = "<h3>5-Day Forecast:</h3><div class='forecast-container'>";
          
          let dailyForecasts = {};
          forecastData.list.forEach(entry => {
              let date = entry.dt_txt.split(" ")[0];
              if (!dailyForecasts[date]) {
                  dailyForecasts[date] = entry;
              }
          });

          Object.values(dailyForecasts).forEach(day => {
              forecastHtml += `
                  <div class="forecast-item">
                      <p><b>${day.dt_txt.split(" ")[0]}</b></p>
                      <p>🌡 ${day.main.temp}°C</p>
                      <p>☁️ ${day.weather[0].description}</p>
                  </div>
              `;
          });

          forecastHtml += "</div>";
          document.getElementById('forecastResult').innerHTML = forecastHtml;
      })
      .catch(error => console.error("Error:", error));
}
