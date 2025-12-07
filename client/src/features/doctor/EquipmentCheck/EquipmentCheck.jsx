import { useState, useEffect, useRef } from 'react';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';
import gsap from 'gsap';

const EquipmentCheck = () => {
  const containerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Static/mock data for equipment
  const [equipment, setEquipment] = useState([
    {
      id: 'EQ001',
      name: 'Ventilator A',
      contaminated: true,
      action: 'Quarantine',
      lastUsers: [
        { userName: 'Ramesh Kumar', timestamp: Date.now() - 3600000, status: 'red' },
        { userName: 'Sunita Devi', timestamp: Date.now() - 7200000, status: 'yellow' },
      ],
    },
    {
      id: 'EQ002',
      name: 'ECG Machine',
      contaminated: false,
      action: 'Clean',
      lastUsers: [
        { userName: 'Dr. Amit', timestamp: Date.now() - 1800000, status: 'green' },
      ],
    },
    {
      id: 'EQ003',
      name: 'Infusion Pump',
      contaminated: true,
      action: 'Replace',
      lastUsers: [
        { userName: 'Nurse Priya', timestamp: Date.now() - 5400000, status: 'red' },
      ],
    },
    {
      id: 'EQ004',
      name: 'Ultrasound Machine',
      contaminated: false,
      action: 'Safe',
      lastUsers: [
        { userName: 'Vikram Patel', timestamp: Date.now() - 900000, status: 'green' },
      ],
    },
  ]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  const handleEquipmentClick = (eq) => {
    setSelectedEquipment(eq);
    setShowModal(true);
  };

  const filteredEquipment = equipment.filter((eq) =>
    eq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionBadge = (action) => {
    const badges = {
      Replace: { bg: 'bg-red-500', icon: 'ri-close-circle-fill' },
      Clean: { bg: 'bg-yellow-500', icon: 'ri-alert-fill' },
      Quarantine: { bg: 'bg-orange-500', icon: 'ri-lock-fill' },
      Safe: { bg: 'bg-green-500', icon: 'ri-checkbox-circle-fill' },
    };
    return badges[action] || badges.Safe;
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Equipment Exposure Check</h1>
        <p className="text-gray-600 mt-1">Check equipment contamination status / Equipment check karein</p>
      </div>

      {/* Search */}
      <Card icon="ri-search-line">
        <input
          type="text"
          placeholder="Search by equipment ID or name / Equipment ID ya naam dalein..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal text-lg"
        />
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => {
          const badge = getActionBadge(eq.action);
          return (
            <Card
              key={eq.id}
              className="cursor-pointer hover:shadow-xl transition-all"
              onClick={() => handleEquipmentClick(eq)}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-light-teal rounded-lg flex items-center justify-center">
                  <i className="ri-stethoscope-line text-3xl text-primary-teal"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-dark-text">{eq.name}</h3>
                  <p className="text-sm text-gray-600">ID: {eq.id}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {eq.contaminated ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3">
                    <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                      <i className="ri-alert-fill"></i>
                      ⚠️ CONTAMINATED
                    </p>
                    <p className="text-xs text-red-600 mt-1">MDR patient used this equipment</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border-l-4 border-green-500 p-3">
                    <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill"></i>
                      ✓ SAFE
                    </p>
                  </div>
                )}

                <div className={`${badge.bg} text-white px-3 py-2 rounded-lg flex items-center justify-between`}>
                  <span className="font-semibold">Action: {eq.action}</span>
                  <i className={badge.icon}></i>
                </div>

                <div className="text-xs text-gray-600">
                  Last User: {eq.lastUsers[0]?.userName || 'N/A'}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <i className="ri-search-line text-6xl mb-4"></i>
            <p className="text-lg">No equipment found</p>
            <p className="text-sm">Koi equipment nahi mila</p>
          </div>
        </Card>
      )}

      {/* Equipment Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Equipment Details"
        size="lg"
      >
        {selectedEquipment && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-light-teal rounded-lg flex items-center justify-center">
                <i className="ri-stethoscope-line text-4xl text-primary-teal"></i>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-dark-text">{selectedEquipment.name}</h2>
                <p className="text-gray-600">Equipment ID: {selectedEquipment.id}</p>
                <div className="mt-3">
                  {selectedEquipment.contaminated ? (
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                      ⚠️ CONTAMINATED
                    </span>
                  ) : (
                    <span className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      ✓ SAFE
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={`${getActionBadge(selectedEquipment.action).bg} text-white p-4 rounded-lg`}>
              <h3 className="text-lg font-bold mb-2">Recommended Action</h3>
              <p className="text-2xl font-bold">{selectedEquipment.action}</p>
              <p className="text-sm opacity-90 mt-2">
                {selectedEquipment.action === 'Replace' && 'Immediate replacement required'}
                {selectedEquipment.action === 'Clean' && 'Thorough cleaning and disinfection needed'}
                {selectedEquipment.action === 'Quarantine' && 'Isolate equipment for 48-72 hours'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-dark-text mb-3">Last Users</h3>
              <div className="space-y-2">
                {selectedEquipment.lastUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="bg-light-teal p-3 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          user.status === 'red'
                            ? 'bg-red-500'
                            : user.status === 'yellow'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      >
                        {user.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.userName}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(user.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'red'
                          ? 'bg-red-100 text-red-700'
                          : user.status === 'yellow'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedEquipment.contaminated && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-700 mb-2">⚠️ Contamination Alert</h4>
                <p className="text-sm text-red-600">
                  This equipment was used by an MDR-positive patient. All subsequent users within
                  24-72 hours are flagged for screening.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentCheck;
