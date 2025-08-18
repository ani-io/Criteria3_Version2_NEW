import * as XLSX from 'xlsx';

/**
 * Parse an Excel or CSV file and return a 2D array of numbers (range 0-3, fallback 0).
 * @param {File} file
 * @returns {Promise<number[][]>} matrix
 */
export function parseFileToMatrix(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Remove header row if present (assume first row is header if any cell is string)
      let startRow = 0;
      if (json.length && json[0].some(cell => typeof cell === 'string')) {
        startRow = 1;
      }
      // Only take first 6 rows and 15 columns
      const matrix = [];
      for (let i = 0; i < 6; i++) {
        const row = (json[startRow + i] || []).slice(0, 15).map(val => {
          let num = parseFloat(val);
          if (isNaN(num) || num < 0) num = 0;
          if (num > 3) num = 3;
          return num;
        });
        while (row.length < 15) row.push(0);
        matrix.push(row);
      }
      resolve(matrix);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
