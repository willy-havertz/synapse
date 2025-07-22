const { Server } = require("socket.io");
const http = require("http");

module.exports = function setupSocket(app, allowedOrigins) {
  // wrap express app
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: allowedOrigins } });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("join", ({ room, userId }) => {
      socket.join(room);
      socket.to(room).emit("user-online", { room, userId });
    });

    socket.on("typing", ({ room, userId, isTyping }) => {
      socket.to(room).emit("typing", { room, userId, isTyping });
    });

    socket.on("message", async ({ room, sender, text }) => {
      const Message = require("../models/Message");
      let msg = await Message.create({ conversation: room, sender, text });
      msg = await msg.populate("sender", "name avatarUrl");
      io.in(room).emit("message", msg);
    });

    socket.on("leave", ({ room, userId }) => {
      socket.leave(room);
      socket.to(room).emit("user-offline", { room, userId });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return server;
};
