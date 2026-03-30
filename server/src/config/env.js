const dotenv = require("dotenv");

dotenv.config({ path: process.env.DOTENV_PATH || ".env" });

const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/watercast",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret_change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
};

module.exports = { env };
