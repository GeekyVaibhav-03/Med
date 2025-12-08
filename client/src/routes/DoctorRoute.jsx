// DoctorRoute.jsx (UPDATED)
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import DoctorDashboard from '../features/doctor/DoctorDashboard/DoctorDashboard';
import PatientSearch from '../features/doctor/PatientSearch/PatientSearch';
import RealTimeMap from '../features/doctor/RealTimeMap/RealTimeMap';
import NetworkGraph from '../features/doctor/NetworkGraph/NetworkGraph';
import EquipmentCheck from '../features/doctor/EquipmentCheck/EquipmentCheck';
import Checklist from '../features/doctor/Checklist/Checklist';
import LabReports from '../features/doctor/LabReports/LabReports';

import useAuthStore from '../store/useAuthStore';
import LogoutButton from '../components/LogoutButton';

const doctorMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
  { path: '/search', label: 'Patient Search', icon: 'ri-search-line' },
  { path: '/map', label: 'Real-Time Map', icon: 'ri-map-pin-line' },
  { path: '/network', label: 'Contact Network', icon: 'ri-node-tree' },
  { path: '/equipment', label: 'Equipment Check', icon: 'ri-stethoscope-line' },
  { path: '/checklist', label: 'MDR Checklist', icon: 'ri-checkbox-multiple-line' },
  { path: '/lab-reports', label: 'Lab Reports', icon: 'ri-file-list-3-line' },
];

const DoctorRoute = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);

  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const validate = async () => {
      console.log('DoctorRoute - token:', token);
      console.log('DoctorRoute - user:', user);
      
      if (!token) {
        console.log('DoctorRoute - No token, setting checking to false');
        setChecking(false);
        return;
      }
      if (!user) {
        console.log('DoctorRoute - No user, calling refresh');
        await refresh(); // validate token & set user
      }
      console.log('DoctorRoute - Validation complete, user:', useAuthStore.getState().user);
      setChecking(false);
    };
    validate();
  }, [token]);

  // 1️⃣ No token → not logged in
  if (!token && !checking) {
    console.log('DoctorRoute - Redirecting to login (no token)');
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Token exists but still validating
  if (checking) {
    console.log('DoctorRoute - Still checking...');
    return <div className="p-10 text-center text-gray-600">Validating session...</div>;
  }

  // 3️⃣ Logged in but wrong role → block access
  if (user && !(user.role === 'doctor' || user.role === 'nurse' || user.role === 'pharmacist' || user.role === 'admin')) {
    console.log('DoctorRoute - Wrong role, redirecting to unauthorized. User role:', user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('DoctorRoute - Rendering doctor panel for user:', user);

  // 4️⃣ Otherwise, show full doctor dashboard UI
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation - Homepage Style */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-800">MedWatch</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/doctor/dashboard" className="text-gray-600 hover:text-[#0E8B86] transition font-medium">
                Dashboard
              </Link>
              <Link to="/doctor/search" className="text-gray-600 hover:text-[#0E8B86] transition">
                Patient Search
              </Link>
              <Link to="/doctor/map" className="text-gray-600 hover:text-[#0E8B86] transition">
                Real-Time Map
              </Link>
              <Link to="/doctor/network" className="text-gray-600 hover:text-[#0E8B86] transition">
                Network Graph
              </Link>
              <Link to="/doctor/equipment" className="text-gray-600 hover:text-[#0E8B86] transition">
                Equipment
              </Link>
              <Link to="/doctor/checklist" className="text-gray-600 hover:text-[#0E8B86] transition">
                Checklist
              </Link>
              <Link to="/doctor/lab-reports" className="text-gray-600 hover:text-[#0E8B86] transition">
                Lab Reports
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome</p>
                  <p className="text-sm font-bold text-gray-800">Dr. {user?.username || 'User'}</p>
                </div>
                <LogoutButton />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <Link to="/doctor/dashboard" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium">
                Dashboard
              </Link>
              <Link to="/doctor/search" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                Patient Search
              </Link>
              <Link to="/doctor/map" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                Real-Time Map
              </Link>
              <Link to="/doctor/network" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                Network Graph
              </Link>
              <Link to="/doctor/equipment" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                Equipment
              </Link>
              <Link to="/doctor/checklist" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                Checklist
              </Link>
              <Link to="/doctor/lab-reports" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                Lab Reports
              </Link>
              <div className="px-4 py-2">
                <p className="text-sm text-gray-600">Welcome, Dr. {user?.username || 'User'}</p>
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-6 py-0">
        <Routes>
          <Route path="/" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/search" element={<PatientSearch />} />
          <Route path="/map" element={<RealTimeMap />} />
          <Route path="/network" element={<NetworkGraph />} />
          <Route path="/equipment" element={<EquipmentCheck />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/lab-reports" element={<LabReports />} />
        </Routes>
      </main>
    </div>
  );
};

export default DoctorRoute;
