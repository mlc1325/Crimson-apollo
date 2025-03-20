// pdfGenerator.ts
import { jsPDF } from 'jspdf';
import type { OptimizedLease } from './leaseOptimizer';

/**
 * Generates and downloads a PDF report.
 * The report includes a table with unit numbers, original and optimized lease dates,
 * and a summary distribution of the optimized lease dates.
 */
export function generatePDF(
  optimizedLeases: OptimizedLease[],
  distribution: Record<string, number>
): void {
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(12);
  doc.text('Lease Optimization Report', 10, y);
  y += 10;
  doc.text('Lease Details:', 10, y);
  y += 10;

  // Table headers.
  doc.text('Unit Number', 10, y);
  doc.text('Original Lease End', 50, y);
  doc.text('Optimized Lease End', 110, y);
  y += 10;

  // List each lease record. Handle page breaks if needed.
  optimizedLeases.forEach((record) => {
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
    doc.text(String(record.unitNumber), 10, y);
    doc.text(record.originalLeaseEndDate, 50, y);
    doc.text(record.optimizedLeaseEndDate, 110, y);
    y += 10;
  });

  // Add summary distribution.
  y += 10;
  doc.text('Lease Distribution Summary:', 10, y);
  y += 10;
  Object.entries(distribution).forEach(([date, count]) => {
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
    doc.text(`${date}: ${count}`, 10, y);
    y += 10;
  });

  doc.save('Lease_Optimization_Report.pdf');
}