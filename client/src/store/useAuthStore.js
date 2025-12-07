import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('medwatch_user')) || null,
  token: localStorage.getItem('medwatch_token') || null,
  loading: false,

  // ✅ Called after login
  setSession: ({ user, token }) => {
    localStorage.setItem('medwatch_user', JSON.stringify(user));
    localStorage.setItem('medwatch_token', token);
    set({ user, token });
  },

  // ✅ Used by ProtectedRoute on reload
  refresh: async () => {
    const token = localStorage.getItem('medwatch_token');
    const user = JSON.parse(localStorage.getItem('medwatch_user'));

    if (!token || !user) {
      set({ user: null, token: null, loading: false });
      return;
    }

    // just restore from storage (JWT already validated by backend per request)
    set({ user, token, loading: false });
  },

  clearUser: () => {
    localStorage.removeItem('medwatch_user');
    localStorage.removeItem('medwatch_token');
    set({ user: null, token: null });
  }
}));

export default useAuthStore;
