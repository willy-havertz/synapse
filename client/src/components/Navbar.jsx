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
      className={`fixed inset-y-0 left-0 z-20 w-64 flex flex-col bg-[#1f1f1f] shadow-2xl border-r border-gray-700
         transform transition-transform duration-200 ease-in-out
         ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
         md:translate-x-0 md:static md:flex-shrink-0`}
      aria-label="Sidebar"
    >
      {/* Mobile header */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden border-b border-gray-700">
        <h2 className="flex items-center space-x-2 text-2xl font-bold text-purple-400">
          <FontAwesomeIcon icon={faComments} />
          <span>Synapse</span>
        </h2>
        <button
          onClick={onMobileClose}
          className="p-2 rounded hover:bg-gray-700 transition"
          aria-label="Close menu"
        >
          <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
        </button>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center h-16 px-6 border-b border-gray-700">
        <h2 className="flex items-center space-x-2 text-2xl font-bold text-purple-400">
          <FontAwesomeIcon icon={faComments} size="lg" />
          <span>Synapse</span>
        </h2>
      </div>

      {/* Welcome Card */}
      <div className="mx-4 my-4 bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
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
          <p className="text-sm font-medium text-white truncate">
            Welcome back,
          </p>
          <p className="text-xs text-gray-400 truncate">{user.name}</p>
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
                  ? "text-purple-400 bg-gray-800 border-l-4 border-purple-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              aria-current={active ? "page" : undefined}
              title={label}
            >
              <FontAwesomeIcon
                icon={icon}
                className={`w-5 h-5 ${
                  active ? "text-purple-400" : "text-gray-400"
                }`}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-700 mx-4" />

      {/* Bottom controls */}
      <div className="px-4 py-6 space-y-4">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-4 py-2 space-x-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          <FontAwesomeIcon
            icon={dark ? faSun : faMoon}
            className="text-purple-400"
          />
          <span className="text-gray-200 text-sm">
            {dark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            delete api.defaults.headers.common.Authorization;

            window.location.replace("/");
          }}
          className="flex items-center w-full px-4 py-2 space-x-3 bg-red-800 rounded-lg hover:bg-red-700 transition"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="text-red-400" />
          <span className="text-red-400 text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
