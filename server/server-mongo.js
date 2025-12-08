require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

// MongoDB Connection
const connectMongoDB = require('./src/config/mongodb');

// MySQL Sequelize (keeping for backward compatibility)
const { sequelize } = require('./src/models');

// Routes
const authRoutes = require('./src/routes/auth');
const ingestRoutes = require('./src/routes/ingest');
const patientRoutes = require('./src/routes/patients');
const contactRoutes = require('./src/routes/contacts');
const alertRoutes = require('./src/routes/alerts');
const mapRoutes = require('./src/routes/map');
const mdrRoutes = require('./src/routes/mdrcases');
const dashboardRoutes = require('./src/routes/dashboard');
const rfidRoutes = require("./src/routes/rfid");
const usersRouter = require('./src/routes/users');

// Middleware
const { requireAuth, requireRole } = require('./src/middleware/auth');

// Socket
const { init: initSocket } = require('./src/socket');

const app = express();

// --- Middlewares ---
app.use(cors({
  origin: ["http://localhost:4000", "http://localhost:4001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(morgan('dev'));
app.use(bodyParser.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/mdrcases', requireAuth, requireRole('admin', 'doctor'), mdrRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/admin/users', requireAuth, requireRole('admin'), usersRouter);
app.use('/admin/users', requireAuth, requireRole('admin'), usersRouter);
app.use("/api", rfidRoutes);

// --- Health Check ---
app.get('/', (req, res) => res.json({ 
  ok: true, 
  msg: 'MedWatch backend running',
  databases: {
    mongodb: 'connected',
    mysql: 'connected'
  }
}));

// Database health check
app.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  const health = {
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mysql: 'unknown'
  };
  
  try {
    await sequelize.authenticate();
    health.mysql = 'connected';
  } catch (err) {
    health.mysql = 'disconnected';
  }
  
  res.json({ ok: true, databases: health });
});

// --- HTTP + Socket ---
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocket(server);
app.locals.io = io;

async function start() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Connect to MySQL (for backward compatibility)
    await sequelize.authenticate();
    console.log('✅ MySQL connected');
    await sequelize.sync();
    
    server.listen(PORT, () => {
      console.log(`\n🚀 Server listening on port ${PORT}`);
      console.log(`📊 MongoDB: Connected`);
      console.log(`📊 MySQL: Connected`);
      console.log(`🔌 Socket.IO: Ready\n`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

start();
