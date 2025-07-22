// src/socket.js
import { io } from "socket.io-client";

// pull in your server URL (e.g. http://localhost:5000) from your Vite env
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const socket = io(SERVER_URL, {
  path: "/socket.io", // default but explicit
  transports: ["websocket"], // skip polling
  autoConnect: false, // call socket.connect() when ready
  withCredentials: true, // send cookies if any
  auth: {
    token: localStorage.getItem("token"), // or from your AuthContext
  },
});

// elsewhere, once you have user & listeners set up:
socket.connect();
