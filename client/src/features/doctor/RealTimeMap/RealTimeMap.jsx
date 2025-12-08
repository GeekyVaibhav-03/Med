// Enhanced Real-Time Map with actual MongoDB patient data
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import api from '../../../services/api';
import gsap from 'gsap';

const RealTimeMap = () => {
  const [patients, setPatients] = useState([]);
  const [currentLocations, setCurrentLocations] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filter, setFilter] = useState('all'); // all, red, yellow, green
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  // Hospital floor layout - 3 floors with rooms
  const allRooms = [
    // Floor 1 - Emergency
    { id: 'ER-1', name: 'ER-1', x: 50, y: 50, width: 120, height: 80, floor: 1 },
    { id: 'ER-2', name: 'ER-2', x: 190, y: 50, width: 120, height: 80, floor: 1 },
    { id: '101', name: 'Room 101', x: 330, y: 50, width: 100, height: 80, floor: 1 },
    { id: '102', name: 'Room 102', x: 450, y: 50, width: 100, height: 80, floor: 1 },
    { id: '103', name: 'Room 103', x: 570, y: 50, width: 100, height: 80, floor: 1 },
    // Floor 2 - General Ward
    { id: '201', name: 'Room 201', x: 50, y: 180, width: 100, height: 80, floor: 2 },
    { id: '202', name: 'Room 202', x: 170, y: 180, width: 100, height: 80, floor: 2 },
    { id: '203', name: 'Room 203', x: 290, y: 180, width: 100, height: 80, floor: 2 },
    { id: '301', name: 'Room 301', x: 410, y: 180, width: 100, height: 80, floor: 2 },
    { id: '302', name: 'Room 302', x: 530, y: 180, width: 100, height: 80, floor: 2 },
    // Floor 3 - ICU
    { id: 'ICU-1', name: 'ICU-1', x: 50, y: 310, width: 140, height: 100, floor: 3 },
    { id: 'ICU-2', name: 'ICU-2', x: 210, y: 310, width: 140, height: 100, floor: 3 },
    { id: 'ICU-3', name: 'ICU-3', x: 370, y: 310, width: 140, height: 100, floor: 3 },
    { id: '303', name: 'Room 303', x: 530, y: 310, width: 140, height: 100, floor: 3 },
  ];

  // Animate container on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  // Fetch patients from MongoDB
  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      console.log('RealTimeMap - API Response:', res.data);
      if (res.data && res.data.ok && Array.isArray(res.data.patients)) {
        setPatients(res.data.patients);
      } else {
        console.warn('Invalid patient data structure:', res.data);
        setPatients([]);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err.message);
      setPatients([]);
    }
  };

  // Simulate room based on patient risk level
  const simulateRoom = (patient) => {
    if (patient.status === 'red' || patient.riskLevel === 'high' || patient.riskLevel === 'critical') {
      const icuRooms = ['ICU-1', 'ICU-2', 'ICU-3'];
      return icuRooms[Math.floor(Math.random() * icuRooms.length)];
    } else if (patient.status === 'yellow' || patient.riskLevel === 'medium') {
      const generalRooms = ['201', '202', '203', '301', '302', '303'];
      return generalRooms[Math.floor(Math.random() * generalRooms.length)];
    } else {
      const allAvailRooms = ['ER-1', 'ER-2', '101', '102', '103', '201', '202'];
      return allAvailRooms[Math.floor(Math.random() * allAvailRooms.length)];
    }
  };

  // Fetch current locations
  const fetchCurrentLocations = async () => {
    // Use patient data to simulate real-time locations
    const simulated = patients.map(p => ({
      uid: p.uid,
      name: p.name,
      room: simulateRoom(p),
      status: p.status,
      riskLevel: p.riskLevel,
      timestamp: new Date()
    }));
    setCurrentLocations(simulated);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0 && !isLive) {
      fetchCurrentLocations();
    }
  }, [patients]);

  // Live tracking
  const handleStartLive = () => {
    setIsLive(true);
    fetchCurrentLocations();
    
    // Poll every 5 seconds for real-time updates
    intervalRef.current = setInterval(() => {
      // Simulate some patients moving (20% chance)
      setCurrentLocations(prev => prev.map(loc => {
        if (Math.random() < 0.2) {
          const patient = patients.find(p => p.uid === loc.uid);
          const newRoom = patient ? simulateRoom(patient) : allRooms[Math.floor(Math.random() * allRooms.length)].id;
          return { ...loc, room: newRoom, timestamp: new Date() };
        }
        return loc;
      }));
    }, 5000);
  };

  const handleStopLive = () => {
    setIsLive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      red: '#EF4444',
      yellow: '#F59E0B',
      green: '#10B981',
    };
    return colors[status] || colors.green;
  };

  const getRoomCoordinates = (roomId) => {
    const room = allRooms.find(r => r.id === roomId);
    if (!room) return { x: 100, y: 100 };
    
    // Center of room with random offset for multiple patients
    return {
      x: room.x + room.width / 2 + (Math.random() - 0.5) * 30,
      y: room.y + room.height / 2 + (Math.random() - 0.5) * 30
    };
  };

  const getRoomColor = (roomId) => {
    const patientsInRoom = currentLocations.filter(loc => loc.room === roomId);
    if (patientsInRoom.length === 0) return '#F0FDF4'; // light green
    
    const hasRed = patientsInRoom.some(p => p.status === 'red');
    const hasYellow = patientsInRoom.some(p => p.status === 'yellow');
    
    if (hasRed) return '#FEE2E2'; // light red
    if (hasYellow) return '#FEF3C7'; // light yellow
    return '#F0FDF4'; // light green
  };

  const filteredLocations = currentLocations.filter(loc => {
    if (filter === 'all') return true;
    return loc.status === filter;
  });

  const stats = {
    total: currentLocations.length,
    red: currentLocations.filter(l => l.status === 'red').length,
    yellow: currentLocations.filter(l => l.status === 'yellow').length,
    green: currentLocations.filter(l => l.status === 'green').length,
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🗺️ Real-Time Patient Tracking</h1>
          <p className="text-gray-600 mt-1">
            Live location tracking across hospital floors
          </p>
        </div>
        <div className="flex gap-3">
          {isLive ? (
            <button
              onClick={handleStopLive}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
            >
              <i className="ri-stop-circle-line"></i>
              Stop Live Tracking
            </button>
          ) : (
            <button
              onClick={handleStartLive}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center gap-2"
            >
              <i className="ri-play-circle-line"></i>
              Start Live Tracking
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <i className="ri-user-location-line text-3xl text-gray-500"></i>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">MDR Positive</p>
              <p className="text-2xl font-bold text-red-600">{stats.red}</p>
            </div>
            <i className="ri-alert-fill text-3xl text-red-500"></i>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">At Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.yellow}</p>
            </div>
            <i className="ri-error-warning-fill text-3xl text-yellow-500"></i>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Safe</p>
              <p className="text-2xl font-bold text-green-600">{stats.green}</p>
            </div>
            <i className="ri-checkbox-circle-fill text-3xl text-green-500"></i>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('red')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'red' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              MDR+ ({stats.red})
            </button>
            <button
              onClick={() => setFilter('yellow')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'yellow' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              At Risk ({stats.yellow})
            </button>
            <button
              onClick={() => setFilter('green')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'green' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Safe ({stats.green})
            </button>
          </div>
          {isLive && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-green-600">LIVE TRACKING</span>
            </div>
          )}
        </div>
      </div>

      {/* Hospital Map */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">🏥 Hospital Floor Plan</h3>
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FEE2E2' }}></div>
              <span className="text-gray-700">MDR+ Patient in Room</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FEF3C7' }}></div>
              <span className="text-gray-700">At-Risk Patient in Room</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F0FDF4' }}></div>
              <span className="text-gray-700">Safe/Empty Room</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <Stage width={700} height={440} className="bg-white rounded-lg border-2 border-gray-300">
            <Layer>
              {/* Draw rooms */}
              {allRooms.map((room) => (
                <React.Fragment key={room.id}>
                  <Rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill={getRoomColor(room.id)}
                    stroke="#0E8B86"
                    strokeWidth={2}
                    cornerRadius={5}
                  />
                  <Text
                    x={room.x + 5}
                    y={room.y + 5}
                    text={room.name}
                    fontSize={12}
                    fontStyle="bold"
                    fill="#374151"
                  />
                  {/* Patient count in room */}
                  {currentLocations.filter(l => l.room === room.id).length > 0 && (
                    <Text
                      x={room.x + 5}
                      y={room.y + room.height - 20}
                      text={`👥 ${currentLocations.filter(l => l.room === room.id).length}`}
                      fontSize={11}
                      fill="#6B7280"
                    />
                  )}
                </React.Fragment>
              ))}

              {/* Draw floor labels */}
              <Text x={690} y={80} text="Floor 1" fontSize={10} fill="#666" align="right" />
              <Text x={690} y={95} text="(ER)" fontSize={9} fill="#999" align="right" />
              <Text x={690} y={210} text="Floor 2" fontSize={10} fill="#666" align="right" />
              <Text x={690} y={225} text="(General)" fontSize={9} fill="#999" align="right" />
              <Text x={690} y={350} text="Floor 3" fontSize={10} fill="#666" align="right" />
              <Text x={690} y={365} text="(ICU)" fontSize={9} fill="#999" align="right" />

              {/* Draw patients */}
              {filteredLocations.map((location, index) => {
                const pos = getRoomCoordinates(location.room);
                return (
                  <React.Fragment key={`${location.uid}-${index}`}>
                    <Circle
                      x={pos.x}
                      y={pos.y}
                      radius={8}
                      fill={getStatusColor(location.status)}
                      stroke="#ffffff"
                      strokeWidth={2}
                      shadowBlur={8}
                      shadowColor={getStatusColor(location.status)}
                      shadowOpacity={0.6}
                      onClick={() => setSelectedPatient(location)}
                      onTap={() => setSelectedPatient(location)}
                    />
                    {/* Pulse animation for red status */}
                    {location.status === 'red' && (
                      <Circle
                        x={pos.x}
                        y={pos.y}
                        radius={12}
                        stroke="#EF4444"
                        strokeWidth={2}
                        opacity={0.5}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Selected Patient Details */}
      {selectedPatient && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4" style={{ borderColor: getStatusColor(selectedPatient.status) }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedPatient.name}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">UID</p>
                  <p className="font-semibold">{selectedPatient.uid}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Room</p>
                  <p className="font-semibold">{selectedPatient.room}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold" style={{ color: getStatusColor(selectedPatient.status) }}>
                    {selectedPatient.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Last Update</p>
                  <p className="font-semibold">
                    {selectedPatient.timestamp ? new Date(selectedPatient.timestamp).toLocaleTimeString() : 'Live'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>
      )}

      {/* Current Locations List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 All Tracked Patients</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {filteredLocations.map((location) => (
            <div
              key={location.uid}
              className="border rounded-lg p-3 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedPatient(location)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: getStatusColor(location.status) }}
                >
                  {location.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{location.name}</p>
                  <p className="text-xs text-gray-600">
                    {location.uid} • Room {location.room}
                  </p>
                </div>
                <i className="ri-map-pin-fill text-teal-600"></i>
              </div>
            </div>
          ))}
        </div>
        {filteredLocations.length === 0 && (
          <p className="text-center text-gray-500 py-8">No patients found with selected filter</p>
        )}
      </div>
    </div>
  );
};

export default RealTimeMap;
