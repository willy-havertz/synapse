import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import ThemeContext from "../contexts/ThemeContext";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faHome,
  faComments,
  faCamera,
  faCloudSun,
  faMobileAlt,
  faRocket,
  faChartBar,
  faSignOutAlt,
  faMoon,
  faSun,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function NavBar({ mobileOpen, onMobileClose }) {
  const { user } = useContext(AuthContext);
  const { dark, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const items = [
    { to: "/home", icon: faHome, label: "Home" },
    { to: "/chat", icon: faComments, label: "Chat" },
    { to: "/photo-analyzer", icon: faCamera, label: "Photo Analyzer" },
    { to: "/weather", icon: faCloudSun, label: "Weather" },
    { to: "/device-inspector", icon: faMobileAlt, label: "Device Inspector" },
    { to: "/tech-trends", icon: faRocket, label: "Tech Trends" },
    { to: "/analytics", icon: faChartBar, label: "Analytics" },
    { to: "/settings", icon: faCog, label: "Settings" },
  ];

  const handleLinkClick = (to) => {
    if (mobileOpen) onMobileClose();
    navigate(to);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 w-64 flex flex-col shadow-2xl border-r transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:flex-shrink-0
        ${
          dark
            ? "bg-gray-900 border-gray-700 text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      aria-label="Sidebar"
    >
      {/* Mobile header */}
      <div
        className={`flex items-center justify-between px-4 py-3 md:hidden border-b ${
          dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"
        }`}
      >
        <h2 className="flex items-center space-x-2 text-2xl font-bold text-purple-400">
          <FontAwesomeIcon icon={faComments} />
          <span>Synapse</span>
        </h2>
        <button
          onClick={onMobileClose}
          className={`p-2 rounded transition ${
            dark ? "hover:bg-gray-700" : "hover:bg-gray-200"
          }`}
          aria-label="Close menu"
        >
          <FontAwesomeIcon
            icon={faTimes}
            className={dark ? "text-gray-300" : "text-gray-600"}
          />
        </button>
      </div>

      {/* Desktop header */}
      <div
        className={`hidden md:flex items-center h-16 px-6 border-b ${
          dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
        }`}
      >
        <h2 className="flex items-center space-x-2 text-2xl font-bold text-purple-400">
          <FontAwesomeIcon icon={faComments} size="lg" />
          <span>Synapse</span>
        </h2>
      </div>

      {/* Welcome Card */}
      <div
        className={`mx-4 my-4 rounded-lg p-4 flex items-center space-x-3 ${
          dark ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.name}'s avatar`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <p
            className={`${
              dark ? "text-gray-100" : "text-gray-800"
            } text-sm font-medium truncate`}
          >
            Welcome back,
          </p>
          <p
            className={`${
              dark ? "text-gray-400" : "text-gray-600"
            } text-xs truncate`}
          >
            {user.name}
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav
        className="flex-1 overflow-y-auto hide-scrollbar px-2 space-y-1"
        aria-label="Main navigation"
      >
        {items.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <button
              key={to}
              onClick={() => handleLinkClick(to)}
              className={`flex items-center w-full px-5 py-3 space-x-3 text-sm font-medium text-left transition rounded-lg ${
                active
                  ? dark
                    ? "text-purple-400 bg-gray-800 border-l-4 border-purple-400"
                    : "text-purple-600 bg-gray-200 border-l-4 border-purple-600"
                  : dark
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              aria-current={active ? "page" : undefined}
              title={label}
            >
              <FontAwesomeIcon
                icon={icon}
                className={`w-5 h-5 ${
                  active
                    ? dark
                      ? "text-purple-400"
                      : "text-purple-600"
                    : dark
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div
        className={`border-t ${
          dark ? "border-gray-700" : "border-gray-200"
        } mx-4`}
      />

      {/* Bottom controls */}
      <div className="px-4 py-6 space-y-4">
        <button
          onClick={toggleTheme}
          className={`flex items-center w-full px-4 py-2 space-x-3 rounded-lg transition ${
            dark
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <FontAwesomeIcon
            icon={dark ? faSun : faMoon}
            className="text-purple-400"
          />
          <span
            className={dark ? "text-gray-200 text-sm" : "text-gray-800 text-sm"}
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            delete api.defaults.headers.common.Authorization;
            window.location.replace("/");
          }}
          className="flex items-center w-full px-4 py-2 space-x-3 rounded-lg transition bg-red-800 hover:bg-red-700"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="text-red-400" />
          <span className="text-red-400 text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
