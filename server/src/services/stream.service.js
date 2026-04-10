const { nanoid } = require("nanoid");
const Stream = require("../models/stream.model");
const { clearViewers } = require("./viewer.service");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const createStreamService = async ({
  userId,
  title,
  description,
  category,
  quality,
  enableChat,
}) => {
  if (!title) {
    throw createError(400, "Stream title is required");
  }

  const trimmedTitle = String(title).trim();
  if (trimmedTitle.length < 3) {
    throw createError(400, "Stream title must be at least 3 characters");
  }

  const previousStreams = await Stream.find({ streamer: userId, status: "live" }).select("_id");
  if (previousStreams.length) {
    await Stream.updateMany(
      { streamer: userId, status: "live" },
      { status: "offline", endedAt: new Date(), viewerCount: 0 }
    );
    await Promise.all(previousStreams.map((stream) => clearViewers(stream._id.toString())));
  }

  const streamKey = `sk_live_${nanoid(16)}`;

  const stream = await Stream.create({
    title: trimmedTitle,
    description: description ? String(description).trim() : "",
    category: category ? String(category).trim() : "other",
    quality: quality ? String(quality).trim() : "1080p",
    enableChat: Boolean(enableChat),
    status: "live",
    streamKey,
    streamer: userId,
    startedAt: new Date(),
  });

  return {
    stream: {
      id: stream._id,
      title: stream.title,
      description: stream.description,
      category: stream.category,
      quality: stream.quality,
      enableChat: stream.enableChat,
      status: stream.status,
      streamer: stream.streamer,
      startedAt: stream.startedAt,
    },
  };
};

const endStreamService = async ({ id, userId }) => {
  const stream = await Stream.findOne({ _id: id, streamer: userId });
  if (!stream) {
    throw createError(404, "Stream not found");
  }

  stream.status = "offline";
  stream.endedAt = new Date();
  stream.viewerCount = 0;
  await stream.save();
  await clearViewers(stream._id.toString());

  return { message: "Stream ended" };
};

module.exports = { createStreamService, endStreamService };
