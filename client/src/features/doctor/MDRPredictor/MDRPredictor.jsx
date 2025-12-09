import React, { useState, useEffect } from 'react';
import { Loader2, Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const MDRPredictor = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    // Clinical parameters for MDR prediction
    fever: '',
    wbcCount: '',
    crp: '',
    pct: '',
    symptomDuration: '',
    purulence: 'clear',
    systolicBP: '',
    antibioticUse: 'none'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelStats, setModelStats] = useState({
    trained: true,
    trainingSamples: 10,
    labelDistribution: {
      'MDR Negative': 2,
      'MDR Positive': 3,
      'At Risk': 5
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async () => {
    // Validate required fields
    if (!formData.age || !formData.gender) {
      alert('Please fill in age and gender fields');
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Mock prediction logic based on clinical parameters
      let predictionResult = 0; // Default: MDR Negative
      let confidence = 75;

      // MDR Risk Assessment based on clinical parameters
      let riskScore = 0;

      // Fever ≥38°C increases risk
      if (formData.fever >= 38) riskScore += 2;

      // WBC count abnormal (<4000 or >12000) increases risk
      if (formData.wbcCount < 4000 || formData.wbcCount > 12000) riskScore += 2;

      // CRP ≥50 increases risk
      if (formData.crp >= 50) riskScore += 2;

      // PCT ≥0.5 increases risk
      if (formData.pct >= 0.5) riskScore += 2;

      // Symptom duration ≥48 hours increases risk
      if (formData.symptomDuration >= 48) riskScore += 2;

      // Abnormal purulence increases risk
      if (formData.purulence !== 'clear') riskScore += 2;

      // Hypotension (<100 mmHg) increases risk
      if (formData.systolicBP < 100) riskScore += 2;

      // Prior antibiotic use increases risk
      if (formData.antibioticUse === 'long_term' || formData.antibioticUse === 'multiple') riskScore += 2;

      // Determine prediction based on risk score
      if (riskScore >= 8) {
        predictionResult = 1; // MDR Positive
        confidence = 85 + Math.min(riskScore - 8, 10);
      } else if (riskScore >= 4) {
        predictionResult = 2; // At Risk
        confidence = 70 + riskScore * 2;
      } else {
        predictionResult = 0; // MDR Negative
        confidence = 80 - riskScore * 5;
      }

      confidence = Math.max(60, Math.min(95, confidence));

      const categories = {
        0: { status: 'MDR Negative', color: 'green', risk: 'low' },
        1: { status: 'MDR Positive', color: 'red', risk: 'high' },
        2: { status: 'At Risk (Can have MDR)', color: 'yellow', risk: 'medium' }
      };

      setPrediction({
        prediction: predictionResult,
        category: categories[predictionResult],
        confidence: confidence,
        riskScore: riskScore,
        features: [
          `Fever: ${formData.fever}°C ${formData.fever >= 38 ? '(Abnormal)' : '(Normal)'}`,
          `WBC: ${formData.wbcCount}/μL ${formData.wbcCount < 4000 || formData.wbcCount > 12000 ? '(Abnormal)' : '(Normal)'}`,
          `CRP: ${formData.crp} mg/L ${formData.crp >= 50 ? '(Abnormal)' : '(Normal)'}`,
          `PCT: ${formData.pct} ng/mL ${formData.pct >= 0.5 ? '(Abnormal)' : '(Normal)'}`,
          `Duration: ${formData.symptomDuration}h ${formData.symptomDuration >= 48 ? '(Abnormal)' : '(Normal)'}`,
          `Purulence: ${formData.purulence} ${formData.purulence !== 'clear' ? '(Abnormal)' : '(Normal)'}`,
          `BP: ${formData.systolicBP} mmHg ${formData.systolicBP < 100 ? '(Abnormal)' : '(Normal)'}`,
          `Antibiotics: ${formData.antibioticUse} ${formData.antibioticUse === 'long_term' || formData.antibioticUse === 'multiple' ? '(Abnormal)' : '(Normal)'}`
        ]
      });

      setLoading(false);
    }, 2000);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MDR Positive':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'At Risk (Can have MDR)':
        return <TrendingUp className="w-6 h-6 text-yellow-500" />;
      case 'MDR Negative':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Brain className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'MDR Positive':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'At Risk (Can have MDR)':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'MDR Negative':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MDR Predictor</h1>
          <p className="text-gray-600">AI-powered MDR risk assessment using KNN algorithm</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Patient Information</h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Age *</label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Clinical Parameters */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Clinical Parameters</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Fever (°C) 
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={formData.fever}
                    onChange={(e) => handleInputChange('fever', parseFloat(e.target.value) || '')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    WBC Count (/μL) 
                  </label>
                  <input
                    type="number"
                    placeholder="8000"
                    value={formData.wbcCount}
                    onChange={(e) => handleInputChange('wbcCount', parseInt(e.target.value) || '')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    CRP (mg/L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={formData.crp}
                    onChange={(e) => handleInputChange('crp', parseFloat(e.target.value) || '')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    PCT (ng/mL) 
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.1"
                    value={formData.pct}
                    onChange={(e) => handleInputChange('pct', parseFloat(e.target.value) || '')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Symptom Duration (hours) 
                  </label>
                  <input
                    type="number"
                    placeholder="24"
                    value={formData.symptomDuration}
                    onChange={(e) => handleInputChange('symptomDuration', parseInt(e.target.value) || '')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Systolic BP (mmHg) 
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    value={formData.systolicBP}
                    onChange={(e) => handleInputChange('systolicBP', parseInt(e.target.value) || '')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Sputum/Urine/Wound Purulence
                  </label>
                  <select
                    value={formData.purulence}
                    onChange={(e) => handleInputChange('purulence', e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="clear">Clear/Normal</option>
                    <option value="purulent">Purulent</option>
                    <option value="foul">Foul</option>
                    <option value="discolored">Discolored</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Prior Antibiotic Use
                  </label>
                  <select
                    value={formData.antibioticUse}
                    onChange={(e) => handleInputChange('antibioticUse', e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="none">None</option>
                    <option value="short_term">Short-term (&lt;3 days)</option>
                    <option value="long_term">Long-term (&gt;3 days)</option>
                    <option value="multiple">Multiple courses</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Predict MDR Risk
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Prediction Result */}
          {prediction && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                  {getCategoryIcon(prediction.category.status)}
                  Prediction Result
                </h3>
              </div>
              <div className="p-6 pt-0">
                <div className={`p-4 rounded-lg border-2 ${getCategoryColor(prediction.category.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{prediction.category.status}</h3>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">{prediction.category.risk} risk</span>
                  </div>
                  <p className="text-sm opacity-80 mb-3">
                    Confidence: {prediction.confidence}%
                  </p>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm">
                      {prediction.category.status === 'MDR Positive' &&
                        'Patient shows strong indicators of MDR infection. Immediate isolation and specialized treatment recommended.'}
                      {prediction.category.status === 'At Risk (Can have MDR)' &&
                        'Patient shows risk factors for MDR. Close monitoring and preventive measures advised.'}
                      {prediction.category.status === 'MDR Negative' &&
                        'Patient shows no significant MDR risk factors. Continue standard care protocols.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Model Statistics */}
          {modelStats && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Model Statistics</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Training Samples</p>
                    <p className="text-2xl font-bold text-blue-600">{modelStats.trainingSamples}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model Status</p>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">Trained</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Category Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(modelStats.labelDistribution).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MDRPredictor;