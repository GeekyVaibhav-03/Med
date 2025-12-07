import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Parse CSV file for contact tracing data
 * Expected format: personId,personName,roomId,timeIn,timeOut,equipmentIds
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData = results.data.map((row) => ({
            personId: row.personId || row.PersonId,
            personName: row.personName || row.PersonName,
            roomId: row.roomId || row.RoomId,
            timeIn: row.timeIn || row.TimeIn,
            timeOut: row.timeOut || row.TimeOut,
            equipmentIds: row.equipmentIds
              ? row.equipmentIds.split(',').map((id) => id.trim())
              : [],
          }));
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error),
    });
  });
};

/**
 * Parse Excel file for contact tracing data
 */
export const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const parsedData = jsonData.map((row) => ({
          personId: row.personId || row.PersonId,
          personName: row.personName || row.PersonName,
          roomId: row.roomId || row.RoomId,
          timeIn: row.timeIn || row.TimeIn,
          timeOut: row.timeOut || row.TimeOut,
          equipmentIds: row.equipmentIds
            ? String(row.equipmentIds).split(',').map((id) => id.trim())
            : [],
        }));

        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data, filename = 'export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename);
};
