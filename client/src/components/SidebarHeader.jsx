// src/components/SidebarHeader.jsx
import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import ThemeContext from "../contexts/ThemeContext";

export default function SidebarHeader() {
  const { dark } = useContext(ThemeContext);

  return (
    <header
      className={`p-4 flex items-center justify-between border-b ${
        dark
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-200 text-black"
      }`}
    >
      <h2 className="text-lg font-bold text">Chats</h2>
      <div className="flex space-x-2">
        <button title="New Chat">
          <FontAwesomeIcon
            icon={faPlus}
            className={
              dark
                ? "text-gray-300 hover:text-white"
                : "text-gray-700 hover:text-black"
            }
          />
        </button>
        <button title="New Group">
          <FontAwesomeIcon
            icon={faUsers}
            className={
              dark
                ? "text-gray-300 hover:text-white"
                : "text-gray-700 hover:text-black"
            }
          />
        </button>
      </div>
    </header>
  );
}
