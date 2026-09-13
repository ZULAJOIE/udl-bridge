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

    // Create temporary off-screen container outside of any CSS transform hierarchy
    // This prevents html2canvas from miscalculating font baselines & box heights due to parent scale() transforms
    const captureHost = document.createElement('div');
    captureHost.style.position = 'fixed';
    captureHost.style.left = '-9999px';
    captureHost.style.top = '0px';
    captureHost.style.width = isLandscape ? '297mm' : '210mm';
    captureHost.style.height = 'auto';
    captureHost.style.zIndex = '-9999';
    captureHost.style.transform = 'none';
    captureHost.style.pointerEvents = 'none';
    document.body.appendChild(captureHost);

    try {
      for (let i = 0; i < elementsToCapture.length; i++) {
        const pageEl = elementsToCapture[i];

        // Clone page element to unscaled capture host
        const clone = pageEl.cloneNode(true) as HTMLElement;
        clone.style.transform = 'none';
        clone.style.margin = '0';
        clone.style.width = isLandscape ? '297mm' : '210mm';
        clone.style.height = isLandscape ? '210mm' : '297mm';
        clone.style.maxHeight = isLandscape ? '210mm' : '297mm';
        clone.style.boxSizing = 'border-box';
        clone.style.overflow = 'hidden';

        captureHost.appendChild(clone);

        // Allow micro-task tick for fonts & layout to render in cloned DOM
        await new Promise(r => setTimeout(r, 60));

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        captureHost.removeChild(clone);

        const imgData = canvas.toDataURL('image/png');

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
    } finally {
      if (document.body.contains(captureHost)) {
        document.body.removeChild(captureHost);
      }
    }

    const sanitizedTitle = (material.title || '학습자료').replace(/[^a-zA-Z0-9가-힣\s_-]/g, '').trim();
    const fileName = `${sanitizedTitle || '학생용자료'}.pdf`;

    pdf.save(fileName);
  }
}
