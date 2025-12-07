import React from 'react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const clear = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  const onLogout = () => {
    clear(); // ✅ just clear JWT
    navigate('/login');
  };

  return (
    <button
      onClick={onLogout}
      className="px-3 py-1 bg-gray-200 rounded"
    >
      Logout
    </button>
  );
}
