// MongoDB-based MDR cases routes
const express = require('express');
const router = express.Router();
const { MdrCase, Person, ContactEdge, Alert } = require('../models/mongodb');

// GET /api/mdrcases - List all MDR cases
router.get('/', async (req, res) => {
  try {
    const { status, severity, organism } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (organism) filter.organism = new RegExp(organism, 'i');
    
    const cases = await MdrCase.find(filter)
      .populate('hospitalId', 'name code')
      .populate('departmentId', 'name')
      .populate('personId', 'name uid profile')
      .sort({ detectedAt: -1 })
      .lean();
    
    res.json({ ok: true, count: cases.length, cases });
  } catch (err) {
    console.error('mdrcases.get error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/mdrcases/:id - Get single MDR case
router.get('/:id', async (req, res) => {
  try {
    const mdrCase = await MdrCase.findById(req.params.id)
      .populate('hospitalId', 'name code address')
      .populate('departmentId', 'name type')
      .populate('personId', 'name uid profile age gender contactNumber')
      .lean();
    
    if (!mdrCase) {
      return res.status(404).json({ ok: false, error: 'MDR case not found' });
    }
    
    res.json({ ok: true, case: mdrCase });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/mdrcases - Create new MDR case with contact tracing
router.post('/', async (req, res) => {
  try {
    const { uid, organism, infectionType, severity, notes } = req.body;
    
    if (!uid || !organism) {
      return res.status(400).json({
        ok: false,
        error: 'uid and organism are required'
      });
    }
    
    // Find the person
    const person = await Person.findOne({ uid });
    if (!person) {
      return res.status(404).json({ ok: false, error: 'Person not found' });
    }
    
    // Create MDR case
    const mdrCase = await MdrCase.create({
      uid,
      personId: person._id,
      hospitalId: person.hospitalId,
      departmentId: person.departmentId,
      organism,
      infectionType,
      severity: severity || 'moderate',
      status: 'active',
      isolationRequired: true,
      notes,
      detectedAt: new Date()
    });
    
    // Find contacts using BFS
    const contactLevels = await traceContacts(uid, 2);
    
    // Create alert
    await Alert.create({
      type: 'mdr_detection',
      message: `New MDR case detected: ${organism} for patient ${uid}`,
      severity: 'critical',
      priority: 5,
      hospitalId: person.hospitalId,
      relatedCaseId: mdrCase._id,
      actionRequired: true
    });
    
    // Emit socket event
    try {
      const io = req.app.locals.io;
      if (io) {
        io.emit('mdr:new', {
          caseId: mdrCase._id,
          uid,
          organism,
          severity: mdrCase.severity,
          contacts: contactLevels
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit failed:', socketErr.message);
    }
    
    res.status(201).json({
      ok: true,
      case: mdrCase,
      contacts: contactLevels
    });
  } catch (err) {
    console.error('mdrcases.post error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Helper function for contact tracing (BFS)
async function traceContacts(sourceUid, maxLevels = 2) {
  const visited = new Set([sourceUid]);
  const levels = { 1: [], 2: [] };
  let currentLevel = [sourceUid];
  
  for (let level = 1; level <= maxLevels; level++) {
    const nextLevel = [];
    
    for (const uid of currentLevel) {
      const contacts = await ContactEdge.find({
        $or: [
          { personAUid: uid },
          { personBUid: uid }
        ]
      }).lean();
      
      for (const contact of contacts) {
        const contactUid = contact.personAUid === uid ? contact.personBUid : contact.personAUid;
        
        if (!visited.has(contactUid)) {
          visited.add(contactUid);
          nextLevel.push(contactUid);
          
          const person = await Person.findOne({ uid: contactUid }).lean();
          levels[level].push({
            uid: contactUid,
            name: person?.name,
            profile: person?.profile,
            room: contact.room,
            duration: contact.durationMinutes,
            riskScore: contact.riskScore
          });
        }
      }
    }
    
    currentLevel = nextLevel;
    if (currentLevel.length === 0) break;
  }
  
  return levels;
}

// PATCH /api/mdrcases/:id - Update MDR case
router.patch('/:id', async (req, res) => {
  try {
    const { status, severity, treatmentPlan, notes } = req.body;
    
    const update = {};
    if (status !== undefined) {
      update.status = status;
      if (status === 'resolved') {
        update.resolvedAt = new Date();
      }
    }
    if (severity !== undefined) update.severity = severity;
    if (treatmentPlan !== undefined) update.treatmentPlan = treatmentPlan;
    if (notes !== undefined) update.notes = notes;
    
    const mdrCase = await MdrCase.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate('personId', 'name uid');
    
    if (!mdrCase) {
      return res.status(404).json({ ok: false, error: 'MDR case not found' });
    }
    
    res.json({ ok: true, case: mdrCase });
  } catch (err) {
    console.error('mdrcases.patch error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
