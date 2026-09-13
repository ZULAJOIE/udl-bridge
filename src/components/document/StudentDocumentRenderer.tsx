import React from 'react';
import { GeneratedMaterial, VisualSuggestion } from '../../types';
import { Plus } from 'lucide-react';

interface StudentDocumentRendererProps {
  material: GeneratedMaterial;
  id?: string;
  imageSizes?: Record<string, 'small' | 'medium' | 'large'>;
  selectedSuggestionId?: string | null;
  onSelectVisual?: (suggestionId?: string, visualId?: string) => void;
  isExporting?: boolean;
}

export const StudentDocumentRenderer: React.FC<StudentDocumentRendererProps> = ({
  material,
  id = 'student-document-renderer',
  imageSizes = {},
  selectedSuggestionId = null,
  onSelectVisual,
  isExporting = false
}) => {
  const isLandscape = material.pageOrientation === 'landscape';

  const schoolText =
    material.schoolLevel === 'elementary'
      ? '초등'
      : material.schoolLevel === 'middle'
      ? '중등'
      : material.schoolLevel === 'high'
      ? '고등'
      : '초·중·고';

  const schoolSubjectHeader = `${schoolText} · ${material.subject || '특수교육/UDL'}`;

  // Helper to clean raw markdown lines for document display
  const formatContentLines = (text: string) => {
    if (!text) return [];
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  // Render inline **bold** markdown as actual bold text instead of showing literal asterisks
  const renderInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return text;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  };

  const getImageHeightClass = (visualId: string) => {
    const sz = imageSizes[visualId] || 'medium';
    if (sz === 'small') return 'max-h-[200px]';
    if (sz === 'large') return 'max-h-[480px]';
    return 'max-h-[340px]';
  };

  // Visual Suggestions List (or fallbacks)
  const suggestions: VisualSuggestion[] =
    material.visualSuggestions && material.visualSuggestions.length > 0
      ? material.visualSuggestions
      : [
          {
            id: 'sugg-default-1',
            sectionId: 'concept',
            title: `${material.coreConcept || '학습 주제'} 시각자료`,
            description: '핵심 개념 시각적 보조 자료',
            reason: '개념 시각 보조',
            visualLevel: 3 as const,
            strategies: []
          }
        ];

  return (
    <div
      id={id}
      className="bg-white text-charcoal font-sans p-8 sm:p-12 mx-auto border border-border"
      style={{
        width: isLandscape ? '297mm' : '210mm',
        minHeight: isLandscape ? '210mm' : '297mm',
        boxSizing: 'border-box',
        color: '#30342F',
        backgroundColor: '#ffffff',
        fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif"
      }}
    >
      {/* Header Banner */}
      <div className="border-b-2 border-charcoal pb-4 mb-6 text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-oat-100 text-charcoal-600 text-xs font-extrabold rounded border border-border">
          {schoolSubjectHeader}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          {material.title || '학생용 맞춤 학습자료'}
        </h1>
        <p className="text-xs text-charcoal-400 font-medium">
          특수교육 학생 맞춤형 교수적 수정 학습지 | {isLandscape ? 'A4 가로형' : 'A4 세로형'}
        </p>
      </div>

      {/* 1. 핵심 개념 */}
      {material.coreConcept && (
        <div className="mb-6 space-y-2">
          <h2 className="text-base font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
            <span>1. 핵심 개념</span>
          </h2>
          <div className="p-4 bg-oat-50 rounded-xl border border-border text-sm font-semibold text-charcoal-600 leading-relaxed">
            {renderInlineMarkdown(material.coreConcept)}
          </div>
        </div>
      )}

      {/* 2. 핵심어 */}
      {material.keywords && material.keywords.length > 0 && (
        <div className="mb-6 space-y-2">
          <h2 className="text-base font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
            <span>2. 핵심어</span>
          </h2>
          <div className="flex flex-wrap gap-2 pt-1">
            {material.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-oat-100 text-charcoal text-xs font-bold rounded-lg border border-border"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. 학습 내용 */}
      {material.simplifiedContent && (
        <div className="mb-6 space-y-3">
          <h2 className="text-base font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
            <span>3. 학습 내용</span>
          </h2>
          <div className="space-y-2 text-sm text-charcoal-600 leading-relaxed font-normal">
            {formatContentLines(material.simplifiedContent).map((line, idx) => (
              <p key={idx} className="my-1">
                {renderInlineMarkdown(line)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 🖼️ 학습 시각자료 섹션 (A4 클릭 상호작용 및 플레이스홀더 지원) */}
      <div className="mb-6 space-y-4">
        <h3 className="text-sm font-bold text-charcoal flex items-center gap-1">
          <span>🖼️ 학습 시각자료</span>
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {suggestions.map((sugg, idx) => {
            const visual = (material.visuals || []).find(
              v => v.suggestionId === sugg.id || (sugg.sectionId && v.sectionId === sugg.sectionId)
            );
            const isSelected = selectedSuggestionId === sugg.id || (visual && selectedSuggestionId === visual.id);

            // Case A: Actual Generated or Uploaded Image
            if (visual) {
              return (
                <div
                  key={visual.id || sugg.id || idx}
                  onClick={() => onSelectVisual?.(sugg.id, visual.id)}
                  className={`p-4 bg-stone-50 rounded-xl border transition-all relative group ${
                    !isExporting ? 'cursor-pointer' : ''
                  } ${
                    isSelected && !isExporting
                      ? 'border-forest-500 ring-4 ring-forest-500/15 shadow-md'
                      : 'border-border hover:border-forest-300'
                  }`}
                >
                  {/* Web Preview Only Source Badge */}
                  {!isExporting && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      {visual.source === 'teacher_upload' ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200 shadow-sm">
                          📁 교사 업로드
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-sage-100 text-sage-800 text-[10px] font-bold rounded border border-sage-300 shadow-sm">
                          ✨ AI 생성
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`flex justify-center items-center overflow-hidden ${getImageHeightClass(visual.id)}`}>
                    {visual.imageUrl && visual.imageUrl.startsWith('<svg') ? (
                      <div
                        className={`max-w-full ${getImageHeightClass(visual.id)} flex justify-center items-center object-contain`}
                        dangerouslySetInnerHTML={{ __html: visual.imageUrl }}
                      />
                    ) : (
                      <img
                        src={visual.imageUrl}
                        alt={visual.description}
                        className={`max-w-full ${getImageHeightClass(visual.id)} object-contain rounded-lg shadow-sm`}
                      />
                    )}
                  </div>
                  <p className="text-xs font-bold text-charcoal-600 mt-2 text-center">
                    [그림 {idx + 1}] {visual.description || sugg.title}
                  </p>
                </div>
              );
            }

            // Case B: No image yet -> Web Preview Placeholder (Hidden during DOCX/PDF export)
            if (!isExporting) {
              return (
                <div
                  key={sugg.id || idx}
                  onClick={() => onSelectVisual?.(sugg.id)}
                  className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-forest-500 bg-sage-50 text-forest-800 ring-2 ring-forest-400/40'
                      : 'border-border bg-oat-50/60 hover:bg-sage-50/60 hover:border-forest-400 text-charcoal-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-forest-700">
                    <Plus className="w-4 h-4 text-forest-600" />
                    <span>+ 이미지 추가 ({sugg.title})</span>
                  </div>
                  <p className="text-[11px] text-charcoal-400 mt-1">
                    클릭하여 오른쪽 패널에서 AI 생성 또는 이미지 파일 직접 업로드
                  </p>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* 4. 학습 활동 및 확인 문항 */}
      {material.activities && material.activities.length > 0 && (
        <div className="mb-6 space-y-4">
          <h2 className="text-base font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
            <span>4. 학습 활동 및 확인 문항</span>
          </h2>
          {material.activities.map((act, idx) => (
            <div key={idx} className="p-4 bg-oat-50/80 rounded-xl border border-border space-y-2">
              <h3 className="text-sm font-bold text-charcoal">{renderInlineMarkdown(act.title)}</h3>
              <div className="text-xs sm:text-sm text-charcoal-600 whitespace-pre-wrap leading-relaxed">
                {renderInlineMarkdown(act.content)}
              </div>

              {/* Options with check marks */}
              {act.options && act.options.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2 text-xs font-semibold text-charcoal-600">
                  {act.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border"
                    >
                      <span className="w-3.5 h-3.5 rounded border border-charcoal-300 inline-block bg-white"></span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5. 교사용 정답 및 안내 */}
      {(material.teacherNote || material.summaryNote) && (
        <div className="mt-8 pt-4 border-t-2 border-dashed border-border text-xs text-charcoal-500 space-y-1.5 bg-oat-50 p-4 rounded-xl">
          <h4 className="font-bold text-charcoal text-xs flex items-center gap-1">
            📌 교사용 참고사항 & 정답 안내
          </h4>
          {material.summaryNote && <p className="text-[11px]">· 수정 적용 내역: {renderInlineMarkdown(material.summaryNote)}</p>}
          {material.teacherNote && <p className="text-[11px]">· 지도 지침 / 요구사항: {renderInlineMarkdown(material.teacherNote)}</p>}
        </div>
      )}
    </div>
  );
};
