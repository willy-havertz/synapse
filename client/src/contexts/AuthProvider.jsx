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
      // data: { name, email, avatarUrl }
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
      // set axios header
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login: save token, set header, fetch profile
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    await fetchProfile();
  };

  // Signup: same flow
  const signup = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    localStorage.setItem("token", data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    await fetchProfile();
  };

  // Logout: clear everything
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  // Delay rendering until we've checked for token & tried fetching
  if (loading) {
    return null; // or a <Spinner/> component
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
