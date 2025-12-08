import { useState, useEffect } from 'react';
import useAppStore from '../../../store/useAppStore';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';

const PatientsPage = () => {
  const { patients, fetchPatients } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      await fetchPatients();
      setLoading(false);
    };
    loadPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.aadharNumber?.includes(searchQuery) ||
      patient.mobileNumber?.includes(searchQuery) ||
      patient.bedNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'mdr' && patient.mdrStatus === 'positive') ||
      (filterStatus === 'safe' && patient.mdrStatus !== 'positive');

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: patients.length,
    mdr: patients.filter((p) => p.mdrStatus === 'positive').length,
    safe: patients.filter((p) => p.mdrStatus !== 'positive').length,
    male: patients.filter((p) => p.gender === 'Male').length,
    female: patients.filter((p) => p.gender === 'Female').length,
  };

  const getStatusBadge = (mdrStatus) => {
    if (mdrStatus === 'positive') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
          <i className="ri-alert-fill"></i>
          MDR+
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
        <i className="ri-checkbox-circle-fill"></i>
        Safe
      </span>
    );
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <p className="text-gray-600 mt-1">View and manage all patient records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Patients</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <i className="ri-user-line text-4xl text-blue-200"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">MDR Positive</p>
              <p className="text-3xl font-bold mt-1">{stats.mdr}</p>
            </div>
            <i className="ri-alert-fill text-4xl text-red-200"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Safe</p>
              <p className="text-3xl font-bold mt-1">{stats.safe}</p>
            </div>
            <i className="ri-checkbox-circle-fill text-4xl text-green-200"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Male</p>
              <p className="text-3xl font-bold mt-1">{stats.male}</p>
            </div>
            <i className="ri-men-line text-4xl text-purple-200"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Female</p>
              <p className="text-3xl font-bold mt-1">{stats.female}</p>
            </div>
            <i className="ri-women-line text-4xl text-pink-200"></i>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, aadhar, mobile, or bed number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('mdr')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'mdr'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              MDR+ ({stats.mdr})
            </button>
            <button
              onClick={() => setFilterStatus('safe')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'safe'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Safe ({stats.safe})
            </button>
          </div>
        </div>
      </Card>

      {/* Patients Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Father/Husband
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ward
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bed No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    <i className="ri-user-search-line text-4xl mb-2"></i>
                    <p>No patients found</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{patient.fatherHusbandName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {patient.gender === 'Male' ? (
                          <i className="ri-men-line text-blue-600"></i>
                        ) : (
                          <i className="ri-women-line text-pink-600"></i>
                        )}
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{patient.age}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{patient.mobileNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{patient.ward}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{patient.bedNumber}</td>
                    <td className="px-4 py-3">{getStatusBadge(patient.mdrStatus)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(patient)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        <i className="ri-eye-line"></i>
                        View
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
          title="Patient Details"
        >
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{selectedPatient.fullName}</h3>
              {getStatusBadge(selectedPatient.mdrStatus)}
            </div>

            {/* Patient Information Grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase">Father/Husband Name</p>
                <p className="text-sm font-medium text-gray-900">{selectedPatient.fatherHusbandName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Gender</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedPatient.gender === 'Male' ? (
                    <span className="flex items-center gap-1">
                      <i className="ri-men-line text-blue-600"></i>
                      Male
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <i className="ri-women-line text-pink-600"></i>
                      Female
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Age</p>
                <p className="text-sm font-medium text-gray-900">{selectedPatient.age} years</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Mobile Number</p>
                <p className="text-sm font-medium text-gray-900">{selectedPatient.mobileNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Aadhar Number</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{selectedPatient.aadharNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Hospital</p>
                <p className="text-sm font-medium text-gray-900">{selectedPatient.hospital}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Ward</p>
                <p className="text-sm font-medium text-gray-900">{selectedPatient.ward}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Bed Number</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{selectedPatient.bedNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">RFID Tag</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{selectedPatient.rfidTag}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Admission Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(selectedPatient.admissionDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase mb-1">Address</p>
              <p className="text-sm font-medium text-gray-900">{selectedPatient.address}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <i className="ri-edit-line"></i>
                Edit Patient
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientsPage;
