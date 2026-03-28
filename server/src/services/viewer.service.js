const viewers = new Map(); // streamId -> Set(socketIds)

const addViewer = (streamId, socketId) => {
  if (!viewers.has(streamId)) {
    viewers.set(streamId, new Set());
  }
  viewers.get(streamId).add(socketId);
  return viewers.get(streamId).size;
};

const removeViewer = (streamId, socketId) => {
  if (!viewers.has(streamId)) return 0;
  viewers.get(streamId).delete(socketId);
  return viewers.get(streamId).size;
};

const clearViewers = (streamId) => {
  viewers.delete(streamId);
};

module.exports = { addViewer, removeViewer, clearViewers };
