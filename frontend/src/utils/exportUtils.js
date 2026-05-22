import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';




export function exportToExcel(data, columns, filename = 'export', sheetName = 'Data') {

  const header = columns.map(c => c.label);
  const rows = data.map(row => columns.map(c => c.value(row) ?? ''));

  const wsData = [header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);


  ws['!cols'] = columns.map(c => ({ wch: c.width || 20 }));


  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: '2563EB' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top:    { style: 'thin', color: { rgb: '1D4ED8' } },
        bottom: { style: 'thin', color: { rgb: '1D4ED8' } },
        left:   { style: 'thin', color: { rgb: '1D4ED8' } },
        right:  { style: 'thin', color: { rgb: '1D4ED8' } },
      },
    };
  }


  for (let R = 1; R <= range.e.r; R++) {
    const isEven = R % 2 === 0;
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddr]) ws[cellAddr] = { v: '', t: 's' };
      ws[cellAddr].s = {
        fill: { fgColor: { rgb: isEven ? 'EFF6FF' : 'FFFFFF' } },
        font: { sz: 10, color: { rgb: '0F172A' } },
        alignment: { vertical: 'center', wrapText: true },
        border: {
          top:    { style: 'thin', color: { rgb: 'CBD5E1' } },
          bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
          left:   { style: 'thin', color: { rgb: 'CBD5E1' } },
          right:  { style: 'thin', color: { rgb: 'CBD5E1' } },
        },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);


  XLSX.writeFile(wb, `${filename}.xlsx`, { bookSST: false, cellStyles: true });
}




export function exportToPDF(data, columns, filename = 'export', title = 'Data Export') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });


  const now = new Date().toLocaleString('id-ID', {
    dateStyle: 'long', timeStyle: 'short',
  });

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 297, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dicetak: ${now}`, 297 - 14, 13, { align: 'right' });


  doc.setFillColor(29, 78, 216);
  doc.roundedRect(14, 25, 55, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${data.length} data`, 41.5, 30.5, { align: 'center' });


  autoTable(doc, {
    startY: 37,
    head: [columns.map(c => c.label)],
    body: data.map(row => columns.map(c => c.value(row) ?? '-')),
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
      overflow: 'linebreak',
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255],
    },
    bodyStyles: {
      textColor: [15, 23, 42],
    },
    columnStyles: Object.fromEntries(
      columns.map((c, i) => [i, { cellWidth: c.pdfWidth || 'auto', halign: c.align || 'left' }])
    ),
    tableLineColor: [203, 213, 225],
    tableLineWidth: 0.2,
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {

      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        297 / 2,
        doc.internal.pageSize.height - 6,
        { align: 'center' }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}




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




export function downloadTemplate(columns, filename = 'template') {
  const header = columns.map(c => c.label);
  const exampleRow = columns.map(c => c.example || '');
  const ws = XLSX.utils.aoa_to_sheet([header, exampleRow]);
  ws['!cols'] = columns.map(c => ({ wch: c.width || 20 }));

  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: '059669' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  for (let C = range.s.c; C <= range.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: 1, c: C });
    if (!ws[addr]) ws[addr] = { v: '', t: 's' };
    ws[addr].s = {
      font: { italic: true, color: { rgb: '64748B' }, sz: 10 },
      fill: { fgColor: { rgb: 'F0FDF4' } },
      alignment: { horizontal: 'left' },
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, `${filename}_template.xlsx`, { cellStyles: true });
}
