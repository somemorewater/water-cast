const Stream = require("../models/stream.model");
const {
  createStreamService,
  endStreamService,
} = require("../services/stream.service");

const createStream = async (req, res) => {
  try {
    const result = await createStreamService({ userId: req.user.id, ...req.body });
    return res.status(201).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || "Failed to create stream" });
  }
};

const endStream = async (req, res) => {
  try {
    const result = await endStreamService({ id: req.params.id, userId: req.user.id });
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || "Failed to end stream" });
  }
};

const listLiveStreams = async (req, res) => {
  const streams = await Stream.find({ status: "live" })
    .populate("streamer", "username")
    .sort({ startedAt: -1 });

  return res.json({
    streams: streams.map((stream) => ({
      id: stream._id,
      title: stream.title,
      description: stream.description,
      category: stream.category,
      quality: stream.quality,
      enableChat: stream.enableChat,
      status: stream.status,
      viewerCount: stream.viewerCount,
      startedAt: stream.startedAt,
      streamer: stream.streamer
        ? { _id: stream.streamer._id, username: stream.streamer.username }
        : null,
    })),
  });
};

const getStream = async (req, res) => {
  const { id } = req.params;
  const stream = await Stream.findById(id).populate("streamer", "username");

  if (!stream) {
    return res.status(404).json({ message: "Stream not found" });
  }

  return res.json({
    stream: {
      id: stream._id,
      title: stream.title,
      description: stream.description,
      category: stream.category,
      quality: stream.quality,
      enableChat: stream.enableChat,
      status: stream.status,
      viewerCount: stream.viewerCount,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      streamer: stream.streamer
        ? { _id: stream.streamer._id, username: stream.streamer.username }
        : null,
    },
  });
};

module.exports = { createStream, endStream, listLiveStreams, getStream };
