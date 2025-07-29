// src/server/callRouter.js
const { Server } = require("socket.io");

module.exports = function setupCallSignaling(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join-chat", ({ userId }) => {
      socket.join(userId);
    });

    socket.on("call:offer", ({ to, offer, from }) => {
      io.to(to).emit("call:offer", { from, offer });
    });

    socket.on("call:answer", ({ to, answer, from }) => {
      io.to(to).emit("call:answer", { from, answer });
    });

    socket.on("call:candidate", ({ to, candidate, from }) => {
      io.to(to).emit("call:candidate", { from, candidate });
    });

    socket.on("call:hangup", ({ to, from }) => {
      io.to(to).emit("call:hangup", { from });
    });
  });

  return io;
};
