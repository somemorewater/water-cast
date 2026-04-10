const { env } = require("../config/env");

const splitUrls = (value) =>
  String(value || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

const buildRtcConfig = () => {
  const iceServers = [];

  const stunUrls = splitUrls(env.RTC_STUN_URLS);
  if (stunUrls.length) {
    iceServers.push({ urls: stunUrls });
  }

  const turnUrls = splitUrls(env.RTC_TURN_URLS);
  if (turnUrls.length) {
    iceServers.push({
      urls: turnUrls,
      username: env.RTC_TURN_USERNAME || undefined,
      credential: env.RTC_TURN_CREDENTIAL || undefined,
    });
  }

  return { iceServers };
};

module.exports = { buildRtcConfig };
