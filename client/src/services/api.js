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

// your existing helper
API.getWeather = (loc) => {
  return API.get("/weather", {
    params: { loc },
  });
};

/**
 * Uploads an image File/Blob to your DeepFace Flask service and returns
 * the analysis JSON.
 *
 * Expects a VITE_DEEPFACE_URL like "http://127.0.0.1:5001"
 */
API.photoAnalyze = (file) => {
  const form = new FormData();
  form.append("file", file);

  return axios.post(
    `${import.meta.env.VITE_DEEPFACE_URL}/photo/analyze`,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export default API;
