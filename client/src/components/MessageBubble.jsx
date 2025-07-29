// src/components/MessageBubble.jsx
import React, { useContext } from "react";
//import { motion } from "framer-motion";
import ThemeContext from "../contexts/ThemeContext";

const bubbleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.1 } },
};

export default function MessageBubble({ msg, isMe }) {
  const { dark } = useContext(ThemeContext);

  const getBubbleStyle = () => {
    if (isMe) {
      return "bg-purple-600 text-white rounded-br-none";
    }

    return dark
      ? "bg-gray-800 text-white rounded-bl-none"
      : "bg-gray-200 text-black rounded-bl-none";
  };

  const timestampColor = dark ? "text-gray-400" : "text-gray-600";

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex my-2 ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[70%] px-4 py-2 break-words whitespace-pre-wrap rounded-2xl ${getBubbleStyle()}`}
      >
        {msg.text}

        <span
          className={`absolute ${timestampColor} text-[10px] bottom-1 right-2`}
        >
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}
