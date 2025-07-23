// src/App.jsx
import React, { useContext, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AuthContext from "./contexts/AuthContext";
import api from "./services/api";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import PhotoAnalyzer from "./pages/PhotoAnalyzer";
import Weather from "./pages/Weather";
import DeviceInspector from "./pages/DeviceInspector";
import TechTrends from "./pages/TechTrends";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Home from "./pages/Home";

import Layout from "./components/Layout";

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

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login initialMode="login" />} />
        <Route path="/signup" element={<Login initialMode="signup" />} />

        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Protected app routes wrapped in Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="home" element={<Home />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="photo-analyzer" element={<PhotoAnalyzer />} />
                  <Route path="weather" element={<Weather />} />
                  <Route
                    path="device-inspector"
                    element={<DeviceInspector />}
                  />
                  <Route path="tech-trends" element={<TechTrends />} />
                  <Route path="analytics" element={<Analytics />} />

                  {/* Redirect unknown protected paths to home */}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
