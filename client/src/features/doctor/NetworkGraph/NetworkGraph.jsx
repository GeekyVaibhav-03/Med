import { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import gsap from 'gsap';
import api from '../../../services/api';

// ✅ SIMPLE STATIC CARD COMPONENT
const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow p-6 space-y-4">
    <h3 className="text-lg font-bold">{title}</h3>
    {children}
  </div>
);

const NetworkGraph = () => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  // ✅ GSAP ENTRY ANIMATION
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 }
      );
    }
  }, []);

  // ✅ FETCH PATIENTS FROM BACKEND
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await api.get('/doctor/patients');
        if (res.data && res.data.ok) {
          setPatients(res.data.patients || []);
        }
      } catch (err) {
        console.error('Failed to fetch patients:', err);
        setError(err?.response?.data?.error || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // ✅ BUILD NETWORK FROM BACKEND
  const handleBuildNetwork = async () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/doctor/network/${selectedPatient}`);
      
      if (res.data && res.data.ok) {
        const networkData = res.data.network;
        setNetwork(networkData);
        renderGraph(networkData);
      }
    } catch (err) {
      console.error('Failed to build network:', err);
      setError(err?.response?.data?.error || 'Failed to generate network');
      alert(err?.response?.data?.error || 'Failed to generate network');
    } finally {
      setLoading(false);
    }
  };

  // ✅ RENDER GRAPH
  const renderGraph = (networkData) => {
    if (!cyRef.current) return;

    if (cyRef.current._cy) {
      cyRef.current._cy.destroy();
    }

    const elements = [
      { data: { id: networkData.source, label: networkData.source, type: 'source' } },

      ...networkData.nodes.map((node) => ({
        data: { id: node.id, label: node.name, type: node.type },
      })),

      ...networkData.edges.map((edge, idx) => ({
        data: {
          id: `edge-${idx}`,
          source: edge.from,
          target: edge.to,
          type: edge.type,
        },
      })),
    ];

    const cy = cytoscape({
      container: cyRef.current,
      elements,

      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4AA3C3',
            label: 'data(label)',
            color: '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            width: 40,
            height: 40,
          },
        },
        {
          selector: 'node[type="source"]',
          style: {
            'background-color': '#EF4444',
            width: 50,
            height: 50,
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node[type="direct"]',
          style: { 'background-color': '#F59E0B' },
        },
        {
          selector: 'node[type="equipment"]',
          style: { 'background-color': '#10B981' },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],

      layout: {
        name: 'cose',
        animate: true,
      },
    });

    cyRef.current._cy = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      alert(`Node: ${node.data('label')}\nType: ${node.data('type')}`);
    });
  };

  return (
    <div ref={containerRef} className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Contact Network Tracing</h1>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* CONTROLS */}
      <Card title="Build Network">
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading}
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.id})
            </option>
          ))}
        </select>

        <button
          onClick={handleBuildNetwork}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading || !selectedPatient}
        >
          {loading ? 'Generating...' : 'Generate Network'}
        </button>
      </Card>

      {/* GRAPH */}
      <Card title="Network Graph">
        <div ref={cyRef} style={{ height: '500px' }} className="bg-gray-200 rounded">
          {!network && !loading && (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select patient & click Generate
            </div>
          )}
          {loading && (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </Card>

      {/* STATS */}
      {network && (
        <Card title="Network Stats">
          <p>Source: {network.source}</p>
          <p>Total Nodes: {network.nodes.length}</p>
          <p>
            Direct Contacts:{' '}
            {network.nodes.filter((n) => n.type === 'direct').length}
          </p>
        </Card>
      )}
    </div>
  );
};

export default NetworkGraph;
