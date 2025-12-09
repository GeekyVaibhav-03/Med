// Equipment Contact Tracing Dashboard
// Real-time tracking of medical equipment, RFID scans, and proximity contacts

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../../services/api';

const EquipmentTracking = () => {
  const [equipment, setEquipment] = useState([]);
  const [contaminated, setContaminated] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [proximityAlerts, setProximityAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentHistory, setEquipmentHistory] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('equipment');
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);

  // Initialize data and Socket connection
  useEffect(() => {
    fetchData();
    
    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // Equipment events
    socket.on('equipment:used', (data) => {
      setEquipment(prev => prev.map(eq => 
        eq._id === data.equipment._id ? data.equipment : eq
      ));
      addAlert('info', `${data.patient} used ${data.equipment.name}`);
    });
    
    socket.on('equipment:moved', (data) => {
      setEquipment(prev => prev.map(eq => 
        eq._id === data._id ? data : eq
      ));
    });
    
    // RFID events
    socket.on('rfid:scan', (data) => {
      setRecentScans(prev => [data.scan, ...prev.slice(0, 49)]);
    });
    
    // Proximity events
    socket.on('proximity:contact', (contact) => {
      if (contact.riskLevel === 'high' || contact.riskLevel === 'critical') {
        setProximityAlerts(prev => [contact, ...prev.slice(0, 19)]);
      }
    });
    
    // Alert events
    socket.on('alert:mdr-equipment', (alert) => {
      addAlert('critical', alert.message);
      fetchContaminated();
    });
    
    socket.on('alert:proximity', (alert) => {
      addAlert(alert.severity, alert.message);
    });
    
    socket.on('alert:mdr-zone-entry', (alert) => {
      addAlert('warning', alert.message);
    });
    
    socketRef.current = socket;
    
    return () => socket.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const [eqRes, contRes, statsRes, scansRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/equipment/contaminated'),
        api.get('/equipment/stats'),
        api.get('/equipment/rfid/scans?limit=50')
      ]);
      
      if (eqRes.data?.ok) setEquipment(eqRes.data.equipment);
      if (contRes.data?.ok) setContaminated(contRes.data.equipment);
      if (statsRes.data?.ok) setStats(statsRes.data.stats);
      if (scansRes.data?.ok) setRecentScans(scansRes.data.scans);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const fetchContaminated = async () => {
    try {
      const res = await api.get('/equipment/contaminated');
      if (res.data?.ok) setContaminated(res.data.equipment);
    } catch (err) {
      console.error('Failed to fetch contaminated equipment:', err);
    }
  };

  const fetchEquipmentHistory = async (id) => {
    try {
      const res = await api.get(`/equipment/${id}/history`);
      if (res.data?.ok) setEquipmentHistory(res.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchEquipmentContacts = async (id) => {
    try {
      const res = await api.get(`/equipment/${id}/contacts`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      return null;
    }
  };

  const addAlert = (type, message) => {
    const id = Date.now();
    setAlerts(prev => [{ id, type, message, time: new Date() }, ...prev.slice(0, 9)]);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 10000);
  };

  const initializeEquipment = async () => {
    try {
      await api.post('/equipment/init');
      addAlert('success', 'Equipment system initialized');
      fetchData();
    } catch (err) {
      addAlert('error', 'Failed to initialize equipment');
    }
  };

  const toggleSimulation = async () => {
    try {
      if (isSimulating) {
        await api.post('/equipment/simulate/stop');
        setIsSimulating(false);
        addAlert('info', 'Simulation stopped');
      } else {
        await api.post('/equipment/simulate/start');
        setIsSimulating(true);
        addAlert('success', 'Simulation started - data updates every 2 seconds');
      }
    } catch (err) {
      addAlert('error', err.response?.data?.error || 'Simulation error');
    }
  };

  const markEquipmentClean = async (id) => {
    try {
      await api.post(`/equipment/${id}/use`, {
        userId: 'SYSTEM',
        userType: 'staff',
        userName: 'Cleaning Staff',
        action: 'cleaning'
      });
      addAlert('success', 'Equipment marked as cleaned');
      fetchData();
    } catch (err) {
      addAlert('error', 'Failed to mark equipment as clean');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'contaminated': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'cleaning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEquipmentIcon = (type) => {
    const icons = {
      ventilator: '🫁',
      iv_pump: '💉',
      monitor: '📊',
      wheelchair: '🦽',
      bed: '🛏️',
      stretcher: '🛋️',
      defibrillator: '⚡',
      xray: '☢️',
      ultrasound: '📡',
      ecg: '💓',
      oxygen_concentrator: '💨',
      suction_machine: '🔧',
      other: '🔧'
    };
    return icons[type] || '🔧';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl">📡</span>
              Equipment Contact Tracing
            </h1>
            <p className="text-gray-500 mt-1">RFID, BLE Beacons & Proximity Detection</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            
            {/* Initialize Button */}
            <button
              onClick={initializeEquipment}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              🔄 Initialize
            </button>
            
            {/* Simulation Toggle */}
            <button
              onClick={toggleSimulation}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isSimulating 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isSimulating ? '⏹ Stop Simulation' : '▶ Start Simulation'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg flex items-center justify-between animate-pulse ${
                alert.type === 'critical' ? 'bg-red-100 border-l-4 border-red-500' :
                alert.type === 'warning' ? 'bg-orange-100 border-l-4 border-orange-500' :
                alert.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' :
                alert.type === 'error' ? 'bg-red-100 border-l-4 border-red-500' :
                'bg-blue-100 border-l-4 border-blue-500'
              }`}
            >
              <span className="font-medium">{alert.message}</span>
              <span className="text-xs text-gray-500">
                {new Date(alert.time).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-800">{stats.equipment.total}</div>
            <div className="text-sm text-gray-500">Total Equipment</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.equipment.available}</div>
            <div className="text-sm text-gray-500">Available</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.equipment.inUse}</div>
            <div className="text-sm text-gray-500">In Use</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{stats.equipment.contaminated}</div>
            <div className="text-sm text-gray-500">Contaminated</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{stats.infrastructure.readers}</div>
            <div className="text-sm text-gray-500">RFID Readers</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{stats.activity.highRiskContacts}</div>
            <div className="text-sm text-gray-500">High Risk Contacts</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'equipment', label: '🔧 Equipment', count: equipment.length },
          { id: 'contaminated', label: '☣️ Contaminated', count: contaminated.length },
          { id: 'scans', label: '📡 RFID Scans', count: recentScans.length },
          { id: 'proximity', label: '🔴 Proximity Alerts', count: proximityAlerts.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-800">Medical Equipment</h2>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {equipment.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No equipment found. Click "Initialize" to set up default equipment.</p>
                  </div>
                ) : (
                  equipment.map(eq => (
                    <div
                      key={eq._id}
                      onClick={() => {
                        setSelectedEquipment(eq);
                        fetchEquipmentHistory(eq._id);
                      }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                        selectedEquipment?._id === eq._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getEquipmentIcon(eq.type)}</span>
                          <div>
                            <div className="font-medium text-gray-800">{eq.name}</div>
                            <div className="text-sm text-gray-500">
                              {eq.currentLocation?.zone} - {eq.currentLocation?.room}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(eq.status)}`}>
                            {eq.status}
                          </span>
                          {eq.mdrExposure?.exposed && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              MDR Exposed
                            </span>
                          )}
                        </div>
                      </div>
                      {eq.lastUsedBy?.patientName && (
                        <div className="mt-2 text-sm text-gray-500">
                          Last used by: <span className="font-medium">{eq.lastUsedBy.patientName}</span>
                          <span className="mx-2">•</span>
                          {new Date(eq.lastUsedBy.usedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Contaminated Tab */}
          {activeTab === 'contaminated' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-red-50">
                <h2 className="font-semibold text-red-800">☣️ Contaminated Equipment</h2>
                <p className="text-sm text-red-600">Equipment exposed to MDR+ patients - requires cleaning</p>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {contaminated.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No contaminated equipment 🎉</p>
                  </div>
                ) : (
                  contaminated.map(eq => (
                    <div key={eq._id} className="p-4 bg-red-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getEquipmentIcon(eq.type)}</span>
                          <div>
                            <div className="font-medium text-gray-800">{eq.name}</div>
                            <div className="text-sm text-red-600">
                              Exposed by: {eq.mdrExposure?.exposedBy}
                            </div>
                            <div className="text-xs text-gray-500">
                              {eq.mdrExposure?.exposedAt && new Date(eq.mdrExposure.exposedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => markEquipmentClean(eq._id)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                        >
                          ✓ Mark Clean
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* RFID Scans Tab */}
          {activeTab === 'scans' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-800">📡 Recent RFID Scans</h2>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {recentScans.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No recent scans. Start simulation to see RFID data.</p>
                  </div>
                ) : (
                  recentScans.map((scan, i) => (
                    <div key={scan._id || i} className="p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">{scan.entityName}</div>
                          <div className="text-sm text-gray-500">
                            {scan.readerName} • {scan.location?.zone}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium ${
                            scan.mdrStatus === 'positive' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {scan.mdrStatus === 'positive' ? '⚠️ MDR+' : '✓ Safe'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(scan.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Proximity Alerts Tab */}
          {activeTab === 'proximity' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-orange-50">
                <h2 className="font-semibold text-orange-800">🔴 High-Risk Proximity Contacts</h2>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {proximityAlerts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No high-risk proximity contacts detected.</p>
                  </div>
                ) : (
                  proximityAlerts.map((contact, i) => (
                    <div key={contact._id || i} className={`p-4 ${getRiskColor(contact.riskLevel)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">
                            {contact.entity1?.name} ↔ {contact.entity2?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Distance: {contact.distance}m • Duration: {contact.duration}s
                          </div>
                          <div className="text-xs text-gray-500">
                            {contact.location?.zone} - Floor {contact.location?.floor}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                            contact.riskLevel === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                          }`}>
                            {contact.riskLevel}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(contact.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Equipment Details */}
        <div className="lg:col-span-1">
          {selectedEquipment ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-6">
              <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getEquipmentIcon(selectedEquipment.type)}</span>
                  <div>
                    <h3 className="font-bold text-lg">{selectedEquipment.name}</h3>
                    <p className="text-blue-100 text-sm">{selectedEquipment.equipmentId}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Status */}
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">Status</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEquipment.status)}`}>
                    {selectedEquipment.status}
                  </span>
                </div>
                
                {/* Location */}
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">Location</div>
                  <div className="text-gray-800">
                    {selectedEquipment.currentLocation?.zone} - {selectedEquipment.currentLocation?.room}
                  </div>
                  <div className="text-sm text-gray-500">
                    Floor {selectedEquipment.currentLocation?.floor}
                  </div>
                </div>
                
                {/* MDR Exposure */}
                {selectedEquipment.mdrExposure?.exposed && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-xs text-red-600 uppercase font-medium mb-1">⚠️ MDR Exposure</div>
                    <div className="text-red-800 font-medium">{selectedEquipment.mdrExposure.exposedBy}</div>
                    <div className="text-xs text-red-600">
                      {new Date(selectedEquipment.mdrExposure.exposedAt).toLocaleString()}
                    </div>
                  </div>
                )}
                
                {/* Last Used */}
                {selectedEquipment.lastUsedBy?.patientName && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Last Used By</div>
                    <div className="text-gray-800">{selectedEquipment.lastUsedBy.patientName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedEquipment.lastUsedBy.usedAt).toLocaleString()}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="pt-4 border-t space-y-2">
                  {selectedEquipment.status === 'contaminated' && (
                    <button
                      onClick={() => markEquipmentClean(selectedEquipment._id)}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                    >
                      ✓ Mark as Cleaned
                    </button>
                  )}
                  <button
                    onClick={() => fetchEquipmentContacts(selectedEquipment._id)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                    📋 View Contact Chain
                  </button>
                </div>
              </div>
              
              {/* Usage History */}
              {equipmentHistory.length > 0 && (
                <div className="border-t">
                  <div className="p-3 bg-gray-50 text-sm font-medium text-gray-600">
                    Recent Usage History
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y">
                    {equipmentHistory.map((usage, i) => (
                      <div key={i} className="p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{usage.userName}</span>
                          <span className={`text-xs ${
                            usage.mdrStatus === 'positive' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {usage.mdrStatus}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {usage.action} • {new Date(usage.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
              <div className="text-4xl mb-3">🔧</div>
              <p>Select equipment to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentTracking;
