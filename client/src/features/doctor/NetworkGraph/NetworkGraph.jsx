// Enhanced Network Graph with real patient contact data
import { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import gsap from 'gsap';
import api from '../../../services/api';

const NetworkGraph = () => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const cyInstance = useRef(null);
  const refreshInterval = useRef(null);

  // GSAP ENTRY ANIMATION
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 }
      );
    }
  }, []);

  // FETCH PATIENTS FROM BACKEND
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await api.get('/patients');
        console.log('NetworkGraph - API Response:', res.data);
        if (res.data && res.data.ok && Array.isArray(res.data.patients)) {
          setPatients(res.data.patients);
        } else {
          console.warn('Invalid patient data structure:', res.data);
          setPatients([]);
        }
      } catch (err) {
        console.error('Failed to fetch patients:', err.message);
        setError(err?.response?.data?.error || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // BUILD NETWORK FROM BACKEND
  const handleBuildNetwork = async (patientUid = selectedPatient) => {
    if (!patientUid) {
      alert('Please select a patient');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/patients/${patientUid}/contacts`);
      console.log('Network API Response:', res.data);
      
      if (res.data && res.data.ok && res.data.network) {
        const networkData = res.data.network;
        setNetwork(networkData);
        renderGraph(networkData);
      } else {
        console.warn('Invalid network data structure:', res.data);
        setError('Invalid network data received');
      }
    } catch (err) {
      console.error('Failed to build network:', err.message);
      setError(err?.response?.data?.error || 'Failed to generate network');
    } finally {
      setLoading(false);
    }
  };

  // AUTO REFRESH
  useEffect(() => {
    if (autoRefresh && selectedPatient) {
      refreshInterval.current = setInterval(() => {
        handleBuildNetwork(selectedPatient);
      }, 10000); // Refresh every 10 seconds

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [autoRefresh, selectedPatient]);

  // RENDER GRAPH
  const renderGraph = (networkData) => {
    if (!cyRef.current) return;

    if (cyInstance.current) {
      cyInstance.current.destroy();
    }

    const elements = [
      { data: { id: networkData.source, label: networkData.sourceName, type: 'source' } },

      ...networkData.nodes
        .filter(node => node.id !== networkData.source)
        .map((node) => ({
          data: { 
            id: node.id, 
            label: node.name, 
            type: node.type,
            riskLevel: node.riskLevel,
            profile: node.profile
          },
        })),

      ...networkData.edges.map((edge, idx) => ({
        data: {
          id: `edge-${idx}`,
          source: edge.from,
          target: edge.to,
          type: edge.type,
          duration: edge.duration,
          weight: edge.weight
        },
      })),
    ];

    const cy = cytoscape({
      container: cyRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele) => {
              const type = ele.data('type');
              const riskLevel = ele.data('riskLevel');
              
              if (type === 'source') return '#EF4444';
              if (riskLevel === 'high' || riskLevel === 'critical') return '#EF4444';
              if (riskLevel === 'medium') return '#F59E0B';
              return '#10B981';
            },
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            color: '#fff',
            'font-size': '12px',
            'font-weight': 'bold',
            width: (ele) => ele.data('type') === 'source' ? 50 : 40,
            height: (ele) => ele.data('type') === 'source' ? 50 : 40,
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'border-width': (ele) => ele.data('type') === 'source' ? 4 : 2,
            'border-color': '#fff',
          },
        },
        {
          selector: 'edge',
          style: {
            width: (ele) => {
              const weight = ele.data('weight') || 1;
              return Math.max(1, Math.min(weight * 3, 10));
            },
            'line-color': (ele) => {
              const type = ele.data('type');
              if (type === 'direct') return '#EF4444';
              if (type === 'indirect') return '#F59E0B';
              return '#10B981';
            },
            'target-arrow-color': (ele) => {
              const type = ele.data('type');
              if (type === 'direct') return '#EF4444';
              if (type === 'indirect') return '#F59E0B';
              return '#10B981';
            },
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: 0.7,
          },
        },
      ],
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    });

    // Add click event for nodes
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = node.data();
      alert(`Patient: ${nodeData.label}\nID: ${nodeData.id}\nType: ${nodeData.type}\nRisk: ${nodeData.riskLevel || 'Unknown'}`);
    });

    cyInstance.current = cy;
  };

  const getPatientStats = () => {
    if (!network) return null;
    
    const totalContacts = network.nodes.length - 1; // Exclude source
    const highRisk = network.nodes.filter(n => n.riskLevel === 'high' || n.riskLevel === 'critical').length;
    const mediumRisk = network.nodes.filter(n => n.riskLevel === 'medium').length;
    const lowRisk = network.nodes.filter(n => n.riskLevel === 'low').length;
    
    return {
      total: totalContacts,
      high: highRisk,
      medium: mediumRisk,
      low: lowRisk,
      edges: network.edges.length
    };
  };

  const stats = getPatientStats();

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🕸️ Contact Tracing Network</h1>
        <p className="text-gray-600 mt-1">
          Visualize patient contact relationships and trace infection spread
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Patient to Trace</h3>
        <div className="flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.uid} value={p.uid}>
                  {p.name} ({p.uid}) - {p.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleBuildNetwork()}
            disabled={!selectedPatient || loading}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Building...
              </>
            ) : (
              <>
                <i className="ri-node-tree"></i>
                Build Network
              </>
            )}
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              autoRefresh
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={!network}
          >
            <i className={autoRefresh ? 'ri-stop-circle-line' : 'ri-refresh-line'}></i>
            {autoRefresh ? 'Stop Auto-Refresh' : 'Auto-Refresh (10s)'}
          </button>
        </div>

        {autoRefresh && (
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold">Live updating every 10 seconds</span>
          </div>
        )}
      </div>

      {/* Network Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Contacts</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">High Risk</p>
            <p className="text-2xl font-bold text-red-600">{stats.high}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Medium Risk</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Low Risk</p>
            <p className="text-2xl font-bold text-green-600">{stats.low}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Connections</p>
            <p className="text-2xl font-bold text-purple-600">{stats.edges}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Network Visualization</h3>
          <div className="flex gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Source/High Risk Patient</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Medium Risk Contact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Low Risk Contact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-500"></div>
              <span>Direct Contact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-yellow-500"></div>
              <span>Indirect Contact</span>
            </div>
          </div>
        </div>

        {!network ? (
          <div className="h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <i className="ri-node-tree text-6xl mb-4"></i>
              <p className="text-lg font-semibold">No Network Generated</p>
              <p className="text-sm">Select a patient and click "Build Network" to visualize contacts</p>
            </div>
          </div>
        ) : (
          <div
            ref={cyRef}
            className="border-2 border-gray-200 rounded-lg"
            style={{ height: '600px', width: '100%' }}
          />
        )}
      </div>

      {/* Network Details */}
      {network && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Network Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Source Patient</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-900">{network.sourceName}</p>
                <p className="text-sm text-red-700">UID: {network.source}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Contact Summary</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  This patient has had contact with <span className="font-bold text-blue-900">{network.contactCount}</span> other individuals
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Total connection paths: <span className="font-bold text-blue-900">{network.edges.length}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">All Contacts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {network.nodes
                .filter(n => n.id !== network.source)
                .map((node) => (
                  <div key={node.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            node.riskLevel === 'high' || node.riskLevel === 'critical'
                              ? '#EF4444'
                              : node.riskLevel === 'medium'
                              ? '#F59E0B'
                              : '#10B981',
                        }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{node.name}</p>
                        <p className="text-xs text-gray-600">
                          {node.id} • {node.profile} • {node.riskLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
