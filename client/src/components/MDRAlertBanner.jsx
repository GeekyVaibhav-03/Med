// client/src/components/MDRAlertBanner.jsx
/**
 * Real-time MDR Alert Banner
 * Shows urgent alerts when MDR organisms are detected
 */

import React, { useState, useEffect } from 'react';
import { initMDRAlertListener, joinHospitalRoom, disconnectMDRListener } from '../services/mdrAlertListener';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const MDRAlertBanner = () => {
  const user = useAuthStore((s) => s.user);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // ✅ Initialize real-time listeners on mount
  useEffect(() => {
    if (!user) return;

    // Initialize Socket.io listener
    initMDRAlertListener('http://localhost:5000', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 5)); // Keep last 5 alerts
    });

    // Join hospital room for targeted alerts
    joinHospitalRoom(user.hospital || 'General Hospital', user.role);

    // Fetch unread notifications
    fetchUnreadNotifications();

    // Cleanup on unmount
    return () => {
      disconnectMDRListener();
    };
  }, [user]);

  // ✅ Fetch unread notifications from backend
  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get('/api/notifications/unread');
      if (response.data.ok) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  // ✅ Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // ✅ Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  if (notifications.length === 0 && alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 space-y-3 max-w-md z-50">
      {/* Real-time Socket.io Alerts */}
      {alerts.map((alert, idx) => (
        <div
          key={`alert-${idx}`}
          className="bg-red-600 text-white p-4 rounded-lg shadow-lg animate-pulse border-l-4 border-red-900"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-lg">🚨 {alert.organism}</p>
              <p className="text-sm mt-1">Patient: {alert.patient_name}</p>
              <p className="text-xs text-red-100 mt-1">
                {alert.timestamp?.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => {
                setAlerts((prev) => prev.filter((_, i) => i !== idx));
              }}
              className="text-red-200 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* Database Notifications */}
      {notifications.slice(0, 3).map((notif) => (
        <div
          key={`notif-${notif.id}`}
          className={`p-4 rounded-lg shadow-lg border-l-4 ${
            notif.severity === 'critical'
              ? 'bg-red-100 border-red-500 text-red-900'
              : notif.severity === 'high'
              ? 'bg-orange-100 border-orange-500 text-orange-900'
              : 'bg-yellow-100 border-yellow-500 text-yellow-900'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold">{notif.title}</p>
              <p className="text-sm mt-1 whitespace-pre-line">{notif.message}</p>
              <p className="text-xs mt-2 opacity-70">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => deleteNotification(notif.id)}
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              ✕
            </button>
          </div>
          {!notif.is_read && (
            <button
              onClick={() => markAsRead(notif.id)}
              className="mt-2 text-xs px-2 py-1 bg-white bg-opacity-50 hover:bg-opacity-75 rounded"
            >
              Mark as Read
            </button>
          )}
        </div>
      ))}

      {notifications.length > 3 && (
        <div className="text-center text-sm text-gray-600 p-2">
          +{notifications.length - 3} more notifications
        </div>
      )}
    </div>
  );
};

export default MDRAlertBanner;
