import React, { useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../services/api';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';
import Toast from '../../../components/Toast';
import gsap from 'gsap';

const LabReportUpload = () => {
  const { user } = useAuthStore();
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'batch'
  const [formData, setFormData] = useState({
    patient_uid: '',
    patient_name: '',
    specimen_type: 'Blood',
    organism: '',
    antibiotic_profile: {
      Ampicillin: 'S',
      Amoxicillin: 'S',
      Ciprofloxacin: 'S',
      Gentamicin: 'S',
      Vancomycin: 'S',
      Doxycycline: 'S',
      Cephalexin: 'S',
      Meropenem: 'S',
      Colistin: 'S',
      Rifampicin: 'S',
    },
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [toast, setToast] = useState(null);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle antibiotic susceptibility changes
  const handleAntibioticChange = (antibiotic, value) => {
    setFormData((prev) => ({
      ...prev,
      antibiotic_profile: {
        ...prev.antibiotic_profile,
        [antibiotic]: value,
      },
    }));
  };

  // Submit single report
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient_uid || !formData.organism) {
      setToast({ message: '⚠️ Please fill in required fields', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/labreports/upload', formData);
      if (response.data.ok) {
        setToast({ message: '✅ Lab report uploaded successfully!', type: 'success' });
        // Reset form
        setFormData({
          patient_uid: '',
          patient_name: '',
          specimen_type: 'Blood',
          organism: '',
          antibiotic_profile: {
            Ampicillin: 'S',
            Amoxicillin: 'S',
            Ciprofloxacin: 'S',
            Gentamicin: 'S',
            Vancomycin: 'S',
            Doxycycline: 'S',
            Cephalexin: 'S',
            Meropenem: 'S',
            Colistin: 'S',
            Rifampicin: 'S',
          },
        });
      }
    } catch (error) {
      setToast({ message: `❌ Error: ${error.response?.data?.error || 'Upload failed'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection for batch upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['application/json', 'text/csv'].includes(file.type)) {
      setToast({ message: '❌ Only JSON and CSV files are supported', type: 'error' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: '❌ File size must be less than 5MB', type: 'error' });
      return;
    }

    setSelectedFile(file);
  };

  // Submit batch upload
  const handleBatchUpload = async () => {
    if (!selectedFile) {
      setToast({ message: '⚠️ Please select a file', type: 'warning' });
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('file', selectedFile);

    setLoading(true);
    try {
      const response = await api.post('/labreports/upload-file', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.ok) {
        setUploadResults(response.data.results);
        setToast({ 
          message: `✅ Batch upload complete! ${response.data.results.processed} records processed`, 
          type: 'success' 
        });
        setSelectedFile(null);
      }
    } catch (error) {
      setToast({ message: `❌ Error: ${error.response?.data?.error || 'Upload failed'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🔬 Lab Report Management</h1>
          <p className="text-gray-600">Upload individual or batch lab reports for MDR detection</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUploadMode('single')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              uploadMode === 'single'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📝 Single Report
          </button>
          <button
            onClick={() => setUploadMode('batch')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              uploadMode === 'batch'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📂 Batch Upload (JSON/CSV)
          </button>
        </div>

        {/* Single Report Upload */}
        {uploadMode === 'single' && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Upload Lab Report</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Patient UID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient UID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="patient_uid"
                    value={formData.patient_uid}
                    onChange={handleInputChange}
                    placeholder="e.g., P001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="patient_name"
                    value={formData.patient_name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Specimen Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specimen Type
                  </label>
                  <select
                    name="specimen_type"
                    value={formData.specimen_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Blood</option>
                    <option>Urine</option>
                    <option>Sputum</option>
                    <option>CSF</option>
                    <option>Swab</option>
                    <option>Wound</option>
                  </select>
                </div>

                {/* Organism */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organism <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organism"
                    value={formData.organism}
                    onChange={handleInputChange}
                    placeholder="e.g., Staphylococcus aureus"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Antibiotic Susceptibilities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Antibiotic Susceptibilities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(formData.antibiotic_profile).map((antibiotic) => (
                      <div key={antibiotic}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {antibiotic}
                        </label>
                        <select
                          value={formData.antibiotic_profile[antibiotic]}
                          onChange={(e) => handleAntibioticChange(antibiotic, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="S">Susceptible (S)</option>
                          <option value="R">Resistant (R)</option>
                          <option value="I">Intermediate (I)</option>
                          <option value="U">Unknown (U)</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? '⏳ Uploading...' : '📤 Upload Report'}
                </button>
              </form>
            </div>
          </Card>
        )}

        {/* Batch Upload */}
        {uploadMode === 'batch' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📂 Batch Upload (JSON/CSV)</h2>

                {/* File Input */}
                <div
                  className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div>
                      <p className="text-lg font-semibold text-green-600">✅ {selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-semibold text-gray-700">📁 Click or drag file here</p>
                      <p className="text-sm text-gray-500 mt-1">JSON or CSV files only (max 5MB)</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleBatchUpload}
                  disabled={!selectedFile || loading}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? '⏳ Uploading...' : '📤 Upload Batch'}
                </button>
              </div>
            </Card>

            {/* Format Examples */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📝 File Format Examples</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* JSON Example */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">JSON Format:</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
{`[
  {
    "patient_uid": "P001",
    "patient_name": "John Doe",
    "specimen_type": "Blood",
    "organism": "Staphylococcus aureus",
    "antibiotic_profile": {
      "Ampicillin": "R",
      "Ciprofloxacin": "R",
      "Vancomycin": "S"
    }
  }
]`}
                    </pre>
                  </div>

                  {/* CSV Example */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">CSV Format:</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
{`patient_uid,patient_name,specimen_type,organism,Ampicillin,Ciprofloxacin,Vancomycin
P001,John Doe,Blood,Staph aureus,R,R,S
P002,Jane Smith,Urine,E. coli,S,R,S`}
                    </pre>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upload Results */}
            {uploadResults && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Upload Results</h3>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Processed</p>
                      <p className="text-2xl font-bold text-blue-600">{uploadResults.processed}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">MDR+ Cases</p>
                      <p className="text-2xl font-bold text-red-600">{uploadResults.mdr_count}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Errors</p>
                      <p className="text-2xl font-bold text-orange-600">{uploadResults.errors?.length || 0}</p>
                    </div>
                  </div>

                  {/* Error List */}
                  {uploadResults.errors && uploadResults.errors.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">⚠️ Errors:</h4>
                      <div className="space-y-2">
                        {uploadResults.errors.map((error, idx) => (
                          <div key={idx} className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                            <p className="font-semibold text-red-700">{error.patient_uid}</p>
                            <p className="text-red-600">{error.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabReportUpload;
