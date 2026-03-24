const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { env } = require("../config/env");

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, username: user.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const trimmedUsername = String(username).trim();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (trimmedUsername.length < 3) {
    return res.status(400).json({ message: "Username must be at least 3 characters" });
  }

  if (normalizedEmail.length < 5 || !normalizedEmail.includes("@")) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: trimmedUsername }],
  });
  if (existing) {
    return res.status(409).json({ message: "Email or username already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: trimmedUsername,
    email: normalizedEmail,
    passwordHash,
  });

  const token = createToken(user);

  return res.status(201).json({
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = createToken(user);

  return res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
};

const me = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = { signup, login, me };
