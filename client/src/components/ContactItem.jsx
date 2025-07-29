// src/components/ContactItem.jsx
import React, { useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";

export default function ContactItem({ contact, active, onClick }) {
  const { dark } = useContext(ThemeContext);

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 mb-1 cursor-pointer rounded-lg transition-colors duration-200 ${
        active
          ? dark
            ? "bg-gray-700"
            : "bg-gray-200"
          : dark
          ? "hover:bg-gray-800"
          : "hover:bg-gray-100"
      }`}
    >
      <img
        src={contact.avatarUrl}
        alt={contact.name}
        className="w-10 h-10 rounded-full mr-3 object-cover"
      />
      <div className="flex-1 overflow-hidden">
        <p
          className={`font-semibold truncate ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          {contact.name}
        </p>
        <p
          className={`text-xs truncate ${
            dark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {contact.isGroup
            ? "Group Chat"
            : contact.online
            ? "Online"
            : "Offline"}
        </p>
      </div>
      {contact.unread > 0 && (
        <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
          {contact.unread}
        </span>
      )}
    </div>
  );
}
