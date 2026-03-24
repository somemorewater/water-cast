const User = require("../models/user.model");

const getUserProfile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("username displayName handle bio followers");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const followerCount = user.followers?.length || 0;
  const isFollowing = req.user
    ? user.followers.some((followerId) => followerId.toString() === req.user.id)
    : false;

  return res.json({
    user: {
      id: user._id,
      username: user.username,
      displayName: user.displayName || user.username,
      handle: user.handle ? `@${user.handle}` : "",
      bio: user.bio || "",
      followerCount,
      isFollowing,
    },
  });
};

const toggleFollow = async (req, res) => {
  const { id } = req.params;

  if (req.user.id === id) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  const user = await User.findById(id).select("followers");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const existingIndex = user.followers.findIndex(
    (followerId) => followerId.toString() === req.user.id
  );

  let following = false;
  if (existingIndex === -1) {
    user.followers.push(req.user.id);
    following = true;
  } else {
    user.followers.splice(existingIndex, 1);
    following = false;
  }

  await user.save();

  return res.json({
    following,
    followerCount: user.followers.length,
  });
};

module.exports = { getUserProfile, toggleFollow };
