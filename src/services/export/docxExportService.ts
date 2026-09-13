import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
  PageOrientation,
  ImageRun,
  BorderStyle
} from 'docx';
import { GeneratedMaterial, SavedMaterial } from '../../types';
import { ExportService } from './index';

// Helper to convert image URL or SVG to PNG Uint8Array buffer & proportional size for docx
async function getImageBufferAndDimensions(
  urlOrData: string,
  maxWidthPt: number = 450
): Promise<{ data: Uint8Array; width: number; height: number } | null> {
  if (!urlOrData) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let src = urlOrData;
    if (urlOrData.startsWith('<svg')) {
      src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(urlOrData);
    }

    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || 500;
        const naturalHeight = img.naturalHeight || 300;
        const aspectRatio = naturalHeight / naturalWidth;

        const canvas = document.createElement('canvas');
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }

        const pngDataUrl = canvas.toDataURL('image/png');
        const base64 = pngDataUrl.split(',')[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const targetWidth = Math.min(maxWidthPt, naturalWidth);
        const targetHeight = targetWidth * aspectRatio;

        resolve({
          data: bytes,
          width: Math.round(targetWidth),
          height: Math.round(targetHeight)
        });
      } catch (err) {
        console.warn('Docx image processing fallback warning:', err);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export class DocxExportService implements ExportService {
  async export(
    data: GeneratedMaterial | SavedMaterial,
    imageSizes: Record<string, 'small' | 'medium' | 'large'> = {}
  ): Promise<void> {
    const material: GeneratedMaterial = 'generatedContent' in data ? data.generatedContent : data;
    const isLandscape = material.pageOrientation === 'landscape';
    const maxImgWidth = isLandscape ? 650 : 450;

    const schoolText =
      material.schoolLevel === 'elementary'
        ? '초등'
        : material.schoolLevel === 'middle'
        ? '중등'
        : material.schoolLevel === 'high'
        ? '고등'
        : '초·중·고';

    const schoolSubjectHeader = `${schoolText} · ${material.subject || '특수교육/UDL'}`;

    const children: Paragraph[] = [];

    // Header Badge / Subtitle
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: `[ ${schoolSubjectHeader} ]`,
            bold: true,
            size: 20, // 10pt
            color: '0F172A',
            font: 'Malgun Gothic'
          })
        ]
      })
    );

    // Title
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: material.title || '학생 맞춤형 교수적 수정 학습자료',
            bold: true,
            size: 32, // 16pt
            color: '0F172A',
            font: 'Malgun Gothic'
          })
        ]
      })
    );

    // Divider Line
    children.push(
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: '───────────────────────────────────────────────────────────',
            color: '94A3B8',
            font: 'Malgun Gothic'
          })
        ]
      })
    );

    // 1. 핵심 개념
    if (material.coreConcept) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 150, after: 100 },
          children: [
            new TextRun({
              text: '1. 핵심 개념',
              bold: true,
              size: 26, // 13pt
              color: '0F172A',
              font: 'Malgun Gothic'
            })
          ]
        })
      );

      children.push(
        new Paragraph({
          spacing: { after: 250 },
          children: [
            new TextRun({
              text: material.coreConcept,
              size: 22, // 11pt
              color: '1E293B',
              font: 'Malgun Gothic'
            })
          ]
        })
      );
    }

    // 2. 핵심어
    if (material.keywords && material.keywords.length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 150, after: 100 },
          children: [
            new TextRun({
              text: '2. 핵심어',
              bold: true,
              size: 26,
              color: '0F172A',
              font: 'Malgun Gothic'
            })
          ]
        })
      );

      children.push(
        new Paragraph({
          spacing: { after: 250 },
          children: [
            new TextRun({
              text: material.keywords.join('   |   '),
              bold: true,
              size: 22,
              color: '1E293B',
              font: 'Malgun Gothic'
            })
          ]
        })
      );
    }

    // 3. 학습 내용 (설명 + 시각자료)
    if (material.simplifiedContent) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 150, after: 100 },
          children: [
            new TextRun({
              text: '3. 학습 내용',
              bold: true,
              size: 26,
              color: '0F172A',
              font: 'Malgun Gothic'
            })
          ]
        })
      );

      const contentLines = material.simplifiedContent.split('\n');
      contentLines.forEach((line) => {
        const cleanLine = line.replace(/\*\*/g, '').replace(/📌/g, '').trim();
        if (cleanLine) {
          children.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: cleanLine,
                  size: 22,
                  color: '1E293B',
                  font: 'Malgun Gothic'
                })
              ]
            })
          );
        }
      });
    }

    // Embed Generated Visuals (Images fit document width without clipping)
    if (material.visuals && material.visuals.length > 0) {
      for (let i = 0; i < material.visuals.length; i++) {
        const v = material.visuals[i];
        const prefSize = imageSizes[v.id] || 'medium';
        const targetMaxWidth = prefSize === 'small' ? 240 : prefSize === 'large' ? 600 : maxImgWidth;
        const processedImg = await getImageBufferAndDimensions(v.imageUrl, targetMaxWidth);

        children.push(
          new Paragraph({
            spacing: { before: 150, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `[학습 시각자료 ${i + 1}] ${v.description}`,
                bold: true,
                size: 22,
                color: '334155',
                font: 'Malgun Gothic'
              })
            ]
          })
        );

        if (processedImg) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new ImageRun({
                  data: processedImg.data,
                  transformation: {
                    width: processedImg.width,
                    height: processedImg.height
                  },
                  type: 'png'
                })
              ]
            })
          );
        }
      }
    }

    // 4. 학습 활동 및 확인 문항 (Word 문서에서도 2페이지로 자동 분원하도록 pageBreakBefore 지원)
    if (material.activities && material.activities.length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          pageBreakBefore: true,
          spacing: { before: 250, after: 150 },
          children: [
            new TextRun({
              text: '4. 학습 활동 및 확인 문항',
              bold: true,
              size: 26,
              color: '0F172A',
              font: 'Malgun Gothic'
            })
          ]
        })
      );

      material.activities.forEach((act) => {
        children.push(
          new Paragraph({
            spacing: { before: 150, after: 80 },
            children: [
              new TextRun({
                text: act.title,
                bold: true,
                size: 24,
                color: '0F172A',
                font: 'Malgun Gothic'
              })
            ]
          })
        );

        const actLines = act.content.split('\n');
        actLines.forEach((line) => {
          children.push(
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                  color: '334155',
                  font: 'Malgun Gothic'
                })
              ]
            })
          );
        });

        if (act.options && act.options.length > 0) {
          const optionsText = act.options.map(opt => `☐ ${opt}`).join('      ');
          children.push(
            new Paragraph({
              spacing: { before: 100, after: 150 },
              children: [
                new TextRun({
                  text: optionsText,
                  size: 22,
                  color: '1E293B',
                  bold: true,
                  font: 'Malgun Gothic'
                })
              ]
            })
          );
        }
      });
    }

    // 5. 교사용 정답 및 참고사항 (하단 별도 구분)
    if (material.teacherNote || material.summaryNote) {
      children.push(
        new Paragraph({
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({
              text: '───────────────────────────────────────────────────────────',
              color: 'CBD5E1',
              font: 'Malgun Gothic'
            })
          ]
        })
      );

      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 100, after: 100 },
          children: [
            new TextRun({
              text: '📌 교사용 참고사항 & 정답 안내',
              bold: true,
              size: 24,
              color: '475569',
              font: 'Malgun Gothic'
            })
          ]
        })
      );

      if (material.summaryNote) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `• 수정 적용 내역: ${material.summaryNote}`,
                size: 20,
                color: '64748B',
                font: 'Malgun Gothic'
              })
            ]
          })
        );
      }

      if (material.teacherNote) {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `• 지도 지침 / 요구사항: ${material.teacherNote}`,
                size: 20,
                color: '64748B',
                font: 'Malgun Gothic'
              })
            ]
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT
              }
            }
          },
          children
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const sanitizedTitle = (material.title || '학습자료').replace(/[^a-zA-Z0-9가-힣\s_-]/g, '').trim();
    const fileName = `${sanitizedTitle || '학생용자료'}.docx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
