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

  // Render inline **bold** markdown as actual bold text
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
    if (isLandscape) {
      if (sz === 'small') return 'max-h-[110px]';
      if (sz === 'large') return 'max-h-[200px]';
      return 'max-h-[145px]';
    }
    if (sz === 'small') return 'max-h-[180px]';
    if (sz === 'large') return 'max-h-[420px]';
    return 'max-h-[280px]';
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

  // 📄 Multi-page A4 Splitting Determination Logic
  const hasActivitiesOrNotes =
    (material.activities && material.activities.length > 0) ||
    Boolean(material.teacherNote || material.summaryNote);

  const isLongText = (material.simplifiedContent || '').length > 250 || formatContentLines(material.simplifiedContent || '').length > 6;
  const hasMultipleVisuals = (material.visuals || []).length >= 2 || suggestions.length >= 2;

  // Split into 2 A4 pages if pageLength is 'a4_2', or if auto & content is extensive
  const isTwoPages =
    material.pageLength === 'a4_2' ||
    (material.pageLength !== 'a4_1' && (hasActivitiesOrNotes || isLongText || hasMultipleVisuals));

  // Visual distribution: If 2 pages, first visual goes to Page 1, remaining visuals go to Page 2
  const page1Suggestions = isTwoPages ? suggestions.slice(0, 1) : suggestions;
  const page2Suggestions = isTwoPages ? suggestions.slice(1) : [];

  const pageStyle: React.CSSProperties = {
    width: isLandscape ? '297mm' : '210mm',
    height: isLandscape ? '210mm' : '297mm',
    minHeight: isLandscape ? '210mm' : '297mm',
    maxHeight: isLandscape ? '210mm' : '297mm',
    boxSizing: 'border-box',
    color: '#30342F',
    backgroundColor: '#ffffff',
    fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif",
    overflow: 'hidden'
  };

  return (
    <div id={id} className="flex flex-col items-center gap-8 w-full">
      {/* ──────────────── PAGE 1 ──────────────── */}
      <div
        className={`a4-page-sheet bg-white text-charcoal font-sans mx-auto border border-border shadow-md flex flex-col justify-between ${
          isLandscape ? 'p-6 sm:p-7' : 'p-8 sm:p-12'
        }`}
        style={pageStyle}
      >
        <div className={isLandscape ? 'space-y-3.5' : 'space-y-6'}>
          {/* Header Banner */}
          <div className={`border-b-2 border-charcoal text-center ${isLandscape ? 'pb-2 space-y-1' : 'pb-4 space-y-2'}`}>
            <div className="flex items-center justify-between">
              <span className="inline-block px-3 py-1 bg-oat-100 text-charcoal-600 text-xs font-extrabold rounded border border-border">
                {schoolSubjectHeader}
              </span>
              <span className="text-[11px] font-extrabold text-charcoal-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                {isTwoPages ? 'A4 1 / 2 페이지' : 'A4 1 / 1 페이지'}
              </span>
            </div>
            <h1 className={`${isLandscape ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-extrabold text-charcoal tracking-tight`}>
              {material.title || '학생용 맞춤 학습자료'}
            </h1>
            <p className="text-xs text-charcoal-400 font-medium">
              특수교육 학생 맞춤형 교수적 수정 학습지 | {isLandscape ? 'A4 가로형' : 'A4 세로형'}
            </p>
          </div>

          {/* Core Concept & Keywords (Side-by-side in Landscape mode) */}
          <div className={isLandscape ? 'grid grid-cols-12 gap-3.5' : 'space-y-6'}>
            {/* 1. 핵심 개념 */}
            {material.coreConcept && (
              <div className={`space-y-1.5 ${isLandscape ? 'col-span-7' : ''}`}>
                <h2 className="text-sm sm:text-base font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
                  <span>1. 핵심 개념</span>
                </h2>
                <div className={`bg-oat-50 rounded-xl border border-border text-xs sm:text-sm font-semibold text-charcoal-600 leading-relaxed ${isLandscape ? 'p-2.5' : 'p-4'}`}>
                  {renderInlineMarkdown(material.coreConcept)}
                </div>
              </div>
            )}

            {/* 2. 핵심어 */}
            {material.keywords && material.keywords.length > 0 && (
              <div className={`space-y-1.5 ${isLandscape ? 'col-span-5' : ''}`}>
                <h2 className="text-sm sm:text-base font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
                  <span>2. 핵심어</span>
                </h2>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {material.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-oat-100 text-charcoal text-xs font-bold rounded-lg border border-border"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. 학습 내용 */}
          {material.simplifiedContent && (
            <div className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
                <span>3. 학습 내용</span>
              </h2>
              <div className="space-y-1.5 text-xs sm:text-sm text-charcoal-600 leading-relaxed font-normal">
                {formatContentLines(material.simplifiedContent).slice(0, isLandscape ? 4 : 8).map((line, idx) => (
                  <p key={idx} className="my-0.5">
                    {renderInlineMarkdown(line)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 🖼️ 학습 시각자료 섹션 (Page 1 Visuals) */}
          {page1Suggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-bold text-charcoal flex items-center gap-1">
                <span>🖼️ 학습 시각자료</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {page1Suggestions.map((sugg, idx) => {
                  const visual = (material.visuals || []).find(
                    v => v.suggestionId === sugg.id || (sugg.sectionId && v.sectionId === sugg.sectionId)
                  );
                  const isSelected = selectedSuggestionId === sugg.id || (visual && selectedSuggestionId === visual.id);

                  if (visual) {
                    return (
                      <div
                        key={visual.id || sugg.id || idx}
                        onClick={() => onSelectVisual?.(sugg.id, visual.id)}
                        className={`p-3 bg-stone-50 rounded-xl border transition-all relative group ${
                          !isExporting ? 'cursor-pointer' : ''
                        } ${
                          isSelected && !isExporting
                            ? 'border-forest-500 ring-4 ring-forest-500/15 shadow-md'
                            : 'border-border hover:border-forest-300'
                        }`}
                      >
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
                        <p className="text-[11px] font-bold text-charcoal-600 mt-1.5 text-center">
                          [그림 {idx + 1}] {visual.description || sugg.title}
                        </p>
                      </div>
                    );
                  }

                  if (!isExporting) {
                    return (
                      <div
                        key={sugg.id || idx}
                        onClick={() => onSelectVisual?.(sugg.id)}
                        className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isSelected
                            ? 'border-forest-500 bg-sage-50 text-forest-800 ring-2 ring-forest-400/40'
                            : 'border-border bg-oat-50/60 hover:bg-sage-50/60 hover:border-forest-400 text-charcoal-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-forest-700">
                          <Plus className="w-4 h-4 text-forest-600" />
                          <span>+ 이미지 추가 ({sugg.title})</span>
                        </div>
                        <p className="text-[11px] text-charcoal-400 mt-0.5">
                          클릭하여 오른쪽 패널에서 AI 생성 또는 이미지 파일 직접 업로드
                        </p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}

          {/* If Single Page Mode, render Activities & Notes on Page 1 as well */}
          {!isTwoPages && (
            <>
              {material.activities && material.activities.length > 0 && (
                <div className="space-y-3 pt-1">
                  <h2 className="text-sm sm:text-base font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
                    <span>4. 학습 활동 및 확인 문항</span>
                  </h2>
                  <div className={isLandscape ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-3'}>
                    {material.activities.map((act, idx) => (
                      <div key={idx} className="p-3 bg-oat-50/80 rounded-xl border border-border space-y-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-charcoal">{renderInlineMarkdown(act.title)}</h3>
                        <div className="text-xs text-charcoal-600 whitespace-pre-wrap leading-relaxed">
                          {renderInlineMarkdown(act.content)}
                        </div>
                        {act.options && act.options.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-charcoal-600">
                            {act.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-border text-[11px]">
                                <span className="w-3 h-3 rounded border border-charcoal-300 inline-block bg-white"></span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(material.teacherNote || material.summaryNote) && (
                <div className="pt-2 border-t-2 border-dashed border-border text-xs text-charcoal-500 space-y-1 bg-oat-50 p-3 rounded-xl">
                  <h4 className="font-bold text-charcoal text-xs flex items-center gap-1">
                    📌 교사용 참고사항 & 정답 안내
                  </h4>
                  {material.summaryNote && <p className="text-[11px]">· 수정 적용 내역: {renderInlineMarkdown(material.summaryNote)}</p>}
                  {material.teacherNote && <p className="text-[11px]">· 지도 지침 / 요구사항: {renderInlineMarkdown(material.teacherNote)}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Page 1 Footer */}
        <div className={`border-t border-gray-200 text-center text-[11px] text-charcoal-400 font-mono flex items-center justify-between ${isLandscape ? 'pt-2' : 'pt-6'}`}>
          <span>udl·bridge 학생용 맞춤 학습지</span>
          <span>- {isTwoPages ? '1 / 2' : '1 / 1'} 페이지 -</span>
        </div>
      </div>

      {/* ──────────────── PAGE 2 (If Two Pages Mode) ──────────────── */}
      {isTwoPages && (
        <>
          {/* Page Break Visual Divider Bar (Web Preview Only) */}
          {!isExporting && (
            <div className="w-full flex items-center justify-center gap-3 py-2 my-1 text-xs text-charcoal-500 font-bold border-y border-dashed border-border/80 bg-white/40 rounded-xl">
              <span>✂️ A4 페이지 구분선 (다음 2페이지로 계속됩니다)</span>
            </div>
          )}

          <div
            className={`a4-page-sheet bg-white text-charcoal font-sans mx-auto border border-border shadow-md flex flex-col justify-between ${
              isLandscape ? 'p-6 sm:p-7' : 'p-8 sm:p-12'
            }`}
            style={pageStyle}
          >
            <div className={isLandscape ? 'space-y-3' : 'space-y-6'}>
              {/* Page 2 Header Banner */}
              <div className={`border-b-2 border-charcoal text-center ${isLandscape ? 'pb-2 space-y-1' : 'pb-4 space-y-1.5'}`}>
                <div className="flex items-center justify-between">
                  <span className="inline-block px-3 py-1 bg-oat-100 text-charcoal-600 text-xs font-extrabold rounded border border-border">
                    {schoolSubjectHeader} (이어서)
                  </span>
                  <span className="text-[11px] font-extrabold text-charcoal-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                    A4 2 / 2 페이지
                  </span>
                </div>
                <h1 className={`${isLandscape ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-extrabold text-charcoal tracking-tight`}>
                  {material.title || '학생용 맞춤 학습자료'} (2/2)
                </h1>
              </div>

              {/* Additional Visuals on Page 2 (if any) */}
              {page2Suggestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-charcoal flex items-center gap-1">
                    <span>🖼️ 학습 시각자료 (추가)</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {page2Suggestions.map((sugg, idx) => {
                      const visual = (material.visuals || []).find(
                        v => v.suggestionId === sugg.id || (sugg.sectionId && v.sectionId === sugg.sectionId)
                      );
                      const isSelected = selectedSuggestionId === sugg.id || (visual && selectedSuggestionId === visual.id);

                      if (visual) {
                        return (
                          <div
                            key={visual.id || sugg.id || idx}
                            onClick={() => onSelectVisual?.(sugg.id, visual.id)}
                            className={`p-3 bg-stone-50 rounded-xl border transition-all relative group ${
                              !isExporting ? 'cursor-pointer' : ''
                            } ${
                              isSelected && !isExporting
                                ? 'border-forest-500 ring-4 ring-forest-500/15 shadow-md'
                                : 'border-border hover:border-forest-300'
                            }`}
                          >
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
                            <p className="text-[11px] font-bold text-charcoal-600 mt-1.5 text-center">
                              [그림 {idx + 2}] {visual.description || sugg.title}
                            </p>
                          </div>
                        );
                      }

                      if (!isExporting) {
                        return (
                          <div
                            key={sugg.id || idx}
                            onClick={() => onSelectVisual?.(sugg.id)}
                            className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-forest-500 bg-sage-50 text-forest-800 ring-2 ring-forest-400/40'
                                : 'border-border bg-oat-50/60 hover:bg-sage-50/60 hover:border-forest-400 text-charcoal-400'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-forest-700">
                              <Plus className="w-4 h-4 text-forest-600" />
                              <span>+ 이미지 추가 ({sugg.title})</span>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* 4. 학습 활동 및 확인 문항 */}
              {material.activities && material.activities.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs sm:text-sm font-bold text-charcoal border-b border-border pb-1 flex items-center gap-1.5">
                    <span>4. 학습 활동 및 확인 문항</span>
                  </h2>
                  <div className={isLandscape ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-3'}>
                    {material.activities.map((act, idx) => (
                      <div key={idx} className="p-3 bg-oat-50/80 rounded-xl border border-border space-y-1">
                        <h3 className="text-xs font-bold text-charcoal">{renderInlineMarkdown(act.title)}</h3>
                        <div className="text-[11px] sm:text-xs text-charcoal-600 whitespace-pre-wrap leading-relaxed">
                          {renderInlineMarkdown(act.content)}
                        </div>

                        {/* Options with check marks */}
                        {act.options && act.options.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-charcoal-600">
                            {act.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-border"
                              >
                                <span className="w-3 h-3 rounded border border-charcoal-300 inline-block bg-white"></span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. 교사용 정답 및 안내 */}
              {(material.teacherNote || material.summaryNote) && (
                <div className="pt-2 border-t-2 border-dashed border-border text-[11px] text-charcoal-500 space-y-1 bg-oat-50 p-2.5 rounded-xl">
                  <h4 className="font-bold text-charcoal text-xs flex items-center gap-1">
                    📌 교사용 참고사항 & 정답 안내
                  </h4>
                  {material.summaryNote && <p className="text-[11px]">· 수정 적용 내역: {renderInlineMarkdown(material.summaryNote)}</p>}
                  {material.teacherNote && <p className="text-[11px]">· 지도 지침 / 요구사항: {renderInlineMarkdown(material.teacherNote)}</p>}
                </div>
              )}
            </div>

            {/* Page 2 Footer */}
            <div className={`border-t border-gray-200 text-center text-[11px] text-charcoal-400 font-mono flex items-center justify-between ${isLandscape ? 'pt-2' : 'pt-6'}`}>
              <span>udl·bridge 학생용 맞춤 학습지</span>
              <span>- 2 / 2 페이지 -</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
