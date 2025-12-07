// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

/**
 * ProtectedRoute enforces session-based auth.
 * - If role prop provided, user.role must match (admin or doctor).
 * - It calls useAuthStore.refresh() once if user not loaded.
 */
export default function ProtectedRoute({ children, role = null }) {
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);
  const loading = useAuthStore((s) => s.loading);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      setChecking(true);
      if (!user) {
        await refresh();
      }
      setChecking(false);
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || checking) return <div className="p-6">Checking session…</div>;

  const currentUser = useAuthStore.getState().user;
  if (!currentUser) return <Navigate to="/login" state={{ requiredRole: role }} replace />;

  if (role && currentUser.role !== role) return <Navigate to="/unauthorized" state={{ requiredRole: role }} replace />;

  return children;
}
