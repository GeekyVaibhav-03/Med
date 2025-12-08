// src/routes/labreports.js
/**
 * Lab Report Ingestion Workflow
 * 1. Hospital uploads lab report (CSV/JSON)
 * 2. System saves to database
 * 3. Checks if organism is MDR
 * 4. Red-flags patient if MDR+
 * 5. Sends real-time alerts
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { LabReport, MdrCase, User, Notification } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');
const { detectMDR } = require('../services/mdrDetectionService');
const { sendNotifications } = require('../services/notificationService');

// ✅ Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ✅ POST /api/labreports/upload
// Hospital uploads lab report (CSV/JSON)
router.post('/upload', requireAuth, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const {
      patient_uid,
      patient_name,
      specimen_type,
      organism,
      antibiotic_profile, // e.g., { "Ampicillin": "R", "Ciprofloxacin": "S", ... }
      doctor_name,
      hospital
    } = req.body;

    // ✅ Validate required fields
    if (!patient_uid || !organism) {
      return res.status(400).json({
        ok: false,
        error: 'patient_uid and organism are required'
      });
    }

    // ✅ 1. Save lab report to database
    const labReport = await LabReport.create({
      patient_uid,
      patient_name: patient_name || 'Unknown',
      specimen_type: specimen_type || 'Unknown',
      organism,
      antibiotic_profile: antibiotic_profile || {},
      doctor_name: doctor_name || req.user.username,
      hospital: hospital || req.user.hospital || 'General Hospital',
      status: 'pending'
    });

    // ✅ 2. Check if organism is MDR
    const isMDR = await detectMDR(organism, antibiotic_profile);

    // ✅ 3. If MDR, create MdrCase and red-flag patient
    let mdrCase = null;
    if (isMDR) {
      mdrCase = await MdrCase.create({
        uid: patient_uid,
        detected_at: new Date(),
        organism
      });

      // ✅ 4. Update lab report status to 'flagged'
      await labReport.update({ is_mdr: true, status: 'flagged' });

      // ✅ 5. Send real-time alerts
      await sendNotifications({
        lab_report_id: labReport.id,
        mdr_case_id: mdrCase.id,
        patient_uid,
        patient_name,
        organism,
        hospital: labReport.hospital,
        doctor_name: labReport.doctor_name
      });
    } else {
      await labReport.update({ is_mdr: false, status: 'processed' });
    }

    return res.json({
      ok: true,
      labReport: {
        id: labReport.id,
        patient_uid: labReport.patient_uid,
        patient_name: labReport.patient_name,
        organism: labReport.organism,
        is_mdr: labReport.is_mdr,
        status: labReport.status
      },
      mdrCase: mdrCase ? { id: mdrCase.id, organism: mdrCase.organism } : null,
      message: isMDR ? `MDR ALERT: ${organism} detected! Alerts sent.` : 'Report processed successfully.'
    });
  } catch (err) {
    console.error('labreports.upload error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// ✅ GET /api/labreports/:patient_uid
// Get all lab reports for a patient
router.get('/:patient_uid', requireAuth, async (req, res) => {
  try {
    const { patient_uid } = req.params;

    const reports = await LabReport.findAll({
      where: { patient_uid },
      order: [['created_at', 'DESC']]
    });

    return res.json({
      ok: true,
      reports,
      count: reports.length
    });
  } catch (err) {
    console.error('labreports.get error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// ✅ GET /api/labreports/mdr/flagged
// Get all flagged (MDR+) lab reports
router.get('/mdr/flagged', requireAuth, requireRole('doctor', 'admin', 'infection_control'), async (req, res) => {
  try {
    const reports = await LabReport.findAll({
      where: { is_mdr: true, status: 'flagged' },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return res.json({
      ok: true,
      reports,
      count: reports.length
    });
  } catch (err) {
    console.error('labreports.flagged error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// ✅ GET /api/labreports/latest
// Get latest lab reports across all patients
router.get('/latest/all', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);

    const reports = await LabReport.findAll({
      order: [['created_at', 'DESC']],
      limit
    });

    return res.json({
      ok: true,
      reports,
      count: reports.length
    });
  } catch (err) {
    console.error('labreports.latest error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// ✅ POST /api/labreports/upload-file
// Upload JSON/CSV file with multiple lab reports
router.post('/upload-file', requireAuth, requireRole('doctor', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: 'No file uploaded'
      });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const fileName = req.file.originalname;
    const isJson = fileName.endsWith('.json');
    const isCsv = fileName.endsWith('.csv');

    let reports = [];

    // ✅ Parse JSON file
    if (isJson) {
      try {
        const jsonData = JSON.parse(fileContent);
        reports = Array.isArray(jsonData) ? jsonData : [jsonData];
      } catch (parseErr) {
        return res.status(400).json({
          ok: false,
          error: 'Invalid JSON format: ' + parseErr.message
        });
      }
    }
    // ✅ Parse CSV file
    else if (isCsv) {
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return res.status(400).json({
          ok: false,
          error: 'CSV must have header row and at least one data row'
        });
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        reports.push(row);
      }
    } else {
      return res.status(400).json({
        ok: false,
        error: 'File must be JSON or CSV'
      });
    }

    if (reports.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'No records found in file'
      });
    }

    // ✅ Process each report
    const results = {
      total: reports.length,
      processed: 0,
      mdr_count: 0,
      errors: [],
      created: []
    };

    const hospital = req.body.hospital || req.user.hospital || 'General Hospital';
    const doctor_name = req.body.doctor_name || req.user.username;

    for (const report of reports) {
      try {
        const {
          patient_uid = report.patient_uid || report['Patient UID'] || report['patient_id'] || '',
          patient_name = report.patient_name || report['Patient Name'] || '',
          specimen_type = report.specimen_type || report['Specimen Type'] || '',
          organism = report.organism || report['Organism'] || '',
          antibiotic_profile = report.antibiotic_profile || {}
        } = report;

        // ✅ Validate required fields
        if (!patient_uid || !organism) {
          results.errors.push({
            row: report,
            error: 'Missing patient_uid or organism'
          });
          continue;
        }

        // ✅ Check if report already exists
        const existing = await LabReport.findOne({
          where: { patient_uid }
        });

        if (existing) {
          results.errors.push({
            patient_uid,
            error: 'Report already exists'
          });
          continue;
        }

        // ✅ Save lab report
        const labReport = await LabReport.create({
          patient_uid,
          patient_name,
          specimen_type,
          organism,
          antibiotic_profile: typeof antibiotic_profile === 'string' ? JSON.parse(antibiotic_profile) : antibiotic_profile || {},
          doctor_name,
          hospital,
          status: 'pending'
        });

        // ✅ Detect MDR
        const isMDR = await detectMDR(organism, antibiotic_profile);

        if (isMDR) {
          // ✅ Create MdrCase
          const mdrCase = await MdrCase.create({
            uid: patient_uid,
            detected_at: new Date(),
            organism
          });

          // ✅ Update report status
          await labReport.update({ is_mdr: true, status: 'flagged' });

          // ✅ Send notifications
          await sendNotifications({
            lab_report_id: labReport.id,
            mdr_case_id: mdrCase.id,
            patient_uid,
            patient_name,
            organism,
            hospital,
            doctor_name
          });

          results.mdr_count++;
        } else {
          await labReport.update({ is_mdr: false, status: 'processed' });
        }

        results.created.push({
          id: labReport.id,
          patient_uid,
          organism,
          is_mdr: isMDR
        });

        results.processed++;
      } catch (rowErr) {
        results.errors.push({
          row: report,
          error: rowErr.message
        });
      }
    }

    return res.json({
      ok: true,
      file: fileName,
      results
    });
  } catch (err) {
    console.error('labreports.upload-file error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

module.exports = router;
