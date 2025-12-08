// MongoDB-based dashboard routes
const express = require('express');
const router = express.Router();
const { User, Person, MdrCase, Alert, RawEvent, Hospital } = require('../models/mongodb');

// GET /api/dashboard/stats - Aggregated statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPatients,
      highRiskPatients,
      activeMdrCases,
      criticalMdrCases,
      unresolvedAlerts,
      criticalAlerts,
      todayEvents,
      totalHospitals
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ active: true }),
      Person.countDocuments({ profile: 'patient', active: true }),
      Person.countDocuments({ 
        profile: 'patient', 
        riskLevel: { $in: ['high', 'critical'] },
        active: true 
      }),
      MdrCase.countDocuments({ status: 'active' }),
      MdrCase.countDocuments({ status: 'active', severity: 'critical' }),
      Alert.countDocuments({ resolved: false }),
      Alert.countDocuments({ resolved: false, severity: 'critical' }),
      RawEvent.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Hospital.countDocuments({ status: 'active' })
    ]);
    
    // Get recent MDR cases with details
    const recentMdrCases = await MdrCase.find({ status: 'active' })
      .populate('personId', 'name uid profile')
      .sort({ detectedAt: -1 })
      .limit(5)
      .lean();
    
    // Get risk distribution
    const riskDistribution = await Person.aggregate([
      { $match: { profile: 'patient', active: true } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);
    
    // Get MDR cases by organism
    const mdrByOrganism = await MdrCase.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$organism', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      ok: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        patients: {
          total: totalPatients,
          highRisk: highRiskPatients
        },
        mdrCases: {
          active: activeMdrCases,
          critical: criticalMdrCases
        },
        alerts: {
          unresolved: unresolvedAlerts,
          critical: criticalAlerts
        },
        tracking: {
          todayEvents
        },
        hospitals: totalHospitals
      },
      recentMdrCases,
      riskDistribution,
      mdrByOrganism
    });
  } catch (err) {
    console.error('dashboard.stats error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/dashboard/activity - Recent activity feed
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    
    const [recentAlerts, recentMdrCases, recentUsers] = await Promise.all([
      Alert.find()
        .sort({ createdAt: -1 })
        .limit(limit / 3)
        .lean(),
      MdrCase.find()
        .populate('personId', 'name uid')
        .sort({ detectedAt: -1 })
        .limit(limit / 3)
        .lean(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(limit / 3)
        .select('-passwordHash')
        .lean()
    ]);
    
    const activity = [
      ...recentAlerts.map(a => ({
        type: 'alert',
        message: a.message,
        severity: a.severity,
        timestamp: a.createdAt,
        id: a._id
      })),
      ...recentMdrCases.map(c => ({
        type: 'mdr_case',
        message: `New MDR case: ${c.organism} - ${c.personId?.name || c.uid}`,
        severity: c.severity,
        timestamp: c.detectedAt,
        id: c._id
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        message: `New user registered: ${u.username} (${u.role})`,
        severity: 'info',
        timestamp: u.createdAt,
        id: u._id
      }))
    ];
    
    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ ok: true, activity: activity.slice(0, limit) });
  } catch (err) {
    console.error('dashboard.activity error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/dashboard/health - System health metrics
router.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const health = {
      database: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0
      },
      collections: {
        users: await User.countDocuments(),
        persons: await Person.countDocuments(),
        mdrCases: await MdrCase.countDocuments(),
        alerts: await Alert.countDocuments(),
        rawEvents: await RawEvent.countDocuments()
      },
      timestamp: new Date()
    };
    
    res.json({ ok: true, health });
  } catch (err) {
    console.error('dashboard.health error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
