// components/FilePicker.jsx
import React, { useRef } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

export default function FilePicker({ onFilesSelect }) {
  const inputRef = useRef();

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    const selectedFiles = files.slice(0, 10); // limit to 10
    const processed = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    onFilesSelect(processed);
    e.target.value = null; // reset input
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current.click()}
      className="p-2 text-gray-300 hover:text-white bg-gray-800 rounded-full"
      aria-label="Attach files"
    >
      <FontAwesomeIcon icon={faPaperclip} />
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        multiple
        accept="image/*,video/*,application/pdf"
        onChange={handleChange}
      />
    </button>
  );
}

FilePicker.propTypes = {
  onFilesSelect: PropTypes.func.isRequired,
};
