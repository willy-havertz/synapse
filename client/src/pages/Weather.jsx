
import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faTimesCircle,
  faTint,
  faCloudRain,
  faCloudSun,
  faSun,
  faWind,
  faCalendarAlt,
  faThermometerHalf,
} from "@fortawesome/free-solid-svg-icons";
import ThemeContext from "../contexts/ThemeContext";

const DEFAULT_CITY = "Nairobi";

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="h-20 w-20 animate-spin rounded-full border-8 border-t-8 border-gray-700" />
    </div>
  );
}

export default function Weather() {
  const { dark } = useContext(ThemeContext);
  const [locInput, setLocInput] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C");
  const [lastUpdated, setLastUpdated] = useState(null);

  const convertTemp = (c) =>
    unit === "C" ? Math.round(c) : Math.round((c * 9) / 5 + 32);

  const fetchData = useCallback(async (query) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.getWeather(query);
      setWeatherData(data.current);
      setForecast(data.forecast);
      setLastUpdated(new Date());
    } catch {
      setError("Could not fetch data. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(DEFAULT_CITY);
  }, [fetchData]);

  const onSearch = () => {
    if (!locInput.trim()) return;
    fetchData(locInput.trim());
    setLocInput("");
  };
  const onClear = () => setLocInput("");
  const onGeolocate = () =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchData(`${coords.latitude},${coords.longitude}`),
      () => setError("Geolocation denied.")
    );
  const toggleUnit = () => setUnit((u) => (u === "C" ? "F" : "C"));

  return (
    <div
      className={`${
        dark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } min-h-screen relative`}
    >
      {loading && <Loader />}

      {/* Header */}
      <div className="py-16 text-center">
        <h1 className="text-5xl font-bold">Weather Dashboard</h1>
        <p className={`${dark ? "text-gray-400" : "text-gray-600"} mt-2`}>
          Stay updated with accurate weather forecasts and current conditions
        </p>
      </div>

      <div className="container mx-auto px-8 py-8 space-y-8">
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Search Panel */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 rounded-2xl p-4 shadow-lg mb-2 ${
            dark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          {/* Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="City or ZIP code"
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className={`w-full rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 ${
                dark
                  ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500"
                  : "bg-white text-black placeholder-gray-600 focus:ring-purple-500"
              }`}
            />
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500"
            />
            {locInput && (
              <button
                onClick={onClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-white focus:outline-none"
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            )}
          </div>

          {/* Buttons */}
          <button
            onClick={onSearch}
            className="flex items-center rounded-2xl bg-purple-600 px-6 py-3 text-white hover:bg-purple-500 transition"
          >
            <FontAwesomeIcon icon={faSearch} className="mr-2" />
            Search
          </button>
          <button
            onClick={onGeolocate}
            className={`flex items-center rounded-2xl px-6 py-3 transition ${
              dark
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-white hover:bg-gray-200 text-black"
            }`}
          >
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="mr-2 text-purple-500"
            />
            My Location
          </button>
          <button
            onClick={toggleUnit}
            title={`Switch to °${unit === "C" ? "F" : "C"}`}
            className={`ml-auto flex items-center rounded-2xl px-4 py-3 transition ${
              dark
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-white hover:bg-gray-200 text-black"
            }`}
          >
            <FontAwesomeIcon
              icon={faThermometerHalf}
              className="mr-2 text-purple-500"
            />
            °{unit}
          </button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p
            className={`${
              dark ? "text-gray-400" : "text-gray-600"
            } text-sm text-right`}
          >
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* Current Weather */}
        {weatherData && (
          <div
            className={`rounded-2xl p-8 shadow-lg ${
              dark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <h3 className="mb-6 flex items-center space-x-3 text-2xl font-semibold">
              <FontAwesomeIcon icon={faCloudSun} className="text-purple-400" />
              <span>Current Weather — {weatherData.city}</span>
            </h3>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <FontAwesomeIcon
                  icon={
                    weatherData.icon === "rain"
                      ? faCloudRain
                      : weatherData.icon === "cloud"
                      ? faCloudSun
                      : faSun
                  }
                  className="text-purple-400 text-7xl"
                />
                <div>
                  <p className="text-6xl font-bold">
                    {convertTemp(weatherData.temp)}°{unit}
                  </p>
                  <p className="capitalize text-gray-400">
                    {weatherData.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faTint} className="text-purple-400" />
                  <span>Humidity: {weatherData.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faWind} className="text-purple-400" />
                  <span>Wind: {weatherData.wind} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSun} className="text-purple-400" />
                  <span>Sunrise: {weatherData.sunrise}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSun} className="text-purple-400" />
                  <span>Sunset: {weatherData.sunset}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Forecast */}
        {forecast.length > 0 && (
          <div
            className={`rounded-2xl p-8 shadow-lg ${
              dark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <h3 className="mb-6 flex items-center space-x-3 text-2xl font-semibold">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-purple-400"
              />
              <span>7‑Day Forecast</span>
            </h3>
            <div className="flex flex-col space-y-4">
              {forecast.map((day, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl px-6 py-4 transition-colors duration-200 ${
                    dark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-white hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <FontAwesomeIcon
                      icon={
                        day.desc.toLowerCase().includes("rain")
                          ? faCloudRain
                          : day.desc.toLowerCase().includes("cloud")
                          ? faCloudSun
                          : faSun
                      }
                      className="text-purple-400 text-4xl"
                    />
                    <div>
                      <p className="text-lg font-medium">{day.day}</p>
                      <p className="text-2xl font-bold">
                        {convertTemp(day.high)}°{unit}
                      </p>
                      <p className="text-sm capitalize text-gray-400">
                        {day.desc}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-right text-gray-400">
                    <p>💧 {day.pop}%</p>
                    <p>
                      🌡️ {convertTemp(day.high)}° / {convertTemp(day.low)}°
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
