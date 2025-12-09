// Equipment Check Component
// Simple equipment checklist for medical staff

import { useState, useEffect } from 'react';
import api from '../../../services/api';

const EquipmentCheck = () => {
  const [equipment, setEquipment] = useState([
    { id: 1, name: 'Ventilator', zone: 'ICU', status: 'operational', lastChecked: '2024-01-15', nextDue: '2024-02-15' },
    { id: 2, name: 'Defibrillator', zone: 'Emergency', status: 'operational', lastChecked: '2024-01-14', nextDue: '2024-02-14' },
    { id: 3, name: 'IV Pump', zone: 'General Ward', status: 'needs_maintenance', lastChecked: '2024-01-10', nextDue: '2024-01-17' },
    { id: 4, name: 'Patient Monitor', zone: 'ICU', status: 'operational', lastChecked: '2024-01-15', nextDue: '2024-02-15' },
    { id: 5, name: 'Oxygen Concentrator', zone: 'Emergency', status: 'operational', lastChecked: '2024-01-13', nextDue: '2024-02-13' },
    { id: 6, name: 'ECG Machine', zone: 'Cardiology', status: 'under_repair', lastChecked: '2024-01-08', nextDue: '2024-01-22' },
    { id: 7, name: 'Ultrasound', zone: 'Radiology', status: 'operational', lastChecked: '2024-01-12', nextDue: '2024-02-12' },
    { id: 8, name: 'Wheelchair', zone: 'Lobby', status: 'operational', lastChecked: '2024-01-15', nextDue: '2024-03-15' },
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'needs_maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'under_repair': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return '✓';
      case 'needs_maintenance': return '⚠';
      case 'under_repair': return '🔧';
      default: return '?';
    }
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesFilter = filter === 'all' || eq.status === filter;
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          eq.zone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const markAsChecked = (id) => {
    setEquipment(prev => prev.map(eq => {
      if (eq.id === id) {
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return {
          ...eq,
          lastChecked: today,
          nextDue: nextMonth.toISOString().split('T')[0],
          status: 'operational'
        };
      }
      return eq;
    }));
  };

  const stats = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === 'operational').length,
    needsMaintenance: equipment.filter(e => e.status === 'needs_maintenance').length,
    underRepair: equipment.filter(e => e.status === 'under_repair').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-xl">🔧</span>
          Equipment Check
        </h1>
        <p className="text-gray-500 mt-1">Monitor and maintain medical equipment status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Equipment</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.operational}</div>
          <div className="text-sm text-gray-500">Operational</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.needsMaintenance}</div>
          <div className="text-sm text-gray-500">Needs Maintenance</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
          <div className="text-2xl font-bold text-red-600">{stats.underRepair}</div>
          <div className="text-sm text-gray-500">Under Repair</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search equipment or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'operational', 'needs_maintenance', 'under_repair'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : 
                 status === 'operational' ? '✓ Operational' :
                 status === 'needs_maintenance' ? '⚠ Maintenance' : '🔧 Repair'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Equipment</th>
              <th className="text-left p-4 font-medium text-gray-600">Zone</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Last Checked</th>
              <th className="text-left p-4 font-medium text-gray-600">Next Due</th>
              <th className="text-left p-4 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredEquipment.map(eq => (
              <tr key={eq.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-800">{eq.name}</div>
                </td>
                <td className="p-4">
                  <span className="text-gray-600">{eq.zone}</span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(eq.status)}`}>
                    {getStatusIcon(eq.status)} {eq.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{eq.lastChecked}</td>
                <td className="p-4">
                  <span className={`${new Date(eq.nextDue) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {eq.nextDue}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => markAsChecked(eq.id)}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                  >
                    Mark Checked
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredEquipment.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No equipment found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentCheck;
