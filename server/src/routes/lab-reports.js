// ============================================================================
// LAB REPORT UPLOAD ROUTE - Main Entry Point
// ============================================================================
// This route handles lab report uploads and triggers the MDR detection workflow

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Try to use full service, fallback to mock if MySQL not available
let labReportService;
try {
  labReportService = require('../services/labReportService');
} catch (err) {
  console.log('⚠️  Using lab report mock service (MySQL not available)');
  labReportService = require('../services/labReportService.mock');
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

const validateLabReport = [
  body('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isInt({ min: 1 }).withMessage('Patient ID must be a positive integer'),
  
  body('reportId')
    .notEmpty().withMessage('Report ID is required')
    .matches(/^[A-Z0-9-]+$/).withMessage('Report ID must contain only uppercase letters, numbers, and hyphens'),
  
  body('testName')
    .notEmpty().withMessage('Test name is required')
    .isLength({ min: 3, max: 255 }).withMessage('Test name must be 3-255 characters'),
  
  body('organism')
    .optional()
    .isLength({ max: 255 }).withMessage('Organism name too long'),
  
  body('sampleType')
    .notEmpty().withMessage('Sample type is required')
    .isIn(['Urine', 'Blood', 'Sputum', 'Wound', 'Stool', 'CSF', 'Other'])
    .withMessage('Invalid sample type'),
  
  body('collectedAt')
    .notEmpty().withMessage('Collection timestamp is required')
    .isISO8601().withMessage('Invalid date format for collectedAt'),
  
  body('resultAt')
    .notEmpty().withMessage('Result timestamp is required')
    .isISO8601().withMessage('Invalid date format for resultAt'),
  
  body('reportFileUrl')
    .optional()
    .isURL().withMessage('Invalid report file URL'),
  
  body('antibioticSensitivity')
    .optional()
    .isArray().withMessage('Antibiotic sensitivity must be an array'),
  
  body('additionalNotes')
    .optional()
    .isLength({ max: 2000 }).withMessage('Additional notes too long')
];

// ============================================================================
// POST /api/lab-reports/upload
// ============================================================================
// Uploads a lab report and triggers automated MDR detection workflow
//
// REQUEST BODY:
// {
//   "patientId": 123,
//   "reportId": "LRP-8891",
//   "testName": "Culture & Sensitivity",
//   "organism": "ESBL",
//   "sampleType": "Urine",
//   "collectedAt": "2025-12-07T07:35:00Z",
//   "resultAt": "2025-12-07T12:00:00Z",
//   "reportFileUrl": "https://hospital.com/reports/abc.pdf",
//   "antibioticSensitivity": [
//     { "antibiotic": "Amoxicillin", "result": "Resistant" },
//     { "antibiotic": "Ciprofloxacin", "result": "Sensitive" }
//   ],
//   "additionalNotes": "High bacterial count"
// }
//
// RESPONSE:
// {
//   "success": true,
//   "message": "Lab report uploaded successfully",
//   "data": {
//     "reportId": "LRP-8891",
//     "mdrDetected": true,
//     "organism": "ESBL",
//     "flagCreated": true,
//     "flagId": 42,
//     "alertSent": true
//   }
// }

router.post('/upload', requireAuth, validateLabReport, async (req, res) => {
  try {
    console.log('📄 Lab Report Upload Request:', {
      reportId: req.body.reportId,
      patientId: req.body.patientId,
      organism: req.body.organism,
      user: req.user?.username
    });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    // Extract and sanitize data
    const labReportData = {
      patientId: parseInt(req.body.patientId),
      reportId: req.body.reportId.trim().toUpperCase(),
      testName: req.body.testName.trim(),
      organism: req.body.organism ? req.body.organism.trim() : null,
      sampleType: req.body.sampleType,
      collectedAt: new Date(req.body.collectedAt),
      resultAt: new Date(req.body.resultAt),
      reportFileUrl: req.body.reportFileUrl || null,
      antibioticSensitivity: req.body.antibioticSensitivity || null,
      additionalNotes: req.body.additionalNotes || null,
      uploadedBy: req.user?.id || null
    };

    // Process the lab report through the service layer
    const result = await labReportService.processLabReport(labReportData);

    // Log result
    console.log('✅ Lab Report Processing Complete:', {
      reportId: result.reportId,
      mdrDetected: result.mdrDetected,
      flagCreated: result.flagCreated,
      alertSent: result.alertSent
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: result.mdrDetected 
        ? 'Lab report uploaded - MDR organism detected and patient flagged'
        : 'Lab report uploaded successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Lab Report Upload Error:', error);

    // Handle specific error types
    if (error.message.includes('Patient not found')) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
        error: error.message
      });
    }

    if (error.message.includes('duplicate') || error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Lab report with this ID already exists',
        error: 'Duplicate report ID'
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      message: 'Failed to process lab report',
      error: error.message
    });
  }
});

// ============================================================================
// GET /api/lab-reports/:reportId
// ============================================================================
// Get details of a specific lab report

router.get('/:reportId', requireAuth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await labReportService.getReportById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Lab report not found'
      });
    }

    return res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('❌ Get Lab Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve lab report',
      error: error.message
    });
  }
});

// ============================================================================
// GET /api/lab-reports/patient/:patientId
// ============================================================================
// Get all lab reports for a specific patient

router.get('/patient/:patientId', requireAuth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const reports = await labReportService.getReportsByPatient(
      parseInt(patientId),
      parseInt(limit),
      parseInt(offset)
    );

    return res.json({
      success: true,
      data: reports,
      count: reports.length
    });

  } catch (error) {
    console.error('❌ Get Patient Reports Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient reports',
      error: error.message
    });
  }
});

// ============================================================================
// GET /api/lab-reports/unprocessed
// ============================================================================
// Get all unprocessed lab reports (admin only)

router.get('/unprocessed', requireAuth, async (req, res) => {
  try {
    // Check admin permission
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - admin only'
      });
    }

    const reports = await labReportService.getUnprocessedReports();

    return res.json({
      success: true,
      data: reports,
      count: reports.length
    });

  } catch (error) {
    console.error('❌ Get Unprocessed Reports Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve unprocessed reports',
      error: error.message
    });
  }
});

// ============================================================================
// POST /api/lab-reports/:reportId/reprocess
// ============================================================================
// Manually reprocess a lab report for MDR detection

router.post('/:reportId/reprocess', requireAuth, async (req, res) => {
  try {
    const { reportId } = req.params;

    // Get the report
    const report = await labReportService.getReportById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Lab report not found'
      });
    }

    // Reprocess MDR detection
    const result = await labReportService.reprocessMDRDetection(reportId);

    return res.json({
      success: true,
      message: 'Lab report reprocessed successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Reprocess Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reprocess lab report',
      error: error.message
    });
  }
});

module.exports = router;
