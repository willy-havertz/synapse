// src/components/ChatHeader.jsx
import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faPhone,
  faVideo,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import ThemeContext from "../contexts/ThemeContext";
import MoreMenu from "./MoreMenu";

export default function ChatHeader({
  active,
  onToggleSidebar,
  onVoiceCall,
  onVideoCall,
  showMoreMenu,
  onMore,
  onCloseMore,
}) {
  const { dark } = useContext(ThemeContext);

  return (
    <header
      className={`relative p-4 flex items-center justify-between border-b ${
        dark
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-200 text-black"
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Mobile menu toggle */}
        <FontAwesomeIcon
          icon={faBars}
          onClick={onToggleSidebar}
          className={`md:hidden cursor-pointer ${
            dark
              ? "text-gray-300 hover:text-purple-500"
              : "text-gray-600 hover:text-purple-600"
          }`}
        />

        {/* Active chat info */}
        {active && (
          <>
            <img
              src={active.avatarUrl}
              alt={active.name}
              className="w-10 h-10 rounded-full"
            />
            <p className="font-semibold">{active.name}</p>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Call controls */}
        <FontAwesomeIcon
          icon={faPhone}
          title="Voice call"
          onClick={onVoiceCall}
          className={`cursor-pointer hover:text-purple-500 ${
            dark ? "text-gray-300" : "text-gray-600"
          }`}
        />
        <FontAwesomeIcon
          icon={faVideo}
          title="Video call"
          onClick={onVideoCall}
          className={`cursor-pointer hover:text-purple-500 ${
            dark ? "text-gray-300" : "text-gray-600"
          }`}
        />

        {/* More menu */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faEllipsisV}
            title="More"
            onClick={onMore}
            className={`cursor-pointer hover:text-purple-500 ${
              dark ? "text-gray-300" : "text-gray-600"
            }`}
          />
          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-2 z-20">
              <MoreMenu onClose={onCloseMore} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
