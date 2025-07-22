// server/src/controllers/weatherController.js
const { fetchCurrentAndForecast } = require("../services/weatherService");

async function getWeather(loc) {
  try {
    return await fetchCurrentAndForecast(loc);
  } catch (err) {
    // Log the full error for debugging:
    console.error("weatherController.getWeather error:", err);
    // re‑throw so the router returns a 502
    throw err;
  }
}

module.exports = { getWeather };
