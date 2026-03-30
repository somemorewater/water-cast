const { createClient } = require("redis");
const { env } = require("./env");

const redisUrl = env.REDIS_URL || "redis://localhost:6379";

const redis = createClient({ url: redisUrl });

redis.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Redis client error", err);
});

redis
  .connect()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Redis connected");
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Redis connection error", err);
  });

module.exports = { redis };
