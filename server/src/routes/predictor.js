const express = require('express');
const router = express.Router();
const mdrPredictor = require('../services/mdrPredictor');
const { requireAuth, requireRole } = require('../middleware/auth');

// Initialize and train the model on startup
let modelInitialized = false;

const initializeModel = async () => {
  if (!modelInitialized) {
    try {
      await mdrPredictor.prepareTrainingData();
      await mdrPredictor.train(5); // Use k=5 for better accuracy
      modelInitialized = true;
      console.log('✅ MDR Predictor model initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MDR Predictor:', error.message);
    }
  }
};

// Initialize model
initializeModel();

// @route   POST /api/predictor/predict
// @desc    Predict MDR status for a patient
// @access  Private (Doctor/Admin)
router.post('/predict', requireAuth, requireRole('admin', 'doctor'), async (req, res) => {
  try {
    const patientData = req.body;

    // Validate required fields
    const requiredFields = ['age', 'gender'];
    const missingFields = requiredFields.filter(field => !patientData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Ensure model is trained
    if (!mdrPredictor.isTrained) {
      await initializeModel();
    }

    // Make prediction
    const result = mdrPredictor.predict(patientData);

    res.json({
      success: true,
      prediction: result,
      timestamp: new Date(),
      modelVersion: 'KNN-v1.0'
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed',
      details: error.message
    });
  }
});

// @route   GET /api/predictor/stats
// @desc    Get model statistics and training info
// @access  Private (Admin)
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const stats = mdrPredictor.getStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// @route   POST /api/predictor/retrain
// @desc    Retrain the model with latest data
// @access  Private (Admin)
router.post('/retrain', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await mdrPredictor.retrain();
    res.json({
      success: true,
      message: 'Model retrained successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Retrain error:', error);
    res.status(500).json({
      success: false,
      error: 'Retraining failed',
      details: error.message
    });
  }
});

// @route   GET /api/predictor/features
// @desc    Get list of features used by the model
// @access  Private (Doctor/Admin)
router.get('/features', requireAuth, requireRole('admin', 'doctor'), (req, res) => {
  res.json({
    success: true,
    features: mdrPredictor.getStats().features,
    categories: [
      { id: 0, name: 'MDR Negative', color: 'green', description: 'Patient shows no MDR indicators' },
      { id: 1, name: 'MDR Positive', color: 'red', description: 'Patient has active MDR infection' },
      { id: 2, name: 'At Risk', color: 'yellow', description: 'Patient shows risk factors for MDR' }
    ]
  });
});

module.exports = router;