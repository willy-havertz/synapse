
import React, { useState, useEffect, useCallback } from "react";
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

const DEFAULT_CITY = "Nairobi";

function Loader() {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full border-8 border-t-8 border-gray-700 h-20 w-20" />
    </div>
  );
}

export default function Weather() {
  const [locInput, setLocInput] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C");
  const [lastUpdated, setLastUpdated] = useState(null);

  const convertTemp = (c) => (unit === "C" ? c : Math.round((c * 9) / 5 + 32));

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
    <div className="min-h-screen bg-black text-white relative">
      {loading && <Loader />}

      {/* Header */}
      <div className="py-16 text-center">
        <h1 className="text-5xl font-bold text-white">Weather Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Stay updated with accurate weather forecasts and current conditions
        </p>
      </div>

      <div className="container mx-auto px-8 py-8 space-y-8">
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Search Panel */}
        <div className="bg-[#1f1f1f] p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-4 mb-2">
          {/* Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="City or ZIP code"
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="w-full bg-black text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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

          {/* Search */}
          <button
            onClick={onSearch}
            className="flex items-center px-6 py-3 bg-[#791cd0] text-white rounded-2xl hover:bg-opacity-90 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faSearch} className="text-purple-500 mr-2" />
            Search
          </button>

          {/* Geolocate */}
          <button
            onClick={onGeolocate}
            className="flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition"
          >
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-purple-500 mr-2"
            />
            My Location
          </button>

          {/* Unit Toggle */}
          <button
            onClick={toggleUnit}
            title={`Switch to °${unit === "C" ? "F" : "C"}`}
            className="ml-auto flex items-center px-4 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition"
          >
            <FontAwesomeIcon
              icon={faThermometerHalf}
              className="text-purple-500 mr-2"
            />
            °{unit}
          </button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-gray-400 text-sm text-right">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* Current Weather */}
        {weatherData && (
          <div className="bg-[#1f1f1f] shadow-lg rounded-2xl p-8 w-full">
            <h3 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-white">
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
                  <p className="text-6xl font-bold text-white">
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
          <div className="bg-[#1f1f1f] shadow-lg rounded-2xl p-8 w-full">
            <h3 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-white">
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
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl px-6 py-4 flex items-center justify-between transition-colors duration-200"
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
                      <p className="text-lg font-medium text-white">
                        {day.day}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {convertTemp(day.high)}°{unit}
                      </p>
                      <p className="text-sm capitalize text-gray-300">
                        {day.desc}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1 text-gray-300">
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
