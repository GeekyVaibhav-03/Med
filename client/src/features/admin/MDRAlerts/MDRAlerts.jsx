import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import Toast from '../../../components/Toast';

const MDRAlerts = () => {
  const [activeFlags, setActiveFlags] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [stats, setStats] = useState({
    totalFlags: 0,
    criticalFlags: 0,
    highFlags: 0,
    moderateFlags: 0,
  });

  useEffect(() => {
    fetchActiveFlags();
    fetchNotifications();
  }, []);

  const fetchActiveFlags = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mdr-flags/active');
      const flags = response.data.flags || [];
      setActiveFlags(flags);

      // Calculate stats
      const stats = {
        totalFlags: flags.length,
        criticalFlags: flags.filter((f) => f.severity === 'critical').length,
        highFlags: flags.filter((f) => f.severity === 'high').length,
        moderateFlags: flags.filter((f) => f.severity === 'moderate').length,
      };
      setStats(stats);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch MDR flags' });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=20');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationRead = async (notifId) => {
    try {
      await api.post(`/notifications/${notifId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const updateIsolationStatus = async (flagId, status, roomNumber) => {
    try {
      await api.patch(`/mdr-flags/${flagId}/isolation`, {
        isolationStatus: status,
        roomNumber: roomNumber || null,
      });
      setToast({ type: 'success', message: 'Isolation status updated' });
      fetchActiveFlags();
      setSelectedFlag(null);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update isolation status' });
    }
  };

  const clearFlag = async (flagId) => {
    const reason = prompt('Enter reason for clearing this MDR flag:');
    if (!reason) return;

    try {
      await api.post(`/mdr-flags/${flagId}/clear`, {
        clearedBy: 'admin_user_id', // Replace with actual user ID
        clearedReason: reason,
      });
      setToast({ type: 'success', message: 'MDR flag cleared successfully' });
      fetchActiveFlags();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to clear flag' });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'moderate':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">MDR Alerts & Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor and manage Multi-Drug Resistant organisms</p>
        </div>
        <button
          onClick={fetchActiveFlags}
          className="px-6 py-3 bg-[#0E8B86] text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
        >
          <i className="ri-refresh-line"></i>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Active Flags</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalFlags}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-flag-line text-2xl text-blue-500"></i>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalFlags}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="ri-alert-line text-2xl text-red-500"></i>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">High Priority</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.highFlags}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="ri-error-warning-line text-2xl text-orange-500"></i>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Moderate</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.moderateFlags}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="ri-information-line text-2xl text-yellow-500"></i>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active MDR Flags */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active MDR Flags</h2>

          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : activeFlags.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No active MDR flags</p>
          ) : (
            <div className="space-y-4">
              {activeFlags.map((flag) => (
                <motion.div
                  key={flag.flag_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    flag.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : flag.severity === 'high'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-800">
                          Patient #{flag.patient_id} - {flag.patient_name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                            flag.severity
                          )} text-white`}
                        >
                          {flag.severity.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-700 font-semibold">
                        🦠 {flag.organism} - {flag.full_name}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">{flag.description}</p>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div className="text-gray-600">
                          <i className="ri-calendar-line"></i> Flagged:{' '}
                          {new Date(flag.flagged_at).toLocaleDateString()}
                        </div>
                        <div className="text-gray-600">
                          <i className="ri-shield-cross-line"></i> Isolation:{' '}
                          {flag.isolation_type || 'Standard'}
                        </div>
                        <div className="text-gray-600">
                          <i className="ri-hospital-line"></i> Status:{' '}
                          <span className="font-semibold">{flag.isolation_status || 'Pending'}</span>
                        </div>
                        {flag.room_number && (
                          <div className="text-gray-600">
                            <i className="ri-door-line"></i> Room: {flag.room_number}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => setSelectedFlag(flag)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => clearFlag(flag.flag_id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Alerts</h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.notif_id}
                  className={`p-3 rounded-lg border ${
                    notif.read_by && notif.read_by.length > 0
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                  {(!notif.read_by || notif.read_by.length === 0) && (
                    <button
                      onClick={() => markNotificationRead(notif.notif_id)}
                      className="text-xs text-blue-600 hover:underline mt-2"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Update Isolation Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Update Isolation Status</h2>

            <p className="text-gray-600 mb-4">
              Patient: <span className="font-semibold">{selectedFlag.patient_name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  id="isolation-status"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  defaultValue={selectedFlag.isolation_status || 'pending'}
                >
                  <option value="pending">Pending</option>
                  <option value="isolated">Isolated</option>
                  <option value="not_isolated">Not Isolated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  id="room-number"
                  defaultValue={selectedFlag.room_number || ''}
                  placeholder="e.g., ICU-201"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setSelectedFlag(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const status = document.getElementById('isolation-status').value;
                    const roomNumber = document.getElementById('room-number').value;
                    updateIsolationStatus(selectedFlag.flag_id, status, roomNumber);
                  }}
                  className="flex-1 px-4 py-2 bg-[#0E8B86] text-white rounded-lg hover:bg-[#0a6f6a]"
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MDRAlerts;
