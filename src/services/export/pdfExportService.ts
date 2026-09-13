import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GeneratedMaterial, SavedMaterial } from '../../types';
import { ExportService } from './index';

export class PdfExportService implements ExportService {
  async export(
    data: GeneratedMaterial | SavedMaterial,
    targetElementId: string = 'student-document-renderer'
  ): Promise<void> {
    const element = document.getElementById(targetElementId);
    if (!element) {
      throw new Error(`Export target element #${targetElementId} not found`);
    }

    const material: GeneratedMaterial = 'generatedContent' in data ? data.generatedContent : data;
    const isLandscape = material.pageOrientation === 'landscape';

    // Capture clean student worksheet container with high DPI
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = isLandscape ? 297 : 210; // A4 width in mm
    const pdfHeight = isLandscape ? 210 : 297; // A4 height in mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const sanitizedTitle = (material.title || '학습자료').replace(/[^a-zA-Z0-9가-힣\s_-]/g, '').trim();
    const fileName = `${sanitizedTitle || '학생용자료'}.pdf`;

    pdf.save(fileName);
  }
}
