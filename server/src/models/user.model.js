const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, default: "" },
    handle: { type: String, default: "" },
    bio: { type: String, default: "" },
    settings: {
      streamDefaults: {
        category: { type: String, default: "Tech & Coding" },
        visibility: { type: String, default: "Public" },
        quality: { type: String, default: "1080p" },
        autoRecord: { type: Boolean, default: false },
      },
      notifications: {
        viewerMilestones: { type: Boolean, default: true },
        mentionsHighlights: { type: Boolean, default: true },
        systemHealth: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false },
      },
      privacy: {
        followerOnlyChat: { type: Boolean, default: false },
        requireVerifiedEmail: { type: Boolean, default: true },
        autoModeration: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
