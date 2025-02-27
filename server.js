const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {}; // Stores room data

// Serve Static Files
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Send active rooms when a user connects
    socket.emit("activeRooms", Object.keys(rooms));

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
            socket.emit("roomJoined", { roomId });
            io.to(roomId).emit("userJoined", { roomId, userId: socket.id });
            updateActiveRooms();
        } else {
            socket.emit("roomNotFound");
        }
    });

    // 🎵 Leave Room (For Hosts & Guests)
    socket.on("leaveRoom", ({ roomId }) => {
        handleLeaveRoom(socket, roomId);
    });

    // 🔹 Handle Disconnections
    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
        Object.keys(rooms).forEach((roomId) => {
            if (io.sockets.adapter.rooms.get(roomId) && io.sockets.adapter.rooms.get(roomId).has(socket.id)) {
                handleLeaveRoom(socket, roomId);
            }
        });
        updateActiveRooms();
    });

    function handleLeaveRoom(socket, roomId) {
        if (!roomId || !rooms[roomId]) {
            console.error(`❌ ERROR: Room ${roomId} not found.`);
            return;
        }

        console.log(`🚪 User ${socket.id} left room: ${roomId}`);
        socket.leave(roomId);
        io.to(roomId).emit("userLeft", { roomId, userId: socket.id });

        if (rooms[roomId].host === socket.id) {
            const remainingUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            if (remainingUsers.length > 0) {
                rooms[roomId].host = remainingUsers[0];
                io.to(roomId).emit("newHost", { roomId, newHost: remainingUsers[0] });
            } else {
                delete rooms[roomId];
            }
        }

        updateActiveRooms();
    }

    function updateActiveRooms() {
        io.emit("activeRooms", Object.keys(rooms));
    }
});

// Start Server
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
