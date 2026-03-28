const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { env } = require("../config/env");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, username: user.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

const signupUser = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw createError(400, "Missing required fields");
  }

  const trimmedUsername = String(username).trim();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (trimmedUsername.length < 3) {
    throw createError(400, "Username must be at least 3 characters");
  }

  if (normalizedEmail.length < 5 || !normalizedEmail.includes("@")) {
    throw createError(400, "Please provide a valid email address");
  }

  if (String(password).length < 8) {
    throw createError(400, "Password must be at least 8 characters");
  }

  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: trimmedUsername }],
  });
  if (existing) {
    throw createError(409, "Email or username already in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: trimmedUsername,
    email: normalizedEmail,
    passwordHash,
  });

  const token = createToken(user);

  return {
    token,
    user: { id: user._id, username: user.username, email: user.email },
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw createError(400, "Missing email or password");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw createError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw createError(401, "Invalid credentials");
  }

  const token = createToken(user);

  return {
    token,
    user: { id: user._id, username: user.username, email: user.email },
  };
};

const getCurrentUser = (user) => ({ user });

module.exports = { signupUser, loginUser, getCurrentUser };
