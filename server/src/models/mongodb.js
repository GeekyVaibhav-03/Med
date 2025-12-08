const mongoose = require('mongoose');

// Hospital Schema
const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  address: String,
  city: String,
  state: String,
  country: { type: String, default: 'India' },
  phone: String,
  email: String,
  capacity: { type: Number, default: 0 },
  type: { type: String, enum: ['government', 'private', 'military', 'research'], default: 'government' },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }
}, { timestamps: true });

// Department Schema
const departmentSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  floor: Number,
  headDoctorUid: String,
  capacity: { type: Number, default: 0 },
  type: { 
    type: String, 
    enum: ['emergency', 'icu', 'general', 'surgery', 'pediatrics', 'cardiology', 'neurology', 'oncology', 'other'],
    default: 'general' 
  },
  status: { type: String, enum: ['active', 'inactive', 'quarantine'], default: 'active' }
}, { timestamps: true });

// Room Schema
const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  name: String,
  type: { 
    type: String,
    enum: ['patient_room', 'icu', 'operation_theater', 'lab', 'pharmacy', 'waiting_area', 'corridor', 'storage', 'staff_room', 'other'],
    default: 'patient_room'
  },
  capacity: { type: Number, default: 1 },
  currentOccupancy: { type: Number, default: 0 },
  floor: Number,
  wing: String,
  isolationLevel: { 
    type: String,
    enum: ['none', 'standard', 'contact', 'droplet', 'airborne'],
    default: 'none'
  },
  status: { 
    type: String,
    enum: ['available', 'occupied', 'cleaning', 'maintenance', 'quarantine'],
    default: 'available'
  },
  lastCleaned: Date
}, { timestamps: true });

roomSchema.index({ roomNumber: 1, departmentId: 1 }, { unique: true });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String,
    enum: ['admin', 'doctor', 'nurse', 'staff', 'patient', 'visitor', 'pharmacist', 'lab_tech', 'security'],
    required: true,
    default: 'staff'
  },
  email: { type: String, unique: true, sparse: true },
  phone: String,
  hospital: String,
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  fullName: String,
  employeeId: String,
  specialization: String,
  licenseNumber: String,
  active: { type: Boolean, default: true },
  lastLogin: Date,
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: Date
}, { timestamps: true });

// Patient Schema
const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  fatherHusbandName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  aadharNumber: { type: String, required: true, unique: true },
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'discharged', 'critical'], default: 'active' },
  mdrStatus: { type: String, enum: ['negative', 'positive', 'pending'], default: 'negative' },
  hospital: { type: String, default: 'myhospital' },
  ward: String,
  bedNumber: String,
  rfidTag: String,
  mdrDetails: {
    diagnosisDate: Date,
    organism: String,
    resistancePattern: String,
    isolationRequired: { type: Boolean, default: false },
    contactTracingInitiated: { type: Boolean, default: false },
    treatmentStarted: Date,
    notes: String
  }
}, { timestamps: true });

// Person Schema (RFID tracked individuals)
const personSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profile: { 
    type: String,
    enum: ['doctor', 'nurse', 'patient', 'visitor', 'staff', 'pharmacist', 'lab_tech', 'security', 'admin'],
    required: true
  },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: String,
  contactNumber: String,
  emergencyContact: String,
  address: String,
  admissionDate: Date,
  dischargeDate: Date,
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  healthStatus: { 
    type: String,
    enum: ['healthy', 'stable', 'critical', 'infected', 'recovered', 'deceased'],
    default: 'healthy'
  },
  notes: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Raw Event Schema (RFID tracking)
const rawEventSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  profile: String,
  room: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  eventType: { type: String, enum: ['entry', 'exit', 'movement'], default: 'entry' },
  entryTime: Date,
  exitTime: Date,
  durationMinutes: Number,
  status: String,
  purpose: String,
  temperature: Number,
  maskCompliance: Boolean,
  sanitizationDone: Boolean,
  notes: String
}, { timestamps: true });

rawEventSchema.index({ uid: 1, entryTime: -1 });
rawEventSchema.index({ room: 1, entryTime: -1 });

// Contact Edge Schema (Contact tracing)
const contactEdgeSchema = new mongoose.Schema({
  personAUid: { type: String, required: true },
  personBUid: { type: String, required: true },
  room: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  overlapStart: { type: Date, required: true },
  overlapEnd: { type: Date, required: true },
  durationMinutes: Number,
  weight: { type: Number, default: 1.0 },
  distanceEstimate: { type: String, enum: ['close', 'moderate', 'far'], default: 'moderate' },
  contactType: { type: String, enum: ['direct', 'indirect', 'surface'], default: 'direct' },
  riskScore: { type: Number, default: 0.0 }
}, { timestamps: true });

contactEdgeSchema.index({ personAUid: 1, personBUid: 1 });
contactEdgeSchema.index({ room: 1 });
contactEdgeSchema.index({ overlapStart: 1, overlapEnd: 1 });

// MDR Case Schema
const mdrCaseSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  organism: { type: String, required: true },
  infectionType: String,
  detectedAt: { type: Date, default: Date.now },
  sampleDate: Date,
  labReportNumber: String,
  severity: { type: String, enum: ['mild', 'moderate', 'severe', 'critical'], default: 'moderate' },
  status: { type: String, enum: ['active', 'treated', 'monitoring', 'resolved', 'fatal'], default: 'active' },
  isolationRequired: { type: Boolean, default: true },
  treatmentPlan: String,
  antibioticsResistant: [String],
  sourceLocation: String,
  notes: String,
  resolvedAt: Date
}, { timestamps: true });

mdrCaseSchema.index({ uid: 1 });
mdrCaseSchema.index({ detectedAt: -1 });
mdrCaseSchema.index({ status: 1 });

// Contact Trace Schema
const contactTraceSchema = new mongoose.Schema({
  mdrCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'MdrCase', required: true },
  sourceUid: { type: String, required: true },
  contactUid: { type: String, required: true },
  contactLevel: { type: Number, default: 1 },
  contactDate: Date,
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  notificationSent: { type: Boolean, default: false },
  tested: { type: Boolean, default: false },
  testResult: { type: String, enum: ['negative', 'positive', 'pending', 'not_tested'], default: 'not_tested' },
  quarantineRequired: { type: Boolean, default: false },
  quarantineStart: Date,
  quarantineEnd: Date,
  notes: String
}, { timestamps: true });

contactTraceSchema.index({ mdrCaseId: 1 });
contactTraceSchema.index({ contactUid: 1 });

// Alert Schema
const alertSchema = new mongoose.Schema({
  type: { 
    type: String,
    enum: ['general', 'critical', 'warning', 'info', 'mdr_detection', 'contact_trace', 'equipment', 'system'],
    default: 'general'
  },
  message: { type: String, required: true },
  priority: { type: Number, default: 1 },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  targetUid: String,
  targetRole: { type: String, enum: ['admin', 'doctor', 'nurse', 'staff', 'all'] },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  relatedCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'MdrCase' },
  actionRequired: { type: Boolean, default: false },
  actionTaken: String,
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  read: { type: Boolean, default: false },
  readBy: [String],
  expiresAt: Date
}, { timestamps: true });

alertSchema.index({ type: 1 });
alertSchema.index({ resolved: 1 });
alertSchema.index({ createdAt: -1 });

// Patient Visit Schema
const patientVisitSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  visitType: { 
    type: String,
    enum: ['outpatient', 'inpatient', 'emergency', 'surgery', 'follow_up'],
    default: 'outpatient'
  },
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: Date,
  reason: String,
  diagnosis: String,
  treatment: String,
  doctorUid: String,
  status: { type: String, enum: ['active', 'discharged', 'transferred', 'deceased'], default: 'active' }
}, { timestamps: true });

patientVisitSchema.index({ personId: 1 });
patientVisitSchema.index({ hospitalId: 1 });
patientVisitSchema.index({ admissionDate: 1, dischargeDate: 1 });

// Infection Report Schema
const infectionReportSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  reportDate: { type: Date, required: true },
  totalCases: { type: Number, default: 0 },
  newCases: { type: Number, default: 0 },
  activeCases: { type: Number, default: 0 },
  resolvedCases: { type: Number, default: 0 },
  fatalCases: { type: Number, default: 0 },
  infectionRate: Number,
  mostCommonOrganism: String,
  highRiskAreas: [String],
  recommendations: String
}, { timestamps: true });

infectionReportSchema.index({ reportDate: -1 });
infectionReportSchema.index({ hospitalId: 1 });

// Room Assignment Schema
const roomAssignmentSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  assignedAt: { type: Date, default: Date.now },
  releasedAt: Date,
  bedNumber: String,
  assignmentType: { 
    type: String,
    enum: ['temporary', 'permanent', 'isolation', 'observation'],
    default: 'temporary'
  },
  status: { type: String, enum: ['active', 'completed', 'transferred'], default: 'active' },
  notes: String
}, { timestamps: true });

roomAssignmentSchema.index({ personId: 1 });
roomAssignmentSchema.index({ roomId: 1 });

// Equipment Check Schema
const equipmentCheckSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  equipmentType: { type: String, required: true },
  equipmentId: String,
  checkType: { 
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'maintenance', 'repair'],
    default: 'daily'
  },
  status: { 
    type: String,
    enum: ['operational', 'needs_attention', 'out_of_service', 'under_maintenance'],
    default: 'operational'
  },
  checkedByUid: String,
  checkedAt: { type: Date, default: Date.now },
  nextCheckDate: Date,
  issuesFound: String,
  actionsTaken: String,
  notes: String
}, { timestamps: true });

equipmentCheckSchema.index({ roomId: 1 });
equipmentCheckSchema.index({ checkedAt: -1 });

// Create Models
const Hospital = mongoose.model('Hospital', hospitalSchema);
const Department = mongoose.model('Department', departmentSchema);
const Room = mongoose.model('Room', roomSchema);
const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Person = mongoose.model('Person', personSchema);
const RawEvent = mongoose.model('RawEvent', rawEventSchema);
const ContactEdge = mongoose.model('ContactEdge', contactEdgeSchema);
const MdrCase = mongoose.model('MdrCase', mdrCaseSchema);
const ContactTrace = mongoose.model('ContactTrace', contactTraceSchema);
const Alert = mongoose.model('Alert', alertSchema);
const PatientVisit = mongoose.model('PatientVisit', patientVisitSchema);
const InfectionReport = mongoose.model('InfectionReport', infectionReportSchema);
const RoomAssignment = mongoose.model('RoomAssignment', roomAssignmentSchema);
const EquipmentCheck = mongoose.model('EquipmentCheck', equipmentCheckSchema);

module.exports = {
  Hospital,
  Department,
  Room,
  User,
  Patient,
  Person,
  RawEvent,
  ContactEdge,
  MdrCase,
  ContactTrace,
  Alert,
  PatientVisit,
  InfectionReport,
  RoomAssignment,
  EquipmentCheck
};
