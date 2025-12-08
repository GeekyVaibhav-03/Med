import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import Toast from '../../../components/Toast';

const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mdrFlags, setMdrFlags] = useState([]);

  // Form state for lab report upload
  const [formData, setFormData] = useState({
    patientId: '',
    reportId: '',
    testName: '',
    organism: '',
    sampleType: 'Blood',
    collectedAt: '',
    resultAt: '',
    reportFileUrl: '',
    antibioticSensitivity: [],
  });

  const [newAntibiotic, setNewAntibiotic] = useState({ name: '', result: 'Sensitive' });

  useEffect(() => {
    fetchActiveMDRFlags();
  }, []);

  const fetchActiveMDRFlags = async () => {
    try {
      const response = await api.get('/mdr-flags/active');
      setMdrFlags(response.data.flags || []);
    } catch (error) {
      console.error('Error fetching MDR flags:', error);
    }
  };

  const fetchPatientReports = async (patientId) => {
    setLoading(true);
    try {
      const response = await api.get(`/lab-reports/patient/${patientId}`);
      setReports(response.data.reports || []);
      setToast({ type: 'success', message: `Found ${response.data.reports.length} reports` });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch reports' });
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/lab-reports/upload', {
        ...formData,
        collectedAt: new Date(formData.collectedAt).toISOString(),
        resultAt: new Date(formData.resultAt).toISOString(),
      });

      const { mdrDetected, flagCreated } = response.data;

      if (mdrDetected) {
        setToast({
          type: 'warning',
          message: `🚨 MDR ORGANISM DETECTED! Patient has been flagged. ${flagCreated ? 'New flag created.' : 'Flag already exists.'}`,
        });
      } else {
        setToast({ type: 'success', message: 'Lab report uploaded successfully' });
      }

      // Reset form
      setFormData({
        patientId: '',
        reportId: '',
        testName: '',
        organism: '',
        sampleType: 'Blood',
        collectedAt: '',
        resultAt: '',
        reportFileUrl: '',
        antibioticSensitivity: [],
      });
      setShowUploadModal(false);
      fetchActiveMDRFlags();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to upload report',
      });
    } finally {
      setLoading(false);
    }
  };

  const addAntibiotic = () => {
    if (newAntibiotic.name.trim()) {
      setFormData({
        ...formData,
        antibioticSensitivity: [...formData.antibioticSensitivity, { ...newAntibiotic }],
      });
      setNewAntibiotic({ name: '', result: 'Sensitive' });
    }
  };

  const removeAntibiotic = (index) => {
    setFormData({
      ...formData,
      antibioticSensitivity: formData.antibioticSensitivity.filter((_, i) => i !== index),
    });
  };

  const clearMDRFlag = async (flagId) => {
    if (!confirm('Are you sure you want to clear this MDR flag?')) return;

    const reason = prompt('Enter reason for clearing flag:');
    if (!reason) return;

    try {
      await api.post(`/mdr-flags/${flagId}/clear`, {
        clearedBy: 'current_user_id', // Replace with actual user ID from auth store
        clearedReason: reason,
      });
      setToast({ type: 'success', message: 'MDR flag cleared successfully' });
      fetchActiveMDRFlags();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to clear MDR flag' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lab Report Management</h1>
          <p className="text-gray-600 mt-1">Upload lab reports and monitor MDR organisms</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-[#0E8B86] to-[#28B99A] text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
        >
          <i className="ri-upload-2-line"></i>
          Upload Lab Report
        </button>
      </div>

      {/* Active MDR Flags */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="ri-alert-line text-red-500"></i>
          Active MDR Flags ({mdrFlags.length})
        </h2>

        {mdrFlags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active MDR flags</p>
        ) : (
          <div className="space-y-3">
            {mdrFlags.map((flag) => (
              <motion.div
                key={flag.flag_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-l-4 ${
                  flag.severity === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : flag.severity === 'high'
                    ? 'bg-orange-50 border-orange-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-800">
                        Patient #{flag.patient_id} - {flag.patient_name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          flag.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : flag.severity === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {flag.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 font-semibold mt-2">
                      🦠 {flag.organism} - {flag.full_name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">{flag.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        <i className="ri-calendar-line"></i> Flagged:{' '}
                        {new Date(flag.flagged_at).toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        <i className="ri-shield-cross-line"></i> Isolation:{' '}
                        {flag.isolation_type || 'Standard'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => clearMDRFlag(flag.flag_id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                  >
                    Clear Flag
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Search Patient Reports */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Search Patient Reports</h2>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Enter Patient ID"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent"
          />
          <button
            onClick={() => fetchPatientReports(selectedPatient)}
            disabled={!selectedPatient || loading}
            className="px-6 py-2 bg-[#0E8B86] text-white rounded-lg hover:bg-[#0a6f6a] disabled:bg-gray-300 transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {reports.length > 0 && (
          <div className="mt-6 space-y-3">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{report.test_name}</h3>
                    <p className="text-gray-600 mt-1">
                      Organism: <span className="font-semibold">{report.organism}</span>
                    </p>
                    <p className="text-gray-600">Sample: {report.sample_type}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Result Date: {new Date(report.result_at).toLocaleString()}
                    </p>
                  </div>
                  {report.is_mdr && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                      MDR DETECTED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload Lab Report</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleUploadReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Patient ID *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Report ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reportId}
                    onChange={(e) => setFormData({ ...formData, reportId: e.target.value })}
                    placeholder="LRP-12345"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    placeholder="Blood Culture"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organism *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organism}
                    onChange={(e) => setFormData({ ...formData, organism: e.target.value })}
                    placeholder="ESBL, MRSA, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sample Type *
                  </label>
                  <select
                    required
                    value={formData.sampleType}
                    onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86]"
                  >
                    <option>Blood</option>
                    <option>Urine</option>
                    <option>Sputum</option>
                    <option>Wound</option>
                    <option>Stool</option>
                    <option>CSF</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Report File URL
                  </label>
                  <input
                    type="url"
                    value={formData.reportFileUrl}
                    onChange={(e) => setFormData({ ...formData, reportFileUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Collected At *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.collectedAt}
                    onChange={(e) => setFormData({ ...formData, collectedAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Result At *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.resultAt}
                    onChange={(e) => setFormData({ ...formData, resultAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8B86]"
                  />
                </div>
              </div>

              {/* Antibiotic Sensitivity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Antibiotic Sensitivity
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Antibiotic name"
                    value={newAntibiotic.name}
                    onChange={(e) => setNewAntibiotic({ ...newAntibiotic, name: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={newAntibiotic.result}
                    onChange={(e) => setNewAntibiotic({ ...newAntibiotic, result: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Sensitive</option>
                    <option>Resistant</option>
                    <option>Intermediate</option>
                  </select>
                  <button
                    type="button"
                    onClick={addAntibiotic}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>

                {formData.antibioticSensitivity.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.antibioticSensitivity.map((ab, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span>
                          {ab.name} - <span className="font-semibold">{ab.result}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAntibiotic(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0E8B86] to-[#28B99A] text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                >
                  {loading ? 'Uploading...' : 'Upload Report'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LabReports;
