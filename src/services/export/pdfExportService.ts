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

    // Find all discrete A4 page sheets inside target container
    const pageSheets = Array.from(container.querySelectorAll('.a4-page-sheet')) as HTMLElement[];
    const elementsToCapture = pageSheets.length > 0 ? pageSheets : [container];

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

    const sanitizedTitle = (material.title || '학습자료').replace(/[^a-zA-Z0-9가-힣\s_-]/g, '').trim();
    const fileName = `${sanitizedTitle || '학생용자료'}.pdf`;

    pdf.save(fileName);
  }
}
