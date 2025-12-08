import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import LogoutButton from '../components/LogoutButton';
import AdminDashboard from '../features/admin/AdminDashboard/AdminDashboard';
import MapEditor from '../features/admin/MapEditor/MapEditor';
import UsersPage from '../features/admin/UsersPage/UsersPage';
import AlertsConfig from '../features/admin/AlertsConfig/AlertsConfig';
import ReportsPage from '../features/admin/ReportsPage/ReportsPage';
import SystemHealth from '../features/admin/SystemHealth/SystemHealth';
import ReportGenerator from '../features/admin/ReportGenerator/ReportGenerator';
import MDRAlerts from '../features/admin/MDRAlerts/MDRAlerts';

const AdminRoute = () => {
  const user = useAuthStore((s) => s.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-lg flex items-center justify-center">
                <i className="ri-admin-line text-xl text-white"></i>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">MedWatch</span>
                <span className="text-xs text-gray-500 block">Admin Panel</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
              >
                <i className="ri-dashboard-line"></i>
                Dashboard
              </Link>
              <Link
                to="/admin/map-editor"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
              >
                <i className="ri-map-2-line"></i>
                Map Config
              </Link>
              <Link
                to="/admin/users"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
              >
                <i className="ri-team-line"></i>
                Users
              </Link>
              <Link
                to="/admin/alerts"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
              >
                <i className="ri-notification-3-line"></i>
                Alerts
              </Link>
              <Link
                to="/admin/mdr-alerts"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
              >
                <i className="ri-alert-line"></i>
                MDR Alerts
              </Link>
              <Link
                to="/admin/reports"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
              >
                <i className="ri-bar-chart-box-line"></i>
                Reports
              </Link>
              <Link
                to="/admin/report-generator"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
              >
                <i className="ri-file-text-line"></i>
                Report Generator
              </Link>
              <Link
                to="/admin/system"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
              >
                <i className="ri-settings-3-line"></i>
                System
              </Link>
            </div>

            {/* User Section */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">Admin: {user?.username}</p>
                <p className="text-xs text-gray-500">{user?.hospital || 'System Administrator'}</p>
              </div>
              <LogoutButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <i className={`text-2xl ${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-2">
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-dashboard-line"></i>
                Dashboard
              </Link>
              <Link
                to="/admin/map-editor"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-map-2-line"></i>
                Map Configuration
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-team-line"></i>
                User Management
              </Link>
              <Link
                to="/admin/alerts"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-notification-3-line"></i>
                Alert Configuration
              </Link>
              <Link
                to="/admin/mdr-alerts"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-alert-line"></i>
                MDR Alerts
              </Link>
              <Link
                to="/admin/reports"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-bar-chart-box-line"></i>
                Reports & Analytics
              </Link>
              <Link
                to="/admin/report-generator"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-file-text-line"></i>
                Report Generator
              </Link>
              <Link
                to="/admin/system"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-settings-3-line"></i>
                System Health
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <p className="px-4 text-sm font-semibold text-gray-800 mb-2">Admin: {user?.username}</p>
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/map-editor" element={<MapEditor />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/alerts" element={<AlertsConfig />} />
          <Route path="/mdr-alerts" element={<MDRAlerts />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/report-generator" element={<ReportGenerator />} />
          <Route path="/system" element={<SystemHealth />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminRoute;
