// Enhanced Network Graph with D3.js Force Simulation and Animations
import { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import api from '../../../services/api';

const NetworkGraph = () => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
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
        renderD3Graph(networkData);
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
      }, 10000);

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [autoRefresh, selectedPatient]);

  // Get node color based on risk level
  const getNodeColor = (node) => {
    if (node.type === 'source') return '#DC2626'; // Red for source
    switch (node.riskLevel) {
      case 'critical': return '#7F1D1D';
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Get edge color based on contact type
  const getEdgeColor = (edge) => {
    if (edge.contactType === 'direct') return '#EF4444';
    if (edge.contactType === 'indirect') return '#F59E0B';
    return '#9CA3AF';
  };

  // RENDER D3 GRAPH WITH ANIMATIONS
  const renderD3Graph = useCallback((networkData) => {
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const width = svgRef.current.clientWidth || 900;
    const height = 600;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Add defs for gradients and filters
    const defs = svg.append('defs');

    // Glow filter for nodes
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow marker for directed edges
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#9CA3AF');

    // Create container group for zoom
    const g = svg.append('g');

    // Prepare nodes data
    const nodes = [
      { 
        id: networkData.source, 
        name: networkData.sourceName, 
        type: 'source',
        riskLevel: 'critical',
        fx: width / 2, // Fix source in center initially
        fy: height / 2
      },
      ...networkData.nodes
        .filter(node => node.id !== networkData.source)
        .map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          riskLevel: node.riskLevel,
          profile: node.profile,
          mdrStatus: node.mdrStatus
        }))
    ];

    // Prepare edges data - API returns from/to, D3 needs source/target
    const edges = networkData.edges.map(edge => ({
      source: edge.from || edge.source,
      target: edge.to || edge.target,
      contactType: edge.type || edge.contactType,
      duration: edge.duration,
      riskScore: edge.weight || edge.riskScore
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges)
        .id(d => d.id)
        .distance(150)
        .strength(0.5))
      .force('charge', d3.forceManyBody()
        .strength(-500)
        .distanceMax(400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    simulationRef.current = simulation;

    // Draw edges
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', d => getEdgeColor(d))
      .attr('stroke-opacity', 0)
      .attr('stroke-width', d => d.contactType === 'direct' ? 3 : 2)
      .attr('stroke-dasharray', d => d.contactType === 'indirect' ? '5,5' : 'none')
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 0) // Start with 0 radius for animation
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)')
      .on('mouseover', function(event, d) {
        setHoveredNode(d);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.type === 'source' ? 35 : 28);
      })
      .on('mouseout', function(event, d) {
        setHoveredNode(null);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.type === 'source' ? 30 : 22);
      });

    // Add labels to nodes
    node.append('text')
      .attr('dy', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .attr('opacity', 0)
      .text(d => d.name?.length > 15 ? d.name.substring(0, 12) + '...' : d.name);

    // Add risk indicator badge
    node.append('circle')
      .attr('r', 8)
      .attr('cx', 20)
      .attr('cy', -20)
      .attr('fill', d => {
        if (d.mdrStatus === 'positive') return '#7F1D1D';
        if (d.riskLevel === 'high' || d.riskLevel === 'critical') return '#EF4444';
        return 'transparent';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', d => d.mdrStatus === 'positive' || d.riskLevel === 'high' ? 1 : 0);

    // Add MDR+ text
    node.append('text')
      .attr('x', 20)
      .attr('y', -17)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('opacity', d => d.mdrStatus === 'positive' ? 1 : 0)
      .text('M');

    // === ANIMATIONS ===

    // Animate edges appearing
    link.transition()
      .duration(800)
      .delay((d, i) => 400 + i * 50)
      .attr('stroke-opacity', 0.6);

    // Animate nodes expanding
    node.select('circle')
      .transition()
      .duration(600)
      .delay((d, i) => i * 80)
      .ease(d3.easeElasticOut.amplitude(1).period(0.5))
      .attr('r', d => d.type === 'source' ? 30 : 22);

    // Animate labels appearing
    node.select('text')
      .transition()
      .duration(400)
      .delay((d, i) => 300 + i * 80)
      .attr('opacity', 1);

    // Pulse animation for source node
    function pulseSource() {
      node.filter(d => d.type === 'source')
        .select('circle')
        .transition()
        .duration(1000)
        .attr('stroke-width', 6)
        .attr('stroke', '#FCA5A5')
        .transition()
        .duration(1000)
        .attr('stroke-width', 3)
        .attr('stroke', '#fff')
        .on('end', pulseSource);
    }
    setTimeout(pulseSource, 1500);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      // Keep source fixed, release others
      if (d.type !== 'source') {
        d.fx = null;
        d.fy = null;
      }
    }

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Release source node after initial positioning
    setTimeout(() => {
      const sourceNode = nodes.find(n => n.type === 'source');
      if (sourceNode) {
        sourceNode.fx = null;
        sourceNode.fy = null;
        simulation.alpha(0.3).restart();
      }
    }, 2000);

  }, []);

  const getPatientStats = () => {
    if (!network) return null;
    
    const totalContacts = network.nodes.length - 1;
    const highRisk = network.nodes.filter(n => n.riskLevel === 'high' || n.riskLevel === 'critical').length;
    const mediumRisk = network.nodes.filter(n => n.riskLevel === 'medium').length;
    const lowRisk = network.nodes.filter(n => n.riskLevel === 'low').length;
    const mdrContacts = network.stats?.mdrContacts || network.nodes.filter(n => n.mdrStatus === 'positive').length;
    const directContacts = network.stats?.directContacts || network.edges.filter(e => e.contactType === 'direct').length;
    
    return {
      total: totalContacts,
      high: highRisk,
      medium: mediumRisk,
      low: lowRisk,
      edges: network.edges.length,
      mdr: mdrContacts,
      direct: directContacts
    };
  };

  const stats = getPatientStats();

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🕸️ Contact Tracing Network</h1>
          <p className="text-gray-600 mt-1">
            Interactive D3.js visualization with force simulation
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white">
          <i className="ri-sparkling-line text-lg"></i>
          <span className="font-semibold">Powered by D3.js</span>
        </div>
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
                <option key={p.id || p.uid} value={p.id || p.uid}>
                  {p.fullName || p.name} - {p.ward || 'Unknown Ward'} {p.mdrStatus === 'positive' ? '🔴 MDR+' : '🟢 Safe'}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleBuildNetwork()}
            disabled={!selectedPatient || loading}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Generating...
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
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Contacts</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">High Risk</p>
            <p className="text-2xl font-bold text-red-600">{stats.high}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">MDR Contacts</p>
            <p className="text-2xl font-bold text-orange-600">{stats.mdr}</p>
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
            <p className="text-gray-600 text-sm">Direct</p>
            <p className="text-2xl font-bold text-purple-600">{stats.direct}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
            <p className="text-gray-600 text-sm">Connections</p>
            <p className="text-2xl font-bold text-cyan-600">{stats.edges}</p>
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Network Visualization</h3>
            {hoveredNode && (
              <div className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm animate-pulse">
                <span className="font-semibold">{hoveredNode.name}</span>
                <span className="mx-2">|</span>
                <span>{hoveredNode.type === 'source' ? 'Source Patient' : hoveredNode.profile || 'Contact'}</span>
                <span className="mx-2">|</span>
                <span className="capitalize">{hoveredNode.riskLevel || 'Unknown'} Risk</span>
              </div>
            )}
          </div>
          <div className="flex gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 shadow-lg shadow-red-200"></div>
              <span>Source/High Risk Patient</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-200"></div>
              <span>Medium Risk Contact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-200"></div>
              <span>Low Risk Contact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-red-500 rounded"></div>
              <span>Direct Contact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-yellow-500 rounded" style={{backgroundImage: 'repeating-linear-gradient(90deg, #F59E0B 0, #F59E0B 4px, transparent 4px, transparent 8px)'}}></div>
              <span>Indirect Contact</span>
            </div>
          </div>
        </div>

        {!network ? (
          <div className="h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="relative inline-block">
                <i className="ri-node-tree text-8xl text-gray-300"></i>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                  <i className="ri-add-line text-white text-sm"></i>
                </div>
              </div>
              <p className="text-lg font-semibold mt-4">No Network Generated</p>
              <p className="text-sm">Select a patient and click "Build Network" to visualize contacts</p>
              <p className="text-xs text-gray-400 mt-2">Drag nodes to reposition • Scroll to zoom • Pan to navigate</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <svg
              ref={svgRef}
              className="border-2 border-gray-200 rounded-lg bg-gradient-to-br from-slate-50 via-white to-cyan-50"
              style={{ width: '100%', height: '600px' }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={() => {
                  const svg = d3.select(svgRef.current);
                  svg.transition().duration(500).call(
                    d3.zoom().transform,
                    d3.zoomIdentity
                  );
                }}
                className="px-3 py-2 bg-white rounded-lg shadow border text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <i className="ri-focus-3-line mr-1"></i>
                Reset View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Network Details */}
      {network && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Network Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Source Patient</h4>
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-900">{network.sourceName}</p>
                <p className="text-sm text-red-700">UID: {network.source}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Contact Summary</h4>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
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
                  <div key={node.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full shadow-lg"
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
                          {node.id} • {node.profile} • <span className="capitalize">{node.riskLevel}</span>
                        </p>
                      </div>
                      {node.mdrStatus === 'positive' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                          MDR+
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions Panel */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <i className="ri-question-line text-teal-600"></i>
          How to Use This Visualization
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <i className="ri-drag-move-2-line text-teal-500 mt-0.5"></i>
            <span><strong>Drag nodes</strong> to reposition them in the graph</span>
          </div>
          <div className="flex items-start gap-2">
            <i className="ri-zoom-in-line text-teal-500 mt-0.5"></i>
            <span><strong>Scroll to zoom</strong> in and out of the network</span>
          </div>
          <div className="flex items-start gap-2">
            <i className="ri-cursor-line text-teal-500 mt-0.5"></i>
            <span><strong>Hover nodes</strong> to see patient details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
