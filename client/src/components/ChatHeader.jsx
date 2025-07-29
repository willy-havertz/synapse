import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faPhone,
  faVideo,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import ThemeContext from "../contexts/ThemeContext";

export default function ChatHeader({
  active,
  onToggleSidebar,
  onVoiceCall,
  onVideoCall,
  onMore,
}) {
  const { dark } = useContext(ThemeContext);

  return (
    <header
      className={`p-4 flex items-center justify-between border-b ${
        dark
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-200 text-black"
      }`}
    >
      <div className="flex items-center space-x-3">
        <FontAwesomeIcon
          icon={faBars}
          onClick={onToggleSidebar}
          className={`md:hidden cursor-pointer ${
            dark
              ? "text-gray-300 hover:text-purple-500"
              : "text-gray-600 hover:text-purple-600"
          }`}
        />
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

      <div
        className={`flex space-x-4 ${dark ? "text-gray-400" : "text-gray-600"}`}
      >
        <FontAwesomeIcon
          icon={faPhone}
          title="Voice call"
          onClick={() => onVoiceCall(active)}
          className="cursor-pointer hover:text-purple-500"
        />
        <FontAwesomeIcon
          icon={faVideo}
          title="Video call"
          onClick={() => onVideoCall(active)}
          className="cursor-pointer hover:text-purple-500"
        />
        <FontAwesomeIcon
          icon={faEllipsisV}
          title="More"
          onClick={onMore}
          className="cursor-pointer hover:text-purple-500"
        />
      </div>
    </header>
  );
}
