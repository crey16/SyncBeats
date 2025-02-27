const socket = io(); // Connect to WebSocket server

let currentRoom = null;
let isPlaying = false;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let nextTickTime = 0;
let bpm = 90;
let timeoutId;

// 🔹 UI Elements
const lobbyScreen = document.getElementById("lobby");
const metronomeScreen = document.getElementById("metronomeScreen");
const roomList = document.getElementById("roomList");
const roomIdInput = document.getElementById("roomIdInput");
const roomKeyDisplay = document.getElementById("roomKey");
const bpmInput = document.getElementById("bpmInput");
const beatVisualizer = document.getElementById("beatVisualizer");

// 🔹 Buttons
const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");
const startMetronomeBtn = document.getElementById("startMetronome");
const stopMetronomeBtn = document.getElementById("stopMetronome");
const leaveRoomBtn = document.getElementById("leaveRoom");

socket.on("connect", () => {
    console.log("Connected to WebSocket server!");
    socket.emit("getActiveRooms"); // Fetch active rooms when the page loads
});

// 🎵 Create Room
createRoomBtn.addEventListener("click", () => {
    socket.emit("createRoom");
});

// Handle Room Creation
socket.on("roomCreated", (roomId) => {
    currentRoom = roomId;
    roomKeyDisplay.textContent = roomId;
    switchToMetronomeScreen();
});

// 🎵 Join Room
joinRoomBtn.addEventListener("click", () => {
    const roomId = roomIdInput.value.trim();
    if (roomId) {
        socket.emit("joinRoom", roomId);
    }
});

// Handle Room Join
socket.on("roomJoined", (data) => {
    currentRoom = data.roomId;
    roomKeyDisplay.textContent = currentRoom;
    switchToMetronomeScreen();
});

// Handle Room Not Found
socket.on("roomNotFound", () => {
    alert("Room not found! Please check the ID.");
});

// 🎵 Start / Stop Metronome
startMetronomeBtn.addEventListener("click", () => {
    if (!isPlaying) {
        socket.emit("metronomeStarted", { roomId: currentRoom });
        startMetronome();
    }
});

stopMetronomeBtn.addEventListener("click", () => {
    if (isPlaying) {
        socket.emit("metronomeStopped", { roomId: currentRoom });
        stopMetronome();
    }
});

// Sync Play/Pause Across Devices
socket.on("metronomeStarted", () => startMetronome());
socket.on("metronomeStopped", () => stopMetronome());

// 🎵 Metronome Logic with Drift Correction
function startMetronome() {
    if (!isPlaying) {
        isPlaying = true;
        nextTickTime = audioCtx.currentTime;
        scheduleTick();
    }
}

function stopMetronome() {
    isPlaying = false;
    clearTimeout(timeoutId);
}

// 🥁 Play Click Sound & Animate Beat
function scheduleTick() {
    if (!isPlaying) return;

    let now = audioCtx.currentTime;
    if (nextTickTime <= now) {
        playClick();
        nextTickTime += 60 / bpm;
    }

    let drift = nextTickTime - now;
    timeoutId = setTimeout(scheduleTick, drift * 1000);
}

// 🎵 Click Sound
function playClick() {
    let oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);

    animateBeat();
}

// 🔹 Beat Animation
function animateBeat() {
    beatVisualizer.classList.add("beat");
    setTimeout(() => beatVisualizer.classList.remove("beat"), 100);
}

// 🎵 Sync BPM Across Devices
bpmInput.addEventListener("input", (e) => {
    bpm = e.target.value;
    if (currentRoom) {
        socket.emit("updateSettings", { roomId: currentRoom, bpm });
    }
});

socket.on("settingsUpdated", ({ bpm }) => {
    bpmInput.value = bpm;
});

// 🎵 Leave Room (For Hosts & Guests)
leaveRoomBtn.addEventListener("click", () => {
    if (!currentRoom) return;
    
    console.log("🚪 Leaving Room:", currentRoom);
    socket.emit("leaveRoom", { roomId: currentRoom });
    switchToLobby();
});

// 🎵 Handle User Leaving the Room (Guests & Hosts)
socket.on("userLeft", ({ roomId, userId }) => {
    console.log(`🔔 User ${userId} left room: ${roomId}`);

    if (userId === socket.id) {
        switchToLobby();
    }
});

// 🎵 Handle Host Transfer
socket.on("newHost", ({ roomId, newHost }) => {
    if (newHost === socket.id) {
        console.log("👑 You are now the host of room:", roomId);
        alert("You are now the host!");
    }
});

// 🔹 Function to Switch Back to Lobby
function switchToLobby() {
    console.log("🔙 Switching to Lobby...");

    metronomeScreen.style.display = "none";
    lobbyScreen.style.display = "flex";

    // Reset UI
    roomIdInput.value = "";
    currentRoom = null;
    isPlaying = false;
    stopMetronome();

    // Fetch active rooms again when leaving
    socket.emit("getActiveRooms");

    console.log("✅ Successfully returned to the lobby.");
}

// 🔹 Switch Screens
function switchToMetronomeScreen() {
    console.log("🔄 Switching to Metronome Screen...");
    lobbyScreen.style.display = "none";
    metronomeScreen.style.display = "flex";
}

// 🎵 Fetch Available Rooms on Load
socket.on("activeRooms", (rooms) => {
    updateRoomList(rooms);
});

// 🎵 Update Room List Dynamically
function updateRoomList(rooms) {
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        roomList.innerHTML = "<li>No active rooms</li>";
    } else {
        rooms.forEach(room => {
            const li = document.createElement("li");
            li.textContent = room;
            li.addEventListener("click", () => {
                roomIdInput.value = room;
            });
            roomList.appendChild(li);
        });
    }
}
