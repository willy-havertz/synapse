// components/EmojiPicker.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile } from "@fortawesome/free-solid-svg-icons";
import Picker from "emoji-picker-react";
import PropTypes from "prop-types";
import ThemeContext from "../contexts/ThemeContext";

export default function EmojiPicker({ onSelect }) {
  const [visible, setVisible] = useState(false);
  const pickerRef = useRef(null);
  const { dark } = useContext(ThemeContext); // Access theme mode

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData) => {
    onSelect(emojiData.emoji);
    setVisible(false);
  };

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className={`p-2 rounded-full ${
          dark
            ? "text-gray-300 hover:text-white bg-gray-800"
            : "text-gray-700 hover:text-black bg-gray-200"
        }`}
        aria-label="Toggle emoji picker"
      >
        <FontAwesomeIcon icon={faSmile} className="w-5 h-5" />
      </button>

      {visible && (
        <div className="absolute bottom-full left-0 mb-2 z-50 rounded-lg shadow-lg">
          <Picker
            onEmojiClick={handleEmojiClick}
            theme={dark ? "dark" : "light"}
            skinTonesDisabled={false}
            searchDisabled={false}
            height={350}
            width={300}
          />
        </div>
      )}
    </div>
  );
}

EmojiPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
};
