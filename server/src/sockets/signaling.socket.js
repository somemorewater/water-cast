const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Stream = require("../models/stream.model");
const { env } = require("../config/env");
const { addViewer, removeViewerBySocket, clearViewers } = require("../services/viewer.service");

const rooms = new Map();

const getRoom = (streamId) => {
  if (!rooms.has(streamId)) {
    rooms.set(streamId, { broadcasterId: null });
  }
  return rooms.get(streamId);
};

const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN.split(","),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) return next();
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      socket.user = payload;
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on("connection", (socket) => {
    socket.on("broadcaster-join", async ({ streamId }) => {
      try {
        if (!streamId) return;
        if (!socket.user?.id) return;

        const stream = await Stream.findById(streamId).select("streamer status");
        if (!stream || stream.status !== "live") {
          socket.emit("stream-ended");
          return;
        }
        if (stream.streamer.toString() !== socket.user.id) {
          socket.emit("stream-ended");
          return;
        }

        const room = getRoom(streamId);
        room.broadcasterId = socket.id;
        socket.join(streamId);

        io.to(streamId).emit("stream-status", { status: "live" });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("broadcaster-join error", err);
      }
    });

    socket.on("watcher-join", async ({ streamId, name }) => {
      try {
        if (!streamId) return;
        const stream = await Stream.findById(streamId).select("status");
        if (!stream || stream.status !== "live") {
          socket.emit("stream-ended");
          return;
        }
        const room = getRoom(streamId);

        const previous = await removeViewerBySocket(socket.id);
        if (previous.streamId && previous.streamId !== streamId) {
          io.to(previous.streamId).emit("viewer-count", { count: previous.count });
          const previousRoom = rooms.get(previous.streamId);
          if (previousRoom?.broadcasterId) {
            io.to(previousRoom.broadcasterId).emit("watcher-left", {
              watcherId: socket.id,
            });
          }
        }

        const userId = socket.user?.id || `guest:${socket.id}`;
        const count = await addViewer({ streamId, userId, socketId: socket.id });
        socket.join(streamId);

        if (room.broadcasterId) {
          io.to(room.broadcasterId).emit("watcher-joined", {
            watcherId: socket.id,
          });
        }

        io.to(streamId).emit("viewer-count", { count });

        if (name) {
          io.to(streamId).emit("chat-message", {
            user: "System",
            message: `${name} joined the chat.`,
            system: true,
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("watcher-join error", err);
      }
    });

    socket.on("offer", ({ watcherId, sdp }) => {
      io.to(watcherId).emit("offer", { broadcasterId: socket.id, sdp });
    });

    socket.on("answer", ({ broadcasterId, sdp }) => {
      io.to(broadcasterId).emit("answer", { watcherId: socket.id, sdp });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    socket.on("chat-message", ({ streamId, message, user }) => {
      if (!streamId || !message) return;
      io.to(streamId).emit("chat-message", {
        user: user || socket.user?.username || "Guest",
        message,
      });
    });

    socket.on("end-stream", async ({ streamId }) => {
      try {
        if (!streamId) return;
        const room = rooms.get(streamId);
        if (room && room.broadcasterId === socket.id) {
          io.to(streamId).emit("stream-ended");
          rooms.delete(streamId);
          await clearViewers(streamId);
          await Stream.updateOne(
            { _id: streamId },
            { status: "offline", endedAt: new Date(), viewerCount: 0 }
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("end-stream error", err);
      }
    });

    socket.on("disconnect", async () => {
      for (const [streamId, room] of rooms.entries()) {
        if (room.broadcasterId === socket.id) {
          io.to(streamId).emit("stream-ended");
          rooms.delete(streamId);
          await clearViewers(streamId);
          try {
            await Stream.updateOne(
              { _id: streamId },
              { status: "offline", endedAt: new Date(), viewerCount: 0 }
            );
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error("disconnect update error", err);
          }
          continue;
        }
      }

      const removed = await removeViewerBySocket(socket.id);
      if (removed.streamId) {
        io.to(removed.streamId).emit("viewer-count", { count: removed.count });
        const room = rooms.get(removed.streamId);
        if (room?.broadcasterId) {
          io.to(room.broadcasterId).emit("watcher-left", {
            watcherId: socket.id,
          });
        }
      }
    });
  });
};

module.exports = { initSockets };
