// client/src/services/mdrAlertListener.js
/**
 * Real-time MDR Alert Listener
 * Listens for Socket.io alerts and shows toast notifications
 */

import io from 'socket.io-client';

let socket = null;
let alertCallback = null;

/**
 * ✅ Initialize Socket.io connection
 * @param {string} apiUrl - Backend URL
 * @param {function} onAlert - Callback when alert received
 */
export function initMDRAlertListener(apiUrl, onAlert) {
  try {
    socket = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    alertCallback = onAlert;

    socket.on('connect', () => {
      console.log('✅ Connected to alert server');
    });

    // ✅ Listen for MDR alerts
    socket.on('mdr_alert_notification', (data) => {
      console.log('🚨 MDR Alert received:', data);
      if (alertCallback) {
        alertCallback({
          type: 'mdr_alert',
          severity: data.severity,
          patient_uid: data.patient_uid,
          patient_name: data.patient_name,
          organism: data.organism,
          hospital: data.hospital,
          timestamp: new Date(data.timestamp)
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from alert server');
    });

    return socket;
  } catch (err) {
    console.error('MDR Alert Listener init error:', err);
  }
}

/**
 * ✅ Join hospital room for targeted alerts
 * @param {string} hospital - Hospital name
 * @param {string} userRole - User role
 */
export function joinHospitalRoom(hospital, userRole) {
  if (socket) {
    socket.emit('join_hospital', { hospital, userRole });
  }
}

/**
 * ✅ Subscribe to patient alerts
 * @param {string} patientUid - Patient UID
 */
export function subscribeToPatient(patientUid) {
  if (socket) {
    socket.emit('subscribe_patient', patientUid);
  }
}

/**
 * ✅ Disconnect from alerts
 */
export function disconnectMDRListener() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default {
  initMDRAlertListener,
  joinHospitalRoom,
  subscribeToPatient,
  disconnectMDRListener
};
