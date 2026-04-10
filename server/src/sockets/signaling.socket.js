const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Stream = require("../models/stream.model");
const { env } = require("../config/env");
const { addViewer, removeViewerBySocket, clearViewers, touchViewer } = require("../services/viewer.service");
const { wrapSocketHandler, emitSocketError, createRateLimiter } = require("../utils/socket-utils");

const rooms = new Map();
const chatLimiter = createRateLimiter({ windowMs: 5000, max: 5 });

const getRoom = (streamId) => {
  if (!rooms.has(streamId)) {
    rooms.set(streamId, { broadcasterId: null });
  }
  return rooms.get(streamId);
};

const initSockets = (httpServer, { adapter } = {}) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN.split(","),
      credentials: true,
    },
  });

  if (adapter) {
    io.adapter(adapter);
  }

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
    let viewerHeartbeat = null;

    const startViewerHeartbeat = () => {
      if (viewerHeartbeat) return;
      viewerHeartbeat = setInterval(() => {
        touchViewer(socket.id);
      }, 30000);
    };

    const stopViewerHeartbeat = () => {
      if (viewerHeartbeat) {
        clearInterval(viewerHeartbeat);
        viewerHeartbeat = null;
      }
    };

    socket.on(
      "broadcaster-join",
      wrapSocketHandler(socket, async ({ streamId }) => {
        if (!streamId) return;
        if (!socket.user?.id) {
          emitSocketError(socket, new Error("Authentication required"), "auth_required");
          return;
        }

        const stream = await Stream.findById(streamId).select("streamer status");
        if (!stream || stream.status !== "live") {
          socket.emit("stream-ended");
          return;
        }
        if (stream.streamer.toString() !== socket.user.id) {
          emitSocketError(socket, new Error("Unauthorized broadcaster"), "unauthorized");
          socket.emit("stream-ended");
          return;
        }

        const room = getRoom(streamId);
        room.broadcasterId = socket.id;
        socket.join(streamId);

        io.to(streamId).emit("stream-status", { status: "live" });
      })
    );

    socket.on(
      "watcher-join",
      wrapSocketHandler(socket, async ({ streamId, name }) => {
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
        startViewerHeartbeat();

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
      })
    );

    socket.on(
      "offer",
      wrapSocketHandler(socket, async ({ watcherId, sdp }) => {
        io.to(watcherId).emit("offer", { broadcasterId: socket.id, sdp });
      })
    );

    socket.on(
      "answer",
      wrapSocketHandler(socket, async ({ broadcasterId, sdp }) => {
        io.to(broadcasterId).emit("answer", { watcherId: socket.id, sdp });
      })
    );

    socket.on(
      "ice-candidate",
      wrapSocketHandler(socket, async ({ to, candidate }) => {
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
      })
    );

    socket.on(
      "chat-message",
      wrapSocketHandler(socket, async ({ streamId, message, user }) => {
        if (!streamId || !message) return;
        if (!chatLimiter.allow(socket.id)) {
          emitSocketError(socket, new Error("Rate limit exceeded"), "rate_limit");
          return;
        }
        io.to(streamId).emit("chat-message", {
          user: user || socket.user?.username || "Guest",
          message,
        });
      })
    );

    socket.on(
      "end-stream",
      wrapSocketHandler(socket, async ({ streamId }) => {
        if (!streamId) return;
        const room = rooms.get(streamId);
        if (room && room.broadcasterId === socket.id) {
          io.to(streamId).emit("stream-ended");
          io.to(streamId).emit("stream-status", { status: "offline" });
          rooms.delete(streamId);
          await clearViewers(streamId);
          await Stream.updateOne(
            { _id: streamId },
            { status: "offline", endedAt: new Date(), viewerCount: 0 }
          );
        }
      })
    );

    socket.on(
      "disconnect",
      wrapSocketHandler(socket, async () => {
        stopViewerHeartbeat();
        chatLimiter.clear(socket.id);

        for (const [streamId, room] of rooms.entries()) {
          if (room.broadcasterId === socket.id) {
            io.to(streamId).emit("stream-ended");
            io.to(streamId).emit("stream-status", { status: "offline" });
            rooms.delete(streamId);
            await clearViewers(streamId);
            await Stream.updateOne(
              { _id: streamId },
              { status: "offline", endedAt: new Date(), viewerCount: 0 }
            );
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
      })
    );
  });
};

module.exports = { initSockets };
