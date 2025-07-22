// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import api from "./services/api";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import PhotoAnalyzer from "./pages/PhotoAnalyzer";
import Weather from "./pages/Weather";
import DeviceInspector from "./pages/DeviceInspector";
import TechTrends from "./pages/TechTrends";
import Analytics from "./pages/Analytics";

// Fires a pageview event on every navigation
function AnalyticsTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    api
      .post("/analytics/event", {
        eventType: "pageview",
        path: pathname,
        referrer: document.referrer || "",
        timestamp: new Date().toISOString(),
      })
      .catch(() => {});
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />

      <Routes>
        {/* Public / Unauthenticated */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* All protected routes live under /app */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="chat" element={<Chat />} />
          <Route path="settings" element={<Settings />} />
          <Route path="photo-analyzer" element={<PhotoAnalyzer />} />
          <Route path="weather" element={<Weather />} />
          <Route path="device-inspector" element={<DeviceInspector />} />
          <Route path="tech-trends" element={<TechTrends />} />
          <Route path="analytics" element={<Analytics />} />

          {/* Redirect /app → /app/home */}
          <Route index element={<Navigate to="home" replace />} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Route>

        {/* Catch-all: if no route matches, decide where to go */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
