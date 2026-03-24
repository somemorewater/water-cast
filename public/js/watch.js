let isPlaying = true;
let isMuted = false;

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Elements
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const videoContainer = document.querySelector(".video-container");
const remoteVideo = document.getElementById("remoteVideo");
const videoPlaceholder = document.getElementById("videoPlaceholder");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const qualityBtn = document.getElementById("qualityBtn");

let socket = null;
let peer = null;
let streamId = null;
let displayName = "Guest";
let streamIsLive = true;

const updateStreamDetails = async () => {
  if (!streamId) return;
  try {
    const payload = await window.WatercastApi.fetchJson(`/api/streams/${streamId}`);
    const stream = payload.stream;

    const titleEl = document.getElementById("streamTitle");
    const descEl = document.getElementById("streamDescription");
    const streamerEl = document.getElementById("streamerName");

    if (titleEl) titleEl.textContent = stream.title || "Live Stream";
    if (descEl) descEl.textContent = stream.description || "";
    if (streamerEl) streamerEl.textContent = stream.streamer?.username || "Streamer";

    if (stream.status !== "live") {
      streamIsLive = false;
      addChatMessage("System", "This stream is offline.");
      videoPlaceholder?.classList.remove("hidden");
      if (chatInput) chatInput.disabled = true;
      if (chatForm) chatForm.querySelector("button")?.setAttribute("disabled", "true");
    }
  } catch (err) {
    console.warn("Unable to load stream details", err);
    await window.WatercastUI?.alert(
      "We couldn't find that stream. Taking you back to live streams."
    );
    window.location.href = "index.html";
  }
};

const initUser = async () => {
  try {
    if (window.WatercastApi.getToken()) {
      const me = await window.WatercastApi.fetchJson("/api/auth/me");
      displayName = me.user?.username || "Guest";
    }
  } catch (err) {
    displayName = `Guest${Math.floor(Math.random() * 9999)}`;
  }
};

const initSocket = () => {
  if (typeof io === "undefined") {
    window.WatercastUI?.alert(
      "Socket client failed to load. Please refresh the page or ensure the server is running."
    );
    return;
  }
  socket = io(window.WatercastApi.base);

  socket.on("offer", async ({ broadcasterId, sdp }) => {
    peer = new RTCPeerConnection(rtcConfig);

    peer.ontrack = (event) => {
      remoteVideo.srcObject = event.streams[0];
      videoPlaceholder?.classList.add("hidden");
      remoteVideo.play().catch(() => {});
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: broadcasterId, candidate: event.candidate });
      }
    };

    await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("answer", { broadcasterId, sdp: answer });
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    if (!peer) return;
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("Failed to add ICE candidate", err);
    }
  });

  socket.on("viewer-count", ({ count }) => {
    const viewerCountEl = document.getElementById("viewerCount");
    const chatViewersEl = document.getElementById("chatViewers");
    if (viewerCountEl) viewerCountEl.textContent = `${count.toLocaleString()} viewers`;
    if (chatViewersEl) chatViewersEl.textContent = count.toLocaleString();
  });

  socket.on("chat-message", ({ user, message }) => {
    addChatMessage(user, message);
  });

  socket.on("stream-ended", () => {
    addChatMessage("System", "Stream has ended.");
    videoPlaceholder?.classList.remove("hidden");
    if (chatInput) chatInput.disabled = true;
    if (chatForm) chatForm.querySelector("button")?.setAttribute("disabled", "true");
    if (peer) {
      peer.close();
      peer = null;
    }
    if (remoteVideo.srcObject) {
      remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
      remoteVideo.srcObject = null;
    }
  });

  socket.emit("watcher-join", { streamId, name: displayName });
};

// Play/Pause Control
playPauseBtn.addEventListener("click", () => {
  isPlaying = !isPlaying;
  playPauseBtn.innerHTML = isPlaying
    ? '<i class="fas fa-pause"></i>'
    : '<i class="fas fa-play"></i>';

  if (remoteVideo) {
    if (isPlaying) {
      remoteVideo.play().catch(() => {});
    } else {
      remoteVideo.pause();
    }
  }
});

// Mute Control
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.innerHTML = isMuted
    ? '<i class="fas fa-volume-mute"></i>'
    : '<i class="fas fa-volume-up"></i>';

  if (remoteVideo) {
    remoteVideo.muted = isMuted;
  }

  volumeSlider.value = isMuted ? 0 : 50;
});

// Volume Control
volumeSlider.addEventListener("input", (e) => {
  const volume = Number(e.target.value) / 100;
  if (remoteVideo) {
    remoteVideo.volume = volume;
  }

  if (volume === 0) {
    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    isMuted = true;
  } else {
    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    isMuted = false;
  }
});

// Fullscreen Control
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen().catch((err) => {
      console.error("Fullscreen error:", err);
    });
  } else {
    document.exitFullscreen();
  }
});

// Listen for fullscreen changes
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
  } else {
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
  }
});

// Chat Functionality
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = chatInput.value.trim();
  if (message && socket) {
    socket.emit("chat-message", { streamId, message, user: displayName });
    chatInput.value = "";
  }
});

function addChatMessage(username, message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";

  const usernameSpan = document.createElement("span");
  usernameSpan.className = "chat-username";
  usernameSpan.textContent = username;

  const messageSpan = document.createElement("span");
  messageSpan.className = "chat-text";
  messageSpan.textContent = message;

  messageDiv.appendChild(usernameSpan);
  messageDiv.appendChild(messageSpan);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Init
(async () => {
  const params = new URLSearchParams(window.location.search);
  streamId = params.get("streamId");
  if (!streamId) {
    try {
      const payload = await window.WatercastApi.fetchJson("/api/streams/live");
      const streams = payload.streams || [];
      if (streams.length > 0) {
        window.WatercastUI?.toast("Taking you to the live stream...", "info");
        window.location.href = `watch.html?streamId=${streams[0].id}`;
        return;
      }
      await window.WatercastUI?.alert(
        "No live streams right now. Returning to home."
      );
      window.location.href = "index.html";
    } catch (err) {
      await window.WatercastUI?.alert(
        "Missing stream ID. Return to the home page to pick a live stream."
      );
      window.location.href = "index.html";
    }
    return;
  }

  await initUser();
  await updateStreamDetails();
  if (streamIsLive) {
    initSocket();
  }
})();

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target.tagName !== "INPUT") {
    e.preventDefault();
    playPauseBtn.click();
  }

  if (e.code === "KeyM") {
    e.preventDefault();
    muteBtn.click();
  }

  if (e.code === "KeyF") {
    e.preventDefault();
    fullscreenBtn.click();
  }
});

const initQualityMenu = () => {
  if (!qualityBtn || !videoContainer) return;

  qualityBtn.textContent = "Auto";

  const menu = document.createElement("div");
  menu.className =
    "absolute bottom-16 right-4 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 overflow-hidden hidden z-20";

  const options = ["Auto", "High", "Low"];
  options.forEach((label) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className =
      "block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition";
    item.textContent = label;
    item.addEventListener("click", () => {
      qualityBtn.textContent = label;
      menu.classList.add("hidden");
    });
    menu.appendChild(item);
  });

  videoContainer.appendChild(menu);

  qualityBtn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && event.target !== qualityBtn) {
      menu.classList.add("hidden");
    }
  });
};

initQualityMenu();
