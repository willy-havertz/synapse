// src/components/MoreMenu.jsx
import React, { useEffect, useRef, useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";

export default function MoreMenu({ onClose }) {
  const menuRef = useRef(null);
  const { dark } = useContext(ThemeContext);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`absolute right-4 top-16 w-48 z-30 rounded shadow-md border ${
        dark
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-200 text-black"
      }`}
    >
      {[
        "View Profile",
        "Clear Chat",
        "Delete Conversation",
        "Block User",
        "Cancel",
      ].map((label, idx) => (
        <button
          key={idx}
          onClick={onClose}
          className={`w-full text-left px-4 py-2 ${
            dark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
