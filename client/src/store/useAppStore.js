// src/store/useAppStore.js
import create from 'zustand';
import api from '../services/api';

const useAppStore = create((set, get) => ({
  users: [],
  alerts: [],

  // Fetch all users from backend
  fetchUsers: async () => {
    try {
      const res = await api.get('/admin/users'); // endpoint to get all users
      if (res.data && res.data.ok) {
        set({ users: res.data.users });
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
        const updatedUsers = [...get().users, res.data.user];
        set({ users: updatedUsers });
        return res.data.user;
      }
    } catch (err) {
      console.error('addUser error', err);
      throw err;
    }
  },

  // Update existing user
  updateUser: async (userId, userData) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, userData);
      if (res.data && res.data.ok) {
        const updatedUsers = get().users.map((u) =>
          u.id === userId ? res.data.user : u
        );
        set({ users: updatedUsers });
        return res.data.user;
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
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      ),
    })),
  clearAlerts: () => set({ alerts: [] }),
}));

export default useAppStore;
