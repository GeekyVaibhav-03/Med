import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AdminDashboard from '../features/admin/AdminDashboard/AdminDashboard';
import PatientsPage from '../features/admin/PatientsPage/PatientsPage';
import MDRDashboard from '../features/admin/MDRDashboard/MDRDashboard';
import MapEditor from '../features/admin/MapEditor/MapEditor';
import UsersPage from '../features/admin/UsersPage/UsersPage';
import AlertsConfig from '../features/admin/AlertsConfig/AlertsConfig';
import ReportsPage from '../features/admin/ReportsPage/ReportsPage';
import SystemHealth from '../features/admin/SystemHealth/SystemHealth';
import LabReportUpload from '../features/admin/LabReportUpload/LabReportUpload';
import MDRAlertBanner from '../components/MDRAlertBanner';

const adminMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
  { path: '/mdr-tracking', label: 'MDR Tracking', icon: 'ri-virus-line' },
  { path: '/patients', label: 'Patient Records', icon: 'ri-user-heart-line' },
  { path: '/lab-upload', label: 'Lab Report Upload', icon: 'ri-test-tube-2-line' },
  { path: '/map-editor', label: 'Map Configuration', icon: 'ri-map-2-line' },
  { path: '/users', label: 'User Management', icon: 'ri-team-line' },
  { path: '/alerts', label: 'Alert Configuration', icon: 'ri-notification-3-line' },
  { path: '/reports', label: 'Reports & Analytics', icon: 'ri-bar-chart-box-line' },
  { path: '/system', label: 'System Health', icon: 'ri-stethoscope-line' },
];

const AdminRoute = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Admin Panel - MDR Contact Tracing" />
      <MDRAlertBanner />
      <main className="p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/mdr-tracking" element={<MDRDashboard />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/lab-upload" element={<LabReportUpload />} />
          <Route path="/map-editor" element={<MapEditor />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/alerts" element={<AlertsConfig />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/system" element={<SystemHealth />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminRoute;
