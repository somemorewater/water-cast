const nameEl = document.getElementById("dashboardName");
const subtextEl = document.getElementById("dashboardSubtext");
const liveStreamsCountEl = document.getElementById("liveStreamsCount");
const totalViewersCountEl = document.getElementById("totalViewersCount");
const yourLiveCountEl = document.getElementById("yourLiveCount");
const recentStreamsListEl = document.getElementById("recentStreamsList");
const liveActivityListEl = document.getElementById("liveActivityList");
const yourLiveStatusEl = document.getElementById("yourLiveStatus");
const liveAlertsEl = document.getElementById("liveAlerts");
const lastUpdatedEl = document.getElementById("lastUpdated");

let currentUser = null;

const formatDuration = (start) => {
  if (!start) return "";
  const diffMs = Date.now() - new Date(start).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m live`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours}h ${rem}m live`;
};

const setListMessage = (el, message) => {
  if (!el) return;
  el.innerHTML = "";
  const msg = document.createElement("div");
  msg.className = "text-sm text-gray-500";
  msg.textContent = message;
  el.appendChild(msg);
};

const renderStreams = (streams) => {
  if (!recentStreamsListEl) return;
  recentStreamsListEl.innerHTML = "";

  if (!streams.length) {
    setListMessage(recentStreamsListEl, "No live streams yet.");
    return;
  }

  streams.forEach((stream) => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition";

    const left = document.createElement("div");
    left.className = "flex items-center gap-4";

    const badge = document.createElement("div");
    badge.className =
      "h-16 w-24 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold";
    badge.textContent = "LIVE";

    const textWrap = document.createElement("div");
    const title = document.createElement("p");
    title.className = "font-semibold";
    title.textContent = stream.title || "Untitled Stream";

    const meta = document.createElement("p");
    meta.className = "text-sm text-gray-500";
    const viewers = Number(stream.viewerCount || 0).toLocaleString();
    meta.textContent = `${formatDuration(stream.startedAt)} • ${viewers} viewers`;

    textWrap.appendChild(title);
    textWrap.appendChild(meta);

    left.appendChild(badge);
    left.appendChild(textWrap);

    const right = document.createElement("div");
    right.className = "flex items-center gap-3";

    const status = document.createElement("span");
    status.className =
      "text-xs font-semibold uppercase px-3 py-1 rounded-full bg-green-50 text-green-600";
    status.textContent = "Live";

    const watchLink = document.createElement("a");
    watchLink.className =
      "px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white";
    watchLink.href = `./watch.html?streamId=${stream.id}`;
    watchLink.textContent = "Watch";

    right.appendChild(status);
    right.appendChild(watchLink);

    wrapper.appendChild(left);
    wrapper.appendChild(right);

    recentStreamsListEl.appendChild(wrapper);
  });
};

const updateStats = (streams) => {
  const totalViewers = streams.reduce(
    (sum, stream) => sum + Number(stream.viewerCount || 0),
    0
  );

  const yourStreams = currentUser
    ? streams.filter((stream) => stream.streamer?._id === currentUser.id)
    : [];

  if (liveStreamsCountEl) liveStreamsCountEl.textContent = streams.length.toString();
  if (totalViewersCountEl) totalViewersCountEl.textContent = totalViewers.toLocaleString();
  if (yourLiveCountEl) yourLiveCountEl.textContent = yourStreams.length.toString();

  if (yourLiveStatusEl) {
    yourLiveStatusEl.innerHTML = "";
    if (yourStreams.length === 0) {
      setListMessage(yourLiveStatusEl, "Not live right now.");
    } else {
      yourStreams.forEach((stream) => {
        const row = document.createElement("div");
        row.textContent = `${stream.title || "Untitled Stream"} • ${formatDuration(stream.startedAt)}`;
        yourLiveStatusEl.appendChild(row);
      });
    }
  }
};

const updateActivity = (streams) => {
  if (!liveActivityListEl) return;
  liveActivityListEl.innerHTML = "";

  if (!streams.length) {
    setListMessage(liveActivityListEl, "No live activity yet.");
    return;
  }

  streams.slice(0, 4).forEach((stream) => {
    const row = document.createElement("div");
    const viewers = Number(stream.viewerCount || 0).toLocaleString();
    row.textContent = `${stream.title || "Untitled Stream"} • ${viewers} viewers`;
    liveActivityListEl.appendChild(row);
  });
};

const updateAlerts = (streams) => {
  if (!liveAlertsEl) return;
  liveAlertsEl.innerHTML = "";

  if (!streams.length) {
    setListMessage(liveAlertsEl, "No alerts.");
    return;
  }

  const maxViewers = streams.reduce((max, stream) => {
    const viewers = Number(stream.viewerCount || 0);
    return viewers > max ? viewers : max;
  }, 0);

  const alert = document.createElement("div");
  alert.textContent = `Peak live viewers right now: ${maxViewers.toLocaleString()}`;
  liveAlertsEl.appendChild(alert);
};

const loadUser = async () => {
  try {
    if (window.WatercastApi.getToken()) {
      const payload = await window.WatercastApi.fetchJson("/api/auth/me");
      currentUser = payload.user;
      if (nameEl) nameEl.textContent = payload.user?.username || "Creator";
      return;
    }
  } catch (err) {
    currentUser = null;
  }

  if (nameEl) nameEl.textContent = "Creator";
  if (subtextEl) {
    subtextEl.textContent = "Log in to see your live stream stats.";
  }
};

const loadStreams = async () => {
  try {
    const payload = await window.WatercastApi.fetchJson("/api/streams/live");
    const streams = payload.streams || [];
    renderStreams(streams);
    updateStats(streams);
    updateActivity(streams);
    updateAlerts(streams);

    if (lastUpdatedEl) {
      const now = new Date();
      lastUpdatedEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
  } catch (err) {
    console.warn("Failed to load live streams", err);
    renderStreams([]);
    updateStats([]);
    updateActivity([]);
    updateAlerts([]);
  }
};

(async () => {
  await loadUser();
  await loadStreams();
  setInterval(loadStreams, 10000);
})();
