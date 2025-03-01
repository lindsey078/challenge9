import './styles/jass.css';

/* 🔹 DOM Elements */
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const todayContainer = document.getElementById('today') as HTMLDivElement;
const forecastContainer = document.getElementById('forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;
const heading = document.getElementById('search-title') as HTMLHeadingElement;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement;
const tempEl = document.getElementById('temp') as HTMLParagraphElement;
const windEl = document.getElementById('wind') as HTMLParagraphElement;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement;

/* 
-------------------------------------
✅ FIX 1: Added TypeScript Interfaces
-------------------------------------
*/
interface WeatherData {
  dt_txt: string; // ✅ FIXED: Date string from API
  main: {
    temp: number; // ✅ FIXED: Temperature
    humidity: number; // ✅ FIXED: Humidity
  };
  wind: {
    speed: number; // ✅ FIXED: Wind speed
  };
  weather: {
    icon: string; // ✅ FIXED: Weather icon
    description: string; // ✅ FIXED: Description of weather
  }[];
}

interface WeatherAPIResponse {
  list: WeatherData[]; // ✅ FIXED: "list" contains an array of WeatherData objects
}

/* 
-------------------------------------
✅ FIX 2: Corrected API Call & Parsing
-------------------------------------
*/
const fetchWeather = async (cityName: string) => {
  const response = await fetch('/api/weather/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city: cityName }), // ✅ FIXED: Use "city" instead of "cityName"
  });

  const weatherData: WeatherAPIResponse = await response.json(); // ✅ FIXED: Ensure correct type
  console.log('weatherData: ', weatherData);

  // ✅ FIXED: Extract current and forecast data properly
  const currentWeather = weatherData.list[0]; // First item in list is current weather
  const forecast = weatherData.list.slice(1); // Remaining items are forecast

  renderCurrentWeather(currentWeather);
  renderForecast(forecast);
};

const fetchSearchHistory = async () => {
  const response = await fetch('/api/weather/history');
  return response.json();
};

const deleteCityFromHistory = async (id: string) => {
  await fetch(`/api/weather/history/${id}`, { method: 'DELETE' });
};

/* 
-------------------------------------
✅ FIX 3: Applied Proper TypeScript Types
-------------------------------------
*/
const renderCurrentWeather = (currentWeather: WeatherData): void => {
  const { dt_txt, main, wind, weather } = currentWeather;

  heading.textContent = `Weather on ${dt_txt}`;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${weather[0].icon}.png`);
  weatherIcon.setAttribute('alt', weather[0].description);
  tempEl.textContent = `Temp: ${main.temp}°F`;
  windEl.textContent = `Wind: ${wind.speed} MPH`;
  humidityEl.textContent = `Humidity: ${main.humidity}%`;

  todayContainer.innerHTML = '';
  todayContainer.append(heading, weatherIcon, tempEl, windEl, humidityEl);
};

/* 
-------------------------------------
✅ FIX 4: Corrected Forecast Data Parsing
-------------------------------------
*/
const renderForecast = (forecast: WeatherData[]): void => {
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';

  for (let i = 0; i < 5; i++) { // ✅ FIXED: Show only 5-day forecast
    renderForecastCard(forecast[i]);
  }
};

const renderForecastCard = (forecast: WeatherData) => {
  const { dt_txt, main, wind, weather } = forecast;
  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = dt_txt;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${weather[0].icon}.png`);
  weatherIcon.setAttribute('alt', weather[0].description);
  tempEl.textContent = `Temp: ${main.temp} °F`;
  windEl.textContent = `Wind: ${wind.speed} MPH`;
  humidityEl.textContent = `Humidity: ${main.humidity} %`;

  forecastContainer.append(col);
};

const renderSearchHistory = async () => {
  const historyList = await fetchSearchHistory();

  searchHistoryContainer.innerHTML = '';

  if (!historyList.length) {
    searchHistoryContainer.innerHTML = '<p class="text-center">No Previous Search History</p>';
  }

  for (let i = historyList.length - 1; i >= 0; i--) {
    const historyItem = buildHistoryListItem(historyList[i]);
    searchHistoryContainer.append(historyItem);
  }
};

/* 🔹 Helper Functions */
const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl };
};

const buildHistoryListItem = (city: any) => {
  const newBtn = document.createElement('button');
  newBtn.setAttribute('type', 'button');
  newBtn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  newBtn.textContent = city.name;
  newBtn.addEventListener('click', () => fetchWeather(city.name));

  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('type', 'button');
  deleteBtn.classList.add('btn', 'btn-danger', 'col-2');
  deleteBtn.textContent = 'X';
  deleteBtn.addEventListener('click', () => deleteCityFromHistory(city.id));

  const historyDiv = document.createElement('div');
  historyDiv.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  historyDiv.append(newBtn, deleteBtn);

  return historyDiv;
};

/* 🔹 Event Listeners */
searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!searchInput.value) return;
  fetchWeather(searchInput.value).then(renderSearchHistory);
  searchInput.value = '';
});

searchHistoryContainer?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('.history-btn')) {
    fetchWeather(target.textContent!);
  }
});

/* 🔹 Initial Render */
renderSearchHistory();