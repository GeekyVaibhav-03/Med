require('dotenv').config(); // load .env if present
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

const { sequelize } = require('./src/models'); // Sequelize instance
const authRoutes = require('./src/routes/auth');
const ingestRoutes = require('./src/routes/ingest');
const patientRoutes = require('./src/routes/patients');
const contactRoutes = require('./src/routes/contacts');
const alertRoutes = require('./src/routes/alerts');
const mapRoutes = require('./src/routes/map');
const mdrRoutes = require('./src/routes/mdrcases');
const { requireAuth, requireRole } = require('./src/middleware/auth');
const rfidRoutes = require("./src/routes/rfid");
const usersRouter = require('./src/routes/users'); // fixed path

const { init: initSocket } = require('./src/socket'); // socket initializer

const app = express();

// --- Middlewares ---
app.use(cors({
  origin: "http://localhost:4000",  // ✅ EXACT frontend URL
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

// Admin-only user management
app.use('/api/admin/users', requireAuth, requireRole('admin'), usersRouter);
app.use('/admin/users', requireAuth, requireRole('admin'), usersRouter);
app.use("/api", rfidRoutes);

// --- Health Check ---
app.get('/', (req, res) => res.json({ ok: true, msg: 'MedWatch backend running' }));

// --- HTTP + Socket ---
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocket(server);
app.locals.io = io;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.sync(); // careful in prod: use migrations
    server.listen(PORT, () => console.log('Server + Socket listening on', PORT));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
