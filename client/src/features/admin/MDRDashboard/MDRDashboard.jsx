import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';
import api from '../../../services/api';

const MDRDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [mdrPatients, setMdrPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch MDR stats
        const statsRes = await api.get('/patients/stats/mdr');
        if (statsRes.data?.ok) {
          setStats(statsRes.data.stats);
        }

        // Fetch MDR patients list
        const patientsRes = await api.get('/patients/mdr/list');
        if (patientsRes.data?.ok) {
          setMdrPatients(patientsRes.data.mdrPatients || []);
        }
      } catch (err) {
        console.error('Failed to load MDR data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getOrganismColor = (organism) => {
    if (!organism) return 'bg-gray-100 text-gray-700';
    if (organism.includes('MRSA')) return 'bg-red-100 text-red-700';
    if (organism.includes('VRE')) return 'bg-orange-100 text-orange-700';
    if (organism.includes('ESBL')) return 'bg-yellow-100 text-yellow-700';
    if (organism.includes('CRE')) return 'bg-purple-100 text-purple-700';
    if (organism.includes('TB')) return 'bg-pink-100 text-pink-700';
    return 'bg-blue-100 text-blue-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-red-600 animate-spin"></i>
          <p className="mt-4 text-gray-600">Loading MDR Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i className="ri-virus-line text-red-600"></i>
            MDR Tracking Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage Multi-Drug Resistant cases</p>
        </div>
        <Link
          to="/admin/patients"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <i className="ri-user-line"></i>
          All Patients
        </Link>
      </div>

      {/* Alert Banner */}
      {stats?.mdrPositive > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <i className="ri-alarm-warning-fill text-2xl text-red-600"></i>
            <div>
              <h3 className="font-bold text-red-800">Active MDR Alert</h3>
              <p className="text-red-700">
                {stats.mdrPositive} patients are currently MDR positive. Isolation and contact tracing protocols are active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">MDR Positive</p>
              <p className="text-4xl font-bold mt-1">{stats?.mdrPositive || 0}</p>
              <p className="text-red-200 text-xs mt-1">
                {stats?.mdrPercentage}% of patients
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-virus-fill text-3xl"></i>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Safe Patients</p>
              <p className="text-4xl font-bold mt-1">{stats?.mdrNegative || 0}</p>
              <p className="text-green-200 text-xs mt-1">
                No MDR detected
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-shield-check-fill text-3xl"></i>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">In Isolation</p>
              <p className="text-4xl font-bold mt-1">{stats?.isolationRequired || 0}</p>
              <p className="text-orange-200 text-xs mt-1">
                Isolation Ward
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-home-heart-fill text-3xl"></i>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Recent Cases (7d)</p>
              <p className="text-4xl font-bold mt-1">{stats?.recentMDRCases || 0}</p>
              <p className="text-purple-200 text-xs mt-1">
                New this week
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-calendar-check-fill text-3xl"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* MDR by Ward and Organism */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Ward */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-hospital-line text-blue-600"></i>
            MDR Cases by Ward
          </h3>
          <div className="space-y-3">
            {stats?.mdrByWard?.length > 0 ? (
              stats.mdrByWard.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="ri-hospital-fill text-blue-600"></i>
                    </div>
                    <span className="font-medium text-gray-800">{item.ward || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-800">{item.count}</span>
                    <span className="text-sm text-gray-500">patients</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </Card>

        {/* By Organism */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-bug-line text-red-600"></i>
            MDR Cases by Organism
          </h3>
          <div className="space-y-3">
            {stats?.mdrByOrganism?.length > 0 ? (
              stats.mdrByOrganism.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrganismColor(item.organism)}`}>
                      {item.organism?.split(' ')[0] || 'Unknown'}
                    </div>
                    <span className="text-sm text-gray-600 hidden md:block">
                      {item.organism?.includes('(') ? item.organism.split('(')[1]?.replace(')', '') : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-800">{item.count}</span>
                    <span className="text-sm text-gray-500">cases</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* MDR Patients List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i className="ri-file-list-3-line text-red-600"></i>
            MDR Positive Patients ({mdrPatients.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50 border-b border-red-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase">Ward / Bed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase">Organism</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase">Diagnosis Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase">Treatment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mdrPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    <i className="ri-virus-line text-4xl mb-2 text-green-500"></i>
                    <p className="text-green-600 font-medium">No MDR positive patients</p>
                  </td>
                </tr>
              ) : (
                mdrPatients.map((patient, index) => (
                  <tr key={patient.id} className="hover:bg-red-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <i className="ri-user-line text-red-600"></i>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{patient.fullName}</div>
                          <div className="text-xs text-gray-500">
                            {patient.gender}, {patient.age}y
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-800">{patient.ward}</div>
                      <div className="text-xs text-gray-500 font-mono">{patient.bedNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getOrganismColor(patient.organism)}`}>
                        {patient.organism?.split(' ')[0] || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(patient.diagnosisDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {patient.treatmentStarted ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <i className="ri-checkbox-circle-fill"></i>
                          Started {formatDate(patient.treatmentStarted)}
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <i className="ri-time-line"></i>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {patient.isolationRequired && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <i className="ri-home-heart-line"></i>
                            Isolated
                          </span>
                        )}
                        {patient.contactTracingInitiated && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <i className="ri-share-line"></i>
                            Tracing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        <i className="ri-eye-line"></i>
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedPatient(null);
          }}
          title="MDR Patient Details"
        >
          <div className="space-y-4">
            {/* Patient Header */}
            <div className="flex items-center gap-4 bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-virus-fill text-3xl text-red-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPatient.fullName}</h3>
                <p className="text-red-600 font-semibold">MDR Positive</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Gender / Age</p>
                <p className="font-medium">{selectedPatient.gender}, {selectedPatient.age} years</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Mobile</p>
                <p className="font-medium">{selectedPatient.mobileNumber}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Ward</p>
                <p className="font-medium">{selectedPatient.ward}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Bed Number</p>
                <p className="font-medium font-mono">{selectedPatient.bedNumber}</p>
              </div>
            </div>

            {/* MDR Details */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <i className="ri-bug-line"></i>
                MDR Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Organism:</span>
                  <span className="font-medium text-red-700">{selectedPatient.organism}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Diagnosis Date:</span>
                  <span className="font-medium">{formatDate(selectedPatient.diagnosisDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Treatment Started:</span>
                  <span className="font-medium">{formatDate(selectedPatient.treatmentStarted)}</span>
                </div>
              </div>
            </div>

            {/* Resistance Pattern */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <i className="ri-shield-cross-line"></i>
                Resistance Pattern
              </h4>
              <p className="text-sm text-orange-700">{selectedPatient.resistancePattern}</p>
            </div>

            {/* Status Indicators */}
            <div className="flex gap-4">
              <div className={`flex-1 p-3 rounded-lg border ${selectedPatient.isolationRequired ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  {selectedPatient.isolationRequired ? (
                    <i className="ri-checkbox-circle-fill text-green-600"></i>
                  ) : (
                    <i className="ri-close-circle-line text-gray-400"></i>
                  )}
                  <span className="font-medium">Isolation</span>
                </div>
              </div>
              <div className={`flex-1 p-3 rounded-lg border ${selectedPatient.contactTracingInitiated ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  {selectedPatient.contactTracingInitiated ? (
                    <i className="ri-checkbox-circle-fill text-green-600"></i>
                  ) : (
                    <i className="ri-close-circle-line text-gray-400"></i>
                  )}
                  <span className="font-medium">Contact Tracing</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedPatient.notes && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <i className="ri-file-text-line"></i>
                  Notes
                </h4>
                <p className="text-sm text-blue-700">{selectedPatient.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <i className="ri-share-line"></i>
                View Contacts
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MDRDashboard;
