document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('city-input');
  const searchButton = document.getElementById('search-button');
  const errorMessage = document.getElementById('error-message');
  const weatherCard = document.getElementById('weather-card');
  const cityName = document.getElementById('city-name');
  const countryName = document.getElementById('country-name');
  const weatherIcon = document.getElementById('weather-icon');
  const temp = document.getElementById('temp');
  const description = document.getElementById('description');
  const feelsLike = document.getElementById('feels-like');
  const windSpeed = document.getElementById('wind-speed');
  const humidity = document.getElementById('humidity');
  const precipitation = document.getElementById('precipitation');
  const windDirection = document.getElementById('wind-direction');

  async function getCityCoordinates(cityName) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=ru&format=json`
    );
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('Город не найден');
    }
    return {
      lat: data.results[0].latitude,
      lon: data.results[0].longitude,
      name: data.results[0].name,
      country: data.results[0].country
    };
  }

  async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
      showError('Введите название города');
      return;
    }
    searchButton.disabled = true;
    searchButton.textContent = 'Загрузка...';
    hideError();
    weatherCard.classList.add('hidden');

    try {
      const coords = await getCityCoordinates(city);
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`
      );
      if (!response.ok) throw new Error('Ошибка получения данных');
      const data = await response.json();
      const weatherData = {
        city: coords.name,
        country: coords.country,
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: data.current.wind_direction_10m,
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code
      };
      displayWeather(weatherData);
    } catch (err) {
      showError(err.message);
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = 'Поиск';
    }
  }

  function getWeatherIcon(code) {
    if (code === 0) return '<i data-lucide="sun" class="w-16 h-16 text-yellow-400"></i>';
    if (code >= 1 && code <= 3) return '<i data-lucide="cloud" class="w-16 h-16 text-gray-400"></i>';
    if (code >= 51 && code <= 67) return '<i data-lucide="cloud-rain" class="w-16 h-16 text-blue-400"></i>';
    return '<i data-lucide="cloud" class="w-16 h-16 text-gray-400"></i>';
  }

  function getWeatherDescription(code) {
    if (code === 0) return 'Ясно';
    if (code === 1) return 'Преимущественно ясно';
    if (code === 2) return 'Переменная облачность';
    if (code === 3) return 'Пасмурно';
    if (code >= 51 && code <= 67) return 'Дождь';
    return 'Облачно';
  }

  function displayWeather(data) {
    cityName.textContent = data.city;
    countryName.textContent = data.country;
    weatherIcon.innerHTML = getWeatherIcon(data.weatherCode);
    temp.textContent = `${data.temp}°C`;
    description.textContent = getWeatherDescription(data.weatherCode);
    feelsLike.textContent = `Ощущается как ${data.feelsLike}°C`;
    windSpeed.textContent = `${data.windSpeed} км/ч`;
    humidity.textContent = `${data.humidity}%`;
    precipitation.textContent = `${data.precipitation} мм`;
    windDirection.textContent = `${data.windDirection}°`;
    weatherCard.classList.remove('hidden');
    lucide.createIcons();
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }

  function hideError() {
    errorMessage.style.display = 'none';
  }

  searchButton.addEventListener('click', getWeather);
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
  });
});