import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

let socket = null;

export function connectSocket() {
  const token = useAuthStore.getState().token;

  socket = io('http://localhost:5000', {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}
