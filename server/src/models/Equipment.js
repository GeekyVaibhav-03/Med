const mongoose = require('mongoose');

// Equipment Schema - Track medical equipment
const EquipmentSchema = new mongoose.Schema({
  equipmentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ventilator', 'iv_pump', 'monitor', 'wheelchair', 'bed', 'stretcher', 'defibrillator', 'xray', 'ultrasound', 'ecg', 'oxygen_concentrator', 'suction_machine', 'infusion_pump', 'other'],
    default: 'other'
  },
  rfidTag: {
    type: String,
    unique: true,
    sparse: true
  },
  bleBeaconId: {
    type: String,
    sparse: true
  },
  currentLocation: {
    zone: String,
    floor: { type: Number, default: 0 },
    room: String,
    x: Number,
    y: Number,
    z: Number
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'cleaning', 'contaminated'],
    default: 'available'
  },
  lastUsedBy: {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    patientName: String,
    usedAt: Date
  },
  lastCleanedAt: Date,
  riskLevel: {
    type: String,
    enum: ['safe', 'low', 'medium', 'high', 'critical'],
    default: 'safe'
  },
  mdrExposure: {
    exposed: { type: Boolean, default: false },
    exposedAt: Date,
    exposedBy: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Equipment Usage Log - Track who used what equipment
const EquipmentUsageSchema = new mongoose.Schema({
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  equipmentName: String,
  equipmentType: String,
  userId: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['patient', 'staff', 'visitor'],
    required: true
  },
  userName: String,
  mdrStatus: {
    type: String,
    enum: ['positive', 'negative', 'suspected', 'unknown'],
    default: 'unknown'
  },
  action: {
    type: String,
    enum: ['start_use', 'end_use', 'proximity', 'cleaning'],
    required: true
  },
  location: {
    zone: String,
    floor: Number,
    room: String
  },
  duration: Number, // in minutes
  timestamp: { type: Date, default: Date.now }
});

// RFID Reader Schema - Fixed readers at locations
const RFIDReaderSchema = new mongoose.Schema({
  readerId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  location: {
    zone: String,
    floor: Number,
    room: String,
    description: String,
    x: Number,
    y: Number,
    z: Number
  },
  type: {
    type: String,
    enum: ['door', 'room', 'zone', 'equipment'],
    default: 'door'
  },
  range: { type: Number, default: 3 }, // meters
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now }
});

// RFID Scan Log - Every time a tag is scanned
const RFIDScanSchema = new mongoose.Schema({
  readerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFIDReader',
    required: true
  },
  readerName: String,
  tagId: {
    type: String,
    required: true
  },
  tagType: {
    type: String,
    enum: ['patient_wristband', 'staff_badge', 'visitor_badge', 'equipment_tag'],
    required: true
  },
  entityId: String, // Patient ID, Staff ID, or Equipment ID
  entityName: String,
  mdrStatus: String,
  location: {
    zone: String,
    floor: Number,
    room: String
  },
  signalStrength: Number, // RSSI value
  timestamp: { type: Date, default: Date.now }
});

// BLE Beacon Schema - Bluetooth beacons for zone detection
const BLEBeaconSchema = new mongoose.Schema({
  beaconId: {
    type: String,
    required: true,
    unique: true
  },
  uuid: String,
  major: Number,
  minor: Number,
  name: String,
  location: {
    zone: String,
    floor: Number,
    room: String,
    description: String,
    x: Number,
    y: Number,
    z: Number
  },
  range: { type: Number, default: 5 }, // meters
  status: {
    type: String,
    enum: ['active', 'inactive', 'low_battery'],
    default: 'active'
  },
  batteryLevel: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

// Proximity Contact Schema - When two tagged entities come close
const ProximityContactSchema = new mongoose.Schema({
  entity1: {
    id: String,
    type: { type: String, enum: ['patient', 'staff', 'visitor', 'equipment'] },
    name: String,
    mdrStatus: String
  },
  entity2: {
    id: String,
    type: { type: String, enum: ['patient', 'staff', 'visitor', 'equipment'] },
    name: String,
    mdrStatus: String
  },
  distance: Number, // estimated distance in meters
  duration: Number, // contact duration in seconds
  location: {
    zone: String,
    floor: Number,
    room: String
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  detectedBy: {
    type: String,
    enum: ['rfid', 'ble', 'uwb', 'manual'],
    default: 'rfid'
  },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  acknowledged: { type: Boolean, default: false }
});

// Zone Entry Log - Track zone entries/exits
const ZoneEntrySchema = new mongoose.Schema({
  entityId: String,
  entityType: {
    type: String,
    enum: ['patient', 'staff', 'visitor', 'equipment']
  },
  entityName: String,
  mdrStatus: String,
  zone: String,
  floor: Number,
  room: String,
  action: {
    type: String,
    enum: ['enter', 'exit']
  },
  detectedBy: {
    readerId: String,
    readerType: String
  },
  timestamp: { type: Date, default: Date.now }
});

const Equipment = mongoose.model('Equipment', EquipmentSchema);
const EquipmentUsage = mongoose.model('EquipmentUsage', EquipmentUsageSchema);
const RFIDReader = mongoose.model('RFIDReader', RFIDReaderSchema);
const RFIDScan = mongoose.model('RFIDScan', RFIDScanSchema);
const BLEBeacon = mongoose.model('BLEBeacon', BLEBeaconSchema);
const ProximityContact = mongoose.model('ProximityContact', ProximityContactSchema);
const ZoneEntry = mongoose.model('ZoneEntry', ZoneEntrySchema);

module.exports = {
  Equipment,
  EquipmentUsage,
  RFIDReader,
  RFIDScan,
  BLEBeacon,
  ProximityContact,
  ZoneEntry
};
