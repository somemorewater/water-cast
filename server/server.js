const http = require("http");
const app = require("./src/app");
const { initSockets } = require("./src/sockets/signaling.socket");
const { connectDb } = require("./src/config/db");
const { env } = require("./src/config/env");

const server = http.createServer(app);
initSockets(server);

connectDb()
  .then(() => {
    server.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`WaterCast server running on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to DB", err);
    process.exit(1);
  });
