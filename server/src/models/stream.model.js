const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "other" },
    quality: { type: String, default: "1080p" },
    enableChat: { type: Boolean, default: true },
    status: { type: String, enum: ["live", "offline"], default: "offline" },
    streamKey: { type: String, required: true, unique: true },
    streamer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    viewerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stream", streamSchema);
