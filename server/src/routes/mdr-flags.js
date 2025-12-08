// ============================================================================
// MDR FLAGS ROUTE
// ============================================================================
// Endpoints for managing MDR flags and patient status

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Try to use full service, fallback to mock if MySQL not available
let labReportService;
try {
  labReportService = require('../services/labReportService');
} catch (err) {
  labReportService = require('../services/labReportService.mock');
}

// ==========================================================================
// GET /api/patients/:id/mdr-status
// ==========================================================================
// Get active MDR flags for a patient

router.get('/:id/mdr-status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const flags = await labReportService.getPatientMDRStatus(id);

    return res.json({
      success: true,
      data: {
        patientId: parseInt(id),
        activeFlags: flags.length,
        flags: flags
      }
    });

  } catch (error) {
    console.error('❌ Get MDR status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve MDR status',
      error: error.message
    });
  }
});

// ==========================================================================
// POST /api/mdr-flags/:flagId/clear
// ==========================================================================
// Clear an MDR flag (mark patient as no longer MDR-positive)

router.post('/:flagId/clear', requireAuth, async (req, res) => {
  try {
    const { flagId } = req.params;
    const { clearedBy, clearedReason } = req.body;

    if (!clearedReason) {
      return res.status(400).json({
        success: false,
        message: 'Clearance reason is required'
      });
    }

    await labReportService.clearMDRFlag(parseInt(flagId), clearedBy || req.user?.id, clearedReason);

    console.log('✅ MDR flag cleared:', flagId);

    return res.json({
      success: true,
      message: 'MDR flag cleared successfully',
      data: { flagId, clearedAt: new Date() }
    });

  } catch (error) {
    console.error('❌ Clear flag error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear MDR flag',
      error: error.message
    });
  }
});

// ==========================================================================
// GET /api/mdr-flags/active
// ==========================================================================
// Get all active MDR flags (admin/infection control)

router.get('/active', requireAuth, async (req, res) => {
  try {
    const flags = await labReportService.getActiveMDRFlags();

    return res.json({
      success: true,
      flags: flags,
      count: flags.length
    });

  } catch (error) {
    console.error('❌ Get active flags error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve active flags',
      error: error.message
    });
  }
});

// ==========================================================================
// PATCH /api/mdr-flags/:flagId/isolation
// ==========================================================================
// Update isolation status

router.patch('/:flagId/isolation', requireAuth, async (req, res) => {
  try {
    const { flagId } = req.params;
    const { isolationStatus, roomNumber } = req.body;

    if (!['isolated', 'not_isolated', 'pending'].includes(isolationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid isolation status'
      });
    }

    await labReportService.updateIsolationStatus(parseInt(flagId), isolationStatus, roomNumber);

    return res.json({
      success: true,
      message: 'Isolation status updated'
    });

  } catch (error) {
    console.error('❌ Update isolation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update isolation status',
      error: error.message
    });
  }
});

module.exports = router;
