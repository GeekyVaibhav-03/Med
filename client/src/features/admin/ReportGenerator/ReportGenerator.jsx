import React, { useState, useRef, useEffect } from 'react';
import { Download, Camera, FileText, Clock, Activity, AlertTriangle, Users, Stethoscope } from 'lucide-react';
import Card from '../../../components/Card';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../../services/api';

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('mdr-patients');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [screenshots, setScreenshots] = useState([]);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mdrData, setMdrData] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'mdr-patients', label: 'MDR Patients Report', icon: Users },
    { value: 'mdr-contacts', label: 'Contact Tracing Report', icon: Activity },
    { value: 'mdr-alerts', label: 'MDR Alert History', icon: AlertTriangle },
    { value: 'infection-spread', label: 'Infection Spread Analysis', icon: Activity },
    { value: 'patient-visits', label: 'Patient Visit History', icon: Stethoscope },
    { value: 'custom', label: 'Custom MDR Report', icon: FileText }
  ];

  // Fetch MDR patient data
  useEffect(() => {
    fetchMDRData();
  }, [dateRange]);

  const fetchMDRData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mdrcases', {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end
        }
      });
      setMdrData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch MDR data:', error);
      setMdrData([]);
    } finally {
      setLoading(false);
    }
  };

  // Capture current screen/component
  const captureScreenshot = async () => {
    try {
      const element = document.getElementById('admin-main-content') || document.body;
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imageData = canvas.toDataURL('image/png');
      const screenshot = {
        id: Date.now(),
        data: imageData,
        timestamp: new Date().toLocaleString(),
        description: `Screenshot captured at ${new Date().toLocaleString()}`
      };
      
      setScreenshots(prev => [...prev, screenshot]);
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = '📸 Screenshot captured successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      alert('Failed to capture screenshot. Please try again.');
    }
  };

  // Generate PDF Report
  const generatePDFReport = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(22);
      pdf.setTextColor(220, 38, 38);
      pdf.text('MDR Patient Tracking Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setDrawColor(220, 38, 38);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Report Details
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Report Details', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      const selectedReport = reportTypes.find(r => r.value === reportType);
      pdf.text(`Report Type: ${selectedReport?.label || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Total MDR Cases: ${mdrData.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Total Screenshots: ${screenshots.length}`, 25, yPosition);
      yPosition += 12;

      // MDR Patient Summary
      if (mdrData.length > 0) {
        pdf.setFontSize(14);
        pdf.text('MDR Patient Summary', 20, yPosition);
        yPosition += 8;

        // Critical stats
        const criticalCases = mdrData.filter(p => p.riskLevel === 'Critical' || p.riskLevel === 'High').length;
        const activeCases = mdrData.filter(p => p.status === 'Active' || p.status === 'active').length;
        
        pdf.setFontSize(10);
        pdf.text(`• Total MDR Cases: ${mdrData.length}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`• Active Cases: ${activeCases}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`• High Risk Cases: ${criticalCases}`, 25, yPosition);
        yPosition += 10;

        // Patient List Table
        pdf.setFontSize(12);
        pdf.text('MDR Patient Details', 20, yPosition);
        yPosition += 8;

        // Table Header
        pdf.setFontSize(9);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, yPosition - 4, pageWidth - 40, 6, 'F');
        pdf.text('Patient ID', 22, yPosition);
        pdf.text('Name', 52, yPosition);
        pdf.text('Status', 95, yPosition);
        pdf.text('Risk', 125, yPosition);
        pdf.text('Location', 150, yPosition);
        yPosition += 8;

        // Table Rows
        pdf.setFontSize(8);
        for (let i = 0; i < Math.min(mdrData.length, 20); i++) {
          const patient = mdrData[i];
          
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.text(String(patient.personId || patient.id || '-'), 22, yPosition);
          pdf.text(String(patient.name || patient.patientName || 'Unknown').substring(0, 20), 52, yPosition);
          pdf.text(String(patient.status || '-').substring(0, 15), 95, yPosition);
          pdf.text(String(patient.riskLevel || patient.risk || '-'), 125, yPosition);
          pdf.text(String(patient.location || patient.room || '-').substring(0, 20), 150, yPosition);
          yPosition += 6;
        }

        if (mdrData.length > 20) {
          yPosition += 5;
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`... and ${mdrData.length - 20} more patients`, 25, yPosition);
          pdf.setTextColor(0, 0, 0);
        }

        yPosition += 12;
      }

      // Notes Section
      if (notes) {
        pdf.setFontSize(14);
        pdf.text('Notes & Observations', 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        const splitNotes = pdf.splitTextToSize(notes, pageWidth - 50);
        pdf.text(splitNotes, 25, yPosition);
        yPosition += splitNotes.length * 5 + 10;
      }

      // Screenshots Section
      if (screenshots.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Evidence & Screenshots', 20, yPosition);
        yPosition += 10;

        for (let i = 0; i < screenshots.length; i++) {
          const screenshot = screenshots[i];
          
          // Check if we need a new page
          if (yPosition > pageHeight - 80) {
            pdf.addPage();
            yPosition = 20;
          }

          // Screenshot info
          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`Screenshot ${i + 1}`, 25, yPosition);
          yPosition += 5;
          
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Captured: ${screenshot.timestamp}`, 25, yPosition);
          yPosition += 8;

          // Add screenshot image
          try {
            const imgWidth = pageWidth - 50;
            const imgHeight = 60;
            pdf.addImage(screenshot.data, 'PNG', 25, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;

            // Description
            if (screenshot.description) {
              pdf.setFontSize(9);
              pdf.setTextColor(80, 80, 80);
              const splitDesc = pdf.splitTextToSize(screenshot.description, pageWidth - 50);
              pdf.text(splitDesc, 25, yPosition);
              yPosition += splitDesc.length * 4 + 10;
            }
          } catch (err) {
            console.error('Failed to add screenshot to PDF:', err);
            yPosition += 5;
          }
        }
      }

      // Footer on last page
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages} | MedWatch MDR Tracking System`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `MDR_${reportType}_Report_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`;
      pdf.save(fileName);

      // Success notification
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = `✅ MDR Report "${fileName}" generated successfully!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);

    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export data as JSON
  const exportJSON = () => {
    const reportData = {
      type: reportType,
      dateRange,
      generatedAt: new Date().toISOString(),
      notes,
      mdrPatients: mdrData,
      statistics: {
        totalCases: Array.isArray(mdrData) ? mdrData.length : 0,
        activeCases: Array.isArray(mdrData) ? mdrData.filter(p => p.status === 'Active' || p.status === 'active').length : 0,
        criticalCases: Array.isArray(mdrData) ? mdrData.filter(p => p.riskLevel === 'Critical' || p.riskLevel === 'High').length : 0
      },
      screenshots: screenshots.map(s => ({
        id: s.id,
        timestamp: s.timestamp,
        description: s.description
      })),
      metadata: {
        totalScreenshots: screenshots.length,
        reportVersion: '2.0',
        hospitalName: 'MedWatch Hospital'
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MDR_${reportType}_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCSV = () => {
    if (!Array.isArray(mdrData) || mdrData.length === 0) {
      alert('No MDR patient data to export');
      return;
    }

    const headers = ['Patient ID', 'Name', 'Status', 'Risk Level', 'Location', 'Detection Date', 'Drug Resistance'];
    const rows = mdrData.map(p => [
      p.personId || p.id || '',
      p.name || p.patientName || '',
      p.status || '',
      p.riskLevel || p.risk || '',
      p.location || p.room || '',
      p.detectionDate || p.date || '',
      p.drugResistance || p.resistantDrugs || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MDR_Patients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeScreenshot = (id) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const updateScreenshotDescription = (id, description) => {
    setScreenshots(prev => prev.map(s => 
      s.id === id ? { ...s, description } : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-600">MDR Patient Report Generator</h1>
          <p className="text-gray-600 mt-2">Generate comprehensive MDR tracking reports with evidence and data</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchMDRData}
            disabled={loading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition shadow-md disabled:opacity-50"
          >
            <Activity size={18} />
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          <button
            onClick={captureScreenshot}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            <Camera size={18} />
            Capture Screenshot
          </button>
        </div>
      </div>

      {/* MDR Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold">Total MDR Cases</p>
              <p className="text-3xl font-bold text-red-700 mt-2">{mdrData.length}</p>
            </div>
            <Users className="text-red-500" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-semibold">Active Cases</p>
              <p className="text-3xl font-bold text-orange-700 mt-2">
                {Array.isArray(mdrData) ? mdrData.filter(p => p.status === 'Active' || p.status === 'active').length : 0}
              </p>
            </div>
            <Activity className="text-orange-500" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-semibold">High Risk</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">
                {Array.isArray(mdrData) ? mdrData.filter(p => p.riskLevel === 'Critical' || p.riskLevel === 'High').length : 0}
              </p>
            </div>
            <AlertTriangle className="text-purple-500" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold">Screenshots</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{screenshots.length}</p>
            </div>
            <Camera className="text-blue-500" size={40} />
          </div>
        </Card>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Report Configuration" className="lg:col-span-2">
          <div className="space-y-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold mb-2">Notes & Observations</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes, observations, or context for this report..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card title="Report Summary">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <FileText className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Report Type</p>
                <p className="font-semibold text-gray-800">
                  {reportTypes.find(r => r.value === reportType)?.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Users className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">MDR Patients</p>
                <p className="font-semibold text-gray-800">{Array.isArray(mdrData) ? mdrData.length : 0} cases</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Camera className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Evidence</p>
                <p className="font-semibold text-gray-800">{screenshots.length} screenshots</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Clock className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Date Range</p>
                <p className="font-semibold text-gray-800 text-xs">
                  {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Screenshots Gallery */}
      {screenshots.length > 0 && (
        <Card title={`Captured Evidence (${screenshots.length})`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {screenshots.map((screenshot, index) => (
              <div key={screenshot.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Screenshot {index + 1}</span>
                  <button
                    onClick={() => removeScreenshot(screenshot.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <img
                  src={screenshot.data}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
                <p className="text-xs text-gray-500 mb-2">{screenshot.timestamp}</p>
                <input
                  type="text"
                  value={screenshot.description}
                  onChange={(e) => updateScreenshotDescription(screenshot.id, e.target.value)}
                  placeholder="Add description..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card title="Generate & Export Report">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={generatePDFReport}
            disabled={isGenerating || !Array.isArray(mdrData) || mdrData.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            {isGenerating ? 'Generating...' : 'Generate PDF Report'}
          </button>

          <button
            onClick={exportJSON}
            disabled={!Array.isArray(mdrData) || mdrData.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition shadow-md disabled:opacity-50"
          >
            <FileText size={20} />
            Export JSON Data
          </button>

          <button
            onClick={exportCSV}
            disabled={!Array.isArray(mdrData) || mdrData.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition shadow-md disabled:opacity-50"
          >
            <Download size={20} />
            Export CSV
          </button>

          <button
            onClick={() => {
              setScreenshots([]);
              setNotes('');
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
              toast.textContent = '🔄 Report cleared successfully!';
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 3000);
            }}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition shadow-md"
          >
            Clear All
          </button>
        </div>

        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>🏥 MDR Report Instructions:</strong> This report includes {Array.isArray(mdrData) ? mdrData.length : 0} MDR patient records from your database. 
            Add screenshots of patient charts, contact tracing maps, or infection spread data. 
            Generate a comprehensive PDF with all evidence for regulatory compliance and medical documentation.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ReportGenerator;
