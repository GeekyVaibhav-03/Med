const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require('path');

require('dotenv').config();

// Use SQLite instead of MySQL - no setup needed!
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../medwatch.db'),
  logging: false,
  define: {
    timestamps: false   // <<--- DISABLE global timestamps (createdAt/updatedAt)
  }
});

// Define models after sequelize is created
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  // map JS attribute passwordHash -> DB column `password_hash`
  passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
  // role might already exist in DB; map it explicitly to avoid mismatch
  role: { type: DataTypes.ENUM('admin',
    'doctor',
    'staff',
    'visitor',
    'pharmacist',
    'nurse',
    'patient'), allowNull: false, field: 'role' },
  hospital: { type: DataTypes.STRING, allowNull: true, field: 'hospital' },
  email: { type: DataTypes.STRING, allowNull: true, field: 'email' }
}, { tableName: 'users', timestamps: false });

const RawEvent = sequelize.define('RawEvent', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  uid: { type: DataTypes.STRING },
  profile: { type: DataTypes.STRING },
  room: { type: DataTypes.STRING },
  entry_time: { type: DataTypes.DATE },
  exit_time: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING }
}, { tableName: 'raw_events', timestamps: false });

const Person = sequelize.define('Person', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  uid: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING },
  profile: { type: DataTypes.STRING }
}, { tableName: 'persons', timestamps: false });

const ContactEdge = sequelize.define('ContactEdge', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  person_a_uid: { type: DataTypes.STRING },
  person_b_uid: { type: DataTypes.STRING },
  room: { type: DataTypes.STRING },
  overlap_start: { type: DataTypes.DATE },
  overlap_end: { type: DataTypes.DATE },
  weight: { type: DataTypes.FLOAT, defaultValue: 1 }
}, { tableName: 'contact_edges', timestamps: false });

const MdrCase = sequelize.define('MdrCase', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  uid: { type: DataTypes.STRING },
  detected_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  organism: { type: DataTypes.STRING }
}, { tableName: 'mdr_cases', timestamps: false });

const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  priority: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { tableName: 'alerts', timestamps: false });

// ✅ NEW: LabReport model
const LabReport = sequelize.define('LabReport', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patient_uid: { type: DataTypes.STRING, allowNull: false, field: 'patient_uid' },
  patient_name: { type: DataTypes.STRING, allowNull: true, field: 'patient_name' },
  report_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'report_date' },
  specimen_type: { type: DataTypes.STRING, allowNull: true, field: 'specimen_type' },
  organism: { type: DataTypes.STRING, allowNull: true, field: 'organism' },
  is_mdr: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_mdr' },
  antibiotic_profile: { type: DataTypes.JSON, allowNull: true, field: 'antibiotic_profile' },
  doctor_name: { type: DataTypes.STRING, allowNull: true, field: 'doctor_name' },
  hospital: { type: DataTypes.STRING, allowNull: true, field: 'hospital' },
  status: { type: DataTypes.ENUM('pending', 'processed', 'flagged'), defaultValue: 'pending', field: 'status' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'created_at' }
}, { tableName: 'lab_reports', timestamps: false });

// ✅ NEW: Notification model for real-time alerts
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  lab_report_id: { type: DataTypes.INTEGER, allowNull: true, field: 'lab_report_id' },
  mdr_case_id: { type: DataTypes.INTEGER, allowNull: true, field: 'mdr_case_id' },
  recipient_role: { type: DataTypes.STRING, allowNull: false, field: 'recipient_role' }, // 'doctor', 'infection_control', 'admin'
  recipient_hospital: { type: DataTypes.STRING, allowNull: true, field: 'recipient_hospital' },
  title: { type: DataTypes.STRING, allowNull: false, field: 'title' },
  message: { type: DataTypes.TEXT, allowNull: false, field: 'message' },
  severity: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium', field: 'severity' },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'created_at' }
}, { tableName: 'notifications', timestamps: false });

// Export everything
module.exports = {
  sequelize,
  Sequelize,
  Op,
  User,
  RawEvent,
  Person,
  ContactEdge,
  MdrCase,
  Alert,
  LabReport,
  Notification
};
