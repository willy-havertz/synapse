import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "./EmojiPicker";
import FilePicker from "./FilePicker";
import ThemeContext from "../contexts/ThemeContext";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const { dark } = useContext(ThemeContext);

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;

    const messageData = {
      text,
      files: attachments.map((f) => f.file),
    };

    onSend(messageData);
    setText("");
    setAttachments([]);
  };

  const removeAttachment = (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
  };

  const renderPreview = () =>
    attachments.map((att, idx) => {
      const { file, url } = att;
      const key = `${file.name}-${idx}`;
      return (
        <div
          key={key}
          className={`relative inline-block mr-2 mb-2 border rounded-lg ${
            dark ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {file.type.startsWith("image/") ? (
            <img
              src={url}
              alt="preview"
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : file.type.startsWith("video/") ? (
            <video
              controls
              src={url}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : (
            <div
              className={`w-24 h-24 flex items-center justify-center text-xs p-2 rounded-lg ${
                dark ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              📄 {file.name.slice(0, 10)}...
            </div>
          )}

          <button
            onClick={() => removeAttachment(idx)}
            className="absolute top-0 right-0 bg-black bg-opacity-70 hover:bg-opacity-100 text-white rounded-full p-1"
          >
            <FontAwesomeIcon icon={faTimesCircle} />
          </button>
        </div>
      );
    });

  return (
    <div
      className={`p-4 border-t ${
        dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* File previews */}
      <div className="flex flex-wrap">{renderPreview()}</div>

      {/* Input area */}
      <footer className="flex items-center mt-2">
        <div className="relative">
          <EmojiPicker onSelect={(emoji) => setText((t) => t + emoji)} />
        </div>

        <FilePicker
          onFilesSelect={(files) =>
            setAttachments((prev) => [...prev, ...files].slice(0, 10))
          }
        />

        <input
          type="text"
          placeholder="Type a message"
          className={`flex-1 px-4 py-2 mx-3 rounded-full outline-none placeholder-gray-400 ${
            dark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
          }`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() && attachments.length === 0}
          className={`p-3 rounded-full ${
            text.trim() || attachments.length > 0
              ? "bg-purple-600 hover:bg-purple-500"
              : dark
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </footer>
    </div>
  );
}
