const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {}; // Stores room data

// Serve Static Files
const path = require("path");

// Serve Static Files Correctly
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("New client connected");

    // 🎵 Create Room
    socket.on("createRoom", () => {
        const roomId = Math.random().toString(36).substr(2, 6);
        rooms[roomId] = { 
            bpm: 90, 
            timeSignature: "4/4", 
            host: socket.id, 
            isPlaying: false 
        };
        socket.join(roomId);
        socket.emit("roomCreated", roomId);
        updateActiveRooms();
    });

    // 🎵 Join Room
    socket.on("joinRoom", (roomId) => {
        if (rooms[roomId]) {
            socket.join(roomId);
            socket.emit("roomJoined", rooms[roomId]);
        } else {
            socket.emit("roomNotFound");
        }
    });

    // 🎵 Update BPM & Time Signature (Only Room Host)
    socket.on("updateSettings", ({ roomId, bpm }) => {
        if (rooms[roomId] && rooms[roomId].host === socket.id) {
            rooms[roomId].bpm = bpm;
            io.to(roomId).emit("settingsUpdated", { bpm });
        }
    });

    // 🎵 Start Metronome (Syncs Across All Devices)
    socket.on("metronomeStarted", ({ roomId }) => {
        if (rooms[roomId]) {
            rooms[roomId].isPlaying = true;
            io.to(roomId).emit("metronomeStarted");
        }
    });

    // 🎵 Stop Metronome (Syncs Across All Devices)
    socket.on("metronomeStopped", ({ roomId }) => {
        if (rooms[roomId]) {
            rooms[roomId].isPlaying = false;
            io.to(roomId).emit("metronomeStopped");
        }
    });

// 🎵 Leave Room (User Leaves WebSocket Room)
socket.on("leaveRoom", ({ roomId }) => {
    if (!roomId || !rooms[roomId]) {
        console.error(`❌ ERROR: Room ${roomId} not found.`);
        return;
    }

    console.log(`🚪 User left room: ${roomId}`);

    // Remove user from the WebSocket room
    socket.leave(roomId);

    // If the last person left, delete the room
    if (io.sockets.adapter.rooms.get(roomId) === undefined) {
        delete rooms[roomId];
        console.log(`🗑️ Room ${roomId} deleted (no users left).`);
    }

    updateActiveRooms();
});


    // 🔹 Send Active Rooms to All Clients
    function updateActiveRooms() {
        io.emit("activeRooms", Object.keys(rooms));
    }

    // 🔹 Remove Empty Rooms
    function removeEmptyRooms() {
        for (const room in rooms) {
            if (io.sockets.adapter.rooms.get(room) === undefined) {
                delete rooms[room];
            }
        }
    }
});

// Start Server
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
