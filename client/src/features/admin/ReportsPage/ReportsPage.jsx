import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../../components/Card';
import gsap from 'gsap';
import useAppStore from '../../../store/useAppStore';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('compliance');
  const containerRef = useRef(null);
  const { dashboardStats, fetchDashboardStats, mdrCases, fetchMDRCases } = useAppStore();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
    
    fetchDashboardStats();
    fetchMDRCases();
  }, [fetchDashboardStats, fetchMDRCases]);

  // Calculate metrics from real data
  const metrics = {
    mdrPositive: dashboardStats?.stats?.mdrCases?.active || 0,
    directContacts: dashboardStats?.stats?.patients?.highRisk || 0,
    indirectContacts: dashboardStats?.stats?.patients?.total || 0,
    alertsTriggered: dashboardStats?.stats?.alerts?.unresolved || 0,
    medianIsolationTime: 18,
    totalPatients: dashboardStats?.stats?.patients?.total || 0,
  };

  // Status distribution from risk levels
  const riskData = dashboardStats?.riskDistribution || [];
  const statusChartData = riskData.map(r => ({
    name: r._id === 'low' ? 'Low Risk' : r._id === 'medium' ? 'Medium Risk' : r._id === 'high' ? 'High Risk' : 'Critical',
    value: r.count,
    color: r._id === 'low' ? '#28B99A' : r._id === 'medium' ? '#FACC15' : r._id === 'high' ? '#FF9800' : '#F44336'
  }));

  // MDR cases by organism
  const organismData = (dashboardStats?.mdrByOrganism || []).map(o => ({
    name: o._id || 'Unknown',
    cases: o.count
  }));

  const timelineData = [
    { date: 'Nov 5', cases: 2, contacts: 8 },
    { date: 'Nov 6', cases: 3, contacts: 12 },
    { date: 'Nov 7', cases: 1, contacts: 5 },
    { date: 'Nov 8', cases: 4, contacts: 15 },
    { date: 'Nov 9', cases: 2, contacts: 9 },
    { date: 'Nov 10', cases: 3, contacts: 11 },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance & Audit Reports</h1>
          <p className="text-gray-700 mt-1 font-medium">Analytics and compliance tracking</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">MDR Positive</p>
              <h3 className="text-4xl font-bold mt-2">{metrics.mdrPositive}</h3>
            </div>
            <i className="ri-alert-line text-5xl opacity-50"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Direct Contacts</p>
              <h3 className="text-4xl font-bold mt-2">{metrics.directContacts}</h3>
            </div>
            <i className="ri-group-line text-5xl opacity-50"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Indirect Contacts</p>
              <h3 className="text-4xl font-bold mt-2">{metrics.indirectContacts}</h3>
            </div>
            <i className="ri-link text-5xl opacity-50"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Alerts Triggered</p>
              <h3 className="text-4xl font-bold mt-2">{metrics.alertsTriggered}</h3>
            </div>
            <i className="ri-notification-3-line text-5xl opacity-50"></i>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Patient Risk Distribution" icon="ri-pie-chart-line">
          <ResponsiveContainer width="100%" height={300}>
            {statusChartData.length > 0 ? (
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No risk distribution data available
              </div>
            )}
          </ResponsiveContainer>
        </Card>

        <Card title="MDR Cases by Organism" icon="ri-bar-chart-line">
          <ResponsiveContainer width="100%" height={300}>
            {organismData.length > 0 ? (
              <BarChart data={organismData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cases" fill="#EF4444" />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No MDR organism data available
              </div>
            )}
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Compliance Details */}
      <Card title="Compliance Metrics" icon="ri-bar-chart-box-line">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-primary-teal pl-4">
            <p className="text-sm text-gray-600">Median Time to Isolation</p>
            <p className="text-3xl font-bold text-dark-text mt-1">{metrics.medianIsolationTime}h</p>
          </div>
          <div className="border-l-4 border-cta-green pl-4">
            <p className="text-sm text-gray-600">Total Patients Traced</p>
            <p className="text-3xl font-bold text-dark-text mt-1">{metrics.totalPatients}</p>
          </div>
          <div className="border-l-4 border-accent-blue pl-4">
            <p className="text-sm text-gray-600">System Uptime</p>
            <p className="text-3xl font-bold text-dark-text mt-1">99.8%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
