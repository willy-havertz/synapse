
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const payload = {
      eventType: "pageview",
      path: location.pathname,
      referrer: document.referrer || "",
      timestamp: new Date().toISOString(),
    };

    api
      .post("/analytics/event", payload)
      .then(() => {
        // you can console.log("tracked", payload) if you like
      })
      .catch((err) => {
        console.error("Analytics POST failed:", err.response?.data || err);
      });
  }, [location.pathname]); // re‑run on every route change

  return null;
}
