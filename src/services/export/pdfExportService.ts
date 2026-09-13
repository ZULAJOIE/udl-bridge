import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GeneratedMaterial, SavedMaterial } from '../../types';
import { ExportService } from './index';

export class PdfExportService implements ExportService {
  async export(
    data: GeneratedMaterial | SavedMaterial,
    targetElementId: string = 'student-document-renderer'
  ): Promise<void> {
    const container = document.getElementById(targetElementId);
    if (!container) {
      throw new Error(`Export target element #${targetElementId} not found`);
    }

    const material: GeneratedMaterial = 'generatedContent' in data ? data.generatedContent : data;
    const isLandscape = material.pageOrientation === 'landscape';

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = isLandscape ? 297 : 210; // A4 width in mm
    const pdfHeight = isLandscape ? 210 : 297; // A4 height in mm

    // Find parent scale wrapper (which applies scale() preview zoom in UI)
    const scaleWrapper = document.getElementById('a4-preview-scale-wrapper');
    const originalTransform = scaleWrapper ? scaleWrapper.style.transform : '';

    // Find all discrete A4 page sheets inside target container
    const pageSheets = Array.from(container.querySelectorAll('.a4-page-sheet')) as HTMLElement[];
    const elementsToCapture = pageSheets.length > 0 ? pageSheets : [container];

    try {
      // Temporarily remove CSS scale transform from live DOM so html2canvas computes exact 1:1 font metrics and layout bounds
      if (scaleWrapper) {
        scaleWrapper.style.transform = 'none';
      }

      // Allow micro-task tick for browser layout engine to update unscaled bounding boxes
      await new Promise(r => setTimeout(r, 60));

      for (let i = 0; i < elementsToCapture.length; i++) {
        const pageEl = elementsToCapture[i];

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
    } finally {
      // Always restore UI zoom scale transform
      if (scaleWrapper) {
        scaleWrapper.style.transform = originalTransform;
      }
    }

    const sanitizedTitle = (material.title || '학습자료').replace(/[^a-zA-Z0-9가-힣\s_-]/g, '').trim();
    const fileName = `${sanitizedTitle || '학생용자료'}.pdf`;

    pdf.save(fileName);
  }
}
