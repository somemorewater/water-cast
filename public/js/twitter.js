// WaterCast - Twitter/X Mobile Interactions

// ========================================
// CHAT BOTTOM SHEET
// ========================================

function openChatSheet() {
  const sheet = document.getElementById('chatSheet');
  if (sheet) {
    sheet.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Trigger haptic feedback
    triggerHaptic();
  }
}

function closeChatSheet() {
  const sheet = document.getElementById('chatSheet');
  if (sheet) {
    sheet.classList.remove('open');
    document.body.style.overflow = '';
    
    // Trigger haptic feedback
    triggerHaptic();
  }
}

// Swipe down to close chat sheet
function initChatSheetGestures() {
  const chatContent = document.querySelector('.chat-sheet-content');
  const chatMessages = document.querySelector('.chat-messages');
  
  if (!chatContent) return;
  
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  
  chatContent.addEventListener('touchstart', (e) => {
    // Only start drag if at top of chat or on drag handle
    if (chatMessages.scrollTop === 0 || e.target.closest('.drag-handle-container')) {
      startY = e.touches[0].clientY;
      isDragging = true;
    }
  });
  
  chatContent.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow downward drag when at top of scroll
    if (deltaY > 0 && chatMessages.scrollTop === 0) {
      e.preventDefault();
      chatContent.style.transform = `translateY(${deltaY}px)`;
    }
  });
  
  chatContent.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    
    // Close if dragged down more than 100px
    if (deltaY > 100) {
      closeChatSheet();
    }
    
    // Reset transform
    chatContent.style.transform = '';
    isDragging = false;
  });
}

// ========================================
// STREAM DESCRIPTION TOGGLE
// ========================================

function toggleDescription() {
  const desc = document.getElementById('streamDescription');
  const text = document.getElementById('expandText');
  const icon = document.getElementById('expandIcon');
  
  if (!desc) return;
  
  desc.classList.toggle('expanded');
  
  if (desc.classList.contains('expanded')) {
    text.textContent = 'Show less';
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  } else {
    text.textContent = 'Show more';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  }
  
  triggerHaptic();
}

// ========================================
// VIDEO CONTROLS
// ========================================

let controlsTimeout;
let isPlaying = true;

function toggleVideoControls() {
  const container = document.querySelector('.video-container');
  if (!container) return;
  
  container.classList.toggle('show-controls');
  
  // Auto-hide controls after 3 seconds
  clearTimeout(controlsTimeout);
  if (container.classList.contains('show-controls')) {
    controlsTimeout = setTimeout(() => {
      container.classList.remove('show-controls');
    }, 3000);
  }
}

function togglePlayPause() {
  isPlaying = !isPlaying;
  const playOverlay = document.querySelector('.play-overlay i');
  
  if (playOverlay) {
    playOverlay.className = isPlaying ? 'fas fa-pause text-6xl' : 'fas fa-play text-6xl';
  }
  
  triggerHaptic();
}

function toggleMute() {
  const muteBtn = document.querySelector('.mute-btn i');
  if (muteBtn) {
    muteBtn.classList.toggle('fa-volume-up');
    muteBtn.classList.toggle('fa-volume-mute');
  }
  
  triggerHaptic();
}

function toggleFullscreen() {
  const videoContainer = document.querySelector('.video-container');
  
  if (!document.fullscreenElement) {
    if (videoContainer.requestFullscreen) {
      videoContainer.requestFullscreen();
    } else if (videoContainer.webkitRequestFullscreen) {
      videoContainer.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
  
  triggerHaptic();
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', () => {
  const fullscreenBtn = document.querySelector('.fullscreen-btn i');
  if (fullscreenBtn) {
    if (document.fullscreenElement) {
      fullscreenBtn.classList.remove('fa-expand');
      fullscreenBtn.classList.add('fa-compress');
    } else {
      fullscreenBtn.classList.remove('fa-compress');
      fullscreenBtn.classList.add('fa-expand');
    }
  }
});

// ========================================
// HEADER AUTO-HIDE ON SCROLL
// ========================================

let lastScrollY = 0;
let ticking = false;

function updateHeaderVisibility() {
  const currentScrollY = window.scrollY;
  const header = document.querySelector('.mobile-header');
  
  if (!header) return;
  
  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    // Scrolling down - hide header
    header.classList.add('hidden');
  } else {
    // Scrolling up - show header
    header.classList.remove('hidden');
  }
  
  lastScrollY = currentScrollY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateHeaderVisibility);
    ticking = true;
  }
});

// ========================================
// PULL TO REFRESH
// ========================================

let startY = 0;
let isPulling = false;
let pullDistance = 0;
const refreshThreshold = 80;

function initPullToRefresh() {
  const loader = document.getElementById('pullRefreshLoader');
  if (!loader) return;
  
  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].pageY;
      isPulling = true;
    }
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    if (!isPulling || window.scrollY > 0) return;
    
    const currentY = e.touches[0].pageY;
    pullDistance = Math.max(0, currentY - startY);
    
    if (pullDistance > 0) {
      e.preventDefault();
      
      // Update loader position and opacity
      const progress = Math.min(pullDistance / refreshThreshold, 1);
      loader.style.transform = `translateX(-50%) translateY(${pullDistance}px)`;
      loader.style.opacity = progress;
      
      // Rotate spinner
      const spinner = loader.querySelector('.spinner');
      if (spinner) {
        spinner.style.transform = `rotate(${pullDistance * 2}deg)`;
      }
    }
  });
  
  document.addEventListener('touchend', (e) => {
    if (!isPulling) return;
    
    if (pullDistance > refreshThreshold) {
      // Trigger refresh
      loader.classList.add('show');
      triggerHaptic('medium');
      
      // Simulate refresh (replace with actual refresh logic)
      setTimeout(() => {
        location.reload();
      }, 500);
    } else {
      // Reset
      loader.style.transform = 'translateX(-50%) translateY(-100%)';
      loader.style.opacity = '0';
    }
    
    isPulling = false;
    pullDistance = 0;
  }, { passive: true });
}

// ========================================
// HAPTIC FEEDBACK
// ========================================

function triggerHaptic(intensity = 'light') {
  // iOS Safari doesn't support Vibration API reliably
  // but we can try
  if (!window.navigator.vibrate) return;
  
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30
  };
  
  window.navigator.vibrate(patterns[intensity] || 10);
}

// Add haptic feedback to all interactive elements
function initHapticFeedback() {
  const interactiveElements = document.querySelectorAll(
    'button, .nav-item, a, .chat-preview, .stream-card, .tag'
  );
  
  interactiveElements.forEach(element => {
    element.addEventListener('touchstart', () => {
      triggerHaptic('light');
    }, { passive: true });
  });
}

// ========================================
// FOLLOW BUTTON TOGGLE
// ========================================

function toggleFollow() {
  const btn = document.querySelector('.follow-btn');
  if (!btn) return;
  
  btn.classList.toggle('following');
  
  const icon = btn.querySelector('i');
  if (icon) {
    if (btn.classList.contains('following')) {
      icon.classList.remove('fa-user-plus');
      icon.classList.add('fa-check');
    } else {
      icon.classList.remove('fa-check');
      icon.classList.add('fa-user-plus');
    }
  }
  
  triggerHaptic('medium');
}

// ========================================
// CHAT MESSAGE SENDING
// ========================================

function initChatInput() {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = chatForm?.querySelector('.send-btn');
  
  if (!chatForm || !chatInput || !sendBtn) return;
  
  // Enable/disable send button based on input
  chatInput.addEventListener('input', () => {
    sendBtn.disabled = !chatInput.value.trim();
  });
  
  // Handle form submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add message to chat
    addChatMessage('You', message);
    
    // Clear input
    chatInput.value = '';
    sendBtn.disabled = true;
    
    // Scroll to bottom
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    triggerHaptic();
  });
}

function addChatMessage(username, message) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message';
  
  const usernameSpan = document.createElement('span');
  usernameSpan.className = 'chat-username';
  usernameSpan.textContent = username;
  
  const messageSpan = document.createElement('span');
  messageSpan.className = 'chat-text';
  messageSpan.textContent = message;
  
  messageDiv.appendChild(usernameSpan);
  messageDiv.appendChild(messageSpan);
  chatMessages.appendChild(messageDiv);
  
  // Keep chat scrolled to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========================================
// ACTIVE NAV STATE
// ========================================

function updateActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(currentPage)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// ========================================
// GO LIVE FAB ACTION
// ========================================

function handleGoLive() {
  triggerHaptic('heavy');
  window.location.href = './go-live.html';
}

// ========================================
// PREVENT BODY SCROLL WHEN SHEET OPEN
// ========================================

let scrollY = 0;

function preventBodyScroll() {
  scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}

function allowBodyScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollY);
}

// Update openChatSheet to use these
const originalOpenChatSheet = openChatSheet;
openChatSheet = function() {
  originalOpenChatSheet();
  preventBodyScroll();
};

const originalCloseChatSheet = closeChatSheet;
closeChatSheet = function() {
  originalCloseChatSheet();
  allowBodyScroll();
};

// ========================================
// SIMULATE LIVE CHAT
// ========================================

function simulateChat() {
  const usernames = ['TechGuru', 'StreamFan', 'DevNinja', 'CodeKing', 'WebMaster', 'AppBuilder'];
  const messages = [
    'Great explanation!',
    'Can you go over that again?',
    'This is helpful 👍',
    'Thanks for the stream!',
    'Interesting approach',
    'What framework is that?',
    'Love this content',
    'Question: how do you handle errors?',
    'Amazing work!',
    'Keep it up!'
  ];
  
  setInterval(() => {
    const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    addChatMessage(randomUser, randomMessage);
  }, 5000 + Math.random() * 10000);
}

// ========================================
// VIEWER COUNT UPDATE
// ========================================

let viewerCount = 2347;

function updateViewerCount() {
  setInterval(() => {
    const change = Math.random() > 0.5 ? 1 : -1;
    viewerCount = Math.max(100, viewerCount + (Math.floor(Math.random() * 5) * change));
    
    // Update all viewer count displays
    document.querySelectorAll('.viewer-count, .chat-count').forEach(el => {
      if (el.classList.contains('chat-count')) {
        el.textContent = `${viewerCount.toLocaleString()} chatting`;
      } else {
        el.innerHTML = `<i class="fas fa-eye"></i> ${(viewerCount / 1000).toFixed(1)}K`;
      }
    });
  }, 3000);
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all features
  initChatSheetGestures();
  initPullToRefresh();
  initHapticFeedback();
  initChatInput();
  updateActiveNav();
  
  // Start simulations (for demo purposes)
  if (document.getElementById('chatMessages')) {
    simulateChat();
    updateViewerCount();
  }
  
  // Video controls tap to show
  const videoContainer = document.querySelector('.video-container');
  if (videoContainer) {
    videoContainer.addEventListener('click', (e) => {
      // Don't toggle if clicking a button
      if (e.target.closest('button')) return;
      
      toggleVideoControls();
    });
  }
  
  // Close chat sheet when clicking backdrop
  const backdrop = document.querySelector('.chat-sheet-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeChatSheet);
  }
  
  console.log('WaterCast Mobile initialized');
});

// ========================================
// KEYBOARD SHORTCUTS (Desktop)
// ========================================

document.addEventListener('keydown', (e) => {
  // Only on desktop
  if (window.innerWidth < 768) return;
  
  // Space to play/pause
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    togglePlayPause();
  }
  
  // M to mute
  if (e.code === 'KeyM') {
    e.preventDefault();
    toggleMute();
  }
  
  // F for fullscreen
  if (e.code === 'KeyF') {
    e.preventDefault();
    toggleFullscreen();
  }
  
  // C for chat
  if (e.code === 'KeyC') {
    e.preventDefault();
    openChatSheet();
  }
  
  // Escape to close chat
  if (e.code === 'Escape') {
    closeChatSheet();
  }
});

// ========================================
// EXPORT FUNCTIONS FOR INLINE USE
// ========================================

window.WaterCastMobile = {
  openChatSheet,
  closeChatSheet,
  toggleDescription,
  togglePlayPause,
  toggleMute,
  toggleFullscreen,
  toggleFollow,
  handleGoLive,
  addChatMessage
};
