import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MapEditor from '../features/admin/MapEditor/MapEditor';
import UsersPage from '../features/admin/UsersPage/UsersPage';
import AlertsConfig from '../features/admin/AlertsConfig/AlertsConfig';
import ReportsPage from '../features/admin/ReportsPage/ReportsPage';
import SystemHealth from '../features/admin/SystemHealth/SystemHealth';

const adminMenuItems = [
  { path: '/map-editor', label: 'Map Configuration', icon: 'ri-map-2-line' },
  { path: '/users', label: 'User Management', icon: 'ri-team-line' },
  { path: '/alerts', label: 'Alert Configuration', icon: 'ri-notification-3-line' },
  { path: '/reports', label: 'Reports & Analytics', icon: 'ri-bar-chart-box-line' },
  { path: '/system', label: 'System Health', icon: 'ri-dashboard-line' },
];

const AdminRoute = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Admin Panel - MDR Contact Tracing" />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar items={adminMenuItems} type="admin" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/map-editor" replace />} />
            <Route path="/map-editor" element={<MapEditor />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/alerts" element={<AlertsConfig />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/system" element={<SystemHealth />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminRoute;
