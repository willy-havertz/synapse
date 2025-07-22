// src/contexts/ThemeProvider.jsx
import React, { useState, useEffect } from "react";
import ThemeContext from "./ThemeContext";

export default function ThemeProvider({ children }) {
  // read “theme” once on mount
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") return false;
    if (saved === "dark") return true;
    // no saved → default to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // whenever `dark` flips, write to <html> and to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const toggleTheme = () => setDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
