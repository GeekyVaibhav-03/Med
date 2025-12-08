// src/services/notificationService.js
/**
 * Notification Service
 * Sends real-time alerts to:
 * 1. Treating doctors
 * 2. Infection Control staff
 * 3. Hospital administrators
 */

const { Notification, User } = require('../models');
const { getMDRRiskLevel } = require('./mdrDetectionService');
const { getIo } = require('../socket');

/**
 * ✅ Send notifications for MDR alert
 * @param {object} data - { lab_report_id, mdr_case_id, patient_uid, patient_name, organism, hospital, doctor_name }
 */
async function sendNotifications(data) {
  try {
    const {
      lab_report_id,
      mdr_case_id,
      patient_uid,
      patient_name,
      organism,
      hospital,
      doctor_name,
      antibiotic_profile = {}
    } = data;

    const riskLevel = getMDRRiskLevel(organism, antibiotic_profile);

    // ✅ 1. Create notification for Infection Control
    const infectionControlNotif = await Notification.create({
      lab_report_id,
      mdr_case_id,
      recipient_role: 'infection_control',
      recipient_hospital: hospital,
      title: `🚨 MDR ALERT: ${organism}`,
      message: `Patient ${patient_name} (${patient_uid}) tested POSITIVE for ${organism}. Immediate isolation protocol required.`,
      severity: riskLevel === 'critical' ? 'critical' : 'high',
      is_read: false
    });

    // ✅ 2. Create notification for treating doctor
    const doctorNotif = await Notification.create({
      lab_report_id,
      mdr_case_id,
      recipient_role: 'doctor',
      recipient_hospital: hospital,
      title: `Lab Report: ${organism} (MDR)`,
      message: `Patient: ${patient_name} (${patient_uid})\nOrganism: ${organism}\nRisk Level: ${riskLevel.toUpperCase()}\n\nAction Required: Review isolation protocols.`,
      severity: riskLevel === 'critical' ? 'critical' : 'high',
      is_read: false
    });

    // ✅ 3. Create notification for Admin
    const adminNotif = await Notification.create({
      lab_report_id,
      mdr_case_id,
      recipient_role: 'admin',
      recipient_hospital: hospital,
      title: `MDR Case Detected: ${organism}`,
      message: `Hospital: ${hospital}\nPatient: ${patient_name}\nOrganism: ${organism}\nRisk Level: ${riskLevel}\nTime: ${new Date().toLocaleString()}`,
      severity: 'high',
      is_read: false
    });

    // ✅ 4. Send real-time Socket.io alerts
    try {
      const io = getIo();
      
      // Broadcast to all connected clients
      io.emit('mdr_alert', {
        type: 'MDR_POSITIVE',
        severity: riskLevel,
        patient_uid,
        patient_name,
        organism,
        hospital,
        doctor_name,
        timestamp: new Date(),
        notification_ids: [infectionControlNotif.id, doctorNotif.id, adminNotif.id]
      });

      // Send to specific rooms (by hospital)
      io.to(`hospital_${hospital}`).emit('mdr_alert_local', {
        type: 'MDR_POSITIVE',
        severity: riskLevel,
        patient_uid,
        patient_name,
        organism,
        doctor_name,
        timestamp: new Date()
      });
    } catch (socketErr) {
      console.warn('Socket.io not available, alerts sent via database only');
    }

    console.log(`✅ Notifications sent for patient ${patient_uid} (${organism})`);

    return {
      ok: true,
      notifications: [infectionControlNotif.id, doctorNotif.id, adminNotif.id]
    };
  } catch (err) {
    console.error('Notification service error:', err);
    throw err;
  }
}

/**
 * ✅ Get unread notifications for a user
 * @param {string} userRole - 'doctor', 'infection_control', 'admin'
 * @param {string} hospital - hospital name
 * @returns {array} - list of unread notifications
 */
async function getUnreadNotifications(userRole, hospital) {
  try {
    const notifications = await Notification.findAll({
      where: {
        recipient_role: userRole,
        recipient_hospital: hospital,
        is_read: false
      },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return notifications;
  } catch (err) {
    console.error('Get notifications error:', err);
    return [];
  }
}

/**
 * ✅ Mark notification as read
 * @param {number} notificationId
 */
async function markAsRead(notificationId) {
  try {
    await Notification.update(
      { is_read: true },
      { where: { id: notificationId } }
    );
    return { ok: true };
  } catch (err) {
    console.error('Mark as read error:', err);
    throw err;
  }
}

/**
 * ✅ Delete old notifications (>30 days)
 */
async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deleted = await Notification.destroy({
      where: {
        created_at: { [require('../models').Op.lt]: thirtyDaysAgo }
      }
    });
    console.log(`✅ Deleted ${deleted} old notifications`);
    return deleted;
  } catch (err) {
    console.error('Cleanup notifications error:', err);
  }
}

module.exports = {
  sendNotifications,
  getUnreadNotifications,
  markAsRead,
  cleanupOldNotifications
};
