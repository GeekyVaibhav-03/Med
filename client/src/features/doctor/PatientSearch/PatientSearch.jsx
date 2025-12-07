import { useState, useEffect, useRef } from 'react';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';
import useAppStore from '../../../store/useAppStore';
import { parseCSV, parseExcel } from '../../../services/csvParser';
import { buildContactNetwork } from '../../../services/tracingEngine';
import gsap from 'gsap';

const PatientSearch = () => {
  const { patients = [], contactData = [], setContactData } = useAppStore(); // safe defaults
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      let parsedData;
      if (file.name.endsWith('.csv')) {
        parsedData = await parseCSV(file);
      } else {
        parsedData = await parseExcel(file);
      }
      setContactData(parsedData || []); // safe default
      alert(`Successfully imported ${parsedData.length} records! / ${parsedData.length} records import ho gaye!`);
    } catch (error) {
      console.error('File parse error', error);
      alert('Error parsing file. Please check format.');
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);

    if (Array.isArray(contactData) && contactData.length > 0) {
      const network = buildContactNetwork(contactData, patient.id);
      setContacts(network.nodes || []); // safe default
    } else {
      setContacts([]);
    }

    setShowModal(true);
  };

  const filteredPatients = Array.isArray(patients)
    ? patients.filter(
        (patient) =>
          patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient?.id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getStatusBadge = (status) => {
    const badges = {
      red: { bg: 'bg-red-500', text: 'MDR Positive', icon: 'ri-alert-fill' },
      yellow: { bg: 'bg-yellow-500', text: 'Contact/Risky', icon: 'ri-error-warning-fill' },
      green: { bg: 'bg-green-500', text: 'Safe', icon: 'ri-checkbox-circle-fill' },
    };
    return badges[status] || badges.green;
  };

  return (
    <div ref={containerRef} className="space-y-6 opacity-100">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Tracing Search</h1>
          <p className="text-gray-700 mt-1 font-medium">Search and trace patient contacts / Patient search karein</p>
        </div>
        <div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="bg-cta-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition cursor-pointer flex items-center gap-2"
          >
            <i className="ri-file-upload-line"></i>
            Import CSV/Excel
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <Card icon="ri-search-line">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by patient name or ID / Patient ka naam ya ID dalein..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal text-lg"
          />
        </div>
      </Card>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => {
            const badge = getStatusBadge(patient.status);
            return (
              <Card
                key={patient.id}
                className="cursor-pointer hover:shadow-xl transition-all"
                onClick={() => handlePatientClick(patient)}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={`https://source.unsplash.com/100x100/?portrait,${patient.id}`}
                    alt={patient.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-dark-text">{patient.name}</h3>
                    <p className="text-sm text-gray-600">ID: {patient.id}</p>
                    <p className="text-sm text-gray-600">Age: {patient.age || '-'}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className={`${badge.bg} text-white px-3 py-2 rounded-lg flex items-center gap-2`}>
                    <i className={badge.icon}></i>
                    <span className="font-semibold">{badge.text}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Room: {patient.room || '-'}</span>
                    <span className="text-gray-600">{patient.lastContact ? new Date(patient.lastContact).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <i className="ri-user-search-line text-6xl mb-4"></i>
              <p className="text-lg">No patients found matching your search</p>
              <p className="text-sm">Koi patient nahi mila</p>
            </div>
          </Card>
        )}
      </div>

      {/* Patient Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Patient Details" size="lg">
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <img
                src={`https://source.unsplash.com/150x150/?portrait,${selectedPatient.id}`}
                alt={selectedPatient.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-dark-text">{selectedPatient.name}</h2>
                <p className="text-gray-600">Patient ID: {selectedPatient.id}</p>
                <div className="mt-3 flex gap-3">
                  <span className="bg-light-teal px-3 py-1 rounded-full text-sm">Age: {selectedPatient.age || '-'}</span>
                  <span className="bg-light-teal px-3 py-1 rounded-full text-sm">Room: {selectedPatient.room || '-'}</span>
                </div>
              </div>
            </div>

            <div className={`${getStatusBadge(selectedPatient.status).bg} text-white p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <i className={`${getStatusBadge(selectedPatient.status).icon} text-2xl`}></i>
                <h3 className="text-lg font-bold">Status: {selectedPatient.mdrStatus || '-'}</h3>
              </div>
              <p className="text-sm opacity-90">
                Last Contact: {selectedPatient.lastContact ? new Date(selectedPatient.lastContact).toLocaleString() : '-'}
              </p>
            </div>

            {contacts.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-dark-text mb-3">Contact Trace</h3>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {contacts.map((contact, idx) => (
                    <div key={idx} className="bg-light-teal p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{contact.name || '-'}</p>
                        <p className="text-xs text-gray-600">
                          Level {contact.level || '-'} - {contact.type || '-'} contact
                        </p>
                      </div>
                      <span className="text-accent-blue">
                        <i className="ri-link"></i>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientSearch;
