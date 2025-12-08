import { useState, useEffect, useRef } from 'react';
import Card from '../../../components/Card';
import gsap from 'gsap';
import api from '../../../services/api';
import useAppStore from '../../../store/useAppStore';

const SystemHealth = () => {
  const containerRef = useRef(null);
  const { dashboardStats, fetchDashboardStats } = useAppStore();
  const [systemHealth, setSystemHealth] = useState({
    lastSync: new Date(),
    mongodb: 'connected',
    mysql: 'disconnected'
  });

  const [integrations, setIntegrations] = useState([
    { name: 'EMR System', status: 'Connected', icon: 'ri-hospital-line', color: 'green' },
    { name: 'Lab Integration', status: 'Connected', icon: 'ri-test-tube-line', color: 'green' },
    { name: 'RFID Network', status: 'Connected', icon: 'ri-sensor-line', color: 'green' },
    { name: 'SMS Gateway', status: 'Checking...', icon: 'ri-message-3-line', color: 'yellow' },
    { name: 'Email Service', status: 'Connected', icon: 'ri-mail-line', color: 'green' },
  ]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }

    // Fetch dashboard stats and system health
    fetchDashboardStats();
    
    api.get('/dashboard/health').then(res => {
      if (res.data.ok) {
        setSystemHealth({
          lastSync: res.data.health?.lastSync ? new Date(res.data.health.lastSync) : new Date(),
          mongodb: res.data.health?.mongodb || 'unknown',
          mysql: res.data.health?.mysql || 'unknown'
        });
      }
    }).catch(err => {
      console.error('Failed to fetch system health:', err);
      // Keep default values on error
    });

    // Simulate status check
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((int) =>
          int.name === 'SMS Gateway'
            ? { ...int, status: 'Connected', color: 'green' }
            : int
        )
      );
    }, 2000);
  }, [fetchDashboardStats]);

  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">System Health & Billing</h1>
        <p className="text-gray-600 mt-1">Monitor integrations and subscription status</p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-teal to-accent-blue text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">System Status</p>
              <h3 className="text-3xl font-bold mt-2">
                {systemHealth?.database?.mongodb === 'connected' ? 'Healthy' : 'Degraded'}
              </h3>
            </div>
            <i className="ri-heart-pulse-line text-5xl opacity-50"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cta-green to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Users</p>
              <h3 className="text-3xl font-bold mt-2">
                {dashboardStats?.stats?.users?.total || 0}
              </h3>
            </div>
            <i className="ri-user-line text-5xl opacity-50"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-blue to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Users</p>
              <h3 className="text-3xl font-bold mt-2">
                {dashboardStats?.stats?.users?.active || 0}
              </h3>
            </div>
            <i className="ri-user-check-line text-5xl opacity-50"></i>
          </div>
        </Card>
      </div>

      {/* Database Stats */}
      {systemHealth && (
        <Card title="Database Statistics" icon="ri-database-2-line">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-light-teal rounded-lg">
              <i className="ri-user-line text-3xl text-primary-teal mb-2"></i>
              <p className="text-2xl font-bold text-dark-text">{systemHealth.collections.users}</p>
              <p className="text-sm text-gray-600">Users</p>
            </div>
            <div className="text-center p-4 bg-light-teal rounded-lg">
              <i className="ri-user-heart-line text-3xl text-primary-teal mb-2"></i>
              <p className="text-2xl font-bold text-dark-text">{systemHealth.collections.persons}</p>
              <p className="text-sm text-gray-600">Persons</p>
            </div>
            <div className="text-center p-4 bg-light-teal rounded-lg">
              <i className="ri-virus-line text-3xl text-red-500 mb-2"></i>
              <p className="text-2xl font-bold text-dark-text">{systemHealth.collections.mdrCases}</p>
              <p className="text-sm text-gray-600">MDR Cases</p>
            </div>
            <div className="text-center p-4 bg-light-teal rounded-lg">
              <i className="ri-alarm-warning-line text-3xl text-yellow-500 mb-2"></i>
              <p className="text-2xl font-bold text-dark-text">{systemHealth.collections.alerts}</p>
              <p className="text-sm text-gray-600">Alerts</p>
            </div>
            <div className="text-center p-4 bg-light-teal rounded-lg">
              <i className="ri-sensor-line text-3xl text-accent-blue mb-2"></i>
              <p className="text-2xl font-bold text-dark-text">{systemHealth.collections.rawEvents}</p>
              <p className="text-sm text-gray-600">RFID Events</p>
            </div>
          </div>
        </Card>
      )}

      {/* Integration Status */}
      <Card title="Integration Status" icon="ri-plug-line">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="border border-grey-light rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-light-teal rounded-lg flex items-center justify-center">
                    <i className={`${integration.icon} text-xl text-primary-teal`}></i>
                  </div>
                  <h4 className="font-semibold text-dark-text">{integration.name}</h4>
                </div>
                <div className={`w-3 h-3 rounded-full ${statusColors[integration.color]}`}></div>
              </div>
              <p className="text-sm text-gray-600">{integration.status}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Last Sync */}
      <Card title="Synchronization" icon="ri-refresh-line">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-light-teal rounded-lg">
            <div>
              <p className="font-medium text-dark-text">Last EMR Sync</p>
              <p className="text-sm text-gray-600">
                {systemHealth?.lastSync ? new Date(systemHealth.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
            <button className="bg-primary-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
              <i className="ri-refresh-line mr-2"></i>
              Sync Now
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-light-teal rounded-lg">
            <div>
              <p className="font-medium text-dark-text">RFID Data Stream</p>
              <p className="text-sm text-gray-600">Real-time updates active</p>
            </div>
            <span className="text-cta-green font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-cta-green rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </Card>

      {/* Billing */}
      <Card title="Subscription & Billing" icon="ri-bank-card-line">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-l-4 border-primary-teal pl-4">
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-2xl font-bold text-dark-text">Enterprise Pro</p>
            </div>
            <div className="border-l-4 border-cta-green pl-4">
              <p className="text-sm text-gray-600">Monthly Cost</p>
              <p className="text-2xl font-bold text-dark-text">₹49,999</p>
            </div>
            <div className="border-l-4 border-accent-blue pl-4">
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="text-2xl font-bold text-dark-text">Dec 10, 2025</p>
            </div>
          </div>

          <div className="bg-light-teal p-6 rounded-lg">
            <h4 className="font-semibold text-dark-text mb-4">Plan Features</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <i className="ri-checkbox-circle-fill text-cta-green"></i>
                Unlimited users
              </li>
              <li className="flex items-center gap-2 text-sm">
                <i className="ri-checkbox-circle-fill text-cta-green"></i>
                Real-time RFID tracking
              </li>
              <li className="flex items-center gap-2 text-sm">
                <i className="ri-checkbox-circle-fill text-cta-green"></i>
                EMR/Lab integration
              </li>
              <li className="flex items-center gap-2 text-sm">
                <i className="ri-checkbox-circle-fill text-cta-green"></i>
                Advanced analytics
              </li>
              <li className="flex items-center gap-2 text-sm">
                <i className="ri-checkbox-circle-fill text-cta-green"></i>
                24/7 support
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemHealth;
