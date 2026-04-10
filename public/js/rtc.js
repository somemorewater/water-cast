window.WatercastRTC = (() => {
  const defaultConfig = {
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
    ],
  };

  const getConfig = async () => {
    try {
      const base = window.WatercastApi?.base || window.location.origin;
      const res = await fetch(`${base}/api/rtc-config`);
      if (!res.ok) return defaultConfig;
      const payload = await res.json();
      if (payload?.iceServers?.length) return payload;
      return defaultConfig;
    } catch (err) {
      return defaultConfig;
    }
  };

  return { getConfig };
})();
