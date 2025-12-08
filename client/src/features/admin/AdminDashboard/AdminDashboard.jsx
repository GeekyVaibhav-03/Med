import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import useAppStore from '../../../store/useAppStore';

const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const recentSectionRef = useRef(null);
  const { 
    users = [], 
    alerts = [], 
    patients = [],
    mdrCases = [],
    rfidData = [],
    fetchUsers,
    fetchAlerts,
    fetchPatients,
    fetchMDRCases,
    fetchRFIDData
  } = useAppStore();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPatients: 0,
    mdrCases: 0,
    recentContacts: 0,
    pendingAlerts: 0,
    activeEquipment: 0,
    criticalCases: 0
  });

  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchPatients(),
          fetchAlerts(),
          fetchMDRCases(),
          fetchRFIDData()
        ]);
      } catch (error) {
        console.error('Error loading admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Calculate stats from real data
    const activeUserCount = users.filter(u => u.isActive).length || 0;
    const mdrCount = patients.filter(p => p.status === 'red' || p.mdrStatus === 'positive').length;
    const contactCount = patients.filter(p => p.status === 'yellow' || p.riskLevel === 'high').length;
    const pendingCount = alerts.filter(a => !a.resolved && !a.read).length;
    const activeEquip = rfidData.filter(d => d.active).length;
    const criticalCount = mdrCases.filter(c => c.severity === 'critical' || c.urgent).length;

    setStats({
      totalUsers: users.length || 7,
      activeUsers: activeUserCount,
      totalPatients: patients.length,
      mdrCases: mdrCount,
      recentContacts: contactCount,
      pendingAlerts: pendingCount,
      activeEquipment: activeEquip,
      criticalCases: criticalCount
    });
  }, [users, patients, alerts, mdrCases, rfidData]);

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage doctors, staff, and permissions',
      icon: 'ri-team-line',
      link: '/admin/users',
      color: 'from-purple-500 to-purple-600',
      badge: users.length
    },
    {
      title: 'Map Configuration',
      description: 'Configure hospital floor plans and zones',
      icon: 'ri-map-2-line',
      link: '/admin/map-editor',
      color: 'from-blue-500 to-blue-600',
      badge: null
    },
    {
      title: 'Alert Configuration',
      description: 'Set up automated alert rules',
      icon: 'ri-notification-3-line',
      link: '/admin/alerts',
      color: 'from-orange-500 to-orange-600',
      badge: stats.pendingAlerts
    },
    {
      title: 'Reports & Analytics',
      description: 'View comprehensive system reports',
      icon: 'ri-bar-chart-box-line',
      link: '/admin/reports',
      color: 'from-green-500 to-green-600',
      badge: null
    },
    {
      title: 'System Health',
      description: 'Monitor system performance',
      icon: 'ri-dashboard-line',
      link: '/admin/system',
      color: 'from-teal-500 to-teal-600',
      badge: null
    }
  ];

  const recentAlerts = alerts.slice(0, 5);
  const pendingAlerts = alerts.filter(a => !a.resolved).slice(0, 5);
  const recentPatients = patients.slice(0, 6);
  const recentUsers = users.slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0E8B86] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section - Admin Banner */}
      <div className="bg-gradient-to-r from-[#064e4a] via-[#0a6b66] to-[#064e4a] rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FBBF24] opacity-10 rounded-full -ml-32 -mb-32 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div>
            <div className="mb-4">
              <span className="text-[#FBBF24] text-4xl md:text-5xl font-bold">MedWatch</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <i className="ri-admin-line text-lg"></i>
                <span className="text-sm font-semibold">Admin Panel</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">System Active</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Admin Control<br/>
              <span className="bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">Panel</span>
            </h1>
            
            <p className="text-base md:text-lg text-teal-100 mb-8 max-w-md">
              Manage your healthcare facility's MDR contact tracing system
            </p>
            
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FBBF24] to-[#FCD34D] hover:from-[#FCD34D] hover:to-[#FBBF24] text-gray-900 font-bold px-6 md:px-8 py-3 md:py-4 rounded-full transition-all transform hover:scale-105 shadow-xl"
            >
              <span>Manage Users</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </Link>
          </div>
          
          {/* Right Image - Admin Dashboard Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop" 
                  alt="Hospital Management" 
                  className="w-full h-[500px] object-cover rounded-xl shadow-2xl"
                />
                <div className="absolute bottom-10 left-10 right-10 bg-gradient-to-r from-[#064e4a]/95 to-[#0a6b66]/95 backdrop-blur-md p-6 rounded-xl border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-2">Healthcare Administration</h3>
                  <p className="text-teal-100 text-sm">Managing hospital operations and MDR contact tracing systems efficiently</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-team-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
              <div className="text-xs text-gray-600">Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-user-heart-line text-2xl text-green-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalPatients}</div>
              <div className="text-xs text-gray-600">Patients</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-virus-line text-2xl text-red-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.mdrCases}</div>
              <div className="text-xs text-gray-600">MDR Cases</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-contacts-line text-2xl text-yellow-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.recentContacts}</div>
              <div className="text-xs text-gray-600">Contacts</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-notification-3-line text-2xl text-orange-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.pendingAlerts}</div>
              <div className="text-xs text-gray-600">Alerts</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-alert-line text-2xl text-purple-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.criticalCases}</div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
          </div>
        </div>
      </div>
      <div ref={recentSectionRef}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-lg flex items-center justify-center">
            <i className="ri-history-line text-white"></i>
          </div>
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Users</h3>
              <Link
                to="/admin/users"
                className="text-[#0E8B86] hover:text-[#28B99A] font-semibold flex items-center text-sm transition-colors"
              >
                View All <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.slice(0, 4).map((user, idx) => {
                  const roleConfig = {
                    admin: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'ri-admin-line', label: 'Admin' },
                    doctor: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'ri-stethoscope-line', label: 'Doctor' },
                    staff: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'ri-user-line', label: 'Staff' }
                  };
                  const role = roleConfig[user.role] || roleConfig.staff;

                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 ${role.bg} rounded-xl border ${role.border} hover:shadow-md transition-all group`}>
                      <div className="flex items-center flex-1">
                        <div className={`w-10 h-10 ${role.bg} rounded-lg flex items-center justify-center mr-3 border ${role.border}`}>
                          <i className={`${role.icon} text-lg ${role.text}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-sm group-hover:text-[#0E8B86] transition-colors">{user.username}</div>
                          <div className="text-xs text-gray-500">{user.email || user.hospitalName}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${role.bg} ${role.text} rounded-full text-xs font-semibold border ${role.border}`}>
                        {role.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <i className="ri-user-line text-4xl mb-2"></i>
                  <p>No recent users</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Alerts</h3>
              <Link
                to="/admin/alerts"
                className="text-[#0E8B86] hover:text-[#28B99A] font-semibold flex items-center text-sm transition-colors"
              >
                View All <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>
            <div className="space-y-3">
              {pendingAlerts.length > 0 ? (
                pendingAlerts.slice(0, 4).map((alert, idx) => {
                  const priorityConfig = {
                    high: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: 'ri-error-warning-fill' },
                    medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'ri-alert-fill' },
                    low: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ri-information-fill' }
                  };
                  const priority = priorityConfig[alert.priority] || priorityConfig.low;

                  return (
                    <div key={idx} className={`p-3 ${priority.bg} rounded-xl border ${priority.border} hover:shadow-md transition-all group`}>
                      <div className="flex items-start">
                        <div className={`w-10 h-10 ${priority.bg} rounded-lg flex items-center justify-center mr-3 border ${priority.border}`}>
                          <i className={`${priority.icon} text-lg ${priority.color}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-sm mb-1 group-hover:text-[#0E8B86] transition-colors">{alert.message}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <i className="ri-time-line"></i>
                              {alert.time}
                            </span>
                            {alert.patient && (
                              <span className="flex items-center gap-1">
                                <i className="ri-user-line"></i>
                                {alert.patient}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <i className="ri-notification-line text-4xl mb-2"></i>
                  <p>No recent alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
