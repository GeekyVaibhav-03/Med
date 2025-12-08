// ============================================================================
// LAB REPORT SERVICE - MOCK MODE (No Database Required)
// ============================================================================
// This is a simplified version that works without MySQL
// Perfect for testing the UI and workflow

const mdrOrganisms = {
  'ESBL': { severity: 'high', fullName: 'Extended-Spectrum Beta-Lactamases' },
  'MRSA': { severity: 'high', fullName: 'Methicillin-Resistant Staphylococcus Aureus' },
  'VRE': { severity: 'moderate', fullName: 'Vancomycin-Resistant Enterococcus' },
  'CRE': { severity: 'critical', fullName: 'Carbapenem-Resistant Enterobacteriaceae' },
  'MDR-TB': { severity: 'critical', fullName: 'Multi-Drug Resistant Tuberculosis' },
  'XDR-TB': { severity: 'critical', fullName: 'Extensively Drug-Resistant Tuberculosis' },
  'CRPA': { severity: 'high', fullName: 'Carbapenem-Resistant Pseudomonas Aeruginosa' },
  'ACINETOBACTER': { severity: 'high', fullName: 'MDR Acinetobacter Baumannii' },
  'C. DIFFICILE': { severity: 'moderate', fullName: 'Clostridioides Difficile' },
  'MDR-SALMONELLA': { severity: 'moderate', fullName: 'Multi-Drug Resistant Salmonella' }
};

// In-memory storage for mock data
const mockReports = [];
const mockFlags = [];
let reportIdCounter = 1;
let flagIdCounter = 1;

class LabReportServiceMock {
  
  async processLabReport(reportData) {
    try {
      console.log('🔄 [MOCK MODE] Processing lab report...');

      // Create report object
      const report = {
        id: reportIdCounter++,
        reportId: reportData.reportId,
        patientId: reportData.patientId,
        testName: reportData.testName,
        organism: reportData.organism,
        sampleType: reportData.sampleType,
        collectedAt: reportData.collectedAt,
        resultAt: reportData.resultAt,
        reportFileUrl: reportData.reportFileUrl || null,
        antibioticSensitivity: reportData.antibioticSensitivity || [],
        additionalNotes: reportData.additionalNotes || null,
        processed: true,
        createdAt: new Date().toISOString()
      };

      // Check if organism is MDR
      const organismUpper = (reportData.organism || '').toUpperCase();
      let isMDR = false;
      let mdrInfo = null;
      let flagId = null;
      let flagCreated = false;

      for (const [key, value] of Object.entries(mdrOrganisms)) {
        if (organismUpper.includes(key)) {
          isMDR = true;
          mdrInfo = {
            organism: key,
            fullName: value.fullName,
            severity: value.severity
          };
          break;
        }
      }

      // If MDR detected, create flag
      if (isMDR) {
        console.log(`🚨 [MOCK MODE] MDR Detected: ${mdrInfo.organism}`);
        
        const flag = {
          flagId: flagIdCounter++,
          patientId: reportData.patientId,
          reportId: reportData.reportId,
          organism: mdrInfo.organism,
          fullName: mdrInfo.fullName,
          severity: mdrInfo.severity,
          status: 'active',
          flaggedAt: new Date().toISOString()
        };

        mockFlags.push(flag);
        flagId = flag.flagId;
        flagCreated = true;

        console.log(`✅ [MOCK MODE] Patient #${reportData.patientId} flagged (Flag ID: ${flagId})`);
      } else {
        console.log(`ℹ️ [MOCK MODE] Non-MDR organism: ${reportData.organism}`);
      }

      // Save report
      mockReports.push(report);

      return {
        success: true,
        report: {
          id: report.id,
          reportId: report.reportId
        },
        mdrDetected: isMDR,
        mdrInfo: mdrInfo,
        flagId: flagId,
        flagCreated: flagCreated,
        message: isMDR 
          ? `MDR organism detected: ${mdrInfo.organism}. Patient has been flagged.`
          : 'Lab report processed successfully. No MDR organism detected.'
      };

    } catch (error) {
      console.error('❌ [MOCK MODE] Error processing lab report:', error);
      throw error;
    }
  }

  async getReportById(reportId) {
    const report = mockReports.find(r => r.reportId === reportId);
    return report || null;
  }

  async getReportsByPatient(patientId, limit = 50, offset = 0) {
    const reports = mockReports.filter(r => r.patientId === parseInt(patientId));
    return {
      reports: reports.slice(offset, offset + limit),
      total: reports.length
    };
  }

  async getUnprocessedReports() {
    return mockReports.filter(r => !r.processed);
  }

  async reprocessMDRDetection(reportId) {
    const report = mockReports.find(r => r.reportId === reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Re-check MDR status
    const organismUpper = (report.organism || '').toUpperCase();
    let isMDR = false;
    let mdrInfo = null;

    for (const [key, value] of Object.entries(mdrOrganisms)) {
      if (organismUpper.includes(key)) {
        isMDR = true;
        mdrInfo = {
          organism: key,
          fullName: value.fullName,
          severity: value.severity
        };
        break;
      }
    }

    return {
      success: true,
      reportId: report.reportId,
      mdrDetected: isMDR,
      mdrInfo: mdrInfo
    };
  }

  // Get all active MDR flags
  async getActiveMDRFlags() {
    return mockFlags.filter(f => f.status === 'active');
  }

  // Get MDR status for a patient
  async getPatientMDRStatus(patientId) {
    return mockFlags.filter(f => f.patientId === parseInt(patientId) && f.status === 'active');
  }

  // Clear an MDR flag
  async clearMDRFlag(flagId, clearedBy, reason) {
    const flag = mockFlags.find(f => f.flagId === flagId);
    if (!flag) {
      throw new Error('Flag not found');
    }

    flag.status = 'cleared';
    flag.clearedAt = new Date().toISOString();
    flag.clearedBy = clearedBy;
    flag.clearedReason = reason;

    console.log(`✅ [MOCK MODE] Flag ${flagId} cleared by user ${clearedBy}`);
    return { success: true };
  }

  // Update isolation status
  async updateIsolationStatus(flagId, isolationStatus, roomNumber) {
    const flag = mockFlags.find(f => f.flagId === flagId);
    if (!flag) {
      throw new Error('Flag not found');
    }

    flag.isolationStatus = isolationStatus;
    flag.roomNumber = roomNumber;
    flag.updatedAt = new Date().toISOString();

    console.log(`✅ [MOCK MODE] Flag ${flagId} isolation updated: ${isolationStatus}`);
    return { success: true };
  }

  // Get statistics
  getStatistics() {
    const activeFlags = mockFlags.filter(f => f.status === 'active');
    return {
      totalReports: mockReports.length,
      totalFlags: mockFlags.length,
      activeFlags: activeFlags.length,
      criticalFlags: activeFlags.filter(f => f.severity === 'critical').length,
      highFlags: activeFlags.filter(f => f.severity === 'high').length,
      moderateFlags: activeFlags.filter(f => f.severity === 'moderate').length
    };
  }
}

module.exports = new LabReportServiceMock();
