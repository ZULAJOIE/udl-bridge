import { GeneratedMaterial, SavedMaterial } from '../../types';

export interface ExportService {
  export(data: GeneratedMaterial | SavedMaterial, options?: any): Promise<void>;
}

export { DocxExportService } from './docxExportService';
export { PdfExportService } from './pdfExportService';
