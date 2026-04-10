const http = require("http");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const app = require("./src/app");
const { initSockets } = require("./src/sockets/signaling.socket");
const { connectDb } = require("./src/config/db");
const { env } = require("./src/config/env");

const server = http.createServer(app);

const startServer = async () => {
  try {
    const pubClient = createClient({ url: env.REDIS_URL });
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();

    initSockets(server, { adapter: createAdapter(pubClient, subClient) });

    await connectDb();
    server.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`WaterCast server running on port ${env.PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

startServer();
