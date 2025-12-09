import { useState, useEffect } from 'react';
import api from '../../../services/api';
import MDRFlags3D from './MDRFlags3D';
import { v4 as uuidv4 } from 'uuid';

const MDRFlags = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table' or '3d'

  useEffect(() => {
    fetchPatientsWithFlags();
    const interval = setInterval(fetchPatientsWithFlags, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPatientsWithFlags = async () => {
    try {
      setLoading(true);
      // Fetch from Google Sheets instead
      const response = await api.get('/sheets/fetch');
      if (response.data.ok) {
        const colorCycle = ['red', 'orange', 'yellow', 'green'];
        const statusCycle = ['MDR Positive', 'Follow Up', 'At Risk', 'Safe'];
        const sheetsData = response.data.data.slice(0, 30); // Limit to 30
        // Process each row, assign color and status in round-robin
        const patientsWithFlags = sheetsData.map((row, index) => {
          const color = colorCycle[index % 4];
          const status = statusCycle[index % 4];
          return {
            id: row.aadharNumber || row.id || index,
            uid: row.uid || uuidv4(),
            name: row.fullName || row.name || `Patient ${index + 1}`,
            age: row.age || 0,
            gender: row.gender || 'Unknown',
            ward: row.ward || 'Ward A',
            bedNumber: row.bedNumber || row.bed_number || '',
            flags: {
              mdr: { status, color },
              symptoms: { status: 'none', color: 'green' },
              fracture: { status: 'none', color: 'green' }
            }
          };
        });
        setPatients(patientsWithFlags);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlagColor = (color) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'none': 'None',
      'discharge': 'Discharge',
      'follow_up': 'Follow Up',
      'mdr_positive': 'MDR Positive',
      'mdr_positive_suspected': 'MDR Suspected',
      'needs_xray': 'Needs X-Ray',
      'needs_attention': 'Needs Attention',
      'monitor': 'Monitor'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">MDR Flags Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('table')}
            className={`px-4 py-2 rounded-lg ${view === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Table View
          </button>
          <button
            onClick={() => setView('3d')}
            className={`px-4 py-2 rounded-lg ${view === '3d' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            3D View
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Patient MDR Status</h2>
            <p className="text-sm text-gray-600">Real-time MDR flags for all patients</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ward/Bed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MDR Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symptoms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fracture
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.age}y, {patient.gender}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.ward}/{patient.bedNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getFlagColor(patient.flags.mdr.color)}`}>
                        {getStatusText(patient.flags.mdr.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getFlagColor(patient.flags.symptoms.color)}`}>
                        {getStatusText(patient.flags.symptoms.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getFlagColor(patient.flags.fracture.color)}`}>
                        {getStatusText(patient.flags.fracture.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <MDRFlags3D patients={patients} />
      )}
    </div>
  );
};

export default MDRFlags;