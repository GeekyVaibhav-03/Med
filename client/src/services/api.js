import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ✅ BACKEND PORT
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Auto logout on token expiry
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().clearUser();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
