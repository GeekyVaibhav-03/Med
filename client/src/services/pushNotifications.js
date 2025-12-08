/**
 * Browser Push Notifications Service
 * Handles browser-native notifications for real-time alerts
 */

let notificationPermission = 'default';

/**
 * Request notification permission from user
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('❌ Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    notificationPermission = 'granted';
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('❌ Notification permission denied by user');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    console.log(`🔔 Notification permission: ${permission}`);
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showBrowserNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.log('❌ Browser does not support notifications');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('❌ Notification permission not granted');
    return;
  }

  const defaultOptions = {
    icon: '/logo.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      // Navigate to relevant page if URL provided
      if (options.url) {
        window.location.href = options.url;
      }
      
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    console.log('✅ Browser notification shown:', title);
  } catch (error) {
    console.error('❌ Error showing notification:', error);
  }
};

/**
 * Show MDR alert notification
 * @param {object} alertData - Alert data from backend
 */
export const showMDRAlert = (alertData) => {
  const { patientId, patientName, organism, severity } = alertData;

  const severityEmoji = {
    critical: '🚨',
    high: '⚠️',
    moderate: '⚡'
  };

  const emoji = severityEmoji[severity] || '🔔';

  showBrowserNotification(`${emoji} MDR Alert - ${severity.toUpperCase()}`, {
    body: `Patient ${patientName || '#' + patientId} tested positive for ${organism}`,
    tag: `mdr-alert-${patientId}`,
    requireInteraction: severity === 'critical', // Critical alerts stay until clicked
    icon: '/alert-icon.png',
    url: `/doctor/lab-reports`
  });
};

/**
 * Check if notifications are supported and enabled
 * @returns {boolean}
 */
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

/**
 * Check if notification permission is granted
 * @returns {boolean}
 */
export const isNotificationGranted = () => {
  return Notification.permission === 'granted';
};

/**
 * Play notification sound
 * @param {string} soundType - 'alert', 'warning', or 'info'
 */
export const playNotificationSound = (soundType = 'alert') => {
  try {
    const audio = new Audio(`/sounds/${soundType}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Sound playback failed:', err));
  } catch (error) {
    console.error('❌ Error playing notification sound:', error);
  }
};

/**
 * Initialize notification service on app load
 */
export const initializeNotifications = async () => {
  console.log('🔔 Initializing notification service...');
  
  if (!isNotificationSupported()) {
    console.log('❌ Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'default') {
    console.log('⏳ Notification permission not set. User needs to grant permission.');
    return false;
  }

  if (Notification.permission === 'granted') {
    console.log('✅ Notification permission already granted');
    return true;
  }

  return false;
};

export default {
  requestNotificationPermission,
  showBrowserNotification,
  showMDRAlert,
  isNotificationSupported,
  isNotificationGranted,
  playNotificationSound,
  initializeNotifications
};
