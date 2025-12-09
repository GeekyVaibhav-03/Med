const KNN = require('ml-knn');
const { Patient } = require('../models/mongodb');

class MDRPredictor {
  constructor() {
    this.model = null;
    this.isTrained = false;
    this.trainingData = [];
    this.labels = [];
  }

  // Prepare training data from existing patients
  async prepareTrainingData() {
    try {
      const patients = await Patient.find({
        'report.mdrStatus': { $exists: true },
        'report.mdrPositive': { $exists: true }
      });

      this.trainingData = [];
      this.labels = [];

      patients.forEach(patient => {
        const features = this.extractFeatures(patient);
        let label = 0; // Default: MDR Negative

        if (patient.report.mdrPositive && patient.report.mdrStatus === 'active') {
          label = 1; // MDR Positive
        } else if (patient.report.hasSymptoms || patient.report.hasFracture) {
          label = 2; // At Risk (can have MDR)
        }

        if (features.every(f => f !== null && f !== undefined)) {
          this.trainingData.push(features);
          this.labels.push(label);
        }
      });

      console.log(`Prepared ${this.trainingData.length} training samples`);
      return { samples: this.trainingData.length, labels: this.labels.length };
    } catch (error) {
      console.error('Error preparing training data:', error);
      throw error;
    }
  }

  // Extract features from patient data
  extractFeatures(patient) {
    const report = patient.report || {};

    // Convert categorical data to numerical
    const genderMap = { 'Male': 0, 'Female': 1, 'Other': 2 };
    const purulenceMap = { 'clear': 0, 'normal': 0, 'purulent': 1, 'foul': 1, 'discolored': 1 };
    const antibioticMap = { 'none': 0, 'short_term': 0, 'long_term': 1, 'multiple': 1 };

    return [
      patient.age || 0,
      genderMap[patient.gender] || 0,
      // Clinical parameters based on MDR infection criteria
      report.fever || 0, // Temperature in Celsius
      report.wbcCount || 0, // White Blood Cell count (/uL)
      report.crp || 0, // C-Reactive Protein (mg/L)
      report.pct || 0, // Procalcitonin (ng/mL)
      report.symptomDuration || 0, // Duration of symptoms (hours)
      purulenceMap[report.purulence] || 0, // Sputum/Urine/Wound purulence (0=clear, 1=abnormal)
      report.systolicBP || 0, // Systolic blood pressure (mmHg)
      antibioticMap[report.antibioticUse] || 0 // Prior antibiotic use (0=normal, 1=abnormal)
    ];
  }

  // Train the KNN model
  async train(k = 3) {
    try {
      if (this.trainingData.length === 0) {
        await this.prepareTrainingData();
      }

      if (this.trainingData.length < k) {
        throw new Error('Not enough training data for KNN with k=' + k);
      }

      this.model = new KNN(this.trainingData, this.labels, { k });
      this.isTrained = true;

      console.log(`KNN model trained with k=${k}, ${this.trainingData.length} samples`);
      return { trained: true, samples: this.trainingData.length, k };
    } catch (error) {
      console.error('Error training KNN model:', error);
      throw error;
    }
  }

  // Predict MDR status for new patient data
  predict(patientData) {
    if (!this.isTrained) {
      throw new Error('Model not trained. Call train() first.');
    }

    const features = this.extractFeaturesFromInput(patientData);
    const prediction = this.model.predict([features])[0];

    const categories = {
      0: { status: 'MDR Negative', color: 'green', risk: 'low' },
      1: { status: 'MDR Positive', color: 'red', risk: 'high' },
      2: { status: 'At Risk (Can have MDR)', color: 'yellow', risk: 'medium' }
    };

    return {
      prediction: prediction,
      category: categories[prediction],
      confidence: this.calculateConfidence(features),
      features: features
    };
  }

  // Extract features from input data (for prediction)
  extractFeaturesFromInput(input) {
    const genderMap = { 'Male': 0, 'Female': 1, 'Other': 2 };
    const purulenceMap = { 'clear': 0, 'normal': 0, 'purulent': 1, 'foul': 1, 'discolored': 1 };
    const antibioticMap = { 'none': 0, 'short_term': 0, 'long_term': 1, 'multiple': 1 };

    return [
      input.age || 0,
      genderMap[input.gender] || 0,
      // Clinical parameters based on MDR infection criteria
      input.fever || 0, // Temperature in Celsius
      input.wbcCount || 0, // White Blood Cell count (/uL)
      input.crp || 0, // C-Reactive Protein (mg/L)
      input.pct || 0, // Procalcitonin (ng/mL)
      input.symptomDuration || 0, // Duration of symptoms (hours)
      purulenceMap[input.purulence] || 0, // Sputum/Urine/Wound purulence (0=clear, 1=abnormal)
      input.systolicBP || 0, // Systolic blood pressure (mmHg)
      antibioticMap[input.antibioticUse] || 0 // Prior antibiotic use (0=normal, 1=abnormal)
    ];
  }

  // Calculate confidence based on distance to nearest neighbors
  calculateConfidence(features) {
    if (!this.model) return 0;

    // Get distances to k nearest neighbors
    const distances = this.model.getDistances([features])[0];
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // Convert distance to confidence (closer = higher confidence)
    const confidence = Math.max(0, Math.min(100, 100 - (avgDistance * 10)));
    return Math.round(confidence);
  }

  // Get model statistics
  getStats() {
    const labelCounts = this.labels.reduce((acc, label) => {
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return {
      trained: this.isTrained,
      trainingSamples: this.trainingData.length,
      labelDistribution: {
        'MDR Negative': labelCounts[0] || 0,
        'MDR Positive': labelCounts[1] || 0,
        'At Risk': labelCounts[2] || 0
      },
      features: [
        'Age',
        'Gender',
        'Has Symptoms',
        'Symptom Severity',
        'Has Fracture',
        'Fracture Risk',
        'Current MDR Status',
        'Length of Stay'
      ]
    };
  }

  // Retrain model with new data
  async retrain() {
    this.isTrained = false;
    await this.prepareTrainingData();
    return await this.train();
  }
}

// Singleton instance
const mdrPredictor = new MDRPredictor();

module.exports = mdrPredictor;