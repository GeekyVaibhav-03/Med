import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const MDRFlags3D = ({ patients }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  const getColorFromFlag = (color) => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'orange': return '#f97316';
      case 'yellow': return '#eab308';
      case 'green': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const FlagSphere = ({ patient, flagType, position, onClick }) => {
    const meshRef = useRef();

    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      }
    });

    const flag = patient.flags[flagType];
    const color = getColorFromFlag(flag.color);

    return (
      <group position={position}>
        <mesh ref={meshRef} onClick={onClick}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
        </mesh>
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-white px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap">
            {patient.name} - {flagType.toUpperCase()}
          </div>
        </Html>
      </group>
    );
  };

  const PatientGroup = ({ patient, index }) => {
    const baseX = (index % 5) * 2 - 4;
    const baseZ = Math.floor(index / 5) * 2 - 2;
    const baseY = 0;

    return (
      <group>
        {/* MDR Sphere */}
        <FlagSphere
          patient={patient}
          flagType="mdr"
          position={[baseX - 0.5, baseY, baseZ]}
          onClick={() => setSelectedPatient({ ...patient, selectedFlag: 'mdr' })}
        />

        {/* Symptoms Sphere */}
        <FlagSphere
          patient={patient}
          flagType="symptoms"
          position={[baseX, baseY, baseZ]}
          onClick={() => setSelectedPatient({ ...patient, selectedFlag: 'symptoms' })}
        />

        {/* Fracture Sphere */}
        <FlagSphere
          patient={patient}
          flagType="fracture"
          position={[baseX + 0.5, baseY, baseZ]}
          onClick={() => setSelectedPatient({ ...patient, selectedFlag: 'fracture' })}
        />

        {/* Patient Label */}
        <Html position={[baseX, baseY - 0.8, baseZ]} center>
          <div className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow text-sm font-medium">
            {patient.name}
          </div>
        </Html>
      </group>
    );
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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">3D MDR Flags Visualization</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Critical/Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Follow Up/Suspected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Monitor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Normal/None</span>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Click on any sphere to see patient details. Each patient has 3 spheres representing MDR, Symptoms, and Fracture flags.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="h-96 relative">
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <pointLight position={[-10, -10, -5]} intensity={0.4} />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#f3f4f6" />
            </mesh>

            {/* Render all patients */}
            {patients.map((patient, index) => (
              <PatientGroup key={patient.id} patient={patient} index={index} />
            ))}

            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>
      </div>

      {/* Selected Patient Details */}
      {selectedPatient && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {selectedPatient.name} - {selectedPatient.selectedFlag.toUpperCase()} Flag
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-600">Age</span>
              <p className="font-medium">{selectedPatient.age} years</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Gender</span>
              <p className="font-medium">{selectedPatient.gender}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Ward/Bed</span>
              <p className="font-medium">{selectedPatient.ward}/{selectedPatient.bedNumber}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Status</span>
              <p className="font-medium capitalize">{selectedPatient.status}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">Flag Status</span>
            <p className="font-medium text-lg">
              {getStatusText(selectedPatient.flags[selectedPatient.selectedFlag].status)}
            </p>
          </div>
          <button
            onClick={() => setSelectedPatient(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
};

export default MDRFlags3D;