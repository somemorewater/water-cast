const liveNowGrid = document.getElementById("liveNowGrid");
const liveNowEmpty = document.getElementById("liveNowEmpty");

const setLiveNowMessage = (message) => {
  if (!liveNowEmpty) return;
  liveNowEmpty.textContent = message;
  liveNowEmpty.classList.remove("hidden");
};

const renderLiveStreams = (streams) => {
  if (!liveNowGrid) return;
  liveNowGrid.innerHTML = "";

  if (!streams.length) {
    setLiveNowMessage("No live streams right now. Check back soon.");
    return;
  }

  if (liveNowEmpty) liveNowEmpty.classList.add("hidden");

  streams.forEach((stream) => {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition duration-200";

    const link = document.createElement("a");
    link.className = "block relative";
    link.href = `watch.html?streamId=${stream.id}`;

    const banner = document.createElement("div");
    banner.className =
      "aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center";
    banner.innerHTML = '<i class="fas fa-play text-white text-4xl opacity-75"></i>';

    const liveBadge = document.createElement("div");
    liveBadge.className =
      "absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5";
    liveBadge.innerHTML = '<span class="w-2 h-2 bg-white rounded-full pulse-dot"></span>LIVE';

    const viewers = document.createElement("div");
    const viewerCount = Number(stream.viewerCount || 0).toLocaleString();
    viewers.className =
      "absolute bottom-3 right-3 bg-black bg-opacity-75 backdrop-blur-sm text-white px-3 py-1 rounded text-sm font-semibold";
    viewers.innerHTML = `<i class="fas fa-eye mr-1"></i>${viewerCount} viewers`;

    link.appendChild(banner);
    link.appendChild(liveBadge);
    link.appendChild(viewers);

    const body = document.createElement("div");
    body.className = "p-4";

    const title = document.createElement("h5");
    title.className = "font-bold text-lg mb-2";
    title.textContent = stream.title || "Live stream";

    const streamer = document.createElement("p");
    streamer.className = "text-gray-600 text-sm mb-2";
    streamer.textContent = stream.streamer?.username || "Streamer";

    const category = document.createElement("span");
    category.className =
      "inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold";
    category.textContent = stream.category || "Live";

    body.appendChild(title);
    body.appendChild(streamer);
    body.appendChild(category);

    card.appendChild(link);
    card.appendChild(body);
    liveNowGrid.appendChild(card);
  });
};

const loadLiveStreams = async () => {
  try {
    setLiveNowMessage("Loading live streams...");
    const payload = await window.WatercastApi.fetchJson("/api/streams/live");
    renderLiveStreams(payload.streams || []);
  } catch (err) {
    console.warn("Failed to load live streams", err);
    setLiveNowMessage("Unable to load live streams right now.");
  }
};

if (liveNowGrid) {
  loadLiveStreams();
  setInterval(loadLiveStreams, 15000);
}
