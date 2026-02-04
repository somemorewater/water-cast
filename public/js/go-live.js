// Go Live Page Functionality
let isLive = false;
let streamTimer = null;
let streamDurationSeconds = 0;

// Elements
const goLiveBtn = document.getElementById('goLiveBtn');
const stopStreamBtn = document.getElementById('stopStreamBtn');
const statusIndicator = document.getElementById('statusIndicator');
const streamStats = document.getElementById('streamStats');
const testCameraBtn = document.getElementById('testCameraBtn');
const streamForm = document.getElementById('streamForm');
const toggleKeyBtn = document.getElementById('toggleKeyBtn');
const copyKeyBtn = document.getElementById('copyKeyBtn');
const streamKey = document.getElementById('streamKey');

// Go Live Button
goLiveBtn.addEventListener('click', () => {
    const title = document.getElementById('streamTitle').value;
    
    if (!title.trim()) {
        alert('Please enter a stream title');
        return;
    }

    // Start streaming
    isLive = true;
    goLiveBtn.classList.add('hidden');
    stopStreamBtn.classList.remove('hidden');
    statusIndicator.className = 'inline-flex items-center gap-2 bg-red-600 bg-opacity-70 px-4 py-2 rounded-full text-sm font-semibold text-white';
    statusIndicator.innerHTML = '<span class="w-2 h-2 bg-white rounded-full pulse-dot"></span> LIVE';
    streamStats.classList.remove('hidden');
    
    // Disable form inputs
    document.querySelectorAll('#streamForm input, #streamForm select, #streamForm textarea').forEach(input => {
        input.disabled = true;
    });

    // Start timer
    startStreamTimer();
    
    // Simulate viewer count updates
    simulateViewers();
});

// Stop Streaming Button
stopStreamBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to stop streaming?')) {
        stopStream();
    }
});

// Stop Stream Function
function stopStream() {
    isLive = false;
    goLiveBtn.classList.remove('hidden');
    stopStreamBtn.classList.add('hidden');
    statusIndicator.className = 'inline-flex items-center gap-2 bg-gray-700 bg-opacity-50 px-4 py-2 rounded-full text-sm font-semibold text-white';
    statusIndicator.innerHTML = '<span class="w-2 h-2 bg-gray-400 rounded-full pulse-dot"></span> OFFLINE';
    streamStats.classList.add('hidden');
    
    // Enable form inputs
    document.querySelectorAll('#streamForm input, #streamForm select, #streamForm textarea').forEach(input => {
        input.disabled = false;
    });

    // Stop timer
    if (streamTimer) {
        clearInterval(streamTimer);
        streamTimer = null;
    }
    streamDurationSeconds = 0;
    document.getElementById('streamDuration').textContent = '00:00';
}

// Stream Timer
function startStreamTimer() {
    streamTimer = setInterval(() => {
        streamDurationSeconds++;
        const minutes = Math.floor(streamDurationSeconds / 60);
        const seconds = streamDurationSeconds % 60;
        const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('streamDuration').textContent = formatted;
    }, 1000);
}

// Simulate Viewer Count
function simulateViewers() {
    let viewers = 0;
    const updateViewers = () => {
        if (isLive) {
            // Random viewer fluctuation
            const change = Math.random() > 0.5 ? 1 : -1;
            viewers = Math.max(0, viewers + change);
            if (Math.random() > 0.7) viewers += Math.floor(Math.random() * 3);
            
            document.getElementById('viewerCount').textContent = viewers.toLocaleString();
            setTimeout(updateViewers, 2000 + Math.random() * 3000);
        }
    };
    updateViewers();
}

// Test Camera Button
testCameraBtn.addEventListener('click', () => {
    alert('Camera test functionality would open your camera preview here');
});

// Toggle Stream Key Visibility
toggleKeyBtn.addEventListener('click', () => {
    if (streamKey.type === 'password') {
        streamKey.type = 'text';
        toggleKeyBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        streamKey.type = 'password';
        toggleKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
});

// Copy Stream Key
copyKeyBtn.addEventListener('click', () => {
    streamKey.select();
    document.execCommand('copy');
    
    const originalHTML = copyKeyBtn.innerHTML;
    copyKeyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
    copyKeyBtn.className = 'w-full bg-green-600 text-white py-2 rounded-lg font-medium transition';
    
    setTimeout(() => {
        copyKeyBtn.innerHTML = originalHTML;
        copyKeyBtn.className = 'w-full border-2 border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition font-medium';
    }, 2000);
});
