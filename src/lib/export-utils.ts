import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { WorkOrder, SystemSettings } from './types';

/**
 * Generate and download PDF Daily Engineering Report
 */
export function exportDailyReportPdf(
  workOrders: WorkOrder[],
  settings: SystemSettings,
  reportDate: string = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(30, 41, 59); // Dark slate
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.hotelName.toUpperCase(), 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Hotel Engineering Reporting Portal — Daily Summary`, 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(`Date: ${reportDate}`, 14, 28);

  // Summary Metrics Box
  const total = workOrders.length;
  const completed = workOrders.filter(w => w.status === 'COMPLETED' || w.status === 'CLOSED').length;
  const p1 = workOrders.filter(w => w.priority === 'P1').length;
  const p2 = workOrders.filter(w => w.priority === 'P2').length;
  const inProgress = workOrders.filter(w => w.status === 'IN_PROGRESS').length;
  const waiting = workOrders.filter(w => w.status === 'WAITING').length;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 38, 182, 22, 2, 2, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total WO: ${total}`, 20, 48);
  doc.text(`Completed: ${completed}`, 52, 48);
  doc.text(`In Progress: ${inProgress}`, 86, 48);
  doc.text(`P1 Emergency: ${p1}`, 122, 48);
  doc.text(`Waiting: ${waiting}`, 160, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated at ${new Date().toLocaleTimeString()} by Hotel Engineering Reporting Portal`, 20, 55);

  // Table of Work Orders
  const tableData = workOrders.map(wo => [
    wo.workOrderNumber,
    wo.priority,
    wo.location + (wo.roomNumber ? ` (${wo.roomNumber})` : ''),
    wo.title.length > 32 ? wo.title.slice(0, 30) + '...' : wo.title,
    wo.departmentName,
    wo.assignedTechnicianName || 'Unassigned',
    wo.status.replace(/_/g, ' '),
  ]);

  autoTable(doc, {
    startY: 66,
    head: [['WO Number', 'Pri', 'Location', 'Issue Title', 'Dept', 'Technician', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 32 },
      3: { cellWidth: 46 },
      4: { cellWidth: 24 },
      5: { cellWidth: 26 },
      6: { cellWidth: 20, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        if (data.cell.raw === 'P1') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'P2') {
          data.cell.styles.textColor = [234, 88, 12];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Footer / Sign-off section
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  if (finalY < 250) {
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    
    doc.line(14, finalY + 22, 70, finalY + 22);
    doc.text('Duty Engineer Sign-off', 14, finalY + 27);

    doc.line(140, finalY + 22, 196, finalY + 22);
    doc.text('Supervisor / GM Verified', 140, finalY + 27);
  }

  doc.save(`Engineering_Daily_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generate and download Excel report with ExcelJS
 */
export async function exportWorkOrdersToExcel(
  workOrders: WorkOrder[],
  settings: SystemSettings,
  fileName = 'Hotel_Engineering_Work_Orders'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Hotel Engineering Reporting Portal';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Work Orders');

  // Title Row
  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${settings.hotelName} — Engineering Work Orders`;
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 30;

  // Subtitle Row
  worksheet.mergeCells('A2:J2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Export Date: ${new Date().toLocaleString()} | Total Records: ${workOrders.length}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  // Headers
  const headerRow = worksheet.getRow(4);
  headerRow.values = [
    'WO Number',
    'Priority',
    'Status',
    'Category',
    'Department',
    'Location',
    'Room',
    'Problem Title',
    'Reported By',
    'Assigned Tech',
    'Reported At',
  ];

  headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
  headerRow.height = 24;

  // Data Rows
  workOrders.forEach((wo) => {
    const row = worksheet.addRow([
      wo.workOrderNumber,
      wo.priority,
      wo.status.replace(/_/g, ' '),
      wo.category,
      wo.departmentName,
      wo.location,
      wo.roomNumber || '-',
      wo.title,
      wo.reportedBy,
      wo.assignedTechnicianName || 'Unassigned',
      new Date(wo.reportedAt).toLocaleString(),
    ]);

    // Priority color highlighting
    const priCell = row.getCell(2);
    if (wo.priority === 'P1') {
      priCell.font = { color: { argb: 'FFDC2626' }, bold: true };
    } else if (wo.priority === 'P2') {
      priCell.font = { color: { argb: 'FFEA580C' }, bold: true };
    }
  });

  // Adjust column widths
  worksheet.columns = [
    { width: 16 }, // WO Number
    { width: 10 }, // Priority
    { width: 18 }, // Status
    { width: 18 }, // Category
    { width: 20 }, // Dept
    { width: 20 }, // Location
    { width: 10 }, // Room
    { width: 36 }, // Title
    { width: 22 }, // Reported By
    { width: 22 }, // Tech
    { width: 22 }, // Reported At
  ];

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
