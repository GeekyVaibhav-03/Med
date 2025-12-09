const express = require("express");
const router = express.Router();

// Load MongoDB models
let Patient;
try {
  const models = require('../models/mongodb');
  Patient = models.Patient;
} catch (err) {
  console.error('❌ MongoDB models not available for patients route');
}

// GET /api/patients - Fetch all patients from MongoDB
router.get("/", async (req, res) => {
  try {
    if (!Patient) {
      return res.status(500).json({ ok: false, error: "Patient model not available" });
    }

    const { mdrOnly, ward, status } = req.query;
    let query = {};
    
    if (mdrOnly === 'true') {
      query.mdrStatus = 'positive';
    }
    if (ward) {
      query.ward = ward;
    }
    if (status) {
      query.status = status;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });

    const formatted = patients.map((p) => ({
      id: p._id.toString(),
      uid: p._id.toString(),
      name: p.fullName || "Unknown",
      fullName: p.fullName,
      fatherHusbandName: p.fatherHusbandName,
      gender: p.gender,
      age: p.age || "-",
      address: p.address,
      mobileNumber: p.mobileNumber,
      aadharNumber: p.aadharNumber,
      ward: p.ward,
      bedNumber: p.bedNumber,
      room: p.bedNumber || p.ward || "-",
      rfidTag: p.rfidTag,
      status: p.status === 'active' ? (p.mdrStatus === 'positive' ? 'red' : 'green') : 'yellow',
      mdrStatus: p.mdrStatus === 'positive' ? "positive" : "negative",
      mdrStatusLabel: p.mdrStatus === 'positive' ? "MDR+" : "Safe",
      hospital: p.hospital,
      admissionDate: p.admissionDate,
      lastContact: p.updatedAt || p.createdAt,
      profile: p.fullName || "Unknown",
      riskLevel: p.mdrStatus === 'positive' ? "high" : "low",
      mdrDetails: p.mdrDetails || null
    }));

    res.json({ ok: true, patients: formatted, count: formatted.length });
  } catch (err) {
    console.error("Patient API Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to fetch patients", patients: [], count: 0 });
  }
});

// GET /api/patients/stats/mdr - Get MDR statistics
router.get("/stats/mdr", async (req, res) => {
  try {
    if (!Patient) {
      return res.status(500).json({ ok: false, error: "Patient model not available" });
    }

    const totalPatients = await Patient.countDocuments();
    const mdrPositive = await Patient.countDocuments({ mdrStatus: 'positive' });
    const mdrNegative = await Patient.countDocuments({ mdrStatus: 'negative' });
    
    // Get MDR by ward
    const mdrByWard = await Patient.aggregate([
      { $match: { mdrStatus: 'positive' } },
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get MDR by organism
    const mdrByOrganism = await Patient.aggregate([
      { $match: { mdrStatus: 'positive', 'mdrDetails.organism': { $exists: true } } },
      { $group: { _id: '$mdrDetails.organism', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent MDR cases (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMDRCases = await Patient.countDocuments({
      mdrStatus: 'positive',
      'mdrDetails.diagnosisDate': { $gte: sevenDaysAgo }
    });

    res.json({
      ok: true,
      stats: {
        totalPatients,
        mdrPositive,
        mdrNegative,
        mdrPercentage: totalPatients > 0 ? ((mdrPositive / totalPatients) * 100).toFixed(1) : 0,
        mdrByWard: mdrByWard.map(w => ({ ward: w._id, count: w.count })),
        mdrByOrganism: mdrByOrganism.map(o => ({ organism: o._id, count: o.count })),
        recentMDRCases,
        isolationRequired: mdrPositive, // All MDR cases require isolation
        contactTracingInitiated: mdrPositive // All MDR cases have contact tracing
      }
    });
  } catch (err) {
    console.error("MDR Stats Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to fetch MDR statistics" });
  }
});

// GET /api/patients/mdr/list - Get only MDR positive patients
router.get("/mdr/list", async (req, res) => {
  try {
    if (!Patient) {
      return res.status(500).json({ ok: false, error: "Patient model not available" });
    }

    const mdrPatients = await Patient.find({ mdrStatus: 'positive' }).sort({ 'mdrDetails.diagnosisDate': -1 });

    const formatted = mdrPatients.map((p) => ({
      id: p._id.toString(),
      fullName: p.fullName,
      gender: p.gender,
      age: p.age,
      ward: p.ward,
      bedNumber: p.bedNumber,
      mobileNumber: p.mobileNumber,
      organism: p.mdrDetails?.organism || 'Unknown',
      resistancePattern: p.mdrDetails?.resistancePattern || 'Unknown',
      diagnosisDate: p.mdrDetails?.diagnosisDate,
      treatmentStarted: p.mdrDetails?.treatmentStarted,
      isolationRequired: p.mdrDetails?.isolationRequired || false,
      contactTracingInitiated: p.mdrDetails?.contactTracingInitiated || false,
      notes: p.mdrDetails?.notes || ''
    }));

    res.json({ ok: true, mdrPatients: formatted, count: formatted.length });
  } catch (err) {
    console.error("MDR List Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to fetch MDR patients" });
  }
});

// PATCH /api/patients/:id/mdr - Update patient MDR status
router.patch("/:id/mdr", async (req, res) => {
  try {
    if (!Patient) {
      return res.status(500).json({ ok: false, error: "Patient model not available" });
    }

    const { id } = req.params;
    const { mdrStatus, mdrDetails } = req.body;

    const updateData = {};
    if (mdrStatus) updateData.mdrStatus = mdrStatus;
    if (mdrDetails) updateData.mdrDetails = mdrDetails;

    // If marking as positive, set isolation ward
    if (mdrStatus === 'positive') {
      updateData.ward = 'Isolation Ward';
      updateData['mdrDetails.isolationRequired'] = true;
      updateData['mdrDetails.contactTracingInitiated'] = true;
      updateData['mdrDetails.diagnosisDate'] = new Date();
    }

    const patient = await Patient.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!patient) {
      return res.status(404).json({ ok: false, error: "Patient not found" });
    }

    res.json({ ok: true, message: "MDR status updated", patient });
  } catch (err) {
    console.error("Update MDR Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to update MDR status" });
  }
});

// GET /api/patients/flags - Get all patients with computed MDR flags
router.get("/flags", async (req, res) => {
  try {
    if (!Patient) {
      return res.status(500).json({ ok: false, error: "Patient model not available" });
    }

    const patients = await Patient.find({}).sort({ createdAt: -1 });

    const patientsWithFlags = patients.map((patient) => {
      const flags = patient.computeFlags();
      return {
        id: patient._id.toString(),
        name: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        ward: patient.ward,
        bedNumber: patient.bedNumber,
        status: patient.status,
        flags: flags
      };
    });

    res.json({ 
      ok: true, 
      patients: patientsWithFlags, 
      count: patientsWithFlags.length 
    });
  } catch (err) {
    console.error("MDR Flags Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to get MDR flags" });
  }
});

// GET /api/patients/:id - Get single patient by ID
router.get("/:id", async (req, res) => {
  try {
    if (!Patient) {
      return res.status(500).json({ ok: false, error: "Patient model not available" });
    }

    const { id } = req.params;
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ ok: false, error: "Patient not found" });
    }

    const formatted = {
      id: patient._id.toString(),
      uid: patient._id.toString(),
      name: patient.fullName || "Unknown",
      fullName: patient.fullName,
      fatherHusbandName: patient.fatherHusbandName,
      gender: patient.gender,
      age: patient.age || "-",
      address: patient.address,
      mobileNumber: patient.mobileNumber,
      aadharNumber: patient.aadharNumber,
      ward: patient.ward,
      bedNumber: patient.bedNumber,
      room: patient.bedNumber || patient.ward || "-",
      rfidTag: patient.rfidTag,
      status: patient.status === 'active' ? (patient.mdrStatus === 'positive' ? 'red' : 'green') : 'yellow',
      mdrStatus: patient.mdrStatus === 'positive' ? "MDR+" : "Safe",
      hospital: patient.hospital,
      admissionDate: patient.admissionDate,
      lastContact: patient.updatedAt || patient.createdAt,
      profile: patient.fullName || "Unknown",
      riskLevel: patient.mdrStatus === 'positive' ? "high" : "low"
    };

    res.json({ ok: true, patient: formatted });
  } catch (err) {
    console.error("Patient API Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to fetch patient" });
  }
});

// GET /api/patients/:id/contacts - Get patient contacts for network graph
router.get("/:id/contacts", async (req, res) => {
  try {
    if (!Patient) {
      return res.status(500).json({ ok: false, error: "Patient model not available" });
    }

    const { id } = req.params;
    const sourcePatient = await Patient.findById(id);
    
    if (!sourcePatient) {
      return res.status(404).json({ ok: false, error: "Patient not found" });
    }

    // Get all patients in the same ward for contact tracing
    const wardPatients = await Patient.find({ 
      ward: sourcePatient.ward,
      _id: { $ne: id }
    }).limit(10);

    // Get all MDR positive patients (potential high-risk contacts)
    const mdrPatients = await Patient.find({
      mdrStatus: 'positive',
      _id: { $ne: id }
    }).limit(5);

    // Combine unique contacts
    const contactMap = new Map();
    
    // Add ward contacts (direct contacts)
    wardPatients.forEach(p => {
      if (!contactMap.has(p._id.toString())) {
        contactMap.set(p._id.toString(), {
          id: p._id.toString(),
          name: p.fullName,
          type: 'direct',
          riskLevel: p.mdrStatus === 'positive' ? 'high' : 'low',
          profile: p.gender === 'Male' ? 'male_patient' : 'female_patient',
          ward: p.ward,
          bedNumber: p.bedNumber,
          mdrStatus: p.mdrStatus
        });
      }
    });

    // Add MDR contacts (indirect/high-risk)
    mdrPatients.forEach(p => {
      if (!contactMap.has(p._id.toString())) {
        contactMap.set(p._id.toString(), {
          id: p._id.toString(),
          name: p.fullName,
          type: 'indirect',
          riskLevel: 'high',
          profile: p.gender === 'Male' ? 'male_patient' : 'female_patient',
          ward: p.ward,
          bedNumber: p.bedNumber,
          mdrStatus: p.mdrStatus
        });
      }
    });

    const nodes = Array.from(contactMap.values());
    
    // Create edges from source to all contacts
    const edges = nodes.map((node, idx) => ({
      from: id,
      to: node.id,
      type: node.type,
      duration: Math.floor(Math.random() * 120) + 10, // Random duration 10-130 mins
      weight: node.riskLevel === 'high' ? 3 : 1,
      room: sourcePatient.ward
    }));

    // Add some inter-patient connections based on same ward
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i < j && node.ward === otherNode.ward && Math.random() > 0.5) {
          edges.push({
            from: node.id,
            to: otherNode.id,
            type: 'indirect',
            duration: Math.floor(Math.random() * 60) + 5,
            weight: 1,
            room: node.ward
          });
        }
      });
    });

    const network = {
      source: id,
      sourceName: sourcePatient.fullName,
      sourceWard: sourcePatient.ward,
      sourceMdrStatus: sourcePatient.mdrStatus,
      nodes: [
        {
          id: id,
          name: sourcePatient.fullName,
          type: 'source',
          riskLevel: sourcePatient.mdrStatus === 'positive' ? 'critical' : 'medium',
          profile: sourcePatient.gender === 'Male' ? 'male_patient' : 'female_patient',
          ward: sourcePatient.ward,
          bedNumber: sourcePatient.bedNumber,
          mdrStatus: sourcePatient.mdrStatus
        },
        ...nodes
      ],
      edges: edges,
      stats: {
        totalContacts: nodes.length,
        directContacts: nodes.filter(n => n.type === 'direct').length,
        indirectContacts: nodes.filter(n => n.type === 'indirect').length,
        highRiskContacts: nodes.filter(n => n.riskLevel === 'high').length,
        mdrContacts: nodes.filter(n => n.mdrStatus === 'positive').length
      }
    };

    res.json({ ok: true, network });
  } catch (err) {
    console.error("Contact Network Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to generate contact network" });
  }
});

module.exports = router;
