import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Generate PDF report for compliance and audit
 */
export const generatePDFReport = (data, type = 'compliance') => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(14, 139, 134); // Primary teal
  doc.text('Hospital MDR Contact Tracing System', 20, 20);

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`${type.toUpperCase()} REPORT`, 20, 30);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 38);

  // Add line
  doc.setDrawColor(14, 139, 134);
  doc.line(20, 42, 190, 42);

  let yPosition = 50;

  if (type === 'compliance') {
    // Compliance metrics
    doc.setFontSize(12);
    doc.text('Compliance Metrics', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const metrics = [
      `Total Patients Traced: ${data.totalPatients || 0}`,
      `MDR Positive Cases: ${data.mdrPositive || 0}`,
      `Direct Contacts Identified: ${data.directContacts || 0}`,
      `Indirect Contacts Identified: ${data.indirectContacts || 0}`,
      `Median Time to Isolation: ${data.medianIsolationTime || 'N/A'} hours`,
      `Alerts Triggered: ${data.alertsTriggered || 0}`,
      `Compliance Rate: ${data.complianceRate || 0}%`,
    ];

    metrics.forEach((metric) => {
      doc.text(metric, 25, yPosition);
      yPosition += 7;
    });
  } else if (type === 'audit') {
    // Audit logs
    doc.setFontSize(12);
    doc.text('Audit Log Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    if (data.logs && data.logs.length > 0) {
      data.logs.slice(0, 20).forEach((log) => {
        doc.text(`${log.timestamp} - ${log.action} by ${log.user}`, 25, yPosition);
        yPosition += 6;

        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Confidential - For Internal Use Only', 105, 285, { align: 'center' });

  // Save
  doc.save(`${type}_report_${Date.now()}.pdf`);
};

/**
 * Generate Excel report
 */
export const generateExcelReport = (data, type = 'contacts') => {
  let worksheetData = [];
  let filename = `${type}_report_${Date.now()}.xlsx`;

  if (type === 'contacts') {
    worksheetData = data.map((contact) => ({
      'Person ID': contact.personId,
      'Person Name': contact.personName,
      'Contact Type': contact.contactType,
      Location: contact.location || contact.equipment,
      Timestamp: contact.timestamp,
      'Risk Level': contact.riskLevel || 'Unknown',
    }));
  } else if (type === 'patients') {
    worksheetData = data.map((patient) => ({
      'Patient ID': patient.id,
      'Patient Name': patient.name,
      Age: patient.age,
      Status: patient.status,
      'MDR Status': patient.mdrStatus,
      Room: patient.room,
      'Last Contact': patient.lastContact,
    }));
  } else if (type === 'equipment') {
    worksheetData = data.map((eq) => ({
      'Equipment ID': eq.id,
      'Equipment Name': eq.name,
      Contaminated: eq.contaminated ? 'Yes' : 'No',
      Action: eq.action,
      'Last User': eq.lastUsers?.[0]?.userName || 'N/A',
    }));
  }

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, type);

  // Add some styling
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!worksheet[address]) continue;
    worksheet[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: '0E8B86' } },
    };
  }

  XLSX.writeFile(workbook, filename);
};

/**
 * Generate chart data for recharts
 */
export const generateChartData = (patients, type = 'status') => {
  if (type === 'status') {
    const statusCount = {
      red: 0,
      yellow: 0,
      green: 0,
    };

    patients.forEach((patient) => {
      statusCount[patient.status] = (statusCount[patient.status] || 0) + 1;
    });

    return [
      { name: 'Critical (Red)', value: statusCount.red, color: '#EF4444' },
      { name: 'Risky (Yellow)', value: statusCount.yellow, color: '#F59E0B' },
      { name: 'Safe (Green)', value: statusCount.green, color: '#10B981' },
    ];
  }

  return [];
};

/**
 * Calculate compliance metrics
 */
export const calculateMetrics = (patients, contacts, alerts) => {
  const mdrPositive = patients.filter((p) => p.status === 'red').length;
  const directContacts = contacts.filter((c) => c.contactType === 'direct').length;
  const indirectContacts = contacts.filter((c) => c.contactType === 'equipment').length;

  return {
    totalPatients: patients.length,
    mdrPositive,
    directContacts,
    indirectContacts,
    alertsTriggered: alerts.length,
    complianceRate: Math.round((mdrPositive / patients.length) * 100) || 0,
    medianIsolationTime: '2.5', // Mock value
  };
};
