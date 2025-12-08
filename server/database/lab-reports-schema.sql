-- ==============================================================================
-- LAB REPORT INGESTION SYSTEM - DATABASE SCHEMA
-- ==============================================================================
-- This schema supports automated MDR detection and real-time alerting

-- 1. PATIENTS TABLE (Extended)
-- Stores patient demographics and admission info
CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    mrn VARCHAR(50) UNIQUE NOT NULL COMMENT 'Medical Record Number',
    name VARCHAR(255) NOT NULL,
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    blood_group VARCHAR(5),
    contact_number VARCHAR(20),
    emergency_contact VARCHAR(20),
    address TEXT,
    admission_date DATETIME,
    discharge_date DATETIME,
    status ENUM('admitted', 'discharged', 'transferred') DEFAULT 'admitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mrn (mrn),
    INDEX idx_status (status),
    INDEX idx_admission_date (admission_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Patient master data';

-- 2. LAB REPORTS TABLE
-- Stores all lab test results with organism details
CREATE TABLE IF NOT EXISTS lab_reports (
    report_id VARCHAR(50) PRIMARY KEY COMMENT 'Unique lab report ID',
    patient_id INT NOT NULL,
    test_name VARCHAR(255) NOT NULL COMMENT 'e.g., Culture & Sensitivity',
    organism VARCHAR(255) COMMENT 'Detected organism name',
    sample_type VARCHAR(100) COMMENT 'e.g., Urine, Blood, Sputum',
    collected_at DATETIME NOT NULL COMMENT 'Sample collection timestamp',
    result_at DATETIME NOT NULL COMMENT 'Result available timestamp',
    file_url TEXT COMMENT 'URL to PDF/image report',
    antibiotic_sensitivity JSON COMMENT 'JSON array of {antibiotic, result}',
    additional_notes TEXT,
    processed BOOLEAN DEFAULT FALSE COMMENT 'Whether MDR check was done',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_organism (organism),
    INDEX idx_collected_at (collected_at),
    INDEX idx_processed (processed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lab test reports with organism data';

-- 3. MDR ORGANISM LIST TABLE
-- Master list of Multi-Drug Resistant organisms
CREATE TABLE IF NOT EXISTS mdr_list (
    organism VARCHAR(255) PRIMARY KEY,
    full_name VARCHAR(500) COMMENT 'Full scientific name',
    category ENUM('bacteria', 'virus', 'fungus', 'parasite') DEFAULT 'bacteria',
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
    isolation_required BOOLEAN DEFAULT TRUE,
    isolation_type VARCHAR(100) COMMENT 'e.g., Contact precautions, Airborne',
    description TEXT,
    treatment_guidelines TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_severity (severity),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='List of MDR organisms for auto-detection';

-- Pre-populate common MDR organisms
INSERT INTO mdr_list (organism, full_name, category, severity, isolation_required, isolation_type, description) VALUES
('MRSA', 'Methicillin-Resistant Staphylococcus aureus', 'bacteria', 'high', TRUE, 'Contact precautions', 'Resistant to beta-lactam antibiotics'),
('VRE', 'Vancomycin-Resistant Enterococci', 'bacteria', 'high', TRUE, 'Contact precautions', 'Resistant to vancomycin and aminoglycosides'),
('ESBL', 'Extended-Spectrum Beta-Lactamase', 'bacteria', 'high', TRUE, 'Contact precautions', 'Resistant to most beta-lactam antibiotics'),
('CRE', 'Carbapenem-Resistant Enterobacteriaceae', 'bacteria', 'critical', TRUE, 'Contact precautions', 'Resistant to carbapenems'),
('MDR-TB', 'Multi-Drug Resistant Tuberculosis', 'bacteria', 'critical', TRUE, 'Airborne precautions', 'Resistant to isoniazid and rifampin'),
('XDR-TB', 'Extensively Drug-Resistant Tuberculosis', 'bacteria', 'critical', TRUE, 'Airborne precautions', 'Resistant to isoniazid, rifampin, fluoroquinolones, and second-line injectables'),
('CRPA', 'Carbapenem-Resistant Pseudomonas aeruginosa', 'bacteria', 'high', TRUE, 'Contact precautions', 'Resistant to carbapenems'),
('Acinetobacter', 'Multi-Drug Resistant Acinetobacter baumannii', 'bacteria', 'high', TRUE, 'Contact precautions', 'Resistant to multiple antibiotics including carbapenems'),
('C. difficile', 'Clostridioides difficile', 'bacteria', 'high', TRUE, 'Contact precautions', 'Causes severe diarrhea and colitis'),
('MDR-Salmonella', 'Multi-Drug Resistant Salmonella', 'bacteria', 'medium', TRUE, 'Contact precautions', 'Resistant to multiple first-line antibiotics')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), severity=VALUES(severity);

-- 4. MDR FLAGS TABLE
-- Tracks patients who are flagged as MDR-positive
CREATE TABLE IF NOT EXISTS mdr_flags (
    flag_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    organism VARCHAR(255) NOT NULL,
    report_id VARCHAR(50) NOT NULL COMMENT 'Reference to lab report that triggered flag',
    status ENUM('active', 'cleared', 'under_review') DEFAULT 'active',
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
    isolation_status ENUM('isolated', 'not_isolated', 'pending') DEFAULT 'pending',
    room_number VARCHAR(50),
    flagged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cleared_at DATETIME NULL,
    cleared_by INT NULL COMMENT 'User ID who cleared the flag',
    clearance_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES lab_reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (organism) REFERENCES mdr_list(organism) ON DELETE RESTRICT,
    UNIQUE KEY unique_active_flag (patient_id, organism, status),
    INDEX idx_patient (patient_id),
    INDEX idx_status (status),
    INDEX idx_organism (organism),
    INDEX idx_flagged_at (flagged_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Active MDR flags for patients';

-- 5. NOTIFICATIONS TABLE
-- Stores all system notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    notif_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    flag_id INT NULL COMMENT 'Reference to MDR flag if applicable',
    notification_type ENUM('mdr_alert', 'isolation_reminder', 'clearance', 'general') DEFAULT 'mdr_alert',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
    message TEXT NOT NULL,
    channel ENUM('push', 'websocket', 'sms', 'email', 'all') DEFAULT 'all',
    recipient_roles JSON COMMENT 'Array of roles to notify: ["doctor", "nurse", "infection_control"]',
    recipient_users JSON COMMENT 'Array of specific user IDs to notify',
    sent BOOLEAN DEFAULT FALSE,
    sent_at DATETIME NULL,
    read_by JSON COMMENT 'Array of user IDs who have read this notification',
    error_message TEXT COMMENT 'Error message if sending failed',
    retry_count INT DEFAULT 0,
    metadata JSON COMMENT 'Additional data like organism, report_id, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (flag_id) REFERENCES mdr_flags(flag_id) ON DELETE SET NULL,
    INDEX idx_patient (patient_id),
    INDEX idx_flag (flag_id),
    INDEX idx_sent (sent),
    INDEX idx_type (notification_type),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='System notifications and alerts';

-- 6. NOTIFICATION SUBSCRIPTIONS TABLE
-- Manages who receives what type of notifications
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL COMMENT 'push, sms, email, websocket',
    enabled BOOLEAN DEFAULT TRUE,
    fcm_token TEXT COMMENT 'Firebase Cloud Messaging token for push',
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_subscription (user_id, notification_type, channel),
    INDEX idx_user (user_id),
    INDEX idx_type (notification_type),
    INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User notification preferences';

-- 7. AUDIT LOG TABLE
-- Tracks all actions related to MDR flags and reports
CREATE TABLE IF NOT EXISTS mdr_audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    flag_id INT NULL,
    report_id VARCHAR(50) NULL,
    action VARCHAR(100) NOT NULL COMMENT 'e.g., flag_created, flag_cleared, report_uploaded',
    performed_by INT NULL COMMENT 'User ID who performed action',
    details JSON COMMENT 'Additional action details',
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (flag_id) REFERENCES mdr_flags(flag_id) ON DELETE SET NULL,
    INDEX idx_patient (patient_id),
    INDEX idx_flag (flag_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Audit trail for MDR system';

-- ==============================================================================
-- VIEWS FOR QUICK ACCESS
-- ==============================================================================

-- Active MDR patients with full details
CREATE OR REPLACE VIEW active_mdr_patients AS
SELECT 
    p.patient_id,
    p.mrn,
    p.name,
    p.admission_date,
    mf.flag_id,
    mf.organism,
    mf.severity,
    mf.isolation_status,
    mf.room_number,
    mf.flagged_at,
    ml.isolation_type,
    ml.description AS organism_description
FROM patients p
JOIN mdr_flags mf ON p.patient_id = mf.patient_id
JOIN mdr_list ml ON mf.organism = ml.organism
WHERE mf.status = 'active'
ORDER BY mf.severity DESC, mf.flagged_at DESC;

-- Recent lab reports needing review
CREATE OR REPLACE VIEW pending_lab_reports AS
SELECT 
    lr.report_id,
    lr.patient_id,
    p.name AS patient_name,
    p.mrn,
    lr.test_name,
    lr.organism,
    lr.sample_type,
    lr.result_at,
    lr.processed,
    ml.organism IS NOT NULL AS is_mdr
FROM lab_reports lr
JOIN patients p ON lr.patient_id = p.patient_id
LEFT JOIN mdr_list ml ON lr.organism = ml.organism
WHERE lr.processed = FALSE
ORDER BY lr.result_at DESC;

-- Notification queue (unsent notifications)
CREATE OR REPLACE VIEW notification_queue AS
SELECT 
    n.notif_id,
    n.patient_id,
    p.name AS patient_name,
    n.notification_type,
    n.priority,
    n.message,
    n.channel,
    n.retry_count,
    n.created_at
FROM notifications n
JOIN patients p ON n.patient_id = p.patient_id
WHERE n.sent = FALSE
ORDER BY n.priority DESC, n.created_at ASC;

-- ==============================================================================
-- STORED PROCEDURES
-- ==============================================================================

-- Procedure to flag patient as MDR-positive
DELIMITER $$
CREATE PROCEDURE flag_patient_mdr(
    IN p_patient_id INT,
    IN p_organism VARCHAR(255),
    IN p_report_id VARCHAR(50),
    OUT p_flag_id INT
)
BEGIN
    DECLARE v_severity VARCHAR(20);
    DECLARE v_existing_flag_id INT;
    
    -- Get severity from mdr_list
    SELECT severity INTO v_severity FROM mdr_list WHERE organism = p_organism;
    
    -- Check for existing active flag
    SELECT flag_id INTO v_existing_flag_id 
    FROM mdr_flags 
    WHERE patient_id = p_patient_id 
      AND organism = p_organism 
      AND status = 'active'
    LIMIT 1;
    
    IF v_existing_flag_id IS NULL THEN
        -- Create new flag
        INSERT INTO mdr_flags (patient_id, organism, report_id, severity, status)
        VALUES (p_patient_id, p_organism, p_report_id, v_severity, 'active');
        
        SET p_flag_id = LAST_INSERT_ID();
    ELSE
        SET p_flag_id = v_existing_flag_id;
    END IF;
END$$
DELIMITER ;

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
-- Additional composite indexes for common queries

CREATE INDEX idx_mdr_flags_active ON mdr_flags(status, severity, flagged_at);
CREATE INDEX idx_notifications_queue ON notifications(sent, priority, created_at);
CREATE INDEX idx_lab_reports_unprocessed ON lab_reports(processed, result_at);

-- ==============================================================================
-- INITIAL DATA SETUP
-- ==============================================================================

-- Insert sample patients for testing (optional)
INSERT IGNORE INTO patients (patient_id, mrn, name, dob, gender, blood_group, admission_date, status) VALUES
(123, 'MRN-2025-001', 'John Doe', '1985-05-15', 'Male', 'A+', '2025-12-01 08:00:00', 'admitted'),
(124, 'MRN-2025-002', 'Jane Smith', '1990-08-22', 'Female', 'B+', '2025-12-03 10:30:00', 'admitted'),
(125, 'MRN-2025-003', 'Robert Johnson', '1975-03-10', 'Male', 'O+', '2025-12-05 14:15:00', 'admitted');

-- Grant permissions (adjust based on your MySQL user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON hospital_db.* TO 'hospital_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
