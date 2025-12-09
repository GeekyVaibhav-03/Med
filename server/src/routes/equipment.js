const express = require('express');
const router = express.Router();
const {
  Equipment,
  EquipmentUsage,
  RFIDReader,
  RFIDScan,
  BLEBeacon,
  ProximityContact,
  ZoneEntry
} = require('../models/Equipment');

// ==================== EQUIPMENT ROUTES ====================

// Get all equipment
router.get('/', async (req, res) => {
  try {
    const { type, status, floor, zone } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (floor) filter['currentLocation.floor'] = parseInt(floor);
    if (zone) filter['currentLocation.zone'] = zone;
    
    const equipment = await Equipment.find(filter).sort({ updatedAt: -1 });
    res.json({ ok: true, equipment, count: equipment.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new equipment
router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('equipment:added', equipment);
    }
    
    res.status(201).json({ ok: true, equipment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update equipment location (from RFID/BLE scan)
router.put('/:id/location', async (req, res) => {
  try {
    const { zone, floor, room, x, y, z } = req.body;
    
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: { zone, floor, room, x, y, z },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    const io = req.app.get('io');
    if (io) {
      io.emit('equipment:moved', equipment);
    }
    
    res.json({ ok: true, equipment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log equipment usage by patient/staff
router.post('/:id/use', async (req, res) => {
  try {
    const { userId, userType, userName, mdrStatus, action, location, duration } = req.body;
    
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Create usage log
    const usage = new EquipmentUsage({
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      equipmentType: equipment.type,
      userId,
      userType,
      userName,
      mdrStatus,
      action,
      location,
      duration
    });
    await usage.save();
    
    // Update equipment status
    if (action === 'start_use') {
      equipment.status = 'in_use';
      equipment.lastUsedBy = { patientId: userId, patientName: userName, usedAt: new Date() };
      
      // Check if MDR patient - mark equipment as potentially contaminated
      if (mdrStatus === 'positive' || mdrStatus === 'suspected') {
        equipment.riskLevel = 'critical';
        equipment.mdrExposure = { exposed: true, exposedAt: new Date(), exposedBy: userName };
      }
    } else if (action === 'end_use') {
      equipment.status = equipment.mdrExposure?.exposed ? 'contaminated' : 'available';
    } else if (action === 'cleaning') {
      equipment.status = 'available';
      equipment.riskLevel = 'safe';
      equipment.mdrExposure = { exposed: false };
      equipment.lastCleanedAt = new Date();
    }
    
    equipment.updatedAt = new Date();
    await equipment.save();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('equipment:used', { equipment, usage });
      
      // If MDR exposure, emit alert
      if (mdrStatus === 'positive') {
        io.emit('alert:mdr-equipment', {
          type: 'mdr_equipment_exposure',
          message: `Equipment ${equipment.name} used by MDR+ patient ${userName}`,
          equipment: equipment,
          patient: userName,
          timestamp: new Date()
        });
      }
    }
    
    res.json({ ok: true, equipment, usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get equipment usage history
router.get('/:id/history', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const history = await EquipmentUsage.find({ equipmentId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({ ok: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contaminated/at-risk equipment
router.get('/contaminated', async (req, res) => {
  try {
    const equipment = await Equipment.find({
      $or: [
        { status: 'contaminated' },
        { riskLevel: { $in: ['high', 'critical'] } },
        { 'mdrExposure.exposed': true }
      ]
    }).sort({ 'mdrExposure.exposedAt': -1 });
    
    res.json({ ok: true, equipment, count: equipment.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contacts through equipment (who else used same equipment after MDR patient)
router.get('/:id/contacts', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment || !equipment.mdrExposure?.exposed) {
      return res.json({ ok: true, contacts: [], message: 'No MDR exposure on this equipment' });
    }
    
    // Find all usage after MDR exposure
    const contacts = await EquipmentUsage.find({
      equipmentId: req.params.id,
      timestamp: { $gte: equipment.mdrExposure.exposedAt },
      mdrStatus: { $ne: 'positive' } // Exclude the MDR patient themselves
    }).sort({ timestamp: 1 });
    
    res.json({
      ok: true,
      equipment: equipment.name,
      exposedBy: equipment.mdrExposure.exposedBy,
      exposedAt: equipment.mdrExposure.exposedAt,
      contacts,
      contactCount: contacts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RFID ROUTES ====================

// Get all RFID readers
router.get('/rfid/readers', async (req, res) => {
  try {
    const readers = await RFIDReader.find({ status: 'active' });
    res.json({ ok: true, readers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add RFID reader
router.post('/rfid/readers', async (req, res) => {
  try {
    const reader = new RFIDReader(req.body);
    await reader.save();
    res.status(201).json({ ok: true, reader });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log RFID scan (main endpoint for RFID data ingestion)
router.post('/rfid/scan', async (req, res) => {
  try {
    const { readerId, tagId, tagType, entityId, entityName, mdrStatus, signalStrength } = req.body;
    
    const reader = await RFIDReader.findOne({ readerId });
    if (!reader) {
      return res.status(404).json({ error: 'RFID Reader not found' });
    }
    
    const scan = new RFIDScan({
      readerId: reader._id,
      readerName: reader.name,
      tagId,
      tagType,
      entityId,
      entityName,
      mdrStatus,
      location: reader.location,
      signalStrength
    });
    await scan.save();
    
    // Log zone entry
    const lastEntry = await ZoneEntry.findOne({ 
      entityId, 
      zone: reader.location.zone 
    }).sort({ timestamp: -1 });
    
    const isNewEntry = !lastEntry || 
      (Date.now() - lastEntry.timestamp.getTime() > 60000) || // More than 1 min since last scan
      lastEntry.action === 'exit';
    
    if (isNewEntry) {
      const entry = new ZoneEntry({
        entityId,
        entityType: tagType.replace('_wristband', '').replace('_badge', '').replace('_tag', ''),
        entityName,
        mdrStatus,
        zone: reader.location.zone,
        floor: reader.location.floor,
        room: reader.location.room,
        action: 'enter',
        detectedBy: { readerId: reader.readerId, readerType: reader.type }
      });
      await entry.save();
    }
    
    const io = req.app.get('io');
    if (io) {
      io.emit('rfid:scan', {
        scan,
        reader: reader.location,
        entity: { id: entityId, name: entityName, type: tagType, mdrStatus }
      });
      
      // Alert if MDR+ patient enters new zone
      if (mdrStatus === 'positive' && isNewEntry) {
        io.emit('alert:mdr-zone-entry', {
          type: 'mdr_zone_entry',
          message: `MDR+ patient ${entityName} entered ${reader.location.zone}`,
          zone: reader.location.zone,
          floor: reader.location.floor,
          patient: entityName,
          timestamp: new Date()
        });
      }
    }
    
    res.json({ ok: true, scan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent scans
router.get('/rfid/scans', async (req, res) => {
  try {
    const { limit = 100, zone, floor, tagType } = req.query;
    const filter = {};
    
    if (zone) filter['location.zone'] = zone;
    if (floor) filter['location.floor'] = parseInt(floor);
    if (tagType) filter.tagType = tagType;
    
    const scans = await RFIDScan.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({ ok: true, scans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BLE BEACON ROUTES ====================

// Get all BLE beacons
router.get('/ble/beacons', async (req, res) => {
  try {
    const beacons = await BLEBeacon.find({ status: 'active' });
    res.json({ ok: true, beacons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add BLE beacon
router.post('/ble/beacons', async (req, res) => {
  try {
    const beacon = new BLEBeacon(req.body);
    await beacon.save();
    res.status(201).json({ ok: true, beacon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROXIMITY CONTACT ROUTES ====================

// Log proximity contact between two entities
router.post('/proximity', async (req, res) => {
  try {
    const { entity1, entity2, distance, duration, location, detectedBy } = req.body;
    
    // Calculate risk level
    let riskLevel = 'low';
    if (entity1.mdrStatus === 'positive' || entity2.mdrStatus === 'positive') {
      if (distance < 1) riskLevel = 'critical';
      else if (distance < 2) riskLevel = 'high';
      else if (distance < 3) riskLevel = 'medium';
    }
    
    const contact = new ProximityContact({
      entity1,
      entity2,
      distance,
      duration,
      location,
      riskLevel,
      detectedBy
    });
    await contact.save();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('proximity:contact', contact);
      
      // Alert for high-risk proximity
      if (riskLevel === 'critical' || riskLevel === 'high') {
        io.emit('alert:proximity', {
          type: 'mdr_proximity',
          message: `Close contact detected: ${entity1.name} ↔ ${entity2.name} (${distance}m)`,
          riskLevel,
          contact,
          timestamp: new Date()
        });
      }
    }
    
    res.json({ ok: true, contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get proximity contacts for an entity
router.get('/proximity/:entityId', async (req, res) => {
  try {
    const { entityId } = req.params;
    const { limit = 50, riskLevel } = req.query;
    
    const filter = {
      $or: [
        { 'entity1.id': entityId },
        { 'entity2.id': entityId }
      ]
    };
    
    if (riskLevel) filter.riskLevel = riskLevel;
    
    const contacts = await ProximityContact.find(filter)
      .sort({ startTime: -1 })
      .limit(parseInt(limit));
    
    res.json({ ok: true, contacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all high-risk contacts
router.get('/proximity/risk/high', async (req, res) => {
  try {
    const contacts = await ProximityContact.find({
      riskLevel: { $in: ['high', 'critical'] },
      acknowledged: false
    }).sort({ startTime: -1 });
    
    res.json({ ok: true, contacts, count: contacts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ZONE ENTRY ROUTES ====================

// Get zone entries
router.get('/zones/entries', async (req, res) => {
  try {
    const { zone, floor, entityType, limit = 100 } = req.query;
    const filter = {};
    
    if (zone) filter.zone = zone;
    if (floor) filter.floor = parseInt(floor);
    if (entityType) filter.entityType = entityType;
    
    const entries = await ZoneEntry.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({ ok: true, entries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current occupants of a zone
router.get('/zones/:zone/occupants', async (req, res) => {
  try {
    const { zone } = req.params;
    
    // Get latest entry/exit for each entity in this zone
    const pipeline = [
      { $match: { zone } },
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: '$entityId',
        entityName: { $first: '$entityName' },
        entityType: { $first: '$entityType' },
        mdrStatus: { $first: '$mdrStatus' },
        action: { $first: '$action' },
        timestamp: { $first: '$timestamp' }
      }},
      { $match: { action: 'enter' } } // Only those who entered and haven't exited
    ];
    
    const occupants = await ZoneEntry.aggregate(pipeline);
    
    res.json({ ok: true, zone, occupants, count: occupants.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SIMULATION / SEED DATA ====================

// Initialize default equipment and readers
router.post('/init', async (req, res) => {
  try {
    // Clear existing data
    await Equipment.deleteMany({});
    await RFIDReader.deleteMany({});
    await BLEBeacon.deleteMany({});
    
    // Create default equipment
    const equipmentList = [
      { equipmentId: 'EQ-VEN-001', name: 'Ventilator A1', type: 'ventilator', rfidTag: 'RFID-EQ-001', currentLocation: { zone: 'icu', floor: 2, room: 'ICU-1' } },
      { equipmentId: 'EQ-VEN-002', name: 'Ventilator A2', type: 'ventilator', rfidTag: 'RFID-EQ-002', currentLocation: { zone: 'icu', floor: 2, room: 'ICU-2' } },
      { equipmentId: 'EQ-IVP-001', name: 'IV Pump 1', type: 'iv_pump', rfidTag: 'RFID-EQ-003', currentLocation: { zone: 'general', floor: 1, room: '101' } },
      { equipmentId: 'EQ-IVP-002', name: 'IV Pump 2', type: 'iv_pump', rfidTag: 'RFID-EQ-004', currentLocation: { zone: 'general', floor: 1, room: '102' } },
      { equipmentId: 'EQ-MON-001', name: 'Patient Monitor 1', type: 'monitor', rfidTag: 'RFID-EQ-005', currentLocation: { zone: 'emergency', floor: 0, room: 'ER-1' } },
      { equipmentId: 'EQ-MON-002', name: 'Patient Monitor 2', type: 'monitor', rfidTag: 'RFID-EQ-006', currentLocation: { zone: 'emergency', floor: 0, room: 'ER-2' } },
      { equipmentId: 'EQ-WCH-001', name: 'Wheelchair 1', type: 'wheelchair', rfidTag: 'RFID-EQ-007', currentLocation: { zone: 'lobby', floor: 0, room: 'LOBBY' } },
      { equipmentId: 'EQ-WCH-002', name: 'Wheelchair 2', type: 'wheelchair', rfidTag: 'RFID-EQ-008', currentLocation: { zone: 'lobby', floor: 0, room: 'LOBBY' } },
      { equipmentId: 'EQ-BED-001', name: 'Smart Bed ICU-1', type: 'bed', rfidTag: 'RFID-EQ-009', currentLocation: { zone: 'icu', floor: 2, room: 'ICU-1' } },
      { equipmentId: 'EQ-BED-002', name: 'Smart Bed ICU-2', type: 'bed', rfidTag: 'RFID-EQ-010', currentLocation: { zone: 'icu', floor: 2, room: 'ICU-2' } },
      { equipmentId: 'EQ-DEF-001', name: 'Defibrillator 1', type: 'defibrillator', rfidTag: 'RFID-EQ-011', currentLocation: { zone: 'emergency', floor: 0, room: 'ER-1' } },
      { equipmentId: 'EQ-ECG-001', name: 'ECG Machine 1', type: 'ecg', rfidTag: 'RFID-EQ-012', currentLocation: { zone: 'emergency', floor: 0, room: 'ER-1' } },
      { equipmentId: 'EQ-OXY-001', name: 'Oxygen Concentrator 1', type: 'oxygen_concentrator', rfidTag: 'RFID-EQ-013', currentLocation: { zone: 'icu', floor: 2, room: 'ICU-3' } },
      { equipmentId: 'EQ-STR-001', name: 'Stretcher 1', type: 'stretcher', rfidTag: 'RFID-EQ-014', currentLocation: { zone: 'emergency', floor: 0, room: 'ER-1' } },
      { equipmentId: 'EQ-XRY-001', name: 'Portable X-Ray', type: 'xray', rfidTag: 'RFID-EQ-015', currentLocation: { zone: 'surgery', floor: 3, room: 'OR-1' } },
    ];
    
    await Equipment.insertMany(equipmentList);
    
    // Create RFID readers at key locations
    const readerList = [
      { readerId: 'RDR-ER-DOOR', name: 'ER Main Entrance', location: { zone: 'emergency', floor: 0, room: 'ER-ENTRANCE', description: 'Emergency Room Main Door' }, type: 'door' },
      { readerId: 'RDR-ER-1', name: 'ER Bay 1', location: { zone: 'emergency', floor: 0, room: 'ER-1' }, type: 'room' },
      { readerId: 'RDR-ER-2', name: 'ER Bay 2', location: { zone: 'emergency', floor: 0, room: 'ER-2' }, type: 'room' },
      { readerId: 'RDR-LOBBY', name: 'Main Lobby', location: { zone: 'lobby', floor: 0, room: 'LOBBY' }, type: 'zone' },
      { readerId: 'RDR-ELEV-0', name: 'Elevator Ground', location: { zone: 'elevator', floor: 0, room: 'ELEVATOR' }, type: 'door' },
      { readerId: 'RDR-GEN-101', name: 'Room 101', location: { zone: 'general', floor: 1, room: '101' }, type: 'room' },
      { readerId: 'RDR-GEN-102', name: 'Room 102', location: { zone: 'general', floor: 1, room: '102' }, type: 'room' },
      { readerId: 'RDR-GEN-103', name: 'Room 103', location: { zone: 'general', floor: 1, room: '103' }, type: 'room' },
      { readerId: 'RDR-NS-1', name: 'Nurse Station F1', location: { zone: 'general', floor: 1, room: 'NS-1' }, type: 'zone' },
      { readerId: 'RDR-ICU-DOOR', name: 'ICU Entrance', location: { zone: 'icu', floor: 2, room: 'ICU-ENTRANCE' }, type: 'door' },
      { readerId: 'RDR-ICU-1', name: 'ICU Bay 1', location: { zone: 'icu', floor: 2, room: 'ICU-1' }, type: 'room' },
      { readerId: 'RDR-ICU-2', name: 'ICU Bay 2', location: { zone: 'icu', floor: 2, room: 'ICU-2' }, type: 'room' },
      { readerId: 'RDR-ICU-3', name: 'ICU Bay 3', location: { zone: 'icu', floor: 2, room: 'ICU-3' }, type: 'room' },
      { readerId: 'RDR-SURG-DOOR', name: 'Surgery Entrance', location: { zone: 'surgery', floor: 3, room: 'SURG-ENTRANCE' }, type: 'door' },
      { readerId: 'RDR-OR-1', name: 'OR 1', location: { zone: 'surgery', floor: 3, room: 'OR-1' }, type: 'room' },
      { readerId: 'RDR-OR-2', name: 'OR 2', location: { zone: 'surgery', floor: 3, room: 'OR-2' }, type: 'room' },
    ];
    
    await RFIDReader.insertMany(readerList);
    
    // Create BLE beacons
    const beaconList = [
      { beaconId: 'BLE-ER-1', uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825', major: 1, minor: 1, name: 'ER Zone Beacon', location: { zone: 'emergency', floor: 0 } },
      { beaconId: 'BLE-GEN-1', uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825', major: 1, minor: 2, name: 'General Ward Beacon', location: { zone: 'general', floor: 1 } },
      { beaconId: 'BLE-ICU-1', uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825', major: 2, minor: 1, name: 'ICU Zone Beacon', location: { zone: 'icu', floor: 2 } },
      { beaconId: 'BLE-SURG-1', uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825', major: 3, minor: 1, name: 'Surgery Zone Beacon', location: { zone: 'surgery', floor: 3 } },
    ];
    
    await BLEBeacon.insertMany(beaconList);
    
    res.json({
      ok: true,
      message: 'Equipment tracking system initialized',
      equipment: equipmentList.length,
      readers: readerList.length,
      beacons: beaconList.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate equipment usage and contact tracing
let simulationInterval = null;

router.post('/simulate/start', async (req, res) => {
  try {
    if (simulationInterval) {
      return res.json({ ok: true, message: 'Simulation already running' });
    }
    
    const io = req.app.get('io');
    
    // Get all equipment and patients
    const equipment = await Equipment.find({});
    const { Patient } = require('../models/mongodb');
    const patients = await Patient.find({}).lean();
    
    if (patients.length === 0) {
      return res.status(400).json({ error: 'No patients in database to simulate' });
    }
    
    const zones = ['emergency', 'general', 'icu', 'surgery'];
    const rooms = {
      emergency: ['ER-1', 'ER-2'],
      general: ['101', '102', '103', '104', '105'],
      icu: ['ICU-1', 'ICU-2', 'ICU-3'],
      surgery: ['OR-1', 'OR-2', 'OR-3', 'RECOV']
    };
    
    simulationInterval = setInterval(async () => {
      // Randomly select a patient and equipment
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const eq = equipment[Math.floor(Math.random() * equipment.length)];
      
      if (!patient || !eq) return;
      
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const room = rooms[zone][Math.floor(Math.random() * rooms[zone].length)];
      const floor = zone === 'emergency' ? 0 : zone === 'general' ? 1 : zone === 'icu' ? 2 : 3;
      
      // Simulate RFID scan
      const readers = await RFIDReader.find({ 'location.zone': zone });
      if (readers.length > 0) {
        const reader = readers[Math.floor(Math.random() * readers.length)];
        
        const scan = new RFIDScan({
          readerId: reader._id,
          readerName: reader.name,
          tagId: `RFID-PAT-${patient.uid || patient._id}`,
          tagType: 'patient_wristband',
          entityId: patient._id.toString(),
          entityName: patient.name,
          mdrStatus: patient.mdrStatus || 'negative',
          location: reader.location,
          signalStrength: -40 - Math.floor(Math.random() * 30)
        });
        await scan.save();
        
        if (io) {
          io.emit('rfid:scan', {
            scan,
            reader: reader.location,
            entity: { id: patient._id, name: patient.name, mdrStatus: patient.mdrStatus }
          });
        }
      }
      
      // Simulate equipment usage
      if (Math.random() > 0.7) {
        const usage = new EquipmentUsage({
          equipmentId: eq._id,
          equipmentName: eq.name,
          equipmentType: eq.type,
          userId: patient._id.toString(),
          userType: 'patient',
          userName: patient.name,
          mdrStatus: patient.mdrStatus || 'negative',
          action: 'start_use',
          location: { zone, floor, room }
        });
        await usage.save();
        
        // Update equipment
        eq.lastUsedBy = { patientId: patient._id, patientName: patient.name, usedAt: new Date() };
        if (patient.mdrStatus === 'positive') {
          eq.riskLevel = 'critical';
          eq.mdrExposure = { exposed: true, exposedAt: new Date(), exposedBy: patient.name };
          eq.status = 'contaminated';
        } else {
          eq.status = 'in_use';
        }
        await eq.save();
        
        if (io) {
          io.emit('equipment:used', { equipment: eq, usage, patient: patient.name });
          
          if (patient.mdrStatus === 'positive') {
            io.emit('alert:mdr-equipment', {
              type: 'mdr_equipment_exposure',
              severity: 'critical',
              message: `⚠️ MDR+ patient ${patient.name} used ${eq.name}`,
              equipment: eq,
              patient: patient.name,
              zone,
              room,
              timestamp: new Date()
            });
          }
        }
      }
      
      // Simulate proximity contact
      if (Math.random() > 0.8 && patients.length > 1) {
        const otherPatient = patients.filter(p => p._id.toString() !== patient._id.toString())[
          Math.floor(Math.random() * (patients.length - 1))
        ];
        
        if (otherPatient) {
          const distance = 0.5 + Math.random() * 2.5;
          let riskLevel = 'low';
          if (patient.mdrStatus === 'positive' || otherPatient.mdrStatus === 'positive') {
            riskLevel = distance < 1 ? 'critical' : distance < 2 ? 'high' : 'medium';
          }
          
          const contact = new ProximityContact({
            entity1: { id: patient._id.toString(), type: 'patient', name: patient.name, mdrStatus: patient.mdrStatus },
            entity2: { id: otherPatient._id.toString(), type: 'patient', name: otherPatient.name, mdrStatus: otherPatient.mdrStatus },
            distance: parseFloat(distance.toFixed(2)),
            duration: 30 + Math.floor(Math.random() * 300),
            location: { zone, floor, room },
            riskLevel,
            detectedBy: 'ble'
          });
          await contact.save();
          
          if (io) {
            io.emit('proximity:contact', contact);
            
            if (riskLevel === 'critical' || riskLevel === 'high') {
              io.emit('alert:proximity', {
                type: 'mdr_proximity',
                severity: riskLevel,
                message: `🔴 Close contact: ${patient.name} ↔ ${otherPatient.name} (${distance.toFixed(1)}m)`,
                contact,
                timestamp: new Date()
              });
            }
          }
        }
      }
      
    }, 2000); // Every 2 seconds
    
    res.json({ ok: true, message: 'Equipment simulation started', interval: '2 seconds' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/simulate/stop', (req, res) => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    res.json({ ok: true, message: 'Simulation stopped' });
  } else {
    res.json({ ok: true, message: 'No simulation running' });
  }
});

router.get('/simulate/status', (req, res) => {
  res.json({ ok: true, running: !!simulationInterval });
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalEquipment = await Equipment.countDocuments();
    const inUse = await Equipment.countDocuments({ status: 'in_use' });
    const contaminated = await Equipment.countDocuments({ status: 'contaminated' });
    const available = await Equipment.countDocuments({ status: 'available' });
    
    const activeReaders = await RFIDReader.countDocuments({ status: 'active' });
    const activeBeacons = await BLEBeacon.countDocuments({ status: 'active' });
    
    const recentScans = await RFIDScan.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 3600000) } // Last hour
    });
    
    const highRiskContacts = await ProximityContact.countDocuments({
      riskLevel: { $in: ['high', 'critical'] },
      acknowledged: false
    });
    
    res.json({
      ok: true,
      stats: {
        equipment: { total: totalEquipment, inUse, contaminated, available },
        infrastructure: { readers: activeReaders, beacons: activeBeacons },
        activity: { recentScans, highRiskContacts }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
