const emitSocketError = (socket, err, code = "socket_error") => {
  const message = err?.message || "Socket error";
  socket.emit("socket-error", { message, code });
};

const wrapSocketHandler = (socket, handler) => async (...args) => {
  try {
    await handler(...args);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Socket handler error", err);
    emitSocketError(socket, err);
  }
};

const createRateLimiter = ({ windowMs, max }) => {
  const buckets = new Map();

  const allow = (key) => {
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || now - bucket.start >= windowMs) {
      buckets.set(key, { start: now, count: 1 });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= max;
  };

  const clear = (key) => {
    buckets.delete(key);
  };

  return { allow, clear };
};

module.exports = { emitSocketError, wrapSocketHandler, createRateLimiter };
