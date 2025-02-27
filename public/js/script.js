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
});

// 🎵 Create Room
createRoomBtn.addEventListener("click", () => {
    console.log("Create Room button clicked!"); // Debugging log
    socket.emit("createRoom"); // Send request to server
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
    console.log("✅ Joined Room:", data.roomId);

    // Update the current room ID
    currentRoom = data.roomId;

    // Display room code
    document.getElementById("roomKey").textContent = currentRoom;

    // Switch to Metronome Screen
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

// 🎵 Leave Room
leaveRoomBtn.addEventListener("click", () => {
    if (!currentRoom) {
        console.error("❌ ERROR: No room to leave.");
        return;
    }

    console.log("🚪 Leaving Room:", currentRoom);

    // Notify the server
    socket.emit("leaveRoom", { roomId: currentRoom });

    // Reset local room state
    currentRoom = null;
    isPlaying = false;
    stopMetronome();

    // Switch UI back to Lobby
    switchToLobby();
});

function switchToLobby() {
    console.log("🔙 Switching to Lobby...");

    let lobby = document.getElementById("lobby");
    let metronomeScreen = document.getElementById("metronomeScreen");

    if (!lobby || !metronomeScreen) {
        console.error("❌ ERROR: Elements not found!");
        return;
    }

    // Hide Metronome Screen and Show Lobby
    metronomeScreen.classList.add("hidden");
    lobby.classList.remove("hidden");

    console.log("✅ Successfully returned to the lobby.");
}

// 🔹 Switch Screens
function switchToMetronomeScreen() {
    console.log("🔄 Switching to Metronome Screen...");

    let lobby = document.getElementById("lobby");
    let metronomeScreen = document.getElementById("metronomeScreen");

    if (!lobby || !metronomeScreen) {
        console.error("❌ ERROR: Elements not found! Check your HTML.");
        return;
    }

    // Hide the lobby and show the metronome
    lobby.style.display = "none";
    metronomeScreen.style.display = "flex";

    console.log("✅ SUCCESS: Lobby hidden, metronome screen displayed.");
}


function switchToLobby() {
    metronomeScreen.classList.remove("active");
    lobbyScreen.classList.remove("hidden");
    currentRoom = null;
    isPlaying = false;
    stopMetronome();
}

// 🎵 Update Room List Dynamically
socket.on("activeRooms", (rooms) => {
    roomList.innerHTML = "";
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.textContent = room;
        li.addEventListener("click", () => {
            roomIdInput.value = room;
        });
        roomList.appendChild(li);
    });
});