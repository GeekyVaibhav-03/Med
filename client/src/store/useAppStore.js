// src/store/useAppStore.js
import { create } from 'zustand';
import api from '../services/api';

const useAppStore = create((set, get) => ({
  users: [],
  alerts: [],
  patients: [],
  contactData: [],
  mdrCases: [],
  rfidData: [],
  dashboardStats: null,

  // Fetch patients
  fetchPatients: async () => {
    try {
      const res = await api.get('/patients');
      if (res.data && res.data.ok) {
        set({ patients: res.data.patients || [] });
      }
    } catch (err) {
      console.error('fetchPatients error', err);
    }
  },

  // Fetch MDR cases
  fetchMDRCases: async () => {
    try {
      const res = await api.get('/mdrcases');
      if (res.data && res.data.ok) {
        const cases = (res.data.cases || []).map(c => ({ ...c, id: c._id }));
        set({ mdrCases: cases });
      }
    } catch (err) {
      console.error('fetchMDRCases error', err);
    }
  },

  // Fetch RFID data
  fetchRFIDData: async () => {
    try {
      const res = await api.get('/rfid-data');
      if (res.data && res.data.ok) {
        set({ rfidData: res.data.data || [] });
      }
    } catch (err) {
      console.error('fetchRFIDData error', err);
    }
  },

  // Set contact data from CSV import
  setContactData: (data) => set({ contactData: data }),

  // Fetch dashboard statistics
  fetchDashboardStats: async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data && res.data.ok) {
        set({ dashboardStats: res.data });
        return res.data;
      }
    } catch (err) {
      console.error('fetchDashboardStats error', err);
    }
  },

  // Fetch all users from backend
  fetchUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data && res.data.ok) {
        // Map MongoDB _id to id for frontend compatibility
        const users = res.data.users.map(u => ({ ...u, id: u._id }));
        set({ users });
      }
    } catch (err) {
      console.error('fetchUsers error', err);
      alert(err?.response?.data?.error || 'Failed to fetch users');
    }
  },

  // Add a new user
  addUser: async (userData) => {
    try {
      const res = await api.post('/admin/users', userData);
      if (res.data && res.data.ok) {
        const user = { ...res.data.user, id: res.data.user._id || res.data.user.id };
        const updatedUsers = [...get().users, user];
        set({ users: updatedUsers });
        return user;
      }
    } catch (err) {
      console.error('addUser error', err);
      throw err;
    }
  },

  // Update existing user
  updateUser: async (userId, userData) => {
    try {
      const res = await api.patch(`/admin/users/${userId}`, userData);
      if (res.data && res.data.ok) {
        const user = { ...res.data.user, id: res.data.user._id || res.data.user.id };
        const updatedUsers = get().users.map((u) =>
          u.id === userId ? user : u
        );
        set({ users: updatedUsers });
        return user;
      }
    } catch (err) {
      console.error('updateUser error', err);
      throw err;
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data && res.data.ok) {
        const updatedUsers = get().users.filter((u) => u.id !== userId);
        set({ users: updatedUsers });
      }
    } catch (err) {
      console.error('deleteUser error', err);
      throw err;
    }
  },

  // Alerts handling
  fetchAlerts: async () => {
    try {
      const res = await api.get('/alerts');
      if (res.data && res.data.ok) {
        // Map MongoDB _id to id for frontend compatibility
        const alerts = (res.data.alerts || []).map(a => ({ ...a, id: a._id }));
        set({ alerts });
      }
    } catch (err) {
      console.error('fetchAlerts error', err);
    }
  },
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  markAlertRead: async (id) => {
    try {
      await api.patch(`/alerts/${id}`, { read: true });
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === id ? { ...a, read: true } : a
        ),
      }));
    } catch (err) {
      console.error('markAlertRead error', err);
    }
  },
  clearAlerts: () => set({ alerts: [] }),
}));

export default useAppStore;
