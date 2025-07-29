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
import ThemeContext from "./contexts/ThemeContext";
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
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <BrowserRouter>
        <AnalyticsTracker />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login initialMode="login" />} />
          <Route path="/signup" element={<Login initialMode="signup" />} />

          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <Chat />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/photo-analyzer"
            element={
              <ProtectedRoute>
                <Layout>
                  <PhotoAnalyzer />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <Layout>
                  <Weather />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/device-inspector"
            element={
              <ProtectedRoute>
                <Layout>
                  <DeviceInspector />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tech-trends"
            element={
              <ProtectedRoute>
                <Layout>
                  <TechTrends />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
