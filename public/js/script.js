document.addEventListener('DOMContentLoaded', function() {
// Remove socket.io connection since we're not using a backend
// const socket = io('http://localhost:3000');

let currentRoom = null;
let isPlaying = false;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let nextTickTime = 0;
let bpm = 90;
let timeoutId;
const timeSignatureSelect = document.getElementById("timeSignature");
const beatBar = document.getElementById("beatBar");
let beatsPerMeasure = 4;
let currentBeat = 0;

// UI Elements
const metronomeScreen = document.getElementById("metronomeScreen");
const roomKeyDisplay = document.getElementById("roomKey");
const bpmInput = document.getElementById("bpmInput");
const beatVisualizer = document.getElementById("beatVisualizer");
const toggleMetronomeBtn = document.getElementById("toggleMetronome");
const leaveRoomBtn = document.getElementById("leaveRoom");

// Landing page elements
const landingContainer = document.querySelector('.landing-container');
const createMetronomeBtn = document.getElementById('createMetronomeBtn');
const joinMetronomeBtn = document.getElementById('joinMetronomeBtn');
const roomCodeInput = document.getElementById('roomCodeInput');

// Hide metronome on load, show landing
if (landingContainer) {
    if (metronomeScreen) metronomeScreen.style.display = 'none';
    landingContainer.style.display = 'flex';
}

// Create Lobby: go directly to metronome with generated code
if (createMetronomeBtn) {
    createMetronomeBtn.addEventListener('click', () => {
        const roomId = Math.random().toString(36).substr(2, 6);
        currentRoom = roomId;
        if (roomKeyDisplay) roomKeyDisplay.textContent = roomId;
        if (landingContainer) landingContainer.style.display = 'none';
        if (metronomeScreen) {
            metronomeScreen.style.display = 'flex';
            metronomeScreen.style.alignItems = 'center';
            metronomeScreen.style.justifyContent = 'center';
        }
    });
}

// Join Lobby: go to metronome with entered code
if (joinMetronomeBtn) {
    joinMetronomeBtn.addEventListener('click', () => {
        const roomId = roomCodeInput.value.trim();
        if (roomId.length === 0) {
            roomCodeInput.classList.add('input-error');
            roomCodeInput.placeholder = 'Enter a code!';
            setTimeout(() => roomCodeInput.classList.remove('input-error'), 1200);
            return;
        }
        currentRoom = roomId;
        if (roomKeyDisplay) roomKeyDisplay.textContent = roomId;
        if (landingContainer) landingContainer.style.display = 'none';
        if (metronomeScreen) {
            metronomeScreen.style.display = 'flex';
            metronomeScreen.style.alignItems = 'center';
            metronomeScreen.style.justifyContent = 'center';
        }
    });
}

// Toggle Metronome
if (toggleMetronomeBtn) {
    toggleMetronomeBtn.addEventListener("click", () => {
        if (!isPlaying) {
            startMetronome();
            toggleMetronomeBtn.textContent = "⏹ Stop";
        } else {
            stopMetronome();
            toggleMetronomeBtn.textContent = "▶ Play";
        }
    });
}

// Render the beat bar
function renderBeatBar() {
    if (!beatBar) return;
    beatBar.innerHTML = '';
    for (let i = 0; i < beatsPerMeasure; i++) {
        const dot = document.createElement('div');
        dot.className = 'beat-dot';
        if (i === 0) dot.classList.add('downbeat');
        if (i === currentBeat) dot.classList.add('active');
        beatBar.appendChild(dot);
    }
}

// Update beatsPerMeasure when time signature changes
if (timeSignatureSelect) {
    timeSignatureSelect.addEventListener('change', (e) => {
        const val = timeSignatureSelect.value.split('/')[0];
        beatsPerMeasure = parseInt(val, 10);
        currentBeat = 0;
        renderBeatBar();
    });
    // Initialize
    beatsPerMeasure = parseInt(timeSignatureSelect.value.split('/')[0], 10);
}
renderBeatBar();

// Metronome Logic
function startMetronome() {
    if (!isPlaying) {
        isPlaying = true;
        nextTickTime = audioCtx.currentTime;
        currentBeat = 0;
        renderBeatBar();
        scheduleTick();
    }
}

function stopMetronome() {
    isPlaying = false;
    clearTimeout(timeoutId);
}

function scheduleTick() {
    if (!isPlaying) return;
    let now = audioCtx.currentTime;
    if (nextTickTime <= now) {
        playClick(currentBeat);
        renderBeatBar();
        currentBeat = (currentBeat + 1) % beatsPerMeasure;
        nextTickTime += 60 / bpm;
    }
    let drift = nextTickTime - now;
    timeoutId = setTimeout(scheduleTick, drift * 1000);
}

// Woodblock Sound
function playClick(beatIdx) {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    let filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 800;
    osc.type = "square";
    // Downbeat is lower pitch, others are higher
    if (beatIdx === 0) {
        osc.frequency.setValueAtTime(700, audioCtx.currentTime);
    } else {
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    }
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.07);
    animateBeat();
}

function animateBeat() {
    beatVisualizer.classList.add("beat");
    setTimeout(() => beatVisualizer.classList.remove("beat"), 100);
}

// Update BPM
if (bpmInput) {
    bpmInput.addEventListener("input", (e) => {
        bpm = e.target.value;
    });
}

// Leave Room
if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener("click", () => {
        switchToLanding();
    });
}

function switchToLanding() {
    if (metronomeScreen) metronomeScreen.style.display = 'none';
    if (landingContainer) landingContainer.style.display = 'flex';
    currentRoom = null;
    isPlaying = false;
    stopMetronome();
    if (toggleMetronomeBtn) toggleMetronomeBtn.textContent = "▶ Play";
    if (roomCodeInput) roomCodeInput.value = '';
}
});

