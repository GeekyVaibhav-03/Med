// 3D Hospital Map - Clean Base
// Basic 3D hospital visualization without data layers

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import api from '../../../services/api';

// ==================== HOSPITAL FLOOR DATA ====================
const HOSPITAL_FLOORS = [
  {
    floor: 0,
    name: 'Ground - Emergency',
    y: 0,
    color: '#fee2e2',
    rooms: [
      { id: 'ER-1', name: 'Emergency 1', x: -12, z: -8, width: 6, depth: 5, type: 'emergency' },
      { id: 'ER-2', name: 'Emergency 2', x: -4, z: -8, width: 6, depth: 5, type: 'emergency' },
      { id: 'LOBBY', name: 'Main Lobby', x: 5, z: -8, width: 8, depth: 6, type: 'lobby' },
      { id: 'RECV', name: 'Reception', x: 15, z: -8, width: 5, depth: 5, type: 'reception' },
      { id: 'PHARM', name: 'Pharmacy', x: -12, z: 2, width: 5, depth: 4, type: 'pharmacy' },
      { id: 'LAB', name: 'Laboratory', x: -5, z: 2, width: 5, depth: 4, type: 'lab' },
    ]
  },
  {
    floor: 1,
    name: 'Floor 1 - General Ward',
    y: 6,
    color: '#dbeafe',
    rooms: [
      { id: '101', name: 'Room 101', x: -12, z: -8, width: 4, depth: 4, type: 'room' },
      { id: '102', name: 'Room 102', x: -6, z: -8, width: 4, depth: 4, type: 'room' },
      { id: '103', name: 'Room 103', x: 0, z: -8, width: 4, depth: 4, type: 'room' },
      { id: '104', name: 'Room 104', x: 6, z: -8, width: 4, depth: 4, type: 'room' },
      { id: '105', name: 'Room 105', x: 12, z: -8, width: 4, depth: 4, type: 'room' },
      { id: 'NS-1', name: 'Nurse Station', x: 0, z: 2, width: 6, depth: 4, type: 'station' },
    ]
  },
  {
    floor: 2,
    name: 'Floor 2 - ICU',
    y: 12,
    color: '#fef3c7',
    rooms: [
      { id: 'ICU-1', name: 'ICU Bay 1', x: -10, z: -8, width: 6, depth: 5, type: 'icu' },
      { id: 'ICU-2', name: 'ICU Bay 2', x: -2, z: -8, width: 6, depth: 5, type: 'icu' },
      { id: 'ICU-3', name: 'ICU Bay 3', x: 6, z: -8, width: 6, depth: 5, type: 'icu' },
      { id: 'NS-2', name: 'ICU Station', x: 0, z: 2, width: 8, depth: 4, type: 'station' },
    ]
  },
  {
    floor: 3,
    name: 'Floor 3 - Surgery',
    y: 18,
    color: '#dcfce7',
    rooms: [
      { id: 'OR-1', name: 'OR 1', x: -10, z: -8, width: 6, depth: 6, type: 'surgery' },
      { id: 'OR-2', name: 'OR 2', x: 0, z: -8, width: 6, depth: 6, type: 'surgery' },
      { id: 'OR-3', name: 'OR 3', x: 10, z: -8, width: 6, depth: 6, type: 'surgery' },
      { id: 'RECOV', name: 'Recovery', x: 0, z: 3, width: 10, depth: 5, type: 'recovery' },
    ]
  }
];

// ==================== FLOOR COMPONENT ====================
function Floor({ floor, isActive, onClick }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = floor.y + Math.sin(state.clock.elapsedTime * 0.5 + floor.floor) * 0.03;
    }
  });

  return (
    <group>
      {/* Floor plate */}
      <mesh ref={meshRef} position={[0, floor.y, 0]} receiveShadow onClick={onClick}>
        <boxGeometry args={[45, 0.3, 25]} />
        <meshStandardMaterial color={floor.color} metalness={0.1} roughness={0.8} transparent opacity={isActive ? 1 : 0.2} />
      </mesh>

      {/* Floor label */}
      <Html position={[-24, floor.y + 1, 0]} center>
        <div
          className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer transition-all ${
            isActive ? 'bg-blue-500 text-white shadow-lg scale-110' : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
          onClick={onClick}
        >
          {floor.name}
        </div>
      </Html>

      {/* Rooms */}
      {isActive && floor.rooms.map((room) => (
        <Room key={room.id} room={room} floorY={floor.y} />
      ))}
    </group>
  );
}

// ==================== ROOM COMPONENT ====================
function Room({ room, floorY }) {
  const [hovered, setHovered] = useState(false);
  const wallHeight = 3;

  const getRoomColor = () => {
    switch (room.type) {
      case 'emergency': return '#ef4444';
      case 'icu': return '#f97316';
      case 'surgery': return '#8b5cf6';
      case 'lobby': return '#3b82f6';
      case 'pharmacy': return '#10b981';
      case 'lab': return '#06b6d4';
      case 'station': return '#ec4899';
      case 'recovery': return '#84cc16';
      default: return '#6366f1';
    }
  };

  return (
    <group position={[room.x, floorY + wallHeight / 2 + 0.2, room.z]}>
      {/* Room walls */}
      <mesh castShadow receiveShadow onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <boxGeometry args={[room.width, wallHeight, room.depth]} />
        <meshStandardMaterial color={getRoomColor()} metalness={0.2} roughness={0.5} transparent opacity={hovered ? 0.9 : 0.7} />
      </mesh>

      {/* Room label */}
      <Html position={[0, wallHeight / 2 + 0.8, 0]} center distanceFactor={15}>
        <div className="bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-800 shadow whitespace-nowrap">
          {room.name}
        </div>
      </Html>

      {/* Hover glow */}
      {hovered && (
        <mesh position={[0, -wallHeight / 2 + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(room.width, room.depth) / 2, Math.max(room.width, room.depth) / 2 + 0.5, 32]} />
          <meshBasicMaterial color={getRoomColor()} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ==================== RFID POINT TO COORDINATE MAPPING ====================
// Map RFID point names to coordinates on Floor 1 (General Ward)
const RFID_POINT_MAPPING = {
  'ROOM-1': { x: -12, z: -8, room: 'Room 101' },
  'ROOM-2': { x: -6, z: -8, room: 'Room 102' },
  'ROOM-3': { x: 0, z: -8, room: 'Room 103' },
  'ROOM-4': { x: 6, z: -8, room: 'Room 104' },
  'ROOM-5': { x: 12, z: -8, room: 'Room 105' },
  'NS-1': { x: 0, z: 2, room: 'Nurse Station' },
  'Unknown': { x: 0, z: 0, room: 'Unknown Location' },
  // Default position for unmapped points
  'default': { x: 0, z: 0, room: 'Unknown Location' }
};

// ==================== ELEVATOR ====================
function Elevator({ position }) {
  const elevatorRef = useRef();
  const [floor, setFloor] = useState(0);

  useFrame(() => {
    if (elevatorRef.current) {
      const targetY = floor * 6 + 1;
      elevatorRef.current.position.y = THREE.MathUtils.lerp(elevatorRef.current.position.y, targetY, 0.02);
    }
  });

  useEffect(() => {
    const interval = setInterval(() => setFloor((prev) => (prev + 1) % 4), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <group position={position}>
      {/* Shaft */}
      <mesh>
        <boxGeometry args={[2.5, 22, 2.5]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} transparent opacity={0.3} />
      </mesh>

      {/* Car */}
      <mesh ref={elevatorRef} position={[0, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ==================== HANGING MDR PATIENT COMPONENT ====================
function HangingMDRPatient({ patient, position, isSelected, onClick }) {
  const groupRef = useRef();
  const swingRef = useRef();

  const getColorFromFlag = (color) => {
    switch (color) {
      case 'red': return '#ef4444';    // MDR disease
      case 'orange': return '#f97316'; // Follow ups
      case 'yellow': return '#eab308'; // At risk
      case 'green': return '#22c55e';  // Safe/Discharge
      default: return '#6b7280';
    }
  };

  // Get the primary MDR flag color for the hanging structure
  const primaryColor = getColorFromFlag(patient.flags.mdr.color);

  useFrame((state) => {
    if (swingRef.current) {
      // Gentle swinging motion
      swingRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      swingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Hanging rope/string */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Hanging hook */}
      <mesh position={[0, 1.8, 0]}>
        <torusGeometry args={[0.1, 0.03, 8, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>

      {/* Swinging patient structure */}
      <group ref={swingRef} position={[0, 1.5, 0]}>
        {/* Main body - colored sphere representing patient status */}
        <mesh onClick={() => onClick && onClick({ ...patient, selectedFlag: 'mdr' })}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={isSelected ? 0.3 : 0.1} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Arms (simple lines) */}
        <mesh position={[-0.3, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Legs (simple lines) */}
        <mesh position={[-0.15, -0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0.15, -0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Status indicator rings around the body */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.03, 8, 16]} />
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.2} />
        </mesh>

        {/* Patient name label */}
        <Html position={[0, -1.2, 0]} center distanceFactor={20}>
          <div className={`bg-white/90 px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow ${isSelected ? 'bg-blue-500 text-white' : ''}`}>
            {patient.name}
          </div>
        </Html>

        {/* MDR status badge */}
        <Html position={[0, 1, 0]} center distanceFactor={15}>
          <div className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg border-2 border-white`}
               style={{ backgroundColor: primaryColor }}>
            {patient.flags.mdr.status.replace('_', ' ').toUpperCase()}
          </div>
        </Html>
      </group>

      {/* Selection glow */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}

// ==================== MAIN COMPONENT ====================
function RealTimeMap3D() {
  const [activeFloor, setActiveFloor] = useState(1); // Start on floor 1
  const [mdrPatients, setMdrPatients] = useState([]);
  const [mdrPositions, setMdrPositions] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const containerRef = useRef(null);

  // Entry animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 });
    }
  }, []);

  // Fetch MDR patients data
  useEffect(() => {
    const fetchMdrPatients = async () => {
      try {
        const response = await api.get('/patients/flags');
        if (response.data?.ok && response.data.patients) {
          const patients = response.data.patients;
          setMdrPatients(patients);

          // Position MDR patients hanging from ceiling across all floors
          const positions = {};
          patients.forEach((patient, index) => {
            // Distribute patients across all 3 floors
            const floorIndex = index % 3;
            const floorY = HOSPITAL_FLOORS[floorIndex].y;

            // Position hanging from ceiling (ceiling is at floorY + 6)
            const ceilingY = floorY + 6;

            // Distribute around the perimeter of each floor
            const angle = (index * 137.5) % 360; // Golden angle for even distribution
            const radius = 15; // Distance from center
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const z = Math.sin(angle * Math.PI / 180) * radius;

            positions[patient.id] = {
              x: x,
              y: ceilingY - 1, // Hang 1 unit below ceiling
              z: z,
              floor: floorIndex,
              flags: patient.flags
            };
          });
          setMdrPositions(positions);
        }
      } catch (error) {
        console.error('Failed to fetch MDR patients:', error);
      }
    };

    fetchMdrPatients();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-xl">🏥</span>
              Hanging MDR Patients
            </h1>
            <p className="text-slate-400 text-sm mt-1">MDR patients hanging throughout hospital • All floors • Click patients for details</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3">
          <div className="bg-slate-800/80 rounded-lg px-3 py-1.5 text-sm"><span className="text-slate-400">Total Patients:</span><span className="text-white font-bold ml-1">{mdrPatients.length}</span></div>
          <div className="bg-red-500/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-red-400">MDR: {mdrPatients.filter(p => p.flags.mdr.color === 'red').length}</span></div>
          <div className="bg-orange-500/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span className="text-orange-400">Follow-up: {mdrPatients.filter(p => p.flags.mdr.color === 'orange').length}</span></div>
          <div className="bg-yellow-500/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span className="text-yellow-400">At Risk: {mdrPatients.filter(p => p.flags.mdr.color === 'yellow').length}</span></div>
          <div className="bg-green-500/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-green-400">Safe: {mdrPatients.filter(p => p.flags.mdr.color === 'green').length}</span></div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-screen">
        <Canvas shadows camera={{ position: [25, 20, 25], fov: 50 }}>
          <Suspense fallback={null}>
            <color attach="background" args={['#0f172a']} />
            <fog attach="fog" args={['#0f172a', 30, 100]} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[15, 30, 15]} intensity={1.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <pointLight position={[-15, 20, -15]} intensity={0.4} color="#60a5fa" />
            <pointLight position={[15, 20, 15]} intensity={0.4} color="#34d399" />

            {/* Floors */}
            {HOSPITAL_FLOORS.map((floor) => (
              <Floor key={floor.floor} floor={floor} isActive={activeFloor === floor.floor} onClick={() => setActiveFloor(floor.floor)} />
            ))}

            {/* Elevator */}
            <Elevator position={[20, 10, 5]} />

            {/* MDR Patients hanging from ceilings on all floors */}
            {mdrPatients.map((patient) => {
              const pos = mdrPositions[patient.id];
              if (!pos) return null;
              return <HangingMDRPatient key={patient.id} patient={patient} position={pos} isSelected={selectedPatient?.id === patient.id} onClick={() => setSelectedPatient(patient)} />;
            })}

            <OrbitControls enableDamping dampingFactor={0.05} minDistance={10} maxDistance={80} maxPolarAngle={Math.PI / 2.1} />
          </Suspense>
        </Canvas>
      </div>

      {/* Floor selector */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-2 space-y-2">
          {HOSPITAL_FLOORS.map((floor) => (
            <button key={floor.floor} onClick={() => setActiveFloor(floor.floor)} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition ${activeFloor === floor.floor ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
              {floor.floor}
            </button>
          ))}
        </div>
      </div>

      {/* Selected MDR Patient */}
      {selectedPatient && (
        <div className="absolute bottom-4 left-4 z-20 bg-slate-800/90 backdrop-blur rounded-xl p-4 w-80 shadow-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">MDR Patient Details</h3>
            <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-white text-xl">×</button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Patient</span><span className="text-white font-medium">{selectedPatient.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Age/Gender</span><span className="text-white">{selectedPatient.age}y, {selectedPatient.gender}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Ward/Bed</span><span className="text-white">{selectedPatient.ward}/{selectedPatient.bedNumber}</span></div>

            <div className="border-t border-slate-600 pt-3">
              <p className="text-slate-400 text-xs mb-2 font-medium">MDR FLAGS {selectedPatient.selectedFlag && `(Selected: ${selectedPatient.selectedFlag.toUpperCase()})`}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className={`text-center p-2 rounded-lg transition-all ${selectedPatient.selectedFlag === 'mdr' ? 'bg-slate-700 ring-2 ring-blue-400' : ''}`}>
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${selectedPatient.flags.mdr.color === 'red' ? 'bg-red-500' : selectedPatient.flags.mdr.color === 'orange' ? 'bg-orange-500' : selectedPatient.flags.mdr.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div className="text-xs text-slate-300">MDR</div>
                  <div className="text-xs text-slate-400">{selectedPatient.flags.mdr.status.replace('_', ' ')}</div>
                </div>
                <div className={`text-center p-2 rounded-lg transition-all ${selectedPatient.selectedFlag === 'symptoms' ? 'bg-slate-700 ring-2 ring-blue-400' : ''}`}>
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${selectedPatient.flags.symptoms.color === 'red' ? 'bg-red-500' : selectedPatient.flags.symptoms.color === 'orange' ? 'bg-orange-500' : selectedPatient.flags.symptoms.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div className="text-xs text-slate-300">Symptoms</div>
                  <div className="text-xs text-slate-400">{selectedPatient.flags.symptoms.status.replace('_', ' ')}</div>
                </div>
                <div className={`text-center p-2 rounded-lg transition-all ${selectedPatient.selectedFlag === 'fracture' ? 'bg-slate-700 ring-2 ring-blue-400' : ''}`}>
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${selectedPatient.flags.fracture.color === 'red' ? 'bg-red-500' : selectedPatient.flags.fracture.color === 'orange' ? 'bg-orange-500' : selectedPatient.flags.fracture.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div className="text-xs text-slate-300">Fracture</div>
                  <div className="text-xs text-slate-400">{selectedPatient.flags.fracture.status.replace('_', ' ')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MDR Legend */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-800/80 backdrop-blur rounded-xl p-3">
        <p className="text-slate-400 text-xs mb-2 font-medium">MDR FLAG COLORS</p>
        <div className="grid grid-cols-1 gap-1.5 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500"></span><span className="text-slate-300">Red: MDR Disease</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500"></span><span className="text-slate-300">Orange: Follow-ups</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-500"></span><span className="text-slate-300">Yellow: At Risk</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500"></span><span className="text-slate-300">Green: Safe/Discharge</span></div>
        </div>
      </div>
    </div>
  );
}

export default RealTimeMap3D;
