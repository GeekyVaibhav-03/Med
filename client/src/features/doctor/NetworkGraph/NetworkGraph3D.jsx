// 3D Contact Tracing Network Graph
// Interactive visualization of patient contacts and MDR spread

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { io } from 'socket.io-client';
import api from '../../../services/api';

// ==================== NODE COMPONENT ====================
function ContactNode({ node, position, isSelected, isHovered, onClick, onHover }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const targetPos = useRef(new THREE.Vector3(...position));
  const currentPos = useRef(new THREE.Vector3(...position));

  const getNodeColor = () => {
    if (node.mdrStatus === 'positive') return '#ef4444'; // Red
    if (node.mdrStatus === 'suspected') return '#f97316'; // Orange
    if (node.riskLevel === 'high') return '#eab308'; // Yellow
    if (node.type === 'equipment') return '#8b5cf6'; // Purple
    if (node.type === 'staff') return '#3b82f6'; // Blue
    if (node.type === 'visitor') return '#06b6d4'; // Cyan
    return '#22c55e'; // Green - safe patient
  };

  const color = getNodeColor();
  const nodeSize = node.type === 'patient' ? 0.5 : node.type === 'equipment' ? 0.4 : 0.35;

  useFrame((state) => {
    if (meshRef.current) {
      // Smooth position interpolation
      targetPos.current.set(...position);
      currentPos.current.lerp(targetPos.current, 0.05);
      meshRef.current.position.copy(currentPos.current);

      // Floating animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + node.id) * 0.02;

      // Pulse effect for MDR positive
      if (node.mdrStatus === 'positive') {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }

      // Rotation
      meshRef.current.rotation.y += 0.005;
    }

    if (glowRef.current && (isSelected || isHovered)) {
      glowRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Glow effect for selected/hovered */}
      {(isSelected || isHovered) && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[nodeSize * 1.5, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}

      {/* Main node */}
      <mesh
        onClick={onClick}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
        castShadow
      >
        {node.type === 'patient' ? (
          <sphereGeometry args={[nodeSize, 32, 32]} />
        ) : node.type === 'equipment' ? (
          <boxGeometry args={[nodeSize * 1.5, nodeSize * 1.5, nodeSize * 1.5]} />
        ) : (
          <octahedronGeometry args={[nodeSize, 0]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : isHovered ? 0.3 : 0.1}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Inner core for MDR positive */}
      {node.mdrStatus === 'positive' && (
        <mesh>
          <sphereGeometry args={[nodeSize * 0.3, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, nodeSize + 0.5, 0]} center distanceFactor={15}>
        <div
          className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            isSelected ? 'bg-white shadow-xl scale-110' : 
            isHovered ? 'bg-white/95 shadow-lg' : 'bg-white/80 shadow'
          }`}
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <div className="text-gray-800">{node.name}</div>
          <div className="text-gray-500 text-[10px]">
            {node.type} {node.mdrStatus === 'positive' && '• MDR+'}
          </div>
        </div>
      </Html>

      {/* Risk indicator ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -nodeSize - 0.1, 0]}>
        <ringGeometry args={[nodeSize * 0.8, nodeSize * 1.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ==================== EDGE COMPONENT ====================
function ContactEdge({ start, end, contact, isHighlighted }) {
  const lineRef = useRef();
  
  const getEdgeColor = () => {
    if (contact.riskLevel === 'critical') return '#ef4444';
    if (contact.riskLevel === 'high') return '#f97316';
    if (contact.riskLevel === 'medium') return '#eab308';
    if (contact.type === 'equipment') return '#8b5cf6';
    return '#6b7280';
  };

  const color = getEdgeColor();
  const points = useMemo(() => {
    const midPoint = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.5, // Slight curve upward
      (start[2] + end[2]) / 2
    ];
    return [start, midPoint, end];
  }, [start, end]);

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color={color}
        lineWidth={isHighlighted ? 3 : 1.5}
        transparent
        opacity={isHighlighted ? 1 : 0.6}
        dashed={contact.type === 'indirect'}
        dashSize={0.3}
        gapSize={0.1}
      />
      
      {/* Contact indicator at midpoint */}
      {isHighlighted && (
        <Html position={points[1]} center>
          <div className="bg-white/90 px-2 py-1 rounded text-xs shadow">
            <span className="font-medium">{contact.duration}s</span>
            <span className="text-gray-500 ml-1">• {contact.distance}m</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// ==================== GRAPH LAYOUT ====================
function useForceLayout(nodes, edges) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (nodes.length === 0) return;

    // Initialize positions in a sphere
    const newPositions = {};
    const radius = Math.max(5, nodes.length * 0.8);

    nodes.forEach((node, i) => {
      const phi = Math.acos(-1 + (2 * i) / nodes.length);
      const theta = Math.sqrt(nodes.length * Math.PI) * phi;
      
      newPositions[node.id] = [
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi) * 0.5, // Flatten Y
        radius * Math.cos(phi)
      ];
    });

    // Simple force-directed adjustment
    const iterations = 50;
    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all nodes
      nodes.forEach((node1, i) => {
        nodes.forEach((node2, j) => {
          if (i >= j) return;
          
          const pos1 = newPositions[node1.id];
          const pos2 = newPositions[node2.id];
          
          const dx = pos1[0] - pos2[0];
          const dy = pos1[1] - pos2[1];
          const dz = pos1[2] - pos2[2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
          
          const repulsion = 2 / (dist * dist);
          const fx = (dx / dist) * repulsion;
          const fy = (dy / dist) * repulsion;
          const fz = (dz / dist) * repulsion;
          
          newPositions[node1.id] = [pos1[0] + fx, pos1[1] + fy, pos1[2] + fz];
          newPositions[node2.id] = [pos2[0] - fx, pos2[1] - fy, pos2[2] - fz];
        });
      });

      // Attraction along edges
      edges.forEach(edge => {
        const pos1 = newPositions[edge.source];
        const pos2 = newPositions[edge.target];
        if (!pos1 || !pos2) return;

        const dx = pos2[0] - pos1[0];
        const dy = pos2[1] - pos1[1];
        const dz = pos2[2] - pos1[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        
        const attraction = dist * 0.1;
        const fx = (dx / dist) * attraction;
        const fy = (dy / dist) * attraction;
        const fz = (dz / dist) * attraction;
        
        newPositions[edge.source] = [pos1[0] + fx * 0.5, pos1[1] + fy * 0.5, pos1[2] + fz * 0.5];
        newPositions[edge.target] = [pos2[0] - fx * 0.5, pos2[1] - fy * 0.5, pos2[2] - fz * 0.5];
      });
    }

    setPositions(newPositions);
  }, [nodes, edges]);

  return positions;
}

// ==================== MAIN GRAPH SCENE ====================
function GraphScene({ nodes, edges, selectedNode, hoveredNode, onSelectNode, onHoverNode }) {
  const positions = useForceLayout(nodes, edges);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#60a5fa" />
      <pointLight position={[10, -10, 10]} intensity={0.5} color="#34d399" />

      {/* Background */}
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 20, 60]} />

      {/* Grid helper */}
      <gridHelper args={[30, 30, '#334155', '#1e293b']} position={[0, -5, 0]} />

      {/* Edges */}
      {edges.map((edge, i) => {
        const startPos = positions[edge.source];
        const endPos = positions[edge.target];
        if (!startPos || !endPos) return null;

        const isHighlighted = 
          selectedNode === edge.source || 
          selectedNode === edge.target ||
          hoveredNode === edge.source ||
          hoveredNode === edge.target;

        return (
          <ContactEdge
            key={`edge-${i}`}
            start={startPos}
            end={endPos}
            contact={edge}
            isHighlighted={isHighlighted}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const pos = positions[node.id];
        if (!pos) return null;

        return (
          <ContactNode
            key={node.id}
            node={node}
            position={pos}
            isSelected={selectedNode === node.id}
            isHovered={hoveredNode === node.id}
            onClick={() => onSelectNode(node.id)}
            onHover={(hovered) => onHoverNode(hovered ? node.id : null)}
          />
        );
      })}

      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={5} 
        maxDistance={50}
        maxPolarAngle={Math.PI * 0.85}
      />
    </>
  );
}

// ==================== MAIN COMPONENT ====================
function NetworkGraph3D() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, mdrPositive: 0, highRisk: 0 });
  const [filter, setFilter] = useState('all');
  const socketRef = useRef(null);

  // Fetch contact network data
  useEffect(() => {
    fetchNetworkData();

    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('proximity:contact', (contact) => {
      // Add new edge for proximity contact
      setEdges(prev => {
        const exists = prev.some(e => 
          (e.source === contact.entity1.id && e.target === contact.entity2.id) ||
          (e.source === contact.entity2.id && e.target === contact.entity1.id)
        );
        if (!exists) {
          return [...prev, {
            source: contact.entity1.id,
            target: contact.entity2.id,
            riskLevel: contact.riskLevel,
            distance: contact.distance,
            duration: contact.duration,
            type: 'proximity'
          }];
        }
        return prev;
      });
    });

    socket.on('equipment:used', (data) => {
      // Could add equipment nodes dynamically
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      // Fetch patients
      const patientsRes = await api.get('/patients');
      const patients = patientsRes.data?.patients || [];

      // Fetch contacts
      const contactsRes = await api.get('/contacts');
      const contacts = contactsRes.data?.contacts || [];

      // Remove all patient nodes from the map
      const patientNodes = [];

      // Add some simulated staff/visitor nodes for demo
      const additionalNodes = [
        { id: 'staff-1', name: 'Dr. Sharma', type: 'staff', mdrStatus: 'negative', riskLevel: 'low' },
        { id: 'staff-2', name: 'Nurse Priya', type: 'staff', mdrStatus: 'negative', riskLevel: 'medium' },
        { id: 'staff-3', name: 'Dr. Kumar', type: 'staff', mdrStatus: 'negative', riskLevel: 'low' },
        { id: 'equip-1', name: 'Ventilator A1', type: 'equipment', mdrStatus: 'negative', riskLevel: 'high' },
        { id: 'equip-2', name: 'IV Pump 1', type: 'equipment', mdrStatus: 'negative', riskLevel: 'medium' },
      ];

      const allNodes = [...patientNodes, ...additionalNodes]; // Only staff/equipment nodes

      // Build edges from contacts
      const contactEdges = contacts.slice(0, 30).map(c => ({
        source: c.sourcePatient?._id || c.sourcePatient,
        target: c.contactPatient?._id || c.contactPatient,
        riskLevel: c.riskLevel || 'low',
        duration: c.duration || Math.floor(Math.random() * 300),
        distance: c.distance || (Math.random() * 2 + 0.5).toFixed(1),
        type: c.contactType || 'direct'
      })).filter(e => e.source && e.target);

      // Add simulated edges for demo
      const simulatedEdges = [];
      if (allNodes.length > 2) {
        // Connect MDR positive patients to others
        const mdrPatients = allNodes.filter(n => n.mdrStatus === 'positive');
        mdrPatients.forEach(mdr => {
          const others = allNodes.filter(n => n.id !== mdr.id).slice(0, 3);
          others.forEach(other => {
            simulatedEdges.push({
              source: mdr.id,
              target: other.id,
              riskLevel: 'high',
              duration: Math.floor(Math.random() * 300) + 60,
              distance: (Math.random() * 1.5 + 0.3).toFixed(1),
              type: 'proximity'
            });
          });
        });

        // Connect staff to patients
        const staff = allNodes.filter(n => n.type === 'staff');
        const patientNodeList = allNodes.filter(n => n.type === 'patient');
        staff.forEach(s => {
          const randomPatients = patientNodeList.sort(() => 0.5 - Math.random()).slice(0, 2);
          randomPatients.forEach(p => {
            simulatedEdges.push({
              source: s.id,
              target: p.id,
              riskLevel: p.mdrStatus === 'positive' ? 'high' : 'low',
              duration: Math.floor(Math.random() * 600) + 120,
              distance: (Math.random() * 1 + 0.5).toFixed(1),
              type: 'direct'
            });
          });
        });

        // Connect equipment to patients
        const equipment = allNodes.filter(n => n.type === 'equipment');
        equipment.forEach(eq => {
          const randomPatients = patientNodeList.sort(() => 0.5 - Math.random()).slice(0, 3);
          randomPatients.forEach(p => {
            simulatedEdges.push({
              source: eq.id,
              target: p.id,
              riskLevel: p.mdrStatus === 'positive' ? 'critical' : 'low',
              duration: Math.floor(Math.random() * 1800) + 300,
              distance: 0,
              type: 'equipment'
            });
          });
        });
      }

      const allEdges = [...contactEdges, ...simulatedEdges];

      setNodes(allNodes);
      setEdges(allEdges);
      setStats({
        nodes: allNodes.length,
        edges: allEdges.length,
        mdrPositive: allNodes.filter(n => n.mdrStatus === 'positive').length,
        highRisk: allEdges.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length
      });

    } catch (err) {
      console.error('Failed to fetch network data:', err);
      // Generate demo data if API fails
      generateDemoData();
    }
    setIsLoading(false);
  };

  const generateDemoData = () => {
    const demoNodes = [
      { id: 'p1', name: 'Rohan Verma', type: 'patient', mdrStatus: 'positive', riskLevel: 'critical' },
      { id: 'p2', name: 'Priya Singh', type: 'patient', mdrStatus: 'suspected', riskLevel: 'high' },
      { id: 'p3', name: 'Amit Kumar', type: 'patient', mdrStatus: 'negative', riskLevel: 'medium' },
      { id: 'p4', name: 'Sneha Patel', type: 'patient', mdrStatus: 'negative', riskLevel: 'low' },
      { id: 'p5', name: 'Raj Sharma', type: 'patient', mdrStatus: 'positive', riskLevel: 'critical' },
      { id: 'p6', name: 'Anita Gupta', type: 'patient', mdrStatus: 'negative', riskLevel: 'medium' },
      { id: 's1', name: 'Dr. Sharma', type: 'staff', mdrStatus: 'negative', riskLevel: 'medium' },
      { id: 's2', name: 'Nurse Priya', type: 'staff', mdrStatus: 'negative', riskLevel: 'high' },
      { id: 'e1', name: 'Ventilator A1', type: 'equipment', mdrStatus: 'negative', riskLevel: 'critical' },
      { id: 'e2', name: 'IV Pump 1', type: 'equipment', mdrStatus: 'negative', riskLevel: 'medium' },
      { id: 'v1', name: 'Visitor Meera', type: 'visitor', mdrStatus: 'negative', riskLevel: 'low' },
    ];

    const demoEdges = [
      { source: 'p1', target: 'p2', riskLevel: 'critical', duration: 180, distance: '0.5', type: 'proximity' },
      { source: 'p1', target: 'p3', riskLevel: 'high', duration: 120, distance: '1.2', type: 'proximity' },
      { source: 'p1', target: 's1', riskLevel: 'high', duration: 300, distance: '0.8', type: 'direct' },
      { source: 'p1', target: 'e1', riskLevel: 'critical', duration: 1200, distance: '0', type: 'equipment' },
      { source: 'p2', target: 'p4', riskLevel: 'medium', duration: 60, distance: '1.5', type: 'proximity' },
      { source: 'p2', target: 's2', riskLevel: 'high', duration: 240, distance: '0.6', type: 'direct' },
      { source: 'p5', target: 'p6', riskLevel: 'high', duration: 150, distance: '0.9', type: 'proximity' },
      { source: 'p5', target: 'e1', riskLevel: 'critical', duration: 900, distance: '0', type: 'equipment' },
      { source: 'p5', target: 's2', riskLevel: 'high', duration: 180, distance: '0.7', type: 'direct' },
      { source: 's1', target: 'p3', riskLevel: 'low', duration: 600, distance: '0.5', type: 'direct' },
      { source: 's1', target: 'p4', riskLevel: 'low', duration: 480, distance: '0.6', type: 'direct' },
      { source: 's2', target: 'p6', riskLevel: 'medium', duration: 360, distance: '0.4', type: 'direct' },
      { source: 'e2', target: 'p3', riskLevel: 'low', duration: 720, distance: '0', type: 'equipment' },
      { source: 'e2', target: 'p4', riskLevel: 'low', duration: 600, distance: '0', type: 'equipment' },
      { source: 'v1', target: 'p4', riskLevel: 'low', duration: 1800, distance: '1.0', type: 'proximity' },
    ];

    setNodes(demoNodes);
    setEdges(demoEdges);
    setStats({
      nodes: demoNodes.length,
      edges: demoEdges.length,
      mdrPositive: demoNodes.filter(n => n.mdrStatus === 'positive').length,
      highRisk: demoEdges.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length
    });
  };

  // Get filtered nodes and edges
  const filteredData = useMemo(() => {
    let filteredNodes = nodes;
    let filteredEdges = edges;

    if (filter === 'mdr') {
      const mdrNodeIds = new Set(nodes.filter(n => n.mdrStatus === 'positive').map(n => n.id));
      // Include MDR nodes and their direct contacts
      edges.forEach(e => {
        if (mdrNodeIds.has(e.source)) mdrNodeIds.add(e.target);
        if (mdrNodeIds.has(e.target)) mdrNodeIds.add(e.source);
      });
      filteredNodes = nodes.filter(n => mdrNodeIds.has(n.id));
      filteredEdges = edges.filter(e => mdrNodeIds.has(e.source) && mdrNodeIds.has(e.target));
    } else if (filter === 'high-risk') {
      filteredEdges = edges.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical');
      const nodeIds = new Set([...filteredEdges.map(e => e.source), ...filteredEdges.map(e => e.target)]);
      filteredNodes = nodes.filter(n => nodeIds.has(n.id));
    } else if (filter === 'equipment') {
      filteredEdges = edges.filter(e => e.type === 'equipment');
      const nodeIds = new Set([...filteredEdges.map(e => e.source), ...filteredEdges.map(e => e.target)]);
      filteredNodes = nodes.filter(n => nodeIds.has(n.id));
    }

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [nodes, edges, filter]);

  // Update selected node data
  useEffect(() => {
    if (selectedNode) {
      const node = nodes.find(n => n.id === selectedNode);
      const nodeEdges = edges.filter(e => e.source === selectedNode || e.target === selectedNode);
      const contacts = nodeEdges.map(e => {
        const contactId = e.source === selectedNode ? e.target : e.source;
        const contactNode = nodes.find(n => n.id === contactId);
        return { ...e, contact: contactNode };
      });
      setSelectedNodeData({ node, contacts });
    } else {
      setSelectedNodeData(null);
    }
  }, [selectedNode, nodes, edges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-xl">🕸️</span>
              3D Contact Network
            </h1>
            <p className="text-slate-400 text-sm mt-1">Interactive MDR contact tracing visualization</p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
              {isConnected ? 'Live' : 'Offline'}
            </div>
            <button
              onClick={fetchNetworkData}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3">
          <div className="bg-slate-800/80 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-slate-400">Nodes:</span>
            <span className="text-white font-bold ml-1">{stats.nodes}</span>
          </div>
          <div className="bg-slate-800/80 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-slate-400">Connections:</span>
            <span className="text-white font-bold ml-1">{stats.edges}</span>
          </div>
          <div className="bg-red-500/20 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-red-400">MDR+:</span>
            <span className="text-red-300 font-bold ml-1">{stats.mdrPositive}</span>
          </div>
          <div className="bg-orange-500/20 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-orange-400">High Risk:</span>
            <span className="text-orange-300 font-bold ml-1">{stats.highRisk}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          {[
            { id: 'all', label: 'All Contacts' },
            { id: 'mdr', label: '🔴 MDR Chain' },
            { id: 'high-risk', label: '⚠️ High Risk' },
            { id: 'equipment', label: '🔧 Equipment' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === f.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-xl">Loading network data...</div>
          </div>
        ) : (
          <Canvas camera={{ position: [15, 10, 15], fov: 50 }}>
            <Suspense fallback={null}>
              <GraphScene
                nodes={filteredData.nodes}
                edges={filteredData.edges}
                selectedNode={selectedNode}
                hoveredNode={hoveredNode}
                onSelectNode={setSelectedNode}
                onHoverNode={setHoveredNode}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-800/90 backdrop-blur rounded-xl p-4">
        <p className="text-slate-400 text-xs mb-2 font-medium">NODE TYPES</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-slate-300">MDR+ Patient</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">Suspected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-slate-300">Safe Patient</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-purple-500"></span>
            <span className="text-slate-300">Equipment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-300">Staff</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
            <span className="text-slate-300">Visitor</span>
          </div>
        </div>
      </div>

      {/* Selected Node Panel */}
      {selectedNodeData && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-800/95 backdrop-blur rounded-xl p-4 w-80 shadow-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Contact Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>

          {/* Node Info */}
          <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${
                selectedNodeData.node.mdrStatus === 'positive' ? 'bg-red-500' :
                selectedNodeData.node.mdrStatus === 'suspected' ? 'bg-orange-500' :
                'bg-green-500'
              }`}></span>
              <span className="text-white font-medium">{selectedNodeData.node.name}</span>
            </div>
            <div className="text-sm text-slate-400">
              <p>Type: <span className="text-slate-300 capitalize">{selectedNodeData.node.type}</span></p>
              <p>MDR Status: <span className={`font-medium ${
                selectedNodeData.node.mdrStatus === 'positive' ? 'text-red-400' :
                selectedNodeData.node.mdrStatus === 'suspected' ? 'text-orange-400' :
                'text-green-400'
              }`}>{selectedNodeData.node.mdrStatus}</span></p>
              {selectedNodeData.node.room && (
                <p>Room: <span className="text-slate-300">{selectedNodeData.node.room}</span></p>
              )}
            </div>
          </div>

          {/* Contacts */}
          <div>
            <p className="text-slate-400 text-xs font-medium mb-2">
              CONTACTS ({selectedNodeData.contacts.length})
            </p>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {selectedNodeData.contacts.map((c, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-sm ${
                    c.riskLevel === 'critical' ? 'bg-red-500/20 border border-red-500/30' :
                    c.riskLevel === 'high' ? 'bg-orange-500/20 border border-orange-500/30' :
                    'bg-slate-700/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{c.contact?.name || 'Unknown'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                      c.riskLevel === 'critical' ? 'bg-red-500 text-white' :
                      c.riskLevel === 'high' ? 'bg-orange-500 text-white' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {c.riskLevel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {c.type} • {c.duration}s • {c.distance}m
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-slate-800/60 rounded-lg p-2 text-xs text-slate-400">
        <p>🖱️ Drag to rotate</p>
        <p>🔍 Scroll to zoom</p>
        <p>👆 Click node for details</p>
      </div>
    </div>
  );
}

export default NetworkGraph3D;
