/**
 * Client-side PDF Generation Utility
 * Uses html2canvas and jsPDF for generating PDFs in the browser
 * This eliminates the need for server-side Puppeteer
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Generate PDF from an HTML element
 * @param element - HTML element to convert to PDF
 * @param options - PDF generation options
 * @returns Promise<Blob> - PDF as blob
 */
export async function generatePDFFromElement(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<Blob> {
  const {
    quality = 2,
    scale = 2,
    format = 'letter',
    orientation = 'portrait',
  } = options;

  // Create canvas from HTML element
  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  // Calculate dimensions
  const imgData = canvas.toDataURL('image/jpeg', quality);
  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'pt',
    format: format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Calculate image dimensions to fit page
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add image to PDF, handling multi-page content
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // Return as blob
  return pdf.output('blob');
}

/**
 * Download PDF directly from an HTML element
 * @param element - HTML element to convert to PDF
 * @param filename - Filename for the downloaded PDF
 * @param options - PDF generation options
 */
export async function downloadPDFFromElement(
  element: HTMLElement,
  filename: string = 'resume.pdf',
  options: PDFOptions = {}
): Promise<void> {
  const blob = await generatePDFFromElement(element, options);
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate PDF from HTML string
 * @param htmlContent - HTML string to convert to PDF
 * @param options - PDF generation options
 * @returns Promise<Blob> - PDF as blob
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  options: PDFOptions = {}
): Promise<Blob> {
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '816px'; // Standard letter width at 96 DPI
  
  document.body.appendChild(container);

  try {
    const blob = await generatePDFFromElement(container, options);
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Download PDF from HTML string
 * @param htmlContent - HTML string to convert to PDF
 * @param filename - Filename for the downloaded PDF
 * @param options - PDF generation options
 */
export async function downloadPDFFromHTML(
  htmlContent: string,
  filename: string = 'resume.pdf',
  options: PDFOptions = {}
): Promise<void> {
  const blob = await generatePDFFromHTML(htmlContent, options);
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Preview PDF in a new window/tab
 * @param blob - PDF blob
 */
export function previewPDF(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Note: URL should be revoked when no longer needed
  // Consider using a cleanup mechanism
}
