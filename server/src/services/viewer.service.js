const { redis } = require("../config/redis");

const getStreamUsersKey = (streamId) => `stream:${streamId}:users`;
const getUserSocketsKey = (streamId, userId) => `stream:${streamId}:user:${userId}:sockets`;
const getSocketMetaKey = (socketId) => `socket:${socketId}:viewer`;

const addViewer = async ({ streamId, userId, socketId }) => {
  try {
    const streamUsersKey = getStreamUsersKey(streamId);
    const userSocketsKey = getUserSocketsKey(streamId, userId);
    const socketMetaKey = getSocketMetaKey(socketId);

    const script = `
      redis.call("SADD", KEYS[2], ARGV[2])
      redis.call("SADD", KEYS[1], ARGV[1])
      redis.call("HSET", KEYS[3], "streamId", ARGV[3], "userId", ARGV[1])
      return redis.call("SCARD", KEYS[1])
    `;

    const count = await redis.eval(script, {
      keys: [streamUsersKey, userSocketsKey, socketMetaKey],
      arguments: [userId, socketId, streamId],
    });

    return Number(count) || 0;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("addViewer error", err);
    return 0;
  }
};

const removeViewerBySocket = async (socketId) => {
  try {
    const socketMetaKey = getSocketMetaKey(socketId);

    const script = `
      local streamId = redis.call("HGET", KEYS[1], "streamId")
      local userId = redis.call("HGET", KEYS[1], "userId")
      if not streamId or not userId then
        return {0, "", "", 0}
      end
      local userSocketsKey = "stream:" .. streamId .. ":user:" .. userId .. ":sockets"
      local streamUsersKey = "stream:" .. streamId .. ":users"
      redis.call("SREM", userSocketsKey, ARGV[1])
      redis.call("DEL", KEYS[1])
      local remaining = redis.call("SCARD", userSocketsKey)
      if remaining == 0 then
        redis.call("SREM", streamUsersKey, userId)
        redis.call("DEL", userSocketsKey)
      end
      local count = redis.call("SCARD", streamUsersKey)
      return {count, streamId, userId, remaining}
    `;

    const [count, streamId, userId, remaining] = await redis.eval(script, {
      keys: [socketMetaKey],
      arguments: [socketId],
    });

    return {
      count: Number(count) || 0,
      streamId: streamId || null,
      userId: userId || null,
      remainingSockets: Number(remaining) || 0,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("removeViewerBySocket error", err);
    return { count: 0, streamId: null, userId: null, remainingSockets: 0 };
  }
};

const clearViewers = async (streamId) => {
  try {
    const streamUsersKey = getStreamUsersKey(streamId);
    const userIds = await redis.sMembers(streamUsersKey);
    const pipeline = redis.multi();

    for (const userId of userIds) {
      pipeline.del(getUserSocketsKey(streamId, userId));
    }

    pipeline.del(streamUsersKey);
    await pipeline.exec();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("clearViewers error", err);
  }
};

module.exports = { addViewer, removeViewerBySocket, clearViewers };
