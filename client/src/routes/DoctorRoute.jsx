// DoctorRoute.jsx (UPDATED)
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

import PatientSearch from '../features/doctor/PatientSearch/PatientSearch';
import RealTimeMap from '../features/doctor/RealTimeMap/RealTimeMap';
import NetworkGraph from '../features/doctor/NetworkGraph/NetworkGraph';
import EquipmentCheck from '../features/doctor/EquipmentCheck/EquipmentCheck';
import Checklist from '../features/doctor/Checklist/Checklist';

import useAuthStore from '../store/useAuthStore';

const doctorMenuItems = [
  { path: '/search', label: 'Patient Search', icon: 'ri-search-line' },
  { path: '/map', label: 'Real-Time Map', icon: 'ri-map-pin-line' },
  { path: '/network', label: 'Contact Network', icon: 'ri-node-tree' },
  { path: '/equipment', label: 'Equipment Check', icon: 'ri-stethoscope-line' },
  { path: '/checklist', label: 'MDR Checklist', icon: 'ri-checkbox-multiple-line' },
];

const DoctorRoute = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setChecking(false);
        return;
      }
      if (!user) {
        await refresh(); // validate token & set user
      }
      setChecking(false);
    };
    validate();
  }, [token]);

  // 1️⃣ No token → not logged in
  if (!token && !checking) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Token exists but still validating
  if (checking) {
    return <div className="p-10 text-center text-gray-600">Validating session...</div>;
  }

  // 3️⃣ Logged in but wrong role → block access
  if (user && !(user.role === 'doctor' || user.role === 'admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4️⃣ Otherwise, show full doctor dashboard UI
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Doctor Dashboard - MDR Contact Tracing" />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar items={doctorMenuItems} type="doctor" />
        <main className="flex-1 p-6 overflow-auto bg-gray-100">
          <Routes>
            <Route path="/" element={<Navigate to="/doctor/search" replace />} />
            <Route path="/search" element={<PatientSearch />} />
            <Route path="/map" element={<RealTimeMap />} />
            <Route path="/network" element={<NetworkGraph />} />
            <Route path="/equipment" element={<EquipmentCheck />} />
            <Route path="/checklist" element={<Checklist />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DoctorRoute;
