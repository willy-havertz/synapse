import React, { useState, useContext, useEffect, useRef } from "react";
import NavBar from "./Navbar";
import ThemeContext from "../contexts/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faBars } from "@fortawesome/free-solid-svg-icons";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark } = useContext(ThemeContext);
  const mainRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sidebarOpen]);

  useEffect(() => {
    const el = mainRef.current;
    const onScroll = () => {
      setShowBackToTop(el.scrollTop > 300);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSidebar = () => setSidebarOpen(true);

  return (
    <div
      className={`fixed inset-0 flex ${
        dark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <NavBar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {!sidebarOpen && (
        <button
          onClick={openSidebar}
          className={`fixed top-4 left-4 z-40 p-2 rounded-md md:hidden ${
            dark
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-label="Open menu"
        >
          <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
        </button>
      )}

      <div className="flex-1 flex flex-col">
        <main
          ref={mainRef}
          tabIndex={-1}
          className={`flex-1 overflow-y-auto scroll-smooth p-8 scrollbar-thin
            ${
              dark
                ? "scrollbar-thumb-purple-600 scrollbar-track-gray-800 bg-gray-900"
                : "scrollbar-thumb-purple-600 scrollbar-track-gray-300 bg-white"
            }`}
        >
          {children}

          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition"
              aria-label="Back to top"
            >
              <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
