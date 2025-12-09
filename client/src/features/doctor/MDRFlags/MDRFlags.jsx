import { useState, useEffect } from 'react';
import api from '../../../services/api';
import MDRFlags3D from './MDRFlags3D';

const MDRFlags = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table' or '3d'

  useEffect(() => {
    fetchPatientsWithFlags();
  }, []);

  const fetchPatientsWithFlags = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients/flags');
      if (response.data.ok) {
        setPatients(response.data.patients);
      }
    } catch (error) {
      console.error('Error fetching MDR flags:', error);
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