// MongoDB-based patient routes for doctor panel
const express = require('express');
const router = express.Router();
const { Person, RawEvent, MdrCase, ContactEdge } = require('../models/mongodb');
const { requireAuth } = require('../middleware/auth');

// GET /api/patients - Fetch all patients
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('📊 GET /patients - Fetching patients from MongoDB...');
    const patients = await Person.find({ profile: 'patient', active: true })
      .populate({ path: 'hospitalId', select: 'name code', strictPopulate: false })
      .populate({ path: 'departmentId', select: 'name code', strictPopulate: false })
      .sort({ admissionDate: -1 })
      .lean();

    console.log(`✅ Found ${patients.length} patients`);

    const formatted = patients.map(p => ({
      id: p._id ? p._id.toString() : p.uid,
      uid: p.uid || '',
      name: p.name || 'Unknown',
      profile: p.profile || 'patient',
      age: p.age || '-',
      gender: p.gender || '-',
      bloodGroup: p.bloodGroup || '-',
      contactNumber: p.contactNumber || '-',
      emergencyContact: p.emergencyContact || '-',
      address: p.address || '-',
      admissionDate: p.admissionDate,
      dischargeDate: p.dischargeDate,
      riskLevel: p.riskLevel || 'low',
      healthStatus: p.healthStatus || 'stable',
      status: p.riskLevel === 'high' || p.riskLevel === 'critical' ? 'red' :
              p.riskLevel === 'medium' ? 'yellow' : 'green',
      mdrStatus: p.riskLevel === 'high' || p.riskLevel === 'critical' ? 'MDR+' : 'Safe',
      hospital: (p.hospitalId && p.hospitalId.name) ? p.hospitalId.name : '-',
      department: (p.departmentId && p.departmentId.name) ? p.departmentId.name : '-',
      notes: p.notes || '',
      lastContact: p.updatedAt || null
    }));

    console.log('✅ Sending response:', { ok: true, count: formatted.length });
    res.json({ 
      ok: true, 
      patients: formatted, 
      count: formatted.length 
    });
  } catch (err) {
    console.error('❌ GET /patients error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/patients/:id - Get single patient details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try finding by MongoDB _id or uid
    let query = { profile: 'patient' };
    
    // Check if id is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      query._id = id;
    } else {
      query.uid = id;
    }
    
    let patient = await Person.findOne(query)
      .populate({ path: 'hospitalId', select: 'name code address city', strictPopulate: false })
      .populate({ path: 'departmentId', select: 'name code floor', strictPopulate: false })
      .lean();

    if (!patient) {
      return res.status(404).json({ ok: false, error: 'Patient not found' });
    }

    // Get latest RFID events for this patient
    const recentEvents = await RawEvent.find({ uid: patient.uid })
      .sort({ entryTime: -1 })
      .limit(10)
      .populate({ path: 'roomId', select: 'roomNumber name type', strictPopulate: false })
      .lean();

    // Check for MDR case
    const mdrCase = await MdrCase.findOne({ uid: patient.uid, status: { $in: ['active', 'monitoring'] } })
      .sort({ detectedAt: -1 })
      .lean();

    // Get contact count
    const contactCount = await ContactEdge.countDocuments({
      $or: [
        { personAUid: patient.uid },
        { personBUid: patient.uid }
      ]
    });

    const formatted = {
      id: patient._id.toString(),
      uid: patient.uid,
      name: patient.name,
      profile: patient.profile,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      contactNumber: patient.contactNumber,
      emergencyContact: patient.emergencyContact,
      address: patient.address,
      admissionDate: patient.admissionDate,
      dischargeDate: patient.dischargeDate,
      riskLevel: patient.riskLevel,
      healthStatus: patient.healthStatus,
      status: patient.riskLevel === 'high' || patient.riskLevel === 'critical' ? 'red' :
              patient.riskLevel === 'medium' ? 'yellow' : 'green',
      mdrStatus: mdrCase ? 'MDR+' : 'Safe',
      hospital: patient.hospitalId ? {
        name: patient.hospitalId.name,
        code: patient.hospitalId.code,
        city: patient.hospitalId.city
      } : null,
      department: patient.departmentId ? {
        name: patient.departmentId.name,
        code: patient.departmentId.code,
        floor: patient.departmentId.floor
      } : null,
      notes: patient.notes,
      lastContact: patient.updatedAt,
      
      // Additional details
      mdrCase: mdrCase ? {
        organism: mdrCase.organism,
        severity: mdrCase.severity,
        status: mdrCase.status,
        detectedAt: mdrCase.detectedAt,
        treatmentPlan: mdrCase.treatmentPlan,
        antibioticsResistant: mdrCase.antibioticsResistant
      } : null,
      
      recentLocations: recentEvents.map(e => ({
        room: e.room,
        roomName: e.roomId?.name || e.room,
        roomType: e.roomId?.type,
        entryTime: e.entryTime,
        exitTime: e.exitTime,
        duration: e.durationMinutes,
        status: e.status
      })),
      
      contactCount: contactCount
    };

    res.json({ ok: true, patient: formatted });
  } catch (err) {
    console.error('GET /patients/:id error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/patients/:id/contacts - Get patient contacts for network graph
router.get('/:id/contacts', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try finding by MongoDB _id or uid
    let query = { profile: 'patient' };
    
    // Check if id is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      query._id = id;
    } else {
      query.uid = id;
    }
    
    let patient = await Person.findOne(query).lean();

    if (!patient) {
      return res.status(404).json({ ok: false, error: 'Patient not found' });
    }

    // Find all contact edges
    const contacts = await ContactEdge.find({
      $or: [
        { personAUid: patient.uid },
        { personBUid: patient.uid }
      ]
    })
    .sort({ overlapStart: -1 })
    .limit(100)
    .lean();

    // Get unique contact UIDs
    const contactUids = new Set();
    contacts.forEach(c => {
      if (c.personAUid !== patient.uid) contactUids.add(c.personAUid);
      if (c.personBUid !== patient.uid) contactUids.add(c.personBUid);
    });

    // Fetch contact person details
    const contactPeople = await Person.find({ uid: { $in: Array.from(contactUids) } }).lean();
    const peopleMap = new Map(contactPeople.map(p => [p.uid, p]));

    // Build network structure
    const nodes = [{
      id: patient.uid,
      name: patient.name,
      type: 'source',
      riskLevel: patient.riskLevel,
      profile: patient.profile
    }];

    const edges = [];
    const addedNodes = new Set([patient.uid]);

    contacts.forEach(contact => {
      const otherUid = contact.personAUid === patient.uid ? contact.personBUid : contact.personAUid;
      const otherPerson = peopleMap.get(otherUid);
      
      if (otherPerson && !addedNodes.has(otherUid)) {
        nodes.push({
          id: otherPerson.uid,
          name: otherPerson.name,
          type: 'contact',
          riskLevel: otherPerson.riskLevel,
          profile: otherPerson.profile
        });
        addedNodes.add(otherUid);
      }

      edges.push({
        from: contact.personAUid,
        to: contact.personBUid,
        room: contact.room,
        duration: contact.durationMinutes,
        weight: contact.weight,
        riskScore: contact.riskScore,
        type: contact.contactType
      });
    });

    res.json({
      ok: true,
      network: {
        source: patient.uid,
        sourceName: patient.name,
        nodes: nodes,
        edges: edges,
        contactCount: nodes.length - 1
      }
    });
  } catch (err) {
    console.error('GET /patients/:id/contacts error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/patients/:id/timeline - Get patient movement timeline
router.get('/:id/timeline', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try finding by MongoDB _id or uid
    let query = { profile: 'patient' };
    
    // Check if id is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      query._id = id;
    } else {
      query.uid = id;
    }
    
    let patient = await Person.findOne(query).lean();

    if (!patient) {
      return res.status(404).json({ ok: false, error: 'Patient not found' });
    }

    const events = await RawEvent.find({ uid: patient.uid })
      .sort({ entryTime: -1 })
      .limit(50)
      .populate({ path: 'roomId', select: 'roomNumber name type floor', strictPopulate: false })
      .lean();

    const timeline = events.map(e => ({
      id: e._id ? e._id.toString() : null,
      room: e.room || '-',
      roomName: (e.roomId && e.roomId.name) ? e.roomId.name : (e.room || '-'),
      roomType: (e.roomId && e.roomId.type) ? e.roomId.type : '-',
      floor: (e.roomId && e.roomId.floor) ? e.roomId.floor : '-',
      entryTime: e.entryTime || null,
      exitTime: e.exitTime || null,
      duration: e.durationMinutes || 0,
      status: e.status || 'unknown',
      temperature: e.temperature || null,
      maskCompliance: e.maskCompliance || false,
      sanitizationDone: e.sanitizationDone || false,
      notes: e.notes || ''
    }));

    res.json({ ok: true, timeline });
  } catch (err) {
    console.error('GET /patients/:id/timeline error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
