import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import useAppStore from '../../../store/useAppStore';
import DoctorCarousel from '../../../components/DoctorCarousel';

const DoctorDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const { 
    patients = [], 
    alerts = [], 
    mdrCases = [],
    rfidData = [],
    fetchPatients,
    fetchAlerts,
    fetchMDRCases,
    fetchRFIDData
  } = useAppStore();
  
  const [stats, setStats] = useState({
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
          fetchPatients(),
          fetchAlerts(),
          fetchMDRCases(),
          fetchRFIDData()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Calculate stats from real data
    const mdrCount = patients.filter(p => p.status === 'red' || p.mdrStatus === 'positive').length;
    const contactCount = patients.filter(p => p.status === 'yellow' || p.riskLevel === 'high').length;
    const pendingCount = alerts.filter(a => !a.resolved && !a.read).length;
    const activeEquip = rfidData.filter(d => d.active).length;
    const criticalCount = mdrCases.filter(c => c.severity === 'critical' || c.urgent).length;

    setStats({
      totalPatients: patients.length,
      mdrCases: mdrCount,
      recentContacts: contactCount,
      pendingAlerts: pendingCount,
      activeEquipment: activeEquip,
      criticalCases: criticalCount
    });
  }, [patients, alerts, mdrCases, rfidData]);

  const quickActions = [
    {
      title: 'Patient Search',
      description: 'Search and view patient records',
      icon: 'ri-search-line',
      link: '/doctor/search',
      color: 'from-teal-500 to-teal-600',
      badge: patients.length
    },
    {
      title: 'Real-Time Map',
      description: 'Track patient locations live',
      icon: 'ri-map-pin-line',
      link: '/doctor/map',
      color: 'from-blue-500 to-blue-600',
      badge: rfidData.filter(d => d.active).length
    },
    {
      title: 'Contact Network',
      description: 'View contact tracing network',
      icon: 'ri-node-tree',
      link: '/doctor/network',
      color: 'from-purple-500 to-purple-600',
      badge: null
    },
    {
      title: 'Equipment Check',
      description: 'Monitor medical equipment',
      icon: 'ri-stethoscope-line',
      link: '/doctor/equipment',
      color: 'from-orange-500 to-orange-600',
      badge: stats.activeEquipment
    },
    {
      title: 'MDR Flags',
      description: 'View patient MDR status flags',
      icon: 'ri-flag-line',
      link: '/doctor/mdr-flags',
      color: 'from-red-500 to-red-600',
      badge: null
    }
  ];

  const recentAlerts = alerts.slice(0, 5);
  const pendingAlerts = alerts.filter(a => !a.resolved).slice(0, 5);
  const recentPatients = patients.slice(0, 6);
  const criticalMDRCases = mdrCases.filter(c => c.severity === 'critical' || c.urgent).slice(0, 4);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0E8B86] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section - Healthcare Banner */}
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
                <i className="ri-stethoscope-line text-lg"></i>
                <span className="text-sm font-semibold">Doctor Portal</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">System Active</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Healthcare<br/>
              <span className="bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">MDR Tracing</span>
            </h1>
            
            <p className="text-base md:text-lg text-teal-100 mb-8 max-w-md">
              Advanced contact tracing and patient monitoring for healthcare facilities
            </p>
            
            <Link
              to="/doctor/search"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FBBF24] to-[#FCD34D] hover:from-[#FCD34D] hover:to-[#FBBF24] text-gray-900 font-bold px-6 md:px-8 py-3 md:py-4 rounded-full transition-all transform hover:scale-105 shadow-xl"
            >
              <span>Start Consultation</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </Link>
          </div>
          
          {/* Right Image - Carousel */}
          <div className="flex justify-center lg:justify-end">
            <DoctorCarousel />
          </div>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-user-heart-line text-2xl text-blue-600"></i>
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
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-stethoscope-line text-2xl text-green-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.activeEquipment}</div>
              <div className="text-xs text-gray-600">Equipment</div>
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

      {/* Quick Actions - Clean Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-lg flex items-center justify-center">
            <i className="ri-lightning-line text-white"></i>
          </div>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions && quickActions.length > 0 ? (
            quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
                  <i className={`${action.icon} text-2xl`}></i>
                </div>
                {action.badge !== null && (
                  <div className="bg-[#FBBF24] text-gray-900 font-bold px-3 py-1 rounded-full text-sm">
                    {action.badge}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#0E8B86] transition-colors">{action.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{action.description}</p>
              <div className="flex items-center text-[#0E8B86] font-semibold group-hover:gap-2 transition-all">
                <span>Open</span>
                <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
              </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400">
              <p>No quick actions available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-lg flex items-center justify-center">
            <i className="ri-history-line text-white"></i>
          </div>
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Patients</h3>
              <Link
                to="/doctor/search"
                className="text-[#0E8B86] hover:text-[#28B99A] font-semibold flex items-center text-sm transition-colors"
              >
                View All <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>
            <div className="space-y-3">
              {recentPatients.length > 0 ? (
                recentPatients.slice(0, 4).map((patient, idx) => {
                  const statusConfig = {
                    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'ri-alert-fill', label: 'MDR+' },
                    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'ri-error-warning-fill', label: 'Risk' },
                    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'ri-checkbox-circle-fill', label: 'Safe' }
                  };
                  const status = statusConfig[patient.status] || statusConfig.green;

                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 ${status.bg} rounded-xl border ${status.border} hover:shadow-md transition-all group`}>
                      <div className="flex items-center flex-1">
                        <div className={`w-10 h-10 ${status.bg} rounded-lg flex items-center justify-center mr-3 border ${status.border}`}>
                          <i className={`${status.icon} text-lg ${status.text}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-sm group-hover:text-[#0E8B86] transition-colors">{patient.name}</div>
                          <div className="text-xs text-gray-500">ID: {patient.id}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${status.bg} ${status.text} rounded-full text-xs font-semibold border ${status.border}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <i className="ri-user-line text-4xl mb-2"></i>
                  <p>No recent patients</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Alerts</h3>
              <Link
                to="/doctor/alerts"
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
}

export default DoctorDashboard;
