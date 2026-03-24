const { nanoid } = require("nanoid");
const Stream = require("../models/stream.model");

const createStream = async (req, res) => {
  const { title, description, category, quality, enableChat } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Stream title is required" });
  }

  const trimmedTitle = String(title).trim();
  if (trimmedTitle.length < 3) {
    return res.status(400).json({ message: "Stream title must be at least 3 characters" });
  }

  await Stream.updateMany(
    { streamer: req.user.id, status: "live" },
    { status: "offline", endedAt: new Date(), viewerCount: 0 }
  );

  const streamKey = `sk_live_${nanoid(16)}`;

  const stream = await Stream.create({
    title: trimmedTitle,
    description: description ? String(description).trim() : "",
    category: category ? String(category).trim() : "other",
    quality: quality ? String(quality).trim() : "1080p",
    enableChat: Boolean(enableChat),
    status: "live",
    streamKey,
    streamer: req.user.id,
    startedAt: new Date(),
  });

  return res.status(201).json({
    stream: {
      id: stream._id,
      title: stream.title,
      description: stream.description,
      category: stream.category,
      quality: stream.quality,
      enableChat: stream.enableChat,
      status: stream.status,
      streamKey: stream.streamKey,
      streamer: stream.streamer,
      startedAt: stream.startedAt,
    },
  });
};

const endStream = async (req, res) => {
  const { id } = req.params;

  const stream = await Stream.findOne({ _id: id, streamer: req.user.id });
  if (!stream) {
    return res.status(404).json({ message: "Stream not found" });
  }

  stream.status = "offline";
  stream.endedAt = new Date();
  stream.viewerCount = 0;
  await stream.save();

  return res.json({ message: "Stream ended" });
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
