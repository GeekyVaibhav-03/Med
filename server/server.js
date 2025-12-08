require('dotenv').config(); // load .env if present
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

// MongoDB Connection (for main data)
const connectMongoDB = require('./src/config/mongodb');

const { sequelize } = require('./src/models'); // MySQL for RFID only

// Try to load MongoDB routes, fallback to MySQL if not available
let authRoutes, alertRoutes, usersRoutes, mdrRoutes, dashboardRoutes;
try {
  authRoutes = require('./src/routes/auth-mongo');
  alertRoutes = require('./src/routes/alerts-mongo');
  usersRoutes = require('./src/routes/users-mongo');
  mdrRoutes = require('./src/routes/mdrcases-mongo');
  dashboardRoutes = require('./src/routes/dashboard-mongo');
  console.log('📦 Using MongoDB routes for Auth, Alerts, Users, MDR, Dashboard');
} catch (err) {
  authRoutes = require('./src/routes/auth');
  alertRoutes = require('./src/routes/alerts');
  usersRoutes = require('./src/routes/users');
  mdrRoutes = require('./src/routes/mdrcases');
  dashboardRoutes = require('./src/routes/dashboard');
  console.log('📦 Using MySQL routes (MongoDB not available)');
}

const ingestRoutes = require('./src/routes/ingest');
const contactRoutes = require('./src/routes/contacts');
const mapRoutes = require('./src/routes/map');
const { requireAuth, requireRole } = require('./src/middleware/auth');
const rfidRoutes = require("./src/routes/rfid");

// Lab Report System Routes
const labReportRoutes = require('./src/routes/lab-reports');
const mdrFlagsRoutes = require('./src/routes/mdr-flags');
const notificationsRoutes = require('./src/routes/notifications');

// Try MongoDB patient routes, fallback to Google Sheets
let patientRoutes;
try {
  patientRoutes = require('./src/routes/patients-mongo');
  console.log('📦 Using MongoDB patient routes');
} catch (err) {
  patientRoutes = require('./src/routes/patients');
  console.log('📦 Using Google Sheets patient routes (MongoDB not available)');
}

const { init: initSocket } = require('./src/socket'); // socket initializer

const app = express();

// --- Middlewares ---
app.use(cors({
  origin: ["http://localhost:4000", "http://localhost:4001"],  // ✅ Support both ports
  credentials: true,               // ✅ REQUIRED for login
  methods: ["GET", "POST", "PUT", "DELETE"],
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

// Admin-only user management
app.use('/api/admin/users', requireAuth, requireRole('admin'), usersRoutes);
app.use('/admin/users', requireAuth, requireRole('admin'), usersRoutes);
app.use("/api", rfidRoutes);

// Lab Report System Routes
app.use('/api/lab-reports', labReportRoutes);
app.use('/api/mdr-flags', mdrFlagsRoutes);
app.use('/api/notifications', notificationsRoutes);

// --- Health Check ---
app.get('/', (req, res) => res.json({ 
  ok: true, 
  msg: 'MedWatch Hybrid Backend',
  databases: {
    mongodb: 'Users, Alerts, MDR Cases, Contacts',
    mysql: 'RFID Tracking Data'
  }
}));

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
  
  res.json({ 
    ok: true, 
    databases: health,
    setup: {
      rfid: 'MySQL (Google Sheets)',
      users: 'MongoDB',
      alerts: 'MongoDB',
      mdr_cases: 'MongoDB',
      lab_reports: 'MySQL'
    }
  });
});

// --- HTTP + Socket ---
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocket(server);
app.locals.io = io;

// Initialize WebSocket for notifications
const notificationService = require('./src/services/notificationService');
notificationService.initializeWebSocket(server);

async function start() {
  try {
    // Try to connect to MongoDB first (main database)
    let mongoConnected = false;
    try {
      await connectMongoDB();
      mongoConnected = true;
      console.log('✅ MongoDB connected - Users, Alerts, MDR Cases, Contacts');
    } catch (mongoErr) {
      console.log('⚠️  MongoDB not available, will use MySQL fallback');
    }
    
    // Try to connect to MySQL (RFID tracking) - optional
    let mysqlConnected = false;
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      mysqlConnected = true;
      console.log('✅ MySQL connected - RFID Tracking Data');
    } catch (mysqlErr) {
      console.log('⚠️  MySQL not available - RFID tracking disabled');
      console.log('   Start MySQL with: net start MySQL80 (as admin)');
    }
    
    // Start server even if MySQL is not available
    server.listen(PORT, () => {
      console.log(`\n🚀 MedWatch Server Running on Port ${PORT}`);
      if (mongoConnected && mysqlConnected) {
        console.log(`📊 MongoDB: Users, Alerts, MDR Cases, Contacts`);
        console.log(`📊 MySQL: RFID Tracking Data`);
      } else if (mongoConnected) {
        console.log(`📊 MongoDB: Users, Alerts, MDR Cases, Contacts`);
        console.log(`⚠️  MySQL: Not connected (RFID disabled)`);
      } else if (mysqlConnected) {
        console.log(`📊 MySQL Only: All data (MongoDB not available)`);
      } else {
        console.log(`⚠️  No databases connected - limited functionality`);
      }
      console.log(`🔌 Socket.IO: Ready\n`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

start();
