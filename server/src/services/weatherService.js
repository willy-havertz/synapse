// server/src/services/weatherService.js
const axios = require("axios");
const API_KEY = process.env.WEATHERAPI_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

/**
 * Fetches current + 7‑day forecast from WeatherAPI.com.
 *
 * @param {string} loc  City name, ZIP, or "lat,lon"
 * @returns {Promise<{ current: Object, forecast: Array }>}
 */
async function fetchCurrentAndForecast(loc) {
  if (!API_KEY) {
    console.error("❌ WEATHERAPI_KEY is not set in .env");
    throw new Error("Weather API key missing");
  }

  // days=7 gives you today + next 6 days; slice below to get exactly 7 entries if you want
  const url = `${BASE_URL}/forecast.json`;
  const params = {
    key: API_KEY,
    q: loc,
    days: 7,
    aqi: false,
    alerts: false,
  };

  let resp;
  try {
    resp = await axios.get(url, { params });
  } catch (err) {
    console.error("WeatherAPI fetch error:", err.response?.data || err.message);
    throw new Error("WeatherAPI request failed");
  }

  const { location, current: c, forecast: f } = resp.data;

  // Build our shapes
  const current = {
    city: location.name,
    temp: Math.round(c.temp_c),
    description: c.condition.text,
    icon: mapIcon(c.condition.code, c.is_day),
    humidity: c.humidity,
    wind: Math.round(c.wind_kph),
    sunrise: f.forecastday[0].astro.sunrise,
    sunset: f.forecastday[0].astro.sunset,
  };

  // forecastday is an array of days (including today). Skip index 0 if you want only future days.
  const forecast = f.forecastday.map((day) => ({
    day: new Date(day.date).toLocaleDateString("en-GB", { weekday: "short" }),
    desc: day.day.condition.text,
    high: Math.round(day.day.maxtemp_c),
    low: Math.round(day.day.mintemp_c),
    pop: Math.round(day.day.daily_chance_of_rain),
  }));

  return { current, forecast };
}

/**
 * Very simple mapping: rain codes → "rain", cloud codes → "cloud", else "sun"
 */
function mapIcon(code, isDay) {
  // WeatherAPI gives you numeric "code", see their docs:
  // https://www.weatherapi.com/docs/#condition-codes
  if (code >= 116 && code <= 124) return "cloud";
  if (
    [1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(
      code
    )
  )
    return "rain";
  return "sun";
}

module.exports = { fetchCurrentAndForecast };
