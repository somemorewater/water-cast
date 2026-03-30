const { redis } = require("../config/redis");

const getKey = (streamId) => `stream:${streamId}:viewers`;

const addViewer = async (streamId, socketId) => {
  try {
    const key = getKey(streamId);
    await redis.sAdd(key, socketId);
    return await redis.sCard(key);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("addViewer error", err);
    return 0;
  }
};

const removeViewer = async (streamId, socketId) => {
  try {
    const key = getKey(streamId);
    await redis.sRem(key, socketId);
    return await redis.sCard(key);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("removeViewer error", err);
    return 0;
  }
};

const clearViewers = async (streamId) => {
  try {
    const key = getKey(streamId);
    await redis.del(key);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("clearViewers error", err);
  }
};

module.exports = { addViewer, removeViewer, clearViewers };
