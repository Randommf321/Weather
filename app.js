const apiKey = '9ac1f5c2d6508db3c616a0d1f80a08fd';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');
const nameTag = document.querySelector('.name');
const tempTag = document.querySelector('.temp');
const windTag = document.querySelector('.wind');
const descTag = document.querySelector('.desc');
const humTag = document.querySelector('.hum');
const mainTag = document.querySelector('.main');
const weatherIcon = document.querySelector('.weather-icon');
const errorDiv = document.querySelector('.error');
const loadingDiv = document.querySelector('.loading');
const lastUpdatedTag = document.querySelector('.last-updated');
const forecastDiv = document.querySelector('.forecast');

let currentUnit = 'metric';

function fetchWeather(city) {
    showLoading();
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            updateWeatherUI(data);
            fetchForecast(city);
        })
        .catch(error => {
            showError(error.message);
        })
        .finally(() => {
            hideLoading();
        });
}

function fetchForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${currentUnit}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            updateForecastUI(data);
        })
        .catch(error => console.error('Error fetching forecast:', error));
}

function updateWeatherUI(data) {
    nameTag.innerText = data.name;
    tempTag.innerText = `${Math.round(data.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    windTag.innerText = `Wind: ${data.wind.speed} ${currentUnit === 'metric' ? 'km/h' : 'mph'}`;
    descTag.innerText = data.weather[0].description;
    humTag.innerText = `Humidity: ${data.main.humidity}%`;
    mainTag.innerText = data.weather[0].main;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    lastUpdatedTag.innerText = `Last updated: ${new Date().toLocaleTimeString()}`;
    errorDiv.style.display = 'none';
}

function updateForecastUI(data) {
    forecastDiv.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const forecastItem = data.list[i];
        const date = new Date(forecastItem.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecastItem.main.temp);
        const icon = forecastItem.weather[0].icon;

        const forecastItemEl = document.createElement('div');
        forecastItemEl.classList.add('forecast-item');
        forecastItemEl.innerHTML = `
            <p>${dayName}</p>
            <img class="forecast-icon" src="http://openweathermap.org/img/wn/${icon}.png" alt="Forecast Icon">
            <p>${temp}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
        `;
        forecastDiv.appendChild(forecastItemEl);
    }
}

function showError(message) {
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
}

function showLoading() {
    loadingDiv.style.display = 'block';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        updateWeatherUI(data);
                        fetchForecast(data.name);
                    })
                    .catch(error => showError('Error fetching weather data'));
            },
            () => {
                showError('Unable to retrieve your location');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
});

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'metric') {
        currentUnit = 'metric';
        const city = nameTag.innerText;
        if (city) {
            fetchWeather(city);
        }
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'imperial') {
        currentUnit = 'imperial';
        const city = nameTag.innerText;
        if (city) {
            fetchWeather(city);
        }
    }
});

// Load default city on page load
fetchWeather('Mongolia');