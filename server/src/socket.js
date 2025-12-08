// src/socket.js
let io = null;

function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: "*", // in production, set your frontend origin here
      methods: ["GET","POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // ✅ User joins room based on hospital
    socket.on('join_hospital', (data) => {
      const { hospital, userRole } = data;
      const roomName = `hospital_${hospital}`;
      socket.join(roomName);
      console.log(`✅ User joined room: ${roomName}`);
    });

    // ✅ Listen for MDR alerts and relay to clients
    socket.on('mdr_alert', (data) => {
      console.log('🚨 MDR Alert received:', data);
      // Broadcast to all connected clients
      io.emit('mdr_alert_notification', data);
    });

    // ✅ Subscribe to specific patient notifications
    socket.on('subscribe_patient', (patientUid) => {
      const patientRoom = `patient_${patientUid}`;
      socket.join(patientRoom);
      console.log(`✅ Subscribed to patient: ${patientUid}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

function getIo() {
  if (!io) throw new Error('Socket.io not initialized. Call init(httpServer) first.');
  return io;
}

// ✅ Helper function to emit MDR alerts to specific rooms
function broadcastMDRAlert(hospital, alertData) {
  if (io) {
    const roomName = `hospital_${hospital}`;
    io.to(roomName).emit('mdr_alert_notification', {
      type: 'MDR_ALERT',
      ...alertData
    });
  }
}

module.exports = { init, getIo, broadcastMDRAlert };
