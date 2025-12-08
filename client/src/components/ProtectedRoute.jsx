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
      console.log('ProtectedRoute - Starting check, user:', user);
      setChecking(true);
      if (!user) {
        console.log('ProtectedRoute - No user, calling refresh');
        await refresh();
        console.log('ProtectedRoute - After refresh, user:', useAuthStore.getState().user);
      }
      setChecking(false);
      console.log('ProtectedRoute - Check complete');
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || checking) {
    console.log('ProtectedRoute - Loading or checking...');
    return <div className="p-6">Checking session…</div>;
  }

  const currentUser = useAuthStore.getState().user;
  console.log('ProtectedRoute - Current user:', currentUser);
  console.log('ProtectedRoute - Required role:', role);
  
  if (!currentUser) {
    console.log('ProtectedRoute - No current user, redirecting to login');
    return <Navigate to="/login" state={{ requiredRole: role }} replace />;
  }

  if (role && currentUser.role !== role) {
    console.log('ProtectedRoute - Role mismatch. User role:', currentUser.role, 'Required:', role);
    return <Navigate to="/unauthorized" state={{ requiredRole: role }} replace />;
  }

  console.log('ProtectedRoute - Rendering children');
  return children;
}
