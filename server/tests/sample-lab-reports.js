// ============================================================================
// SAMPLE LAB REPORT DATA
// ============================================================================
// Use these payloads to test the lab report ingestion system

module.exports = {
  // TEST 1: ESBL (High Severity MDR)
  eslbReport: {
    patientId: 123,
    reportId: "LRP-2025-001",
    testName: "Culture & Sensitivity",
    organism: "ESBL",
    sampleType: "Urine",
    collectedAt: "2025-12-07T07:35:00Z",
    resultAt: "2025-12-07T12:00:00Z",
    reportFileUrl: "https://hospital.com/reports/esbl-001.pdf",
    antibioticSensitivity: [
      { antibiotic: "Amoxicillin", result: "Resistant" },
      { antibiotic: "Ceftriaxone", result: "Resistant" },
      { antibiotic: "Ciprofloxacin", result: "Resistant" },
      { antibiotic: "Meropenem", result: "Sensitive" },
      { antibiotic: "Amikacin", result: "Sensitive" }
    ],
    additionalNotes: "High bacterial count: 10^5 CFU/mL"
  },

  // TEST 2: MRSA (High Severity MDR)
  mrsaReport: {
    patientId: 124,
    reportId: "LRP-2025-002",
    testName: "Culture & Sensitivity",
    organism: "MRSA",
    sampleType: "Blood",
    collectedAt: "2025-12-07T08:00:00Z",
    resultAt: "2025-12-07T14:00:00Z",
    reportFileUrl: "https://hospital.com/reports/mrsa-002.pdf",
    antibioticSensitivity: [
      { antibiotic: "Methicillin", result: "Resistant" },
      { antibiotic: "Oxacillin", result: "Resistant" },
      { antibiotic: "Vancomycin", result: "Sensitive" },
      { antibiotic: "Linezolid", result: "Sensitive" }
    ],
    additionalNotes: "Patient in ICU, post-surgical wound infection"
  },

  // TEST 3: MDR-TB (Critical Severity)
  mdrTbReport: {
    patientId: 125,
    reportId: "LRP-2025-003",
    testName: "TB Culture",
    organism: "MDR-TB",
    sampleType: "Sputum",
    collectedAt: "2025-12-06T06:00:00Z",
    resultAt: "2025-12-07T18:00:00Z",
    reportFileUrl: "https://hospital.com/reports/tb-003.pdf",
    antibioticSensitivity: [
      { antibiotic: "Isoniazid", result: "Resistant" },
      { antibiotic: "Rifampin", result: "Resistant" },
      { antibiotic: "Ethambutol", result: "Sensitive" },
      { antibiotic: "Pyrazinamide", result: "Sensitive" }
    ],
    additionalNotes: "Patient requires immediate airborne isolation. Contact tracing initiated."
  },

  // TEST 4: CRE (Critical Severity)
  creReport: {
    patientId: 123,
    reportId: "LRP-2025-004",
    testName: "Culture & Sensitivity",
    organism: "CRE",
    sampleType: "Wound",
    collectedAt: "2025-12-07T10:00:00Z",
    resultAt: "2025-12-07T16:00:00Z",
    reportFileUrl: "https://hospital.com/reports/cre-004.pdf",
    antibioticSensitivity: [
      { antibiotic: "Meropenem", result: "Resistant" },
      { antibiotic: "Imipenem", result: "Resistant" },
      { antibiotic: "Ertapenem", result: "Resistant" },
      { antibiotic: "Colistin", result: "Sensitive" },
      { antibiotic: "Tigecycline", result: "Sensitive" }
    ],
    additionalNotes: "Carbapenemase-producing organism. Extreme infection control measures required."
  },

  // TEST 5: VRE (High Severity)
  vreReport: {
    patientId: 124,
    reportId: "LRP-2025-005",
    testName: "Culture & Sensitivity",
    organism: "VRE",
    sampleType: "Urine",
    collectedAt: "2025-12-07T09:00:00Z",
    resultAt: "2025-12-07T15:00:00Z",
    reportFileUrl: "https://hospital.com/reports/vre-005.pdf",
    antibioticSensitivity: [
      { antibiotic: "Vancomycin", result: "Resistant" },
      { antibiotic: "Teicoplanin", result: "Resistant" },
      { antibiotic: "Linezolid", result: "Sensitive" },
      { antibiotic: "Daptomycin", result: "Sensitive" }
    ],
    additionalNotes: "Patient in long-term care facility. Enhanced contact precautions."
  },

  // TEST 6: Non-MDR Organism (Should NOT trigger flag)
  normalEcoliReport: {
    patientId: 125,
    reportId: "LRP-2025-006",
    testName: "Culture & Sensitivity",
    organism: "E. coli (normal)",
    sampleType: "Urine",
    collectedAt: "2025-12-07T11:00:00Z",
    resultAt: "2025-12-07T17:00:00Z",
    reportFileUrl: "https://hospital.com/reports/ecoli-006.pdf",
    antibioticSensitivity: [
      { antibiotic: "Amoxicillin", result: "Sensitive" },
      { antibiotic: "Ciprofloxacin", result: "Sensitive" },
      { antibiotic: "Trimethoprim", result: "Sensitive" }
    ],
    additionalNotes: "Routine UTI, no resistance patterns detected"
  },

  // TEST 7: C. difficile (High Severity)
  cdiffReport: {
    patientId: 123,
    reportId: "LRP-2025-007",
    testName: "C. difficile Toxin Test",
    organism: "C. difficile",
    sampleType: "Stool",
    collectedAt: "2025-12-07T12:00:00Z",
    resultAt: "2025-12-07T13:00:00Z",
    reportFileUrl: "https://hospital.com/reports/cdiff-007.pdf",
    antibioticSensitivity: [
      { antibiotic: "Metronidazole", result: "Sensitive" },
      { antibiotic: "Vancomycin", result: "Sensitive" },
      { antibiotic: "Fidaxomicin", result: "Sensitive" }
    ],
    additionalNotes: "Patient on antibiotics for 2 weeks. Severe diarrhea. Contact isolation required."
  },

  // TEST 8: Acinetobacter (High Severity)
  acinetobacterReport: {
    patientId: 124,
    reportId: "LRP-2025-008",
    testName: "Culture & Sensitivity",
    organism: "Acinetobacter",
    sampleType: "Blood",
    collectedAt: "2025-12-07T07:00:00Z",
    resultAt: "2025-12-07T19:00:00Z",
    reportFileUrl: "https://hospital.com/reports/acineto-008.pdf",
    antibioticSensitivity: [
      { antibiotic: "Meropenem", result: "Resistant" },
      { antibiotic: "Imipenem", result: "Resistant" },
      { antibiotic: "Ciprofloxacin", result: "Resistant" },
      { antibiotic: "Colistin", result: "Sensitive" },
      { antibiotic: "Tigecycline", result: "Sensitive" }
    ],
    additionalNotes: "Ventilator-associated infection. Patient in ICU bed 3."
  }
};
