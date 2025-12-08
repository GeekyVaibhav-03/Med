// ============================================================================
// AUDIT SERVICE
// ============================================================================
// Logs all actions related to MDR flags and lab reports

class AuditService {
  
  async logAction(connection, auditData) {
    const query = `
      INSERT INTO mdr_audit_log (
        patient_id, flag_id, report_id, action, performed_by, details, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(query, [
      auditData.patientId,
      auditData.flagId || null,
      auditData.reportId || null,
      auditData.action,
      auditData.performedBy || null,
      auditData.details ? JSON.stringify(auditData.details) : null,
      auditData.ipAddress || null
    ]);

    console.log('📝 Audit log created:', auditData.action);
  }

  async getAuditLog(patientId, limit = 50) {
    const db = require('../config/database');
    const [rows] = await db.query(`
      SELECT 
        al.*,
        u.username AS performed_by_username
      FROM mdr_audit_log al
      LEFT JOIN users u ON al.performed_by = u.id
      WHERE al.patient_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [patientId, limit]);

    return rows;
  }
}

module.exports = new AuditService();
