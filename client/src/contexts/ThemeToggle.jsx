// src/components/ThemeToggle.jsx
import React, { useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

export default function ThemeToggle() {
  const { dark, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
      aria-label="Toggle theme"
    >
      <FontAwesomeIcon
        icon={dark ? faSun : faMoon}
        className="text-xl text-purple-400"
      />
    </button>
  );
}
