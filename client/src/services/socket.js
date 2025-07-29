import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const socket = io(SERVER_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false,
});

socket.on("connect", () =>
  console.log("✅ Client socket connected:", socket.id)
);
socket.on("connect_error", (err) =>
  console.error("🚨 Client connect_error:", err.message)
);
socket.on("disconnect", (reason) =>
  console.warn("⚠️ Client socket disconnected:", reason)
);

export function initializeSocket(token) {
  console.log("➡️ initializeSocket, token:", token);
  if (token) socket.auth = { token };
  socket.connect();
}

export function disconnectSocket() {
  console.log("⬅️ disconnectSocket");
  socket.disconnect();
}

export function subscribeToChatEvents({ onMessage, onTyping }) {
  console.log("📝 subscribeToChatEvents");
  if (onMessage) socket.on("message", onMessage);
  if (onTyping) socket.on("typing", onTyping);
  return () => {
    console.log("❌ unsubscribeFromChatEvents");
    if (onMessage) socket.off("message", onMessage);
    if (onTyping) socket.off("typing", onTyping);
  };
}

export function joinRoom(roomId, userId) {
  console.log(`🔑 joinRoom: room=${roomId}, user=${userId}`);
  socket.emit("join", { room: roomId, userId });
}

export function leaveRoom(roomId, userId) {
  console.log(`🔒 leaveRoom: room=${roomId}, user=${userId}`);
  socket.emit("leave", { room: roomId, userId });
}

export function sendMessage(msg) {
  console.log("📨 sendMessage:", msg);
  socket.emit("message", msg);
}

export function sendTyping(roomId, userId, isTyping = true) {
  console.log(
    `💬 sendTyping: room=${roomId}, user=${userId}, typing=${isTyping}`
  );
  socket.emit("typing", { room: roomId, userId, isTyping });
}
