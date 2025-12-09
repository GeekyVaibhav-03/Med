require('dotenv').config(); // load .env if present
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

// MongoDB Connection
const connectMongoDB = require('./src/config/mongodb');

// MySQL Sequelize
const { sequelize } = require('./src/models');

// Use MongoDB auth routes
const authRoutes = require('./src/routes/auth-mongo');
const ingestRoutes = require('./src/routes/ingest');
const patientRoutes = require('./src/routes/patients');
const contactRoutes = require('./src/routes/contacts');
const alertRoutes = require('./src/routes/alerts');
const mapRoutes = require('./src/routes/map');
const mdrRoutes = require('./src/routes/mdrcases');
const labReportsRoutes = require('./src/routes/labreports'); // ✅ NEW
const notificationsRoutes = require('./src/routes/notifications'); // ✅ NEW
const { requireAuth, requireRole } = require('./src/middleware/auth');
const rfidRoutes = require("./src/routes/rfid");
const usersRouter = require('./src/routes/users'); // fixed path
const gpsRoutes = require('./src/routes/gps'); // GPS Tracking routes
const equipmentRoutes = require('./src/routes/equipment'); // Equipment Tracking routes
const googleSheetsRoutes = require('./src/routes/googleSheets'); // Google Sheets sync
const predictorRoutes = require('./src/routes/predictor'); // MDR Prediction routes

const { init: initSocket } = require('./src/socket'); // socket initializer

// Auto-sync Google Sheets every 30 seconds
async function startAutoSync(io) {
  // Local parseCSV function
  function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];
      
      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
        currentRow.push(currentCell);
        if (currentRow.some(cell => cell.trim())) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentCell += char;
      }
    }
    
    // Push last row
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      if (currentRow.some(cell => cell.trim())) {
        rows.push(currentRow);
      }
    }
    
    return rows;
  }
  
  const syncInterval = setInterval(async () => {
    try {
      console.log('🔄 Auto-syncing Google Sheets...');

      const axios = require('axios');
      const SHEET_ID = '1i16fwRUX7uVDKPzTKJVYWy0k-ruZy45z37w7eacVWPY';
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;

      const response = await axios.get(csvUrl, {
        timeout: 10000,
        headers: { 'Accept': 'text/csv' }
      });

      const rows = parseCSV(response.data);

      if (rows.length > 1) {
        const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        const data = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i]?.trim() || '';
          });
          return obj;
        }).filter(row => Object.values(row).some(v => v));
        
        if (data.length > 0) {
          // Use the syncRFIDScans function from the routes
          const syncFunction = require('./src/routes/googleSheets').syncRFIDScans;
          const result = await syncFunction(data, false);
          
          if (result.inserted > 0) {
            console.log(`📡 New RFID data synced: ${result.inserted} records`);
            io.emit('sheets:auto-synced', {
              timestamp: new Date(),
              inserted: result.inserted,
              message: 'New RFID data available'
            });
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Auto-sync error:', error.message);
    }
  }, 30000); // Sync every 30 seconds
  
  console.log('🔄 Auto-sync started (every 30 seconds)');
  return syncInterval;
}

const app = express();

// --- Middlewares ---
app.use(cors({
  origin: ["http://localhost:4000", "http://localhost:4001"],  // ✅ Allow both ports
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
app.use('/api/labreports', requireAuth, labReportsRoutes); // ✅ NEW
app.use('/api/notifications', requireAuth, notificationsRoutes); // ✅ NEW

// Admin-only user management
app.use('/api/admin/users', requireAuth, requireRole('admin'), usersRouter);
app.use('/admin/users', requireAuth, requireRole('admin'), usersRouter);
app.use("/api", rfidRoutes);
app.use('/api/gps', gpsRoutes); // GPS Tracking API
app.use('/api/equipment', equipmentRoutes); // Equipment & RFID Tracking API
app.use('/api/sheets', googleSheetsRoutes); // Google Sheets Sync API
app.use('/api/predictor', predictorRoutes); // MDR Prediction API

// --- Health Check ---
app.get('/', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    ok: true,
    msg: 'MedWatch Hybrid Backend',
    databases: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      mysql: 'connected'
    }
  });
});

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

  res.json({ ok: true, ...health });
});// --- HTTP + Socket ---
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = initSocket(server);
app.locals.io = io;

async function start() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Connect to MySQL
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ MySQL Connected');
    
    server.listen(PORT, () => {
      console.log(`\n🚀 MedWatch Hybrid Server Running on Port ${PORT}`);
      console.log(`📊 MongoDB + MySQL Databases Active`);
      console.log(`🔌 Socket.IO: Ready\n`);
      
      // Start automatic Google Sheets syncing
      startAutoSync(io);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
