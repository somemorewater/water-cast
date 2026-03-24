const User = require("../models/user.model");

const normalizeHandle = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
};

const getSettings = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "username email displayName handle bio settings"
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName || user.username,
      handle: user.handle ? `@${user.handle}` : "",
      bio: user.bio || "",
    },
    settings: user.settings || {},
  });
};

const updateSettings = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const {
    displayName,
    handle,
    bio,
    settings = {},
  } = req.body || {};

  if (displayName !== undefined) {
    const trimmed = String(displayName).trim();
    user.displayName = trimmed.slice(0, 64);
  }

  if (handle !== undefined) {
    const normalized = normalizeHandle(handle).slice(0, 32);
    user.handle = normalized;
  }

  if (bio !== undefined) {
    user.bio = String(bio).trim().slice(0, 280);
  }

  if (!user.settings) {
    user.settings = {};
  }

  if (!user.settings.streamDefaults) {
    user.settings.streamDefaults = {};
  }

  if (!user.settings.notifications) {
    user.settings.notifications = {};
  }

  if (!user.settings.privacy) {
    user.settings.privacy = {};
  }

  const streamDefaults = settings.streamDefaults || {};
  user.settings.streamDefaults = {
    ...user.settings.streamDefaults,
    ...streamDefaults,
  };

  const notifications = settings.notifications || {};
  user.settings.notifications = {
    ...user.settings.notifications,
    ...notifications,
  };

  const privacy = settings.privacy || {};
  user.settings.privacy = {
    ...user.settings.privacy,
    ...privacy,
  };

  await user.save();

  return res.json({ message: "Settings updated" });
};

module.exports = { getSettings, updateSettings };
