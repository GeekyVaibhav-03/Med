// 3D Real-Time Hospital Map - Working Version
// Features: Three.js + WebGL + Real-time tracking

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { io } from 'socket.io-client';
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

// ==================== PATIENT AVATAR ====================
function PatientAvatar({ patient, position, isSelected, onClick }) {
  const groupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(...position));

  const getColor = () => {
    const risk = patient.riskLevel || patient.status;
    switch (risk) {
      case 'critical':
      case 'red': return '#ef4444';
      case 'high':
      case 'orange': return '#f97316';
      case 'medium':
      case 'yellow': return '#eab308';
      default: return '#22c55e';
    }
  };

  const color = getColor();

  useFrame((state) => {
    if (groupRef.current) {
      const target = new THREE.Vector3(...position);
      currentPos.current.lerp(target, 0.05);
      groupRef.current.position.copy(currentPos.current);
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.2, 0.4, 4, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.5 : 0.2} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fcd5ce" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[0.25, 0.35, 32]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>

      {/* Name label */}
      <Html position={[0, 1, 0]} center distanceFactor={20}>
        <div
          className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
            isSelected ? 'bg-white shadow-xl scale-125' : 'bg-white/90 shadow'
          }`}
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <div className="text-gray-800">{patient.name || patient.uid}</div>
          <div className="text-gray-500 text-[10px]">{patient.room || 'Active'}</div>
        </div>
      </Html>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

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

// ==================== MAIN COMPONENT ====================
function RealTimeMap3D() {
  const [patients, setPatients] = useState([]);
  const [patientPositions, setPatientPositions] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeFloor, setActiveFloor] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const containerRef = useRef(null);
  const socketRef = useRef(null);
  const updateInterval = useRef(null);

  // Entry animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 });
    }
  }, []);

  // Socket connection
  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => { setIsConnected(true); });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('gps:location-update', (data) => {
      setPatientPositions(prev => ({
        ...prev,
        [data.deviceId]: {
          x: (data.longitude - 77.21) * 30000,
          y: HOSPITAL_FLOORS[activeFloor].y + 1,
          z: (data.latitude - 28.567) * 30000
        }
      }));
    });
    socketRef.current = socket;
    return () => socket.disconnect();
  }, [activeFloor]);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients');
        if (res.data?.ok && res.data.patients) {
          setPatients(res.data.patients);
          const positions = {};
          res.data.patients.forEach((p) => {
            const floor = HOSPITAL_FLOORS[Math.floor(Math.random() * 4)];
            const room = floor.rooms[Math.floor(Math.random() * floor.rooms.length)];
            positions[p.uid] = {
              x: room.x + (Math.random() - 0.5) * room.width * 0.6,
              y: floor.y + 1,
              z: room.z + (Math.random() - 0.5) * room.depth * 0.6
            };
          });
          setPatientPositions(positions);
          const newStats = { total: res.data.patients.length, critical: 0, high: 0, medium: 0, low: 0 };
          res.data.patients.forEach(p => {
            const risk = p.riskLevel || p.status || 'low';
            if (risk === 'critical' || risk === 'red') newStats.critical++;
            else if (risk === 'high' || risk === 'orange') newStats.high++;
            else if (risk === 'medium' || risk === 'yellow') newStats.medium++;
            else newStats.low++;
          });
          setStats(newStats);
        }
      } catch (err) {
        console.error('Failed to fetch patients:', err);
      }
    };
    fetchPatients();
  }, []);

  // Simulate movement
  useEffect(() => {
    if (isLive && patients.length > 0) {
      updateInterval.current = setInterval(() => {
        setPatientPositions(prev => {
          const updated = { ...prev };
          patients.forEach(p => {
            if (updated[p.uid]) {
              updated[p.uid] = {
                ...updated[p.uid],
                x: updated[p.uid].x + (Math.random() - 0.5) * 0.3,
                z: updated[p.uid].z + (Math.random() - 0.5) * 0.3
              };
            }
          });
          return updated;
        });
      }, 100);
    }
    return () => { if (updateInterval.current) clearInterval(updateInterval.current); };
  }, [isLive, patients]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl">🏥</span>
              3D Hospital Map
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time patient tracking</p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
              {isConnected ? 'Live' : 'Offline'}
            </div>
            <button onClick={() => setIsLive(!isLive)} className={`px-4 py-2 rounded-lg font-medium transition ${isLive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
              {isLive ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3">
          <div className="bg-slate-800/80 rounded-lg px-3 py-1.5 text-sm"><span className="text-slate-400">Total:</span><span className="text-white font-bold ml-1">{stats.total}</span></div>
          <div className="bg-red-500/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-red-400">{stats.critical}</span></div>
          <div className="bg-orange-500/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span className="text-orange-400">{stats.high}</span></div>
          <div className="bg-yellow-500/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span className="text-yellow-400">{stats.medium}</span></div>
          <div className="bg-green-500/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-green-400">{stats.low}</span></div>
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

            {/* Patients */}
            {patients.map((patient) => {
              const pos = patientPositions[patient.uid];
              if (!pos) return null;
              return <PatientAvatar key={patient.uid} patient={patient} position={[pos.x, pos.y, pos.z]} isSelected={selectedPatient?.uid === patient.uid} onClick={() => setSelectedPatient(patient)} />;
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

      {/* Selected patient */}
      {selectedPatient && (
        <div className="absolute bottom-4 left-4 z-20 bg-slate-800/90 backdrop-blur rounded-xl p-4 w-72 shadow-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Patient Details</h3>
            <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-white text-xl">×</button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="text-white font-medium">{selectedPatient.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">ID</span><span className="text-white">{selectedPatient.uid}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Risk</span><span className={`font-medium ${selectedPatient.riskLevel === 'critical' ? 'text-red-400' : selectedPatient.riskLevel === 'high' ? 'text-orange-400' : 'text-green-400'}`}>{selectedPatient.riskLevel || 'Low'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Diagnosis</span><span className="text-white">{selectedPatient.diagnosis || 'N/A'}</span></div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-800/80 backdrop-blur rounded-xl p-3">
        <p className="text-slate-400 text-xs mb-2 font-medium">ROOM TYPES</p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500"></span><span className="text-slate-300">Emergency</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500"></span><span className="text-slate-300">ICU</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500"></span><span className="text-slate-300">Surgery</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500"></span><span className="text-slate-300">Lobby</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500"></span><span className="text-slate-300">Pharmacy</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-pink-500"></span><span className="text-slate-300">Station</span></div>
        </div>
      </div>
    </div>
  );
}

export default RealTimeMap3D;
