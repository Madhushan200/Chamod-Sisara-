'use client';

import { WorkOrder } from './types';

// 1. Export to Excel (.xlsx) using ExcelJS
export async function exportReportToExcel(
  workOrders: WorkOrder[],
  reportTitle: string = 'ME Colombo Engineering Report',
  dateLabel: string = ''
) {
  try {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ME Colombo Hotel Engineering';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Work Orders Report');

    // Title Row
    worksheet.mergeCells('A1', 'K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `ME COLOMBO — ${reportTitle.toUpperCase()}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }, // Dark Blue
    };
    worksheet.getRow(1).height = 30;

    // Subtitle / Date Range
    worksheet.mergeCells('A2', 'K2');
    const subCell = worksheet.getCell('A2');
    subCell.value = `Generated: ${new Date().toLocaleDateString()} | Period: ${dateLabel || 'All Time'} | Total Records: ${workOrders.length}`;
    subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 20;

    // Blank Row
    worksheet.addRow([]);

    // Table Headers
    const headers = [
      'WO Number',
      'Reported Date/Time',
      'Department',
      'Location / Room',
      'Category',
      'Priority',
      'Status',
      'Issue Title',
      'Description',
      'Assigned Technician',
      'Work Done & Resolution',
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF334155' }, // Slate 700
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'medium' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Populate Data Rows
    workOrders.forEach((wo) => {
      const row = worksheet.addRow([
        wo.workOrderNumber,
        new Date(wo.reportedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        wo.departmentName,
        wo.roomNumber ? `Room ${wo.roomNumber}` : wo.location,
        wo.category,
        wo.priority,
        wo.status,
        wo.title,
        wo.description || '-',
        wo.assignedTechnicianName || 'Unassigned',
        wo.workDone || wo.completionNote || '-',
      ]);

      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.alignment = { vertical: 'middle', wrapText: colNum === 8 || colNum === 9 || colNum === 11 };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Priority column color highlight
        if (colNum === 6) {
          if (cell.value === 'P1') cell.font = { bold: true, color: { argb: 'FFDC2626' } };
          if (cell.value === 'P2') cell.font = { bold: true, color: { argb: 'FFEA580C' } };
          if (cell.value === 'P3') cell.font = { bold: true, color: { argb: 'FFCA8A04' } };
          if (cell.value === 'P4') cell.font = { bold: true, color: { argb: 'FF16A34A' } };
        }
      });
    });

    // Column Widths
    worksheet.columns = [
      { width: 16 }, // WO Number
      { width: 20 }, // Date
      { width: 18 }, // Dept
      { width: 18 }, // Location
      { width: 14 }, // Category
      { width: 10 }, // Priority
      { width: 14 }, // Status
      { width: 28 }, // Title
      { width: 32 }, // Description
      { width: 20 }, // Tech
      { width: 32 }, // Work Done
    ];

    // Download Blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ME_Colombo_${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error generating Excel report:', err);
  }
}

// 2. Export / Print PDF Report using jsPDF
export async function exportReportToPdf(
  workOrders: WorkOrder[],
  reportTitle: string = 'Engineering Maintenance Report',
  dateLabel: string = '',
  stats: {
    total: number;
    completed: number;
    p1Count: number;
    avgSpeed: string;
  }
) {
  try {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('landscape');

    // Header Branding
    doc.setFillColor(30, 58, 138); // Navy
    doc.rect(0, 0, 297, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ME COLOMBO HOTEL — ENGINEERING COMMAND', 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(reportTitle.toUpperCase(), 14, 18);

    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 230, 15);

    // Summary Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Report Period: ${dateLabel || 'All Time'}`, 14, 32);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Total Requests: ${stats.total} | Completed/Closed: ${stats.completed} | P1 Emergencies: ${stats.p1Count} | Avg Response: ${stats.avgSpeed}`,
      14,
      38
    );

    // Table Data
    const tableRows = workOrders.map((wo) => [
      wo.workOrderNumber,
      new Date(wo.reportedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      wo.departmentName,
      wo.roomNumber ? `Room ${wo.roomNumber}` : wo.location,
      wo.category,
      wo.priority,
      wo.status,
      wo.title,
      wo.assignedTechnicianName || 'Unassigned',
      wo.workDone || '-',
    ]);

    autoTable(doc, {
      startY: 44,
      head: [
        [
          'WO #',
          'Reported',
          'Department',
          'Location',
          'Category',
          'Priority',
          'Status',
          'Title',
          'Technician',
          'Work Done',
        ],
      ],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 24 },
        2: { cellWidth: 22 },
        3: { cellWidth: 20 },
        4: { cellWidth: 18 },
        5: { cellWidth: 14 },
        6: { cellWidth: 18 },
        7: { cellWidth: 45 },
        8: { cellWidth: 25 },
        9: { cellWidth: 50 },
      },
    });

    doc.save(`ME_Colombo_${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('Error generating PDF report:', err);
  }
}
