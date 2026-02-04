// Watch Stream Page Functionality
let isPlaying = true;
let isMuted = false;
let viewerCount = 2347;

// Elements
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const videoContainer = document.querySelector('.video-container');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// Play/Pause Control
playPauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
});

// Mute Control
muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    if (isMuted) {
        volumeSlider.value = 0;
    } else {
        volumeSlider.value = 50;
    }
});

// Volume Control
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    if (volume == 0) {
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        isMuted = true;
    } else {
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        isMuted = false;
    }
});

// Fullscreen Control
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
});

// Chat Functionality
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (message) {
        addChatMessage('You', message);
        chatInput.value = '';
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

// Add Chat Message
function addChatMessage(username, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerHTML = `
        <span class="chat-username">${username}</span>
        <span class="chat-text">${message}</span>
    `;
    chatMessages.appendChild(messageDiv);
    
    // Keep chat scrolled to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate Chat Messages
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

// Update Viewer Count
function updateViewerCount() {
    setInterval(() => {
        const change = Math.random() > 0.5 ? 1 : -1;
        viewerCount = Math.max(100, viewerCount + (Math.floor(Math.random() * 5) * change));
        
        document.getElementById('viewerCount').textContent = viewerCount.toLocaleString() + ' viewers';
        document.getElementById('chatViewers').textContent = viewerCount.toLocaleString();
    }, 3000);
}

// Initialize
simulateChat();
updateViewerCount();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space to play/pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        playPauseBtn.click();
    }
    
    // M to mute
    if (e.code === 'KeyM') {
        e.preventDefault();
        muteBtn.click();
    }
    
    // F for fullscreen
    if (e.code === 'KeyF') {
        e.preventDefault();
        fullscreenBtn.click();
    }
});
