const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// POST /api/gps/location - Save GPS coordinates and broadcast via Socket.io
router.post('/location', async (req, res) => {
  try {
    const { 
      deviceId, 
      patientId, 
      patientName,
      latitude, 
      longitude, 
      altitude,
      speed,
      heading,
      accuracy,
      zone,
      riskLevel,
      status,
      metadata 
    } = req.body;

    // Validate required fields
    if (!deviceId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        ok: false, 
        error: 'deviceId, latitude, and longitude are required' 
      });
    }

    // Create new location record
    const location = new Location({
      deviceId,
      patientId,
      patientName,
      latitude,
      longitude,
      altitude: altitude || 0,
      speed: speed || 0,
      heading: heading || 0,
      accuracy,
      zone: zone || 'Unknown',
      riskLevel: riskLevel || 'low',
      status: status || 'active',
      metadata
    });

    await location.save();

    // Broadcast to all connected clients via Socket.io
    const io = req.app.locals.io;
    if (io) {
      io.emit('gps:location-update', {
        deviceId,
        patientId,
        patientName,
        latitude,
        longitude,
        altitude: location.altitude,
        speed: location.speed,
        heading: location.heading,
        zone: location.zone,
        riskLevel: location.riskLevel,
        status: location.status,
        timestamp: location.createdAt
      });
    }

    res.json({ 
      ok: true, 
      message: 'Location saved and broadcasted',
      location 
    });

  } catch (err) {
    console.error('GPS location error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/gps/locations - Get all latest locations (one per device)
router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.getLatestLocations();
    res.json({ ok: true, locations });
  } catch (err) {
    console.error('Get locations error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/gps/device/:deviceId - Get location history for a device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100 } = req.query;

    const locations = await Location.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ ok: true, locations });
  } catch (err) {
    console.error('Get device locations error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/gps/zones - Get devices grouped by zone
router.get('/zones', async (req, res) => {
  try {
    const latestLocations = await Location.getLatestLocations();
    
    const zones = latestLocations.reduce((acc, loc) => {
      if (!acc[loc.zone]) {
        acc[loc.zone] = [];
      }
      acc[loc.zone].push(loc);
      return acc;
    }, {});

    res.json({ ok: true, zones });
  } catch (err) {
    console.error('Get zones error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/gps/simulate - Simulate GPS updates for testing
router.post('/simulate', async (req, res) => {
  try {
    const io = req.app.locals.io;
    
    // Hospital center coordinates (example: Delhi AIIMS area)
    const hospitalCenter = {
      lat: 28.5672,
      lng: 77.2100
    };

    const zones = ['ICU', 'ER', 'Ward-A', 'Ward-B', 'Ward-C', 'Lobby', 'Pharmacy', 'Lab'];
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    
    // Generate 5 simulated patients
    const patients = [];
    for (let i = 1; i <= 5; i++) {
      const angle = (i / 5) * 2 * Math.PI;
      const radius = 0.001 + Math.random() * 0.002;
      
      const patient = {
        deviceId: `DEVICE-${String(i).padStart(3, '0')}`,
        patientId: `PAT-${String(i).padStart(4, '0')}`,
        patientName: `Patient ${i}`,
        latitude: hospitalCenter.lat + Math.sin(angle) * radius,
        longitude: hospitalCenter.lng + Math.cos(angle) * radius,
        altitude: Math.floor(Math.random() * 5),
        speed: Math.random() * 2,
        heading: Math.random() * 360,
        zone: zones[Math.floor(Math.random() * zones.length)],
        riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
        status: 'active'
      };

      // Save to database
      const location = new Location(patient);
      await location.save();
      patients.push(patient);

      // Broadcast update
      if (io) {
        io.emit('gps:location-update', {
          ...patient,
          timestamp: new Date()
        });
      }
    }

    res.json({ 
      ok: true, 
      message: 'Simulated 5 patient locations',
      patients 
    });

  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/gps/clear - Clear all location data (for testing)
router.delete('/clear', async (req, res) => {
  try {
    await Location.deleteMany({});
    res.json({ ok: true, message: 'All location data cleared' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
