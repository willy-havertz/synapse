const { Server } = require("socket.io");
const http = require("http");

module.exports = function setupSocket(app, allowedOrigins) {
  const server = http.createServer(app);
  const io = new Server(server, {
    path: "/socket.io",
    transports: ["websocket"],
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Server socket connected:", socket.id);

    socket.on("join", ({ room, userId }) => {
      console.log(`➡️ [${socket.id}] join room=${room} user=${userId}`);
      socket.join(room);
      socket.to(room).emit("user-online", { room, userId });
    });

    socket.on("typing", ({ room, userId, isTyping }) => {
      console.log(
        `💬 [${socket.id}] typing in room=${room} user=${userId} typing=${isTyping}`
      );
      socket.to(room).emit("typing", { room, userId, isTyping });
    });

    socket.on("message", async ({ room, sender, text }) => {
      const Message = require("../models/Message");
      let msg = await Message.create({ conversation: room, sender, text });
      msg = await msg.populate("sender", "name avatarUrl");
      io.in(room).emit("message", msg);
    });

    socket.on("leave", ({ room, userId }) => {
      console.log(`🔒 [${socket.id}] leave room=${room} user=${userId}`);
      socket.leave(room);
      socket.to(room).emit("user-offline", { room, userId });
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "🔴 Server socket disconnected:",
        socket.id,
        "reason:",
        reason
      );
    });
  });

  return server;
};
