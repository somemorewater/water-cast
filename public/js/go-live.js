let isLive = false;
let streamTimer = null;
let streamDurationSeconds = 0;
let localStream = null;
let streamId = null;
let socket = null;
const peerConnections = new Map();

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Elements
const goLiveBtn = document.getElementById("goLiveBtn");
const video = document.getElementById("videoPreview");
const stopStreamBtn = document.getElementById("stopStreamBtn");
const statusIndicator = document.getElementById("statusIndicator");
const streamStats = document.getElementById("streamStats");
const testCameraBtn = document.getElementById("testCameraBtn");
const streamForm = document.getElementById("streamForm");
const toggleKeyBtn = document.getElementById("toggleKeyBtn");
const copyKeyBtn = document.getElementById("copyKeyBtn");
const streamKey = document.getElementById("streamKey");
const streamLink = document.getElementById("streamLink");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const streamHealthEl = document.getElementById("streamHealth");

const getStreamPayload = () => ({
  title: document.getElementById("streamTitle").value.trim(),
  description: document.getElementById("streamDescription").value.trim(),
  category: document.getElementById("streamCategory").value,
  quality: document.getElementById("streamQuality").value,
  enableChat: document.getElementById("enableChat").checked,
});

const ensureSocket = () => {
  if (socket) return socket;
  const token = window.WatercastApi.getToken();
  socket = io(window.WatercastApi.base, { auth: { token } });

  socket.on("watcher-joined", async ({ watcherId }) => {
    if (!localStream) return;
    const peer = new RTCPeerConnection(rtcConfig);
    peerConnections.set(watcherId, peer);

    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: watcherId, candidate: event.candidate });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("offer", { watcherId, sdp: offer });
  });

  socket.on("answer", async ({ watcherId, sdp }) => {
    const peer = peerConnections.get(watcherId);
    if (!peer) return;
    await peer.setRemoteDescription(new RTCSessionDescription(sdp));
  });

  socket.on("ice-candidate", async ({ from, candidate }) => {
    const peer = peerConnections.get(from);
    if (!peer) return;
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("Failed to add ICE candidate", err);
    }
  });

  socket.on("watcher-left", ({ watcherId }) => {
    const peer = peerConnections.get(watcherId);
    if (peer) {
      peer.close();
      peerConnections.delete(watcherId);
    }
  });

  socket.on("viewer-count", ({ count }) => {
    const viewerCountEl = document.getElementById("viewerCount");
    if (viewerCountEl) viewerCountEl.textContent = count.toLocaleString();
    if (streamHealthEl) {
      streamHealthEl.textContent =
        count === 0 ? "Waiting for viewers" : "Excellent";
    }
  });

  return socket;
};

const startLocalStream = async () => {
  if (localStream) return localStream;
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  video.srcObject = localStream;
  video.classList.remove("hidden");
  return localStream;
};

const stopLocalStream = () => {
  if (!localStream) return;
  localStream.getTracks().forEach((track) => track.stop());
  localStream = null;
  video.srcObject = null;
  video.classList.add("hidden");
};

const updateShareLink = (id) => {
  if (!streamLink) return;
  const link = `${window.location.origin}/watch.html?streamId=${id}`;
  streamLink.value = link;
};

const disableStreamForm = (disabled) => {
  document
    .querySelectorAll("#streamForm input, #streamForm select, #streamForm textarea")
    .forEach((input) => {
      input.disabled = disabled;
    });
};

const startStreamTimer = () => {
  streamTimer = setInterval(() => {
    streamDurationSeconds++;
    const minutes = Math.floor(streamDurationSeconds / 60);
    const seconds = streamDurationSeconds % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    document.getElementById("streamDuration").textContent = formatted;
  }, 1000);
};

const stopStreamTimer = () => {
  if (streamTimer) {
    clearInterval(streamTimer);
    streamTimer = null;
  }
  streamDurationSeconds = 0;
  document.getElementById("streamDuration").textContent = "00:00";
};

const stopStream = async () => {
  isLive = false;
  window.WatercastUI?.setButtonLoading(goLiveBtn, false);
  goLiveBtn.classList.remove("hidden");
  stopStreamBtn.classList.add("hidden");
  statusIndicator.className =
    "inline-flex items-center gap-2 bg-gray-700 bg-opacity-50 px-4 py-2 rounded-full text-sm font-semibold text-white";
  statusIndicator.innerHTML =
    '<span class="w-2 h-2 bg-gray-400 rounded-full pulse-dot"></span> OFFLINE';
  streamStats.classList.add("hidden");
  disableStreamForm(false);

  peerConnections.forEach((peer) => peer.close());
  peerConnections.clear();
  stopLocalStream();

  if (socket && streamId) {
    socket.emit("end-stream", { streamId });
  }

  if (streamId) {
    try {
      await window.WatercastApi.fetchJson(`/api/streams/${streamId}/end`, {
        method: "POST",
        keepalive: true,
      });
    } catch (err) {
      console.warn(err);
    }
  }

  stopStreamTimer();
  if (streamHealthEl) streamHealthEl.textContent = "Offline";
};

// Go Live Button
goLiveBtn.addEventListener("click", async () => {
  const { title } = getStreamPayload();
  if (!title.trim()) {
    await window.WatercastUI?.alert("Please enter a stream title");
    return;
  }

  if (!window.WatercastApi.getToken()) {
    await window.WatercastUI?.alert("Please log in before going live.");
    window.location.href = "login.html";
    return;
  }

  try {
    window.WatercastUI?.setButtonLoading(goLiveBtn, true, "Starting stream...");
    await startLocalStream();

    const payload = await window.WatercastApi.fetchJson("/api/streams", {
      method: "POST",
      body: JSON.stringify(getStreamPayload()),
    });

    streamId = payload.stream.id;
    streamKey.value = payload.stream.streamKey;
    updateShareLink(streamId);

    isLive = true;
    goLiveBtn.classList.add("hidden");
    stopStreamBtn.classList.remove("hidden");
    statusIndicator.className =
      "inline-flex items-center gap-2 bg-red-600 bg-opacity-70 px-4 py-2 rounded-full text-sm font-semibold text-white";
    statusIndicator.innerHTML =
      '<span class="w-2 h-2 bg-white rounded-full pulse-dot"></span> LIVE';
    streamStats.classList.remove("hidden");

    disableStreamForm(true);
    startStreamTimer();
    if (streamHealthEl) streamHealthEl.textContent = "Connecting...";

    const socketInstance = ensureSocket();
    socketInstance.emit("broadcaster-join", { streamId });
    window.WatercastUI?.setButtonLoading(goLiveBtn, false);
  } catch (error) {
    console.error("Go live error:", error);
    await window.WatercastUI?.alert(error.message || "Unable to start stream");
    window.WatercastUI?.setButtonLoading(goLiveBtn, false);
  }
});

// Stop Streaming Button
stopStreamBtn.addEventListener("click", async () => {
  const ok = await window.WatercastUI?.confirm(
    "Are you sure you want to stop streaming?"
  );
  if (ok) {
    window.WatercastUI?.setButtonLoading(stopStreamBtn, true, "Stopping...");
    stopStream().finally(() => {
      window.WatercastUI?.setButtonLoading(stopStreamBtn, false);
    });
  }
});

// Test Camera Button
testCameraBtn.addEventListener("click", async () => {
  try {
    await startLocalStream();
  } catch (error) {
    console.error("Camera access error:", error);

    let errorMessage = "Unable to access camera. ";

    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      errorMessage += "Please allow camera access in your browser settings.";
    } else if (
      error.name === "NotFoundError" ||
      error.name === "DevicesNotFoundError"
    ) {
      errorMessage += "No camera found on your device.";
    } else if (
      error.name === "NotReadableError" ||
      error.name === "TrackStartError"
    ) {
      errorMessage += "Camera is already in use by another application.";
    } else {
      errorMessage += "Please check your camera connection and permissions.";
    }

    await window.WatercastUI?.alert(errorMessage);
  }
});

// Toggle Stream Key Visibility
toggleKeyBtn.addEventListener("click", () => {
  if (streamKey.type === "password") {
    streamKey.type = "text";
    toggleKeyBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    streamKey.type = "password";
    toggleKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
  }
});

// Copy Stream Key
copyKeyBtn.addEventListener("click", async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(streamKey.value);
      showCopySuccess(copyKeyBtn, "Copied!");
    } else {
      streamKey.select();
      const success = document.execCommand("copy");
      if (success) {
        showCopySuccess(copyKeyBtn, "Copied!");
      } else {
        throw new Error("Copy command failed");
      }
    }
  } catch (error) {
    console.error("Copy failed:", error);
    streamKey.select();
    await window.WatercastUI?.alert(
      "Automatic copy failed. Please press Ctrl+C (or Cmd+C on Mac) to copy."
    );
  }
});

if (copyLinkBtn && streamLink) {
  copyLinkBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(streamLink.value);
      showCopySuccess(copyLinkBtn, "Link copied!");
    } catch (error) {
      await window.WatercastUI?.alert("Unable to copy link. Please copy manually.");
    }
  });
}

const showCopySuccess = (button, text) => {
  const originalHTML = button.innerHTML;
  const originalClass = button.className;

  button.innerHTML = `<i class="fas fa-check mr-2"></i>${text}`;
  button.className =
    "w-full bg-green-600 text-white py-2 rounded-lg font-medium transition";

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.className = originalClass;
  }, 2000);
};

window.addEventListener("beforeunload", () => {
  if (isLive) {
    stopStream();
  }
});

window.addEventListener("pagehide", () => {
  if (isLive) {
    stopStream();
  }
});
