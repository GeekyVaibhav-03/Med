// ============================================================================
// TEST SUITE - Lab Report Ingestion & MDR Detection
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test helper to login and get token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin1',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Test helper to make authenticated requests
function makeRequest(method, url, data = null) {
  return axios({
    method,
    url: `${BASE_URL}${url}`,
    data,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
}

// ==========================================================================
// TEST 1: Upload MDR-positive lab report
// ==========================================================================
async function testMDRPositiveReport() {
  console.log('\n🧪 TEST 1: MDR-positive report upload');
  console.log('='.repeat(60));

  const labReport = {
    patientId: 123,
    reportId: `LRP-${Date.now()}`,
    testName: "Culture & Sensitivity",
    organism: "ESBL",
    sampleType: "Urine",
    collectedAt: "2025-12-07T07:35:00Z",
    resultAt: "2025-12-07T12:00:00Z",
    reportFileUrl: "https://hospital.com/reports/test-esbl.pdf",
    antibioticSensitivity: [
      { antibiotic: "Amoxicillin", result: "Resistant" },
      { antibiotic: "Ciprofloxacin", result: "Resistant" },
      { antibiotic: "Meropenem", result: "Sensitive" }
    ],
    additionalNotes: "High bacterial count detected"
  };

  try {
    const response = await makeRequest('POST', '/lab-reports/upload', labReport);
    console.log('✅ Response:', response.data);
    
    if (response.data.data.mdrDetected) {
      console.log('✅ MDR detected correctly');
      console.log('✅ Flag created:', response.data.data.flagId);
      console.log('✅ Alert triggered:', response.data.data.alertSent);
    } else {
      console.log('❌ FAIL: MDR should have been detected');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// ==========================================================================
// TEST 2: Upload non-MDR organism
// ==========================================================================
async function testNonMDRReport() {
  console.log('\n🧪 TEST 2: Non-MDR organism upload');
  console.log('='.repeat(60));

  const labReport = {
    patientId: 124,
    reportId: `LRP-${Date.now()}`,
    testName: "Culture & Sensitivity",
    organism: "E. coli (normal)",
    sampleType: "Blood",
    collectedAt: "2025-12-07T08:00:00Z",
    resultAt: "2025-12-07T14:00:00Z",
    reportFileUrl: "https://hospital.com/reports/test-ecoli.pdf",
    antibioticSensitivity: [
      { antibiotic: "Amoxicillin", result: "Sensitive" },
      { antibiotic: "Ciprofloxacin", result: "Sensitive" }
    ]
  };

  try {
    const response = await makeRequest('POST', '/lab-reports/upload', labReport);
    console.log('✅ Response:', response.data);
    
    if (!response.data.data.mdrDetected) {
      console.log('✅ Non-MDR organism handled correctly');
      console.log('✅ No flag created (as expected)');
    } else {
      console.log('❌ FAIL: Non-MDR organism should not trigger flag');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// ==========================================================================
// TEST 3: Get patient MDR status
// ==========================================================================
async function testGetMDRStatus(patientId) {
  console.log('\n🧪 TEST 3: Get patient MDR status');
  console.log('='.repeat(60));

  try {
    const response = await makeRequest('GET', `/patients/${patientId}/mdr-status`);
    console.log('✅ MDR Status:', response.data);
    console.log(`   Active flags: ${response.data.data.activeFlags}`);
    
    if (response.data.data.flags) {
      response.data.data.flags.forEach(flag => {
        console.log(`   - ${flag.organism} (${flag.severity})`);
      });
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// ==========================================================================
// TEST 4: Clear MDR flag
// ==========================================================================
async function testClearFlag(flagId) {
  console.log('\n🧪 TEST 4: Clear MDR flag');
  console.log('='.repeat(60));

  try {
    const response = await makeRequest('POST', `/mdr-flags/${flagId}/clear`, {
      reason: "Patient completed treatment course",
      notes: "Follow-up cultures negative for 3 consecutive tests"
    });
    
    console.log('✅ Flag cleared:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// ==========================================================================
// TEST 5: Get active MDR flags
// ==========================================================================
async function testGetActiveFlags() {
  console.log('\n🧪 TEST 5: Get all active MDR flags');
  console.log('='.repeat(60));

  try {
    const response = await makeRequest('GET', '/mdr-flags/active');
    console.log('✅ Active flags:', response.data.count);
    
    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach(flag => {
        console.log(`   - Patient: ${flag.patient_name} | Organism: ${flag.organism} | Severity: ${flag.severity}`);
      });
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// ==========================================================================
// TEST 6: Critical severity organism (MDR-TB)
// ==========================================================================
async function testCriticalMDR() {
  console.log('\n🧪 TEST 6: Critical severity organism (MDR-TB)');
  console.log('='.repeat(60));

  const labReport = {
    patientId: 125,
    reportId: `LRP-${Date.now()}`,
    testName: "TB Culture",
    organism: "MDR-TB",
    sampleType: "Sputum",
    collectedAt: "2025-12-07T06:00:00Z",
    resultAt: "2025-12-07T18:00:00Z",
    reportFileUrl: "https://hospital.com/reports/test-tb.pdf",
    additionalNotes: "Resistant to isoniazid and rifampin"
  };

  try {
    const response = await makeRequest('POST', '/lab-reports/upload', labReport);
    console.log('✅ Response:', response.data);
    
    if (response.data.data.severity === 'critical') {
      console.log('✅ Critical severity detected correctly');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// ==========================================================================
// TEST 7: Duplicate report ID
// ==========================================================================
async function testDuplicateReport(existingReportId) {
  console.log('\n🧪 TEST 7: Duplicate report ID validation');
  console.log('='.repeat(60));

  const labReport = {
    patientId: 123,
    reportId: existingReportId,
    testName: "Culture & Sensitivity",
    organism: "MRSA",
    sampleType: "Wound",
    collectedAt: "2025-12-07T10:00:00Z",
    resultAt: "2025-12-07T15:00:00Z"
  };

  try {
    const response = await makeRequest('POST', '/lab-reports/upload', labReport);
    console.log('❌ FAIL: Duplicate report should have been rejected');
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('✅ Duplicate report correctly rejected:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

// ==========================================================================
// RUN ALL TESTS
// ==========================================================================
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 STARTING LAB REPORT INGESTION TEST SUITE');
  console.log('='.repeat(60));

  try {
    // Login first
    await login();

    // Test 1: MDR-positive report
    const mdrResult = await testMDRPositiveReport();
    await sleep(1000);

    // Test 2: Non-MDR report
    await testNonMDRReport();
    await sleep(1000);

    // Test 3: Get MDR status
    await testGetMDRStatus(123);
    await sleep(1000);

    // Test 4: Clear flag (if created)
    if (mdrResult.flagId) {
      await testClearFlag(mdrResult.flagId);
      await sleep(1000);
    }

    // Test 5: Get active flags
    await testGetActiveFlags();
    await sleep(1000);

    // Test 6: Critical severity
    await testCriticalMDR();
    await sleep(1000);

    // Test 7: Duplicate report
    if (mdrResult.reportId) {
      await testDuplicateReport(mdrResult.reportId);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testMDRPositiveReport,
  testNonMDRReport,
  testGetMDRStatus,
  testClearFlag,
  testGetActiveFlags,
  testCriticalMDR,
  testDuplicateReport
};
