import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
});

// attach JWT if present
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.getWeather = (loc) => {
  return API.get("/weather", {
    params: { loc },
  });
};

export default API;
