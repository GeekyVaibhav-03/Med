const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const { Patient, Contact } = require('../models/mongodb');

// Your Google Sheet ID
const SHEET_ID = '1i16fwRUX7uVDKPzTKJVYWy0k-ruZy45z37w7eacVWPY';

// ==================== RFID Location Scan Schema ====================
const RFIDLocationScanSchema = new mongoose.Schema({
  uid: { type: String, required: true, index: true },
  point: { type: String, required: true },
  time: { type: Date, required: true },
  rawTime: { type: String }, // Original time string
  syncedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to prevent duplicates
RFIDLocationScanSchema.index({ uid: 1, time: 1, point: 1 }, { unique: true });

const RFIDLocationScan = mongoose.models.RFIDLocationScan || mongoose.model('RFIDLocationScan', RFIDLocationScanSchema);

// ==================== RFID Tag to Patient Mapping ====================
const RFIDTagSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: String,
  type: { type: String, enum: ['patient', 'staff', 'equipment'], default: 'patient' },
  active: { type: Boolean, default: true },
  assignedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const RFIDTag = mongoose.models.RFIDTag || mongoose.model('RFIDTag', RFIDTagSchema);

// ==================== OPTION 1: PUBLIC CSV EXPORT ====================
// Make your Google Sheet public (Share > Anyone with link > Viewer)
// Then use this endpoint to fetch data

// Fetch data from Google Sheet (CSV format)
router.get('/fetch', async (req, res) => {
  try {
    const { sheet = 'Sheet1' } = req.query;
    
    // Google Sheets CSV export URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
    
    console.log('Fetching from:', csvUrl);
    
    const response = await axios.get(csvUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'text/csv'
      }
    });
    
    // Parse CSV
    const rows = parseCSV(response.data);
    
    if (rows.length === 0) {
      return res.json({ ok: true, message: 'No data found', data: [] });
    }
    
    // First row is headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim().toLowerCase().replace(/\s+/g, '_')] = row[i]?.trim() || '';
      });
      return obj;
    });
    
    res.json({
      ok: true,
      message: `Fetched ${data.length} rows from Google Sheet`,
      headers,
      data,
      count: data.length
    });
    
  } catch (error) {
    console.error('Google Sheets fetch error:', error.message);
    res.status(500).json({ 
      error: error.message,
      hint: 'Make sure the Google Sheet is shared as "Anyone with the link can view"'
    });
  }
});

// Sync Google Sheet data to MongoDB
router.post('/sync', async (req, res) => {
  try {
    const { sheet = 'Sheet1', collection = 'rfid_scans', clearExisting = false } = req.body;
    
    // Fetch from Google Sheets
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
    
    const response = await axios.get(csvUrl, {
      timeout: 10000,
      headers: { 'Accept': 'text/csv' }
    });
    
    const rows = parseCSV(response.data);
    
    if (rows.length < 2) {
      return res.json({ ok: false, message: 'No data rows found' });
    }
    
    const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i]?.trim() || '';
      });
      return obj;
    }).filter(row => Object.values(row).some(v => v)); // Remove empty rows
    
    let result = { inserted: 0, updated: 0, errors: [] };
    
    // Auto-detect collection based on headers
    const hasRfidColumns = headers.includes('uid') && (headers.includes('time') || headers.includes('point'));
    
    if (hasRfidColumns || collection === 'rfid_scans') {
      result = await syncRFIDScans(data, clearExisting);
    } else if (collection === 'patients') {
      result = await syncPatients(data, clearExisting);
    } else if (collection === 'contacts') {
      result = await syncContacts(data, clearExisting);
    } else if (collection === 'equipment') {
      result = await syncEquipment(data, clearExisting);
    } else {
      // Generic collection sync
      result = await syncGeneric(collection, data, clearExisting);
    }
    
    // Broadcast update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('sheets:synced', {
        collection,
        count: data.length,
        timestamp: new Date()
      });
    }
    
    res.json({
      ok: true,
      message: `Synced ${data.length} rows to ${collection}`,
      ...result
    });
    
  } catch (error) {
    console.error('Sync error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Auto-sync endpoint (call periodically)
let autoSyncInterval = null;

router.post('/auto-sync/start', async (req, res) => {
  try {
    const { intervalSeconds = 2, sheet = 'Sheet1', collection = 'rfid_scans' } = req.body;
    
    if (autoSyncInterval) {
      return res.json({ ok: true, message: 'Auto-sync already running' });
    }
    
    const io = req.app.get('io');
    
    const syncData = async () => {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
        const response = await axios.get(csvUrl, { timeout: 10000 });
        
        const rows = parseCSV(response.data);
        if (rows.length < 2) return;
        
        const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        const data = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i]?.trim() || '';
          });
          return obj;
        }).filter(row => Object.values(row).some(v => v));
        
        // Use RFID sync by default (based on your sheet structure)
        const result = await syncRFIDScans(data, false);
        
        console.log(`[Auto-Sync] Synced ${data.length} rows:`, result);
        
        // Emit latest locations via Socket.io
        if (io) {
          // Get latest position for each UID
          const latestScans = await RFIDLocationScan.aggregate([
            { $sort: { time: -1 } },
            {
              $group: {
                _id: '$uid',
                uid: { $first: '$uid' },
                point: { $first: '$point' },
                time: { $first: '$time' }
              }
            }
          ]);
          
          io.emit('rfid:locations', {
            locations: latestScans,
            count: latestScans.length,
            timestamp: new Date()
          });
          
          io.emit('sheets:auto-synced', {
            collection: 'rfid_scans',
            count: data.length,
            result,
            timestamp: new Date()
          });
        }
      } catch (err) {
        console.error('[Auto-Sync Error]', err.message);
      }
    };
    
    // Initial sync
    await syncData();
    
    // Set up interval (default 2 seconds)
    autoSyncInterval = setInterval(syncData, intervalSeconds * 1000);
    
    res.json({
      ok: true,
      message: `Auto-sync started every ${intervalSeconds} seconds`,
      sheetId: SHEET_ID,
      sheet,
      collection
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auto-sync/stop', (req, res) => {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
    res.json({ ok: true, message: 'Auto-sync stopped' });
  } else {
    res.json({ ok: true, message: 'No auto-sync running' });
  }
});

router.get('/auto-sync/status', (req, res) => {
  res.json({
    ok: true,
    running: !!autoSyncInterval,
    sheetId: SHEET_ID
  });
});

// ==================== GET LATEST RFID LOCATIONS ====================
router.get('/rfid/latest', async (req, res) => {
  try {
    // Get the latest scan for each unique UID
    const latestScans = await RFIDLocationScan.aggregate([
      { $sort: { time: -1 } },
      {
        $group: {
          _id: '$uid',
          uid: { $first: '$uid' },
          point: { $first: '$point' },
          time: { $first: '$time' },
          rawTime: { $first: '$rawTime' }
        }
      },
      { $sort: { time: -1 } }
    ]);

    // Try to enrich with patient data
    const enriched = await Promise.all(latestScans.map(async (scan) => {
      const tag = await RFIDTag.findOne({ uid: scan.uid });
      return {
        ...scan,
        patientName: tag?.patientName || `Tag ${scan.uid}`,
        type: tag?.type || 'unknown'
      };
    }));

    res.json({ ok: true, locations: enriched, count: enriched.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all RFID scans (paginated)
router.get('/rfid/scans', async (req, res) => {
  try {
    const { limit = 100, offset = 0, uid, point } = req.query;
    
    const filter = {};
    if (uid) filter.uid = uid;
    if (point) filter.point = point;
    
    const scans = await RFIDLocationScan.find(filter)
      .sort({ time: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    const total = await RFIDLocationScan.countDocuments(filter);
    
    // Enrich with patient data
    const enriched = await Promise.all(scans.map(async (scan) => {
      const tag = await RFIDTag.findOne({ uid: scan.uid });
      return {
        ...scan.toObject(),
        patientName: tag?.patientName || `Tag ${scan.uid}`,
        type: tag?.type || 'unknown'
      };
    }));
    
    res.json({ ok: true, scans: enriched, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage RFID Tag to Patient mappings
router.get('/rfid/tags', async (req, res) => {
  try {
    const tags = await RFIDTag.find().sort({ createdAt: -1 });
    res.json({ ok: true, tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rfid/tags', async (req, res) => {
  try {
    const { uid, patientName, patientId, type = 'patient' } = req.body;
    
    const tag = await RFIDTag.findOneAndUpdate(
      { uid },
      { uid, patientName, patientId, type, active: true },
      { upsert: true, new: true }
    );
    
    res.json({ ok: true, tag });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYNC FUNCTIONS ====================

// Sync RFID location scans from Google Sheet
async function syncRFIDScans(data, clearExisting) {
  const result = { inserted: 0, skipped: 0, errors: [] };
  
  if (clearExisting) {
    await RFIDLocationScan.deleteMany({});
  }
  
  for (const row of data) {
    try {
      if (!row.uid || !row.time) {
        result.skipped++;
        continue;
      }
      
      // Parse the time - handle multiple formats
      let parsedTime;
      const timeStr = row.time;
      
      // Try different date formats
      if (timeStr.includes('/')) {
        // Format: DD/MM/YYYY HH:MM:SS or MM/DD/YYYY HH:MM:SS
        const parts = timeStr.split(' ');
        const dateParts = parts[0].split('/');
        const timeParts = parts[1] ? parts[1].split(':') : ['0', '0', '0'];
        
        let day, month, year;
        const first = parseInt(dateParts[0]);
        const second = parseInt(dateParts[1]);
        year = parseInt(dateParts[2]);
        
        // Smart detection: try both formats and pick the one closest to today
        const today = new Date();
        
        // Try DD/MM/YYYY
        const ddmmDate = new Date(year, second - 1, first);
        // Try MM/DD/YYYY  
        const mmddDate = new Date(year, first - 1, second);
        
        // Pick the one that's valid and closest to today
        const ddmmDiff = Math.abs(ddmmDate.getTime() - today.getTime());
        const mmddDiff = Math.abs(mmddDate.getTime() - today.getTime());
        
        if (first > 12) {
          // Must be DD/MM/YYYY (day > 12)
          day = first;
          month = second - 1;
        } else if (second > 12) {
          // Must be MM/DD/YYYY (day > 12)
          month = first - 1;
          day = second;
        } else {
          // Ambiguous - pick the format that gives a date closest to today
          if (ddmmDiff < mmddDiff) {
            day = first;
            month = second - 1;
          } else {
            month = first - 1;
            day = second;
          }
        }
        
        parsedTime = new Date(year, month, day, 
          parseInt(timeParts[0]) || 0, 
          parseInt(timeParts[1]) || 0, 
          parseInt(timeParts[2]) || 0
        );
      } else {
        parsedTime = new Date(timeStr);
      }
      
      if (isNaN(parsedTime.getTime())) {
        parsedTime = new Date(); // Fallback to now
      }
      
      const scanData = {
        uid: row.uid.trim(),
        point: row.point?.trim() || 'Unknown',
        time: parsedTime,
        rawTime: timeStr
      };
      
      // Use upsert to avoid duplicates
      await RFIDLocationScan.findOneAndUpdate(
        { uid: scanData.uid, time: scanData.time, point: scanData.point },
        scanData,
        { upsert: true, new: true }
      );
      
      result.inserted++;
      
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate - skip
        result.skipped++;
      } else {
        result.errors.push({ row, error: err.message });
      }
    }
  }
  
  return result;
}

async function syncPatients(data, clearExisting) {
  const result = { inserted: 0, updated: 0, errors: [] };
  
  if (clearExisting) {
    await Patient.deleteMany({});
  }
  
  for (const row of data) {
    try {
      // Map spreadsheet columns to Patient schema
      const patientData = {
        uid: row.patient_id || row.uid || row.id || `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: row.name || row.patient_name || 'Unknown',
        age: parseInt(row.age) || 0,
        gender: row.gender || row.sex || 'Unknown',
        contact: row.contact || row.phone || row.mobile || '',
        room: row.room || row.room_number || row.bed || '',
        ward: row.ward || row.department || '',
        diagnosis: row.diagnosis || row.condition || '',
        mdrStatus: mapMDRStatus(row.mdr_status || row.mdr || row.status),
        riskLevel: mapRiskLevel(row.risk_level || row.risk || row.priority),
        admissionDate: parseDate(row.admission_date || row.admitted || row.date),
        dischargeDate: parseDate(row.discharge_date || row.discharged),
        isolationStatus: row.isolation === 'true' || row.isolation === 'yes' || row.isolated === 'true',
        notes: row.notes || row.remarks || '',
        // Location tracking
        currentFloor: parseInt(row.floor) || 0,
        zone: row.zone || row.area || 'general',
        location: {
          x: parseFloat(row.x) || 0,
          y: parseFloat(row.y) || 0,
          z: parseFloat(row.z) || 0
        },
        lastSeen: new Date()
      };
      
      // Upsert (update if exists, insert if not)
      const existing = await Patient.findOne({ uid: patientData.uid });
      
      if (existing) {
        await Patient.updateOne({ uid: patientData.uid }, patientData);
        result.updated++;
      } else {
        await Patient.create(patientData);
        result.inserted++;
      }
      
    } catch (err) {
      result.errors.push({ row, error: err.message });
    }
  }
  
  return result;
}

async function syncContacts(data, clearExisting) {
  const result = { inserted: 0, updated: 0, errors: [] };
  
  if (clearExisting) {
    await Contact.deleteMany({});
  }
  
  for (const row of data) {
    try {
      const contactData = {
        sourcePatient: row.source_patient || row.patient_1 || row.from,
        contactPatient: row.contact_patient || row.patient_2 || row.to,
        contactType: row.contact_type || row.type || 'direct',
        duration: parseInt(row.duration) || 0,
        distance: parseFloat(row.distance) || 1,
        location: row.location || row.zone || '',
        riskLevel: mapRiskLevel(row.risk_level || row.risk),
        timestamp: parseDate(row.timestamp || row.date || row.time) || new Date()
      };
      
      await Contact.create(contactData);
      result.inserted++;
      
    } catch (err) {
      result.errors.push({ row, error: err.message });
    }
  }
  
  return result;
}

async function syncEquipment(data, clearExisting) {
  const { Equipment } = require('../models/Equipment');
  const result = { inserted: 0, updated: 0, errors: [] };
  
  if (clearExisting) {
    await Equipment.deleteMany({});
  }
  
  for (const row of data) {
    try {
      const equipmentData = {
        equipmentId: row.equipment_id || row.id || `EQ-${Date.now()}`,
        name: row.name || row.equipment_name || 'Unknown',
        type: row.type || row.equipment_type || 'other',
        rfidTag: row.rfid_tag || row.rfid || '',
        currentLocation: {
          zone: row.zone || row.location || 'general',
          floor: parseInt(row.floor) || 0,
          room: row.room || ''
        },
        status: row.status || 'available',
        riskLevel: mapRiskLevel(row.risk_level || row.risk)
      };
      
      const existing = await Equipment.findOne({ equipmentId: equipmentData.equipmentId });
      
      if (existing) {
        await Equipment.updateOne({ equipmentId: equipmentData.equipmentId }, equipmentData);
        result.updated++;
      } else {
        await Equipment.create(equipmentData);
        result.inserted++;
      }
      
    } catch (err) {
      result.errors.push({ row, error: err.message });
    }
  }
  
  return result;
}

async function syncGeneric(collectionName, data, clearExisting) {
  const mongoose = require('mongoose');
  const result = { inserted: 0, errors: [] };
  
  // Create a dynamic schema
  const schema = new mongoose.Schema({}, { strict: false, timestamps: true });
  const Model = mongoose.models[collectionName] || mongoose.model(collectionName, schema);
  
  if (clearExisting) {
    await Model.deleteMany({});
  }
  
  for (const row of data) {
    try {
      await Model.create(row);
      result.inserted++;
    } catch (err) {
      result.errors.push({ row, error: err.message });
    }
  }
  
  return result;
}

// ==================== HELPER FUNCTIONS ====================

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

function mapMDRStatus(status) {
  if (!status) return 'negative';
  const s = status.toLowerCase();
  if (s.includes('positive') || s === 'yes' || s === 'true' || s === '1' || s === 'mdr+') return 'positive';
  if (s.includes('suspect') || s === 'maybe' || s === 'pending') return 'suspected';
  return 'negative';
}

function mapRiskLevel(risk) {
  if (!risk) return 'low';
  const r = risk.toLowerCase();
  if (r.includes('critical') || r === '4' || r === 'highest') return 'critical';
  if (r.includes('high') || r === '3') return 'high';
  if (r.includes('medium') || r === 'moderate' || r === '2') return 'medium';
  return 'low';
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// ==================== MANUAL DATA ENTRY ====================

// Add single row from frontend
router.post('/add-row', async (req, res) => {
  try {
    const { collection = 'patients', data } = req.body;
    
    if (collection === 'patients') {
      const patient = await Patient.create(data);
      res.json({ ok: true, patient });
    } else {
      res.status(400).json({ error: 'Unsupported collection' });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current sheet config
router.get('/config', (req, res) => {
  res.json({
    ok: true,
    sheetId: SHEET_ID,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}`,
    autoSyncRunning: !!autoSyncInterval,
    expectedColumns: {
      patients: ['patient_id', 'name', 'age', 'gender', 'room', 'ward', 'diagnosis', 'mdr_status', 'risk_level', 'admission_date', 'zone', 'floor'],
      contacts: ['source_patient', 'contact_patient', 'contact_type', 'duration', 'distance', 'location', 'risk_level', 'timestamp'],
      equipment: ['equipment_id', 'name', 'type', 'rfid_tag', 'zone', 'floor', 'room', 'status', 'risk_level']
    }
  });
});

module.exports = router;
module.exports.syncRFIDScans = syncRFIDScans;
