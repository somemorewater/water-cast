// Watch Stream Page Functionality
let isPlaying = true;
let isMuted = false;
let viewerCount = 2347;

// Elements
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const videoContainer = document.querySelector(".video-container");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// Play/Pause Control
playPauseBtn.addEventListener("click", () => {
  isPlaying = !isPlaying;
  playPauseBtn.innerHTML = isPlaying
    ? '<i class="fas fa-pause"></i>'
    : '<i class="fas fa-play"></i>';
});

// Mute Control
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.innerHTML = isMuted
    ? '<i class="fas fa-volume-mute"></i>'
    : '<i class="fas fa-volume-up"></i>';
  if (isMuted) {
    volumeSlider.value = 0;
  } else {
    volumeSlider.value = 50;
  }
});

// Volume Control - FIXED: Using strict equality (===) instead of loose equality (==)
volumeSlider.addEventListener("input", (e) => {
  const volume = e.target.value;
  if (volume === "0" || volume === 0) {
    // FIXED: Strict comparison
    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    isMuted = true;
  } else {
    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    isMuted = false;
  }
});

// Fullscreen Control - FIXED: Added event listener for fullscreen changes
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen().catch((err) => {
      console.error("Fullscreen error:", err);
    });
  } else {
    document.exitFullscreen();
  }
});

// FIXED: Listen for fullscreen changes to update button icon correctly
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
  if (message) {
    addChatMessage("You", message);
    chatInput.value = "";

    // Auto scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

// Add Chat Message - FIXED: Proper XSS protection using textContent
function addChatMessage(username, message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";

  // FIXED: Create elements safely without innerHTML to prevent XSS
  const usernameSpan = document.createElement("span");
  usernameSpan.className = "chat-username";
  usernameSpan.textContent = username; // textContent prevents XSS

  const messageSpan = document.createElement("span");
  messageSpan.className = "chat-text";
  messageSpan.textContent = message; // textContent prevents XSS

  messageDiv.appendChild(usernameSpan);
  messageDiv.appendChild(messageSpan);
  chatMessages.appendChild(messageDiv);

  // Keep chat scrolled to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Sanitize HTML helper function (alternative approach if HTML formatting is needed)
function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Simulate Chat Messages
function simulateChat() {
  const usernames = [
    "TechGuru",
    "StreamFan",
    "DevNinja",
    "CodeKing",
    "WebMaster",
    "AppBuilder",
  ];
  const messages = [
    "Great explanation!",
    "Can you go over that again?",
    "This is helpful 👍",
    "Thanks for the stream!",
    "Interesting approach",
    "What framework is that?",
    "Love this content",
    "Question: how do you handle errors?",
    "Amazing work!",
    "Keep it up!",
  ];

  setInterval(
    () => {
      const randomUser =
        usernames[Math.floor(Math.random() * usernames.length)];
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      addChatMessage(randomUser, randomMessage);
    },
    5000 + Math.random() * 10000,
  );
}

// Update Viewer Count
function updateViewerCount() {
  setInterval(() => {
    const change = Math.random() > 0.5 ? 1 : -1;
    viewerCount = Math.max(
      100,
      viewerCount + Math.floor(Math.random() * 5) * change,
    );

    document.getElementById("viewerCount").textContent =
      viewerCount.toLocaleString() + " viewers";
    document.getElementById("chatViewers").textContent =
      viewerCount.toLocaleString();
  }, 3000);
}

// Initialize
simulateChat();
updateViewerCount();

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Space to play/pause
  if (e.code === "Space" && e.target.tagName !== "INPUT") {
    e.preventDefault();
    playPauseBtn.click();
  }

  // M to mute
  if (e.code === "KeyM") {
    e.preventDefault();
    muteBtn.click();
  }

  // F for fullscreen
  if (e.code === "KeyF") {
    e.preventDefault();
    fullscreenBtn.click();
  }
});
