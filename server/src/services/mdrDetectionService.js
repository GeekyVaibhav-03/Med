// ============================================================================
// MDR DETECTION SERVICE
// ============================================================================
// Checks if an organism is classified as Multi-Drug Resistant

class MDRDetectionService {
  
  /**
   * Check if organism is in the MDR list
   * @param {Object} connection - MySQL connection
   * @param {String} organism - Organism name to check
   * @returns {Object} { isMDR, organism, severity, isolationRequired, etc. }
   */
  async checkMDROrganism(connection, organism) {
    if (!organism || organism.trim() === '') {
      return {
        isMDR: false,
        organism: null,
        message: 'No organism specified'
      };
    }

    // Normalize organism name (trim, uppercase for comparison)
    const normalizedOrganism = organism.trim();

    // Query MDR list
    const [rows] = await connection.query(`
      SELECT 
        organism,
        full_name,
        category,
        severity,
        isolation_required,
        isolation_type,
        description,
        treatment_guidelines
      FROM mdr_list
      WHERE organism = ? OR full_name LIKE ?
      LIMIT 1
    `, [normalizedOrganism, `%${normalizedOrganism}%`]);

    if (rows.length === 0) {
      return {
        isMDR: false,
        organism: normalizedOrganism,
        message: 'Organism not found in MDR list'
      };
    }

    const mdrInfo = rows[0];

    return {
      isMDR: true,
      organism: mdrInfo.organism,
      fullName: mdrInfo.full_name,
      category: mdrInfo.category,
      severity: mdrInfo.severity,
      isolationRequired: mdrInfo.isolation_required,
      isolationType: mdrInfo.isolation_type,
      description: mdrInfo.description,
      treatmentGuidelines: mdrInfo.treatment_guidelines
    };
  }

  /**
   * Get all MDR organisms
   */
  async getAllMDROrganisms(connection) {
    const [rows] = await connection.query(`
      SELECT * FROM mdr_list ORDER BY severity DESC, organism ASC
    `);
    return rows;
  }

  /**
   * Add new MDR organism to the list (admin only)
   */
  async addMDROrganism(connection, organismData) {
    const [result] = await connection.query(`
      INSERT INTO mdr_list (
        organism, full_name, category, severity,
        isolation_required, isolation_type, description, treatment_guidelines
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      organismData.organism,
      organismData.fullName,
      organismData.category || 'bacteria',
      organismData.severity || 'high',
      organismData.isolationRequired !== false,
      organismData.isolationType,
      organismData.description,
      organismData.treatmentGuidelines
    ]);

    return { success: true, organism: organismData.organism };
  }
}

module.exports = new MDRDetectionService();
