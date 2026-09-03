// Photobooth Lifmar - Server
// Node + Express untuk serve static + Socket.io untuk room/sinkronisasi + PeerJS untuk signaling video call

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// --- PeerJS signaling server ---
const peerServer = ExpressPeerServer(server, { debug: false });
app.use('/peerjs', peerServer);

// --- Serve static files ---
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Room state ---
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: new Map(), hostId: null });
  }
  return rooms.get(roomId);
}

// --- Socket.io events ---
io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  socket.on('create-room', ({ roomId, username }) => {
    const room = getRoom(roomId);
    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username || 'Guest';

    // Pertama masuk = host
    if (room.users.size === 0) {
      room.hostId = socket.id;
    }
    room.users.set(socket.id, socket.username);

    io.to(roomId).emit('room-update', {
      users: Object.fromEntries(room.users),
      hostId: room.hostId,
      userCount: room.users.size,
    });

    // Beritahu user baru peer id teman
    const peerIds = [...room.users.keys()];
    socket.emit('joined', { hostId: room.hostId, memberCount: room.users.size });
    console.log(`room created/joined: ${roomId} by ${socket.username}`);
  });

  socket.on('join-room', ({ roomId, username }) => {
    const room = getRoom(roomId);
    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username || 'Guest';

    if (room.users.size === 0) {
      room.hostId = socket.id;
    }
    room.users.set(socket.id, socket.username);

    io.to(roomId).emit('room-update', {
      users: Object.fromEntries(room.users),
      hostId: room.hostId,
      userCount: room.users.size,
    });

    const peerIds = [...room.users.keys()];
    socket.emit('joined', { hostId: room.hostId, memberCount: room.users.size, peerIds });
    console.log(`join room: ${roomId} by ${socket.username}`);
  });

  // Daftarkan peer id client agar host bisa memanggil via PeerJS
  socket.on('register-peer', ({ roomId, peerId }) => {
    socket.to(roomId).emit('peer-registered', { peerId, roomId });
  });

  // Sinkronisasi sesi foto (host memulai, partner ikut)
  socket.on('session-start', ({ roomId }) => {
    socket.to(roomId).emit('session-start', { initiator: socket.id });
  });

  socket.on('session-end', ({ roomId }) => {
    socket.to(roomId).emit('session-end', { initiator: socket.id });
  });

  socket.on('shutter', ({ roomId }) => {
    socket.to(roomId).emit('shutter', { initiator: socket.id });
  });

  socket.on('camera-flip', ({ roomId }) => {
    socket.to(roomId).emit('camera-flip', { initiator: socket.id });
  });

  // Sinyal foto diambil untuk preview bareng
  socket.on('photo-taken', ({ roomId, photoIndex, userCount }) => {
    socket.to(roomId).emit('photo-taken', { photoIndex });
  });

  // Ruangan selesai / keluar
  socket.on('leave-room', () => {
    socket.leave(socket.roomId || '');
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.users.delete(socket.id);
        if (room.hostId === socket.id) {
          // Pindahkan host ke user berikutnya jika ada
          const next = room.users.keys().next();
          room.hostId = next.done ? null : next.value;
        }
        io.to(socket.roomId).emit('room-update', {
          users: Object.fromEntries(room.users),
          hostId: room.hostId,
          userCount: room.users.size,
        });
        if (room.users.size === 0) {
          rooms.delete(socket.roomId);
        }
      }
    }
    console.log('user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌷 Photobooth Lifmar berjalan di http://localhost:${PORT}`);
});
