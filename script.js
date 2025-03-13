const API_KEY = '5dae7f999739062c07ce5897f8f02583';  // Replace with your OpenWeather API Key

// Function to get weather by entering a location manually
function getWeather() {
    let area = document.getElementById('cityInput').value.trim();
    if (area === '') {
        alert("Please enter a location");
        return;
    }

    // Fetch latitude & longitude
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
            let locationName = geoData[0].name;

            fetchWeather(lat, lon, locationName);
        })
        .catch(error => console.error("Error:", error));
}

// Function to get weather by user's current location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Success callback for geolocation (fetching latitude and longitude)
function success(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    // ✅ Use Nominatim (OpenStreetMap) for precise location
    let reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    fetch(reverseGeoUrl)
        .then(response => response.json())
        .then(geoData => {
            let address = geoData.address;
            
            // Fetch village/town first, then fallback to broader locations
            let locationName = address.village || address.town || address.hamlet || address.suburb || 
                               address.city || address.county || address.state || "Unknown Location";

            document.getElementById('weatherResult').innerHTML = `<p>Fetching weather for: <b>${locationName}</b></p>`;

            fetchWeather(lat, lon, locationName);
        })
        .catch(error => console.error("Error fetching location name:", error));
}

// Error handling for geolocation
function error() {
    alert("Unable to retrieve your location.");
}

// Function to fetch and display weather data
function fetchWeather(lat, lon, locationName) {
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(weatherData => {
            document.getElementById('weatherResult').innerHTML = `
                <h2>${locationName}, ${weatherData.sys.country}</h2>
                <p>Temperature: ${weatherData.main.temp}°C</p>
                <p>Humidity: ${weatherData.main.humidity}%</p>
                <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
                <p>Weather: ${weatherData.weather[0].description}</p>
            `;

            fetchForecast(lat, lon);
        })
        .catch(error => console.error("Error fetching weather data:", error));
}

// Function to fetch and display 5-day weather forecast
function fetchForecast(lat, lon) {
    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    fetch(forecastUrl)
        .then(response => response.json())
        .then(forecastData => {
            let forecastHTML = "<h3>5-Day Forecast</h3><div style='display: flex; gap: 15px; overflow-x: auto;'>";

            for (let i = 0; i < forecastData.list.length; i += 8) {  // Every 24 hours
                let day = new Date(forecastData.list[i].dt_txt).toDateString();
                let temp = forecastData.list[i].main.temp;
                let weatherDesc = forecastData.list[i].weather[0].description;

                forecastHTML += `
                    <div style="border: 1px solid #ccc; padding: 10px; text-align: center; min-width: 120px;">
                        <p><b>${day}</b></p>
                        <p>${temp}°C</p>
                        <p>${weatherDesc}</p>
                    </div>
                `;
            }

            forecastHTML += "</div>";
            document.getElementById('forecastResult').innerHTML = forecastHTML;
        })
        .catch(error => console.error("Error fetching forecast data:", error));
}
