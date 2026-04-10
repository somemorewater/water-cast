const express = require("express");
const cors = require("cors");
const path = require("path");
const { env } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const streamRoutes = require("./routes/stream.routes");
const settingsRoutes = require("./routes/settings.routes");
const userRoutes = require("./routes/user.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const { buildRtcConfig } = require("./utils/rtc-config");

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN.split(","),
    credentials: true,
  })
);
app.use(express.json());

const publicPath = path.join(__dirname, "../../public");
app.use(express.static(publicPath));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/rtc-config", (req, res) => {
  res.json(buildRtcConfig());
});

app.use("/api/auth", authRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
