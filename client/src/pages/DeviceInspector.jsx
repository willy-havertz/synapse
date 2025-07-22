// src/pages/DeviceInspector.jsx
import React, { useState, useEffect } from "react";

// FontAwesome core styles
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktop,
  faBatteryHalf,
  faMobileAlt,
  faGlobe,
  faCookieBite,
  faMicrochip,
  faMemory,
  faNetworkWired,
  faClock,
  faMapMarkerAlt,
  faTachometerAlt,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";

import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DeviceInspector() {
  const [info, setInfo] = useState({
    ua: "",
    platform: "",
    language: "",
    screen: { width: 0, height: 0 },
    pixelRatio: 0,
    cores: 0,
    memory: null,
    online: navigator.onLine,
    cookies: navigator.cookieEnabled,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    battery: null,
    charging: null,
    dischargingTime: null,
    chargingTime: null,
    network: null,
    geo: null,
    paint: null,
  });

  const copyReport = () => {
    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
    toast.success("Device report copied!", {
      position: "top-right",
      autoClose: 3000,
      theme: "dark",
      transition: Slide,
    });
  };

  const formatTime = (seconds) => {
    if (seconds === Infinity || seconds == null) return "Unknown";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  useEffect(() => {
    // Basic info
    setInfo((i) => ({
      ...i,
      ua: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: { width: window.screen.width, height: window.screen.height },
      pixelRatio: window.devicePixelRatio,
      cores: navigator.hardwareConcurrency || 1,
      memory: navigator.deviceMemory || null,
    }));

    // Online/offline
    const updateOnline = () =>
      setInfo((i) => ({ ...i, online: navigator.onLine }));
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    // Battery Prediction
    if (navigator.getBattery) {
      navigator.getBattery().then((batt) => {
        const updateBatt = () =>
          setInfo((i) => ({
            ...i,
            battery: Math.round(batt.level * 100),
            charging: batt.charging,
            dischargingTime: batt.dischargingTime,
            chargingTime: batt.chargingTime,
          }));
        updateBatt();
        batt.addEventListener("levelchange", updateBatt);
        batt.addEventListener("chargingchange", updateBatt);
        batt.addEventListener("dischargingtimechange", updateBatt);
        batt.addEventListener("chargingtimechange", updateBatt);
      });
    }

    // Network
    const navConn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (navConn) {
      const updateNet = () =>
        setInfo((i) => ({
          ...i,
          network: {
            type: navConn.effectiveType,
            downlink: navConn.downlink,
            rtt: navConn.rtt,
          },
        }));
      updateNet();
      navConn.addEventListener("change", updateNet);
    }

    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setInfo((i) => ({
            ...i,
            geo: {
              lat: pos.coords.latitude.toFixed(4),
              lon: pos.coords.longitude.toFixed(4),
            },
          })),
        () => {}
      );
    }

    // Paint metrics
    const paints = performance.getEntriesByType("paint");
    if (paints.length) {
      const map = {};
      paints.forEach((e) => {
        map[e.name] = Math.round(e.startTime);
      });
      setInfo((i) => ({ ...i, paint: map }));
    }

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      if (navConn) navConn.removeEventListener("change", () => {});
    };
  }, []);

  const Card = ({ icon, label, value, wrap = false }) => (
    <div className="bg-[#1f1f1f] rounded-lg p-4 flex items-start space-x-4 shadow-md">
      <div className="p-3 rounded-md bg-black">
        <FontAwesomeIcon icon={icon} className="text-[#8312ed]" size="lg" />
      </div>
      <div className="flex-1">
        <p className="text-gray-400 text-sm">{label}</p>
        <p
          className={`text-white font-semibold ${
            wrap ? "whitespace-normal break-words" : "truncate"
          }`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-[#101010] text-white font-sans space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Device Inspector</h1>
        <button
          onClick={copyReport}
          className="flex items-center space-x-2 bg-[#2a2a2a] hover:bg-[#3b3b3b] px-4 py-2 rounded-md transition"
        >
          <FontAwesomeIcon icon={faCopy} className="text-white" />
          <span>Copy Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          icon={faDesktop}
          label="User Agent"
          value={info.ua}
          wrap
        />
        <Card
          icon={faMobileAlt}
          label="Platform"
          value={info.platform}
        />
        <Card
          icon={faGlobe}
          label="Language"
          value={info.language}
        />
        <Card
          icon={faNetworkWired}
          label="Network"
          value={
            info.network
              ? `${info.network.type} / ${info.network.downlink}Mbps / ${info.network.rtt}ms`
              : "Unknown"
          }
        />
        {info.geo && (
          <Card
            icon={faMapMarkerAlt}
            label="Location"
            value={`${info.geo.lat}, ${info.geo.lon}`}
          />
        )}
        <Card
          icon={faClock}
          label="Time Zone"
          value={info.timezone}
        />
        <Card
          icon={faTachometerAlt}
          label="Paint Metrics"
          value={
            info.paint
              ? `FP: ${info.paint["first-paint"]} ms, FCP: ${info.paint["first-contentful-paint"]} ms`
              : "N/A"
          }
        />
        <Card
          icon={faBatteryHalf}
          label="Battery Level"
          value={info.battery != null ? `${info.battery}%` : "Unknown"}
        />
        <Card
          icon={faBatteryHalf}
          label="Battery Prediction"
          value={
            info.charging
              ? `Full in ${formatTime(info.chargingTime)}`
              : `Empty in ${formatTime(info.dischargingTime)}`
          }
        />
        <Card
          icon={faCookieBite}
          label="Cookies Enabled"
          value={info.cookies ? "Yes" : "No"}
        />
        <Card
          icon={faDesktop}
          label="Screen Resolution"
          value={`${info.screen.width}×${info.screen.height}`}
        />
        <Card
          icon={faDesktop}
          label="Pixel Ratio"
          value={info.pixelRatio}
        />
        <Card
          icon={faMicrochip}
          label="CPU Cores"
          value={info.cores}
        />
        <Card
          icon={faMemory}
          label="Device Memory"
          value={info.memory ? `${info.memory} GB` : "Unknown"}
        />
        <Card
          icon={faNetworkWired}
          label="Online Status"
          value={info.online ? "Online" : "Offline"}
        />
      </div>

      <ToastContainer />
    </div>
  );
}
