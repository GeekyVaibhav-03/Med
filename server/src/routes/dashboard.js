// src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { User, Alert, MdrCase, ContactEdge, RawEvent } = require('../models');
const { Op } = require('sequelize');

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyxMnuv_NV2l3PAL-eeak0BUhBTr848J-UfavJ4ltJv6D1Dlz119gWUHwXZcZ9QiyC-/exec";
const RFID_API = "https://script.google.com/macros/s/AKfycbySd83jRAJ1Z5geVM79gp5CYZZ41Tq99xaGB9XNevGlT0PKI8ZIBHlYQ68ncgvAedsGZw/exec";

// GET /api/dashboard/stats - Get all dashboard statistics in one call
router.get('/stats', async (req, res) => {
  try {
    // Fetch all data in parallel
    const [users, alerts, mdrCases, contactEdges, patientsData, rfidResponse] = await Promise.all([
      User.findAll({ attributes: ['id', 'username', 'role', 'email', 'active'] }),
      Alert.findAll({ 
        order: [['id', 'DESC']], 
        limit: 100 
      }),
      MdrCase.findAll({ 
        order: [['detected_at', 'DESC']],
        limit: 100 
      }),
      ContactEdge.findAll({ limit: 500 }),
      axios.get(GOOGLE_SHEET_URL).catch(() => ({ data: [] })),
      axios.get(RFID_API).catch(() => ({ data: [] }))
    ]);

    const patients = patientsData.data || [];
    const rfidData = rfidResponse.data || [];

    // Calculate statistics
    const stats = {
      // User stats
      totalUsers: users.length,
      activeUsers: users.filter(u => u.active).length,
      usersByRole: {
        admin: users.filter(u => u.role === 'admin').length,
        doctor: users.filter(u => u.role === 'doctor').length,
        staff: users.filter(u => u.role === 'staff').length,
        nurse: users.filter(u => u.role === 'nurse').length
      },

      // Patient stats
      totalPatients: patients.length,
      patientsByStatus: {
        red: patients.filter(p => p.status === 'red').length,
        yellow: patients.filter(p => p.status === 'yellow').length,
        green: patients.filter(p => p.status === 'green').length
      },

      // MDR Cases
      totalMdrCases: mdrCases.length,
      recentMdrCases: mdrCases.slice(0, 10),
      mdrCasesToday: mdrCases.filter(c => {
        const today = new Date();
        const caseDate = new Date(c.detected_at);
        return caseDate.toDateString() === today.toDateString();
      }).length,

      // Alerts
      totalAlerts: alerts.length,
      pendingAlerts: alerts.filter(a => !a.resolved && !a.read).length,
      resolvedAlerts: alerts.filter(a => a.resolved).length,
      alertsByPriority: {
        high: alerts.filter(a => a.priority >= 3).length,
        medium: alerts.filter(a => a.priority === 2).length,
        low: alerts.filter(a => a.priority === 1).length
      },
      recentAlerts: alerts.slice(0, 10),

      // Contact tracing
      totalContacts: contactEdges.length,
      recentContacts: patients.filter(p => p.status === 'yellow' || p.status === 'red').length,

      // RFID Equipment
      activeEquipment: rfidData.filter(d => d.active !== false).length,
      totalEquipment: rfidData.length,

      // Critical cases (MDR + high risk patients)
      criticalCases: patients.filter(p => p.status === 'red').length + 
                     mdrCases.filter(c => {
                       const hoursSince = (Date.now() - new Date(c.detected_at)) / (1000 * 60 * 60);
                       return hoursSince < 24;
                     }).length,

      // Recent activity timestamps
      lastUpdate: new Date().toISOString(),
      systemStatus: 'operational'
    };

    res.json({ ok: true, stats });
  } catch (err) {
    console.error('dashboard.stats error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/dashboard/activity - Get recent activity feed
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    
    const [recentUsers, recentAlerts, recentMdrCases] = await Promise.all([
      User.findAll({ 
        order: [['id', 'DESC']], 
        limit: 10,
        attributes: ['id', 'username', 'role', 'email', 'active']
      }),
      Alert.findAll({ 
        order: [['id', 'DESC']], 
        limit: 10
      }),
      MdrCase.findAll({ 
        order: [['detected_at', 'DESC']], 
        limit: 10
      })
    ]);

    const activity = [
      ...recentUsers.map(u => ({
        type: 'user',
        action: 'created',
        data: u,
        timestamp: u.createdAt || new Date()
      })),
      ...recentAlerts.map(a => ({
        type: 'alert',
        action: 'triggered',
        data: a,
        timestamp: a.created_at || new Date()
      })),
      ...recentMdrCases.map(c => ({
        type: 'mdr_case',
        action: 'detected',
        data: c,
        timestamp: c.detected_at
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

    res.json({ ok: true, activity, count: activity.length });
  } catch (err) {
    console.error('dashboard.activity error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/dashboard/health - System health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      database: 'healthy',
      api: 'healthy',
      googleSheets: 'unknown',
      timestamp: new Date().toISOString()
    };

    // Test database connection
    try {
      await User.count();
      health.database = 'healthy';
    } catch (err) {
      health.database = 'unhealthy';
    }

    // Test Google Sheets API
    try {
      await axios.get(GOOGLE_SHEET_URL, { timeout: 5000 });
      health.googleSheets = 'healthy';
    } catch (err) {
      health.googleSheets = 'unhealthy';
    }

    const overallStatus = Object.values(health).every(v => v === 'healthy' || v === health.timestamp) ? 'healthy' : 'degraded';
    
    res.json({ ok: true, health: { ...health, status: overallStatus } });
  } catch (err) {
    console.error('dashboard.health error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
