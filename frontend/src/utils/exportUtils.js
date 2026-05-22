import XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * EXCEL EXPORT (Using xlsx-js-style for professional formatting)
 */
export function exportToExcel(data, columns, filename = 'export', sheetName = 'Data') {
  // 1. Create worksheet data
  const header = columns.map(c => c.label);
  const rows = data.map(row => columns.map(c => c.value(row) ?? ''));
  
  // Create worksheet from data starting at Row 4 (leaving space for Title & Date)
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows], { origin: 'A3' });

  // 2. Add Title and Metadata
  XLSX.utils.sheet_add_aoa(ws, [
    [sheetName.toUpperCase()],
    [`Generated at: ${new Date().toLocaleString('id-ID')}`]
  ], { origin: 'A1' });

  // 3. Merge Title Row
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } });

  // 4. Set Column Widths
  ws['!cols'] = columns.map(c => ({ wch: c.width || 20 }));

  // 5. Stylings
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Iterate through every cell in the range [0 to end]
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddr]) {
        // Create empty cell for borders if needed
        if (R >= 2) ws[cellAddr] = { v: '', t: 's' };
        else continue;
      }

      // Base style
      ws[cellAddr].s = {
        font: { sz: 10, name: 'Calibri' },
        alignment: { vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: '94A3B8' } },
          bottom: { style: 'thin', color: { rgb: '94A3B8' } },
          left: { style: 'thin', color: { rgb: '94A3B8' } },
          right: { style: 'thin', color: { rgb: '94A3B8' } },
        }
      };

      // Header Title Row (Row 0)
      if (R === 0) {
        ws[cellAddr].s = {
          ...ws[cellAddr].s,
          font: { bold: true, sz: 14, color: { rgb: '1E293B' } },
          alignment: { horizontal: 'center' },
          border: {} // No border for title
        };
      }
      // Metadata Row (Row 1)
      else if (R === 1) {
        ws[cellAddr].s = {
          ...ws[cellAddr].s,
          font: { italic: true, sz: 9, color: { rgb: '64748B' } },
          alignment: { horizontal: 'left' },
          border: {} // No border for metadata
        };
      }
      // Table Header Row (Row 2)
      else if (R === 2) {
        ws[cellAddr].s = {
          ...ws[cellAddr].s,
          fill: { fgColor: { rgb: '2563EB' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium', color: { rgb: '1D4ED8' } },
            bottom: { style: 'medium', color: { rgb: '1D4ED8' } },
            left: { style: 'thin', color: { rgb: '1D4ED8' } },
            right: { style: 'thin', color: { rgb: '1D4ED8' } },
          }
        };
      }
      // Table Data Rows (Row 3+)
      else {
        const isEven = (R - 2) % 2 === 0;
        const colDef = columns[C];
        ws[cellAddr].s = {
          ...ws[cellAddr].s,
          fill: { fgColor: { rgb: isEven ? 'F8FAFC' : 'FFFFFF' } },
          alignment: { 
            horizontal: colDef.align || 'left', 
            vertical: 'center', 
            wrapText: true,
            indent: colDef.align === 'center' ? 0 : 1
          }
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`, { cellStyles: true });
}

/**
 * PDF EXPORT (Highly professional styling)
 */
export function exportToPDF(data, columns, filename = 'export', title = 'Data Export') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const now = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

  // Add Accent Bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 297, 22, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 14);

  // Subtitle / Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exported on: ${now}`, 297 - 14, 14, { align: 'right' });

  // Summary Box
  doc.setFillColor(30, 64, 175);
  doc.roundedRect(14, 25, 40, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Records: ${data.length}`, 34, 30.5, { align: 'center' });

  autoTable(doc, {
    startY: 37,
    head: [columns.map(c => c.label)],
    body: data.map(row => columns.map(c => c.value(row) ?? '-')),
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
      lineColor: [226, 232, 240], // Slate-200
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    columnStyles: Object.fromEntries(
      columns.map((c, i) => [i, { 
        cellWidth: c.pdfWidth || 'auto', 
        halign: c.align || 'left' 
      }])
    ),
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        297 / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * IMPORT FROM EXCEL
 */
export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(jsonData);
      } catch (err) {
        reject(new Error('Gagal membaca file Excel'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsBinaryString(file);
  });
}

/**
 * DOWNLOAD TEMPLATE
 */
export function downloadTemplate(columns, filename = 'template') {
  const header = columns.map(c => c.label);
  const exampleRow = columns.map(c => c.example || '');
  
  // Start headers at Row 2
  const ws = XLSX.utils.aoa_to_sheet([header, exampleRow], { origin: 'A2' });

  // Add Title
  XLSX.utils.sheet_add_aoa(ws, [[`IMPORT TEMPLATE: ${filename.toUpperCase()}`]], { origin: 'A1' });
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } });

  ws['!cols'] = columns.map(c => ({ wch: c.width || 20 }));

  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) {
        if (R >= 1) ws[addr] = { v: '', t: 's' };
        else continue;
      }

      ws[addr].s = {
        font: { sz: 10, name: 'Calibri' },
        alignment: { vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '94A3B8' } },
          bottom: { style: 'thin', color: { rgb: '94A3B8' } },
          left: { style: 'thin', color: { rgb: '94A3B8' } },
          right: { style: 'thin', color: { rgb: '94A3B8' } },
        }
      };

      if (R === 0) {
        ws[addr].s = {
          ...ws[addr].s,
          font: { bold: true, sz: 12, color: { rgb: '065F46' } },
          alignment: { horizontal: 'center' },
          border: {}
        };
      } else if (R === 1) {
        ws[addr].s = {
          ...ws[addr].s,
          fill: { fgColor: { rgb: '059669' } },
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          alignment: { horizontal: 'center' },
        };
      } else if (R === 2) {
        ws[addr].s = {
          ...ws[addr].s,
          font: { italic: true, color: { rgb: '64748B' } },
          fill: { fgColor: { rgb: 'F0FDF4' } },
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, `${filename}_template.xlsx`, { cellStyles: true });
}

