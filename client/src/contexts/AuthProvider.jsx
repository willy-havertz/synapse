// src/contexts/AuthProvider.jsx
import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../services/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to load profile from the server
  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile");
      // data: { name, email, avatarUrl, ... }
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // invalid token? clear it
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  // On mount: see if there's a token, then fetch profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login: save token, set header, fetch profile
  const login = async (email, password, remember = false, recaptchaToken) => {
    const payload = { email, password, remember, recaptchaToken };
    console.log("🔵 AuthProvider.login payload:", payload);

    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    await fetchProfile();
  };

  // Signup: save token, set header, fetch profile
  const signup = async (name, email, password, recaptchaToken) => {
    const payload = { name, email, password, recaptchaToken };
    console.log("🔵 AuthProvider.signup payload:", payload);

    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("token", data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    await fetchProfile();
  };

  // Send password reset email
  const sendResetEmail = async (email, recaptchaToken) => {
    const payload = { email, recaptchaToken };

    await api.post("/auth/reset-password", payload);
  };

  // Logout: clear everything
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ user, login, signup, sendResetEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
