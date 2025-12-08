// ============================================================================
// LAB REPORT SERVICE - Core Business Logic
// ============================================================================
// Orchestrates the complete workflow:
// 1. Save lab report to database
// 2. Check if organism is MDR
// 3. Flag patient if MDR detected
// 4. Trigger real-time alerts
// 5. Create audit log entries

const db = require('../config/database');
const mdrDetectionService = require('./mdrDetectionService');
const notificationService = require('./notificationService');
const eventPublisher = require('./eventPublisher');
const auditService = require('./auditService');

class LabReportService {
  
  // ==========================================================================
  // MAIN WORKFLOW: Process Lab Report
  // ==========================================================================
  async processLabReport(reportData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      console.log('🔄 Starting lab report processing workflow...');

      // STEP 1: Validate patient exists
      const patient = await this.validatePatient(connection, reportData.patientId);
      if (!patient) {
        throw new Error(`Patient not found: ${reportData.patientId}`);
      }

      // STEP 2: Save lab report to database
      const savedReport = await this.saveLabReport(connection, reportData);
      console.log('✅ Lab report saved:', savedReport.reportId);

      // STEP 3: Check if organism is MDR
      const mdrCheck = await mdrDetectionService.checkMDROrganism(
        connection, 
        reportData.organism
      );

      let flagResult = null;
      let alertResult = null;

      if (mdrCheck.isMDR) {
        console.log('🚨 MDR organism detected:', reportData.organism);

        // STEP 4: Flag patient as MDR-positive
        flagResult = await this.flagPatientMDR(
          connection,
          reportData.patientId,
          reportData.organism,
          savedReport.reportId,
          mdrCheck
        );
        console.log('🚩 Patient flagged:', flagResult.flagId);

        // STEP 5: Trigger real-time alerts
        alertResult = await this.triggerMDRAlert(
          connection,
          patient,
          flagResult,
          mdrCheck,
          savedReport
        );
        console.log('🔔 Alerts triggered:', alertResult.notificationId);

        // STEP 6: Publish event to message queue
        await eventPublisher.publishMDRAlert({
          patientId: reportData.patientId,
          patientName: patient.name,
          mrn: patient.mrn,
          organism: reportData.organism,
          severity: mdrCheck.severity,
          flagId: flagResult.flagId,
          reportId: savedReport.reportId,
          timestamp: new Date()
        });
        console.log('📢 Event published to queue');
      } else {
        console.log('✅ Non-MDR organism - no flagging required');
      }

      // STEP 7: Mark report as processed
      await this.markReportProcessed(connection, savedReport.reportId);

      // STEP 8: Create audit log entry
      await auditService.logAction(connection, {
        patientId: reportData.patientId,
        reportId: savedReport.reportId,
        flagId: flagResult?.flagId,
        action: mdrCheck.isMDR ? 'mdr_flag_created' : 'lab_report_uploaded',
        performedBy: reportData.uploadedBy,
        details: {
          organism: reportData.organism,
          testName: reportData.testName,
          mdrDetected: mdrCheck.isMDR
        }
      });

      await connection.commit();
      console.log('✅ Lab report processing completed successfully');

      return {
        reportId: savedReport.reportId,
        patientId: reportData.patientId,
        mdrDetected: mdrCheck.isMDR,
        organism: reportData.organism,
        severity: mdrCheck.severity,
        flagCreated: !!flagResult,
        flagId: flagResult?.flagId,
        alertSent: !!alertResult,
        notificationId: alertResult?.notificationId
      };

    } catch (error) {
      await connection.rollback();
      console.error('❌ Lab report processing failed:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  async validatePatient(connection, patientId) {
    const [rows] = await connection.query(
      'SELECT patient_id, mrn, name, status FROM patients WHERE patient_id = ?',
      [patientId]
    );
    return rows[0] || null;
  }

  async saveLabReport(connection, reportData) {
    const query = `
      INSERT INTO lab_reports (
        report_id, patient_id, test_name, organism, sample_type,
        collected_at, result_at, file_url, antibiotic_sensitivity,
        additional_notes, processed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
    `;

    await connection.query(query, [
      reportData.reportId,
      reportData.patientId,
      reportData.testName,
      reportData.organism,
      reportData.sampleType,
      reportData.collectedAt,
      reportData.resultAt,
      reportData.reportFileUrl,
      reportData.antibioticSensitivity ? JSON.stringify(reportData.antibioticSensitivity) : null,
      reportData.additionalNotes
    ]);

    return { reportId: reportData.reportId };
  }

  async flagPatientMDR(connection, patientId, organism, reportId, mdrCheck) {
    // Check if active flag already exists for this patient + organism
    const [existingFlags] = await connection.query(`
      SELECT flag_id FROM mdr_flags
      WHERE patient_id = ? AND organism = ? AND status = 'active'
      LIMIT 1
    `, [patientId, organism]);

    if (existingFlags.length > 0) {
      console.log('⚠️  Active flag already exists for this patient + organism');
      return { flagId: existingFlags[0].flag_id, isNew: false };
    }

    // Create new flag
    const [result] = await connection.query(`
      INSERT INTO mdr_flags (
        patient_id, organism, report_id, severity, status, flagged_at
      ) VALUES (?, ?, ?, ?, 'active', NOW())
    `, [patientId, organism, reportId, mdrCheck.severity]);

    return { flagId: result.insertId, isNew: true };
  }

  async triggerMDRAlert(connection, patient, flagResult, mdrCheck, report) {
    const message = this.buildAlertMessage(patient, mdrCheck, report);

    // Create notification record
    const [result] = await connection.query(`
      INSERT INTO notifications (
        patient_id, flag_id, notification_type, priority, message,
        channel, recipient_roles, metadata, sent
      ) VALUES (?, ?, 'mdr_alert', ?, ?, 'all', ?, ?, FALSE)
    `, [
      patient.patient_id,
      flagResult.flagId,
      mdrCheck.severity === 'critical' ? 'critical' : 'high',
      message,
      JSON.stringify(['doctor', 'nurse', 'infection_control']),
      JSON.stringify({
        organism: mdrCheck.organism,
        reportId: report.reportId,
        isolationType: mdrCheck.isolationType
      })
    ]);

    return { notificationId: result.insertId };
  }

  buildAlertMessage(patient, mdrCheck, report) {
    return `🚨 URGENT MDR ALERT: Patient ${patient.name} (MRN: ${patient.mrn}) tested positive for ${mdrCheck.fullName || mdrCheck.organism}. ` +
           `Sample: ${report.sampleType}. ` +
           `${mdrCheck.isolationRequired ? `Immediate ${mdrCheck.isolationType} recommended.` : ''}`;
  }

  async markReportProcessed(connection, reportId) {
    await connection.query(
      'UPDATE lab_reports SET processed = TRUE WHERE report_id = ?',
      [reportId]
    );
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  async getReportById(reportId) {
    const [rows] = await db.query(`
      SELECT 
        lr.*,
        p.name AS patient_name,
        p.mrn,
        ml.full_name AS organism_full_name,
        ml.severity,
        ml.isolation_required
      FROM lab_reports lr
      JOIN patients p ON lr.patient_id = p.patient_id
      LEFT JOIN mdr_list ml ON lr.organism = ml.organism
      WHERE lr.report_id = ?
    `, [reportId]);

    return rows[0] || null;
  }

  async getReportsByPatient(patientId, limit = 50, offset = 0) {
    const [rows] = await db.query(`
      SELECT 
        lr.*,
        ml.full_name AS organism_full_name,
        ml.severity
      FROM lab_reports lr
      LEFT JOIN mdr_list ml ON lr.organism = ml.organism
      WHERE lr.patient_id = ?
      ORDER BY lr.result_at DESC
      LIMIT ? OFFSET ?
    `, [patientId, limit, offset]);

    return rows;
  }

  async getUnprocessedReports() {
    const [rows] = await db.query(`
      SELECT 
        lr.*,
        p.name AS patient_name,
        p.mrn
      FROM lab_reports lr
      JOIN patients p ON lr.patient_id = p.patient_id
      WHERE lr.processed = FALSE
      ORDER BY lr.result_at DESC
      LIMIT 100
    `);

    return rows;
  }

  async reprocessMDRDetection(reportId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get report details
      const [reports] = await connection.query(
        'SELECT * FROM lab_reports WHERE report_id = ?',
        [reportId]
      );

      if (reports.length === 0) {
        throw new Error('Report not found');
      }

      const report = reports[0];

      // Check MDR status
      const mdrCheck = await mdrDetectionService.checkMDROrganism(
        connection,
        report.organism
      );

      let result = { mdrDetected: mdrCheck.isMDR, flagCreated: false };

      if (mdrCheck.isMDR) {
        const patient = await this.validatePatient(connection, report.patient_id);
        const flagResult = await this.flagPatientMDR(
          connection,
          report.patient_id,
          report.organism,
          reportId,
          mdrCheck
        );

        if (flagResult.isNew) {
          await this.triggerMDRAlert(connection, patient, flagResult, mdrCheck, report);
          result.flagCreated = true;
          result.flagId = flagResult.flagId;
        }
      }

      await this.markReportProcessed(connection, reportId);
      await connection.commit();

      return result;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new LabReportService();
