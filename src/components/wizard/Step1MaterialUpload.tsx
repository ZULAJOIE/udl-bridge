import React, { useRef, useState, useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import { SchoolLevel, MaterialFile, MAX_FILE_SIZE_MB, MAX_SOURCE_PAGES } from '../../types';
import { SCHOOL_LEVEL_LABELS, SUBJECTS_BY_LEVEL } from '../../data/udlData';
import {
  BookOpen, Upload, FileText, Image as ImageIcon, Check, Edit3,
  AlertCircle, RefreshCw, X, Sparkles
} from 'lucide-react';

export const Step1MaterialUpload: React.FC = () => {
  const { state, setSchoolLevel, setSubject, setTopic, setSourceText, setMaterialFile, setMustKeepText, setTeacherRequest } = useWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadSampleFireworks = () => {
    setSchoolLevel('middle');
    setSubject('사회');
    setTopic('세계 불꽃 축제, 단순한 불꽃놀이 아닌 도시 자산');
    setMustKeepText('세계 불꽃 축제, 약 295억 원, 도시 자산, 소상공인 매출 증대');
    setTeacherRequest('어려운 경제 어휘(도시 자산, 임시 고용, 소상공인)를 구체적인 예시와 쉬운 말로 설명하고, 선택형 응답 문제로 지원해 주세요.');
    setSourceText(`매년 가을, 밤하늘을 수놓는 ‘세계 불꽃 축제’가 도시의 문화 · 경제 자산으로 자리 잡고 있다는 분석이 나오고 있다. 한국문화관광연구원 서○○ 이사장은 “세계 불꽃 축제는 약 295억 원 규모의 경제 효과가 있다. 불꽃 축제 덕분에 인근 지역 상권이 활기를 띠고, 생활 소비가 확대되어 소상공인 매출 증대와 임시 고용 창출로 이어졌다.”라고 밝혔다. 또한 세계 불꽃 축제에 매년 100만 명 이상이 방문하며, 외국인 관광객의 비중도 꾸준히 늘고 있다고 덧붙였다. - 『아시아경제』, 2025. 9. 15.`);

    const sampleFile: MaterialFile = {
      name: '세계_불꽃_축제_신문기사_예시자료.png',
      type: 'image',
      mimeType: 'image/png',
      size: 358400
    };
    setMaterialFile(sampleFile);
  };

  const [pdfOverPageNotice, setPdfOverPageNotice] = useState<boolean>(false);
  const [fileSizeErrorNotice, setFileSizeErrorNotice] = useState<string | null>(null);
  const [pendingReplaceFile, setPendingReplaceFile] = useState<File | null>(null);

  const schoolLevels: SchoolLevel[] = ['elementary', 'middle', 'high'];
  const subjects = SUBJECTS_BY_LEVEL[state.schoolLevel];

  // Helper to inspect PDF page count
  const inspectPdfPageCount = async (file: File): Promise<number> => {
    try {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder('latin1').decode(buffer);
      const pageMatches = text.match(/\/Type\s*\/Page\b/g);
      if (pageMatches && pageMatches.length > 0) {
        return pageMatches.length;
      }
    } catch (err) {
      console.warn('PDF page inspection fallback:', err);
    }
    return 1;
  };

  // Process File with Validation (1-page check, size limit)
  const processFile = async (file: File, isConfirmedReplace = false) => {
    // 1. Check size limit
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setFileSizeErrorNotice(`파일 용량이 너무 큽니다. ${MAX_FILE_SIZE_MB}MB 이하의 PDF 또는 이미지를 사용해주세요.`);
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isImage && !isPdf) {
      alert('PDF 1쪽 또는 이미지 파일(JPG, JPEG, PNG)만 업로드 가능합니다.');
      return;
    }

    // 2. Check PDF Page Count
    if (isPdf) {
      const pageCount = await inspectPdfPageCount(file);
      if (pageCount > MAX_SOURCE_PAGES) {
        setPdfOverPageNotice(true);
        return;
      }
    }

    // 3. Check Replacement Confirmation if file already exists
    if (state.materialFile && !isConfirmedReplace) {
      setPendingReplaceFile(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64Data = dataUrl ? dataUrl.split(',')[1] : undefined;

      const materialFile: MaterialFile = {
        name: file.name || '캡처_붙여넣기_자료.png',
        type: isImage ? 'image' : 'pdf',
        mimeType: file.type || (isImage ? 'image/png' : 'application/pdf'),
        size: file.size,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        base64Data
      };

      setMaterialFile(materialFile);
      setPdfOverPageNotice(false);
      setFileSizeErrorNotice(null);
      setPendingReplaceFile(null);
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste Event Handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const pastedFile = new File([blob], `캡처_붙여넣기_자료_${Date.now()}.png`, {
              type: blob.type || 'image/png'
            });
            processFile(pastedFile);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [state.materialFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Section Title */}
      <div>
        <div className="flex items-center gap-2 text-forest-700 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>STEP 1</span>
          <span>•</span>
          <span>수업자료 업로드</span>
        </div>
        <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
          <FileText className="w-6 h-6 text-forest-600" />
          수정할 원본 수업자료 한 장을 넣어주세요
        </h2>
        <p className="text-xs text-charcoal-500 mt-1 font-medium">
          PDF 또는 이미지 · 1장
        </p>
      </div>

      {/* 1. School Level */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-charcoal-600">1. 학교급 선택</label>
        <div className="grid grid-cols-3 gap-3">
          {schoolLevels.map(lvl => {
            const isSelected = state.schoolLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSchoolLevel(lvl)}
                className={`py-3 px-4 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
                  isSelected
                    ? 'bg-forest-600 text-white border-forest-600'
                    : 'bg-white hover:bg-oat-50 text-charcoal-600 border-border'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
                <span>{SCHOOL_LEVEL_LABELS[lvl]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Subject Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-600 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sage-600" />
            2. 교과목 선택 ({SCHOOL_LEVEL_LABELS[state.schoolLevel]})
          </label>
          <span className="text-xs text-charcoal-400">선택: <span className="text-forest-700 font-bold">{state.subject}</span></span>
        </div>

        <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-oat-50 border border-border">
          {subjects.map(subj => {
            const isSelected = state.subject === subj;
            return (
              <button
                key={subj}
                type="button"
                onClick={() => setSubject(subj)}
                className={isSelected ? 'chip-selected px-3 py-1.5 text-xs' : 'chip px-3 py-1.5 text-xs'}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Material File Upload Area (MVP 1-Page + Clipboard Paste) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-600 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-forest-600" />
            <span>3. 학습자료 업로드</span>
          </label>
          <span className="text-xs text-charcoal-400">PDF 1쪽 또는 이미지 1장 사용</span>
        </div>

        {/* Quick Sample Material Banner */}
        <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-600 text-white flex items-center justify-center shrink-0 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest-900">
                예시 자료로 빠르게 체험해보세요!
              </p>
              <p className="text-[11px] text-forest-700 font-medium">
                📰 『세계 불꽃 축제, 단순한 불꽃놀이 아닌 도시 자산』 신문기사 예시
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoadSampleFireworks}
            className="btn-primary px-3 py-1.5 text-xs shrink-0 flex items-center gap-1 font-bold shadow-xs hover:scale-102 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>예시 자료 불러오기</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,image/jpeg,image/png,image/jpg"
          className="hidden"
        />

        {/* File Size Error Alert */}
        {fileSizeErrorNotice && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{fileSizeErrorNotice}</span>
            </div>
            <button onClick={() => setFileSizeErrorNotice(null)} className="text-charcoal-400 hover:text-charcoal">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Uploaded Material Card */}
        {state.materialFile ? (
          <div className="p-4 rounded-xl bg-white border border-forest-200 flex items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3 overflow-hidden">
              {state.materialFile.type === 'image' ? (
                state.materialFile.previewUrl ? (
                  <img
                    src={state.materialFile.previewUrl}
                    alt="미리보기"
                    className="w-14 h-14 object-cover rounded-lg border border-border shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-sage-100 border border-sage-300 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6 text-sage-700" />
                  </div>
                )
              ) : (
                <div className="w-12 h-12 rounded-lg bg-oat-100 border border-border flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-brown-600" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-charcoal truncate flex items-center gap-1">
                    {state.materialFile.type === 'image' ? '🖼' : '📄'} {state.materialFile.name}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 mt-0.5 font-medium">
                  {state.materialFile.type.toUpperCase()} · 1쪽 · {formatFileSize(state.materialFile.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary px-3.5 py-1.5 text-xs"
              >
                교체
              </button>
              <button
                type="button"
                onClick={() => setMaterialFile(null)}
                className="btn-danger-ghost px-3.5 py-1.5 text-xs"
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          /* Empty Upload Box (Requirement UI) */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            tabIndex={0}
            className="p-8 rounded-xl border-2 border-dashed border-border hover:border-forest-400 bg-oat-50 hover:bg-oat-100/60 transition-all text-center space-y-4 group flex flex-col items-center justify-center min-h-[220px] focus:outline-none focus:border-forest-400"
          >
            <div className="w-12 h-12 rounded-xl bg-sage-100 border border-sage-300 flex items-center justify-center text-forest-700 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-charcoal flex items-center justify-center gap-1.5">
                <span>📎 PDF 또는 이미지 1장을 올려주세요</span>
              </p>

              <div className="flex justify-center pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary px-4 py-2 text-xs font-extrabold"
                >
                  <span>[ 파일 선택 ]</span>
                </button>
              </div>

              <p className="text-xs text-charcoal-400 font-mono">
                PDF · JPG · JPEG · PNG
              </p>

              <div className="pt-2 border-t border-border max-w-xs mx-auto">
                <p className="text-xs text-forest-700 font-semibold flex items-center justify-center gap-1">
                  <span>또는 화면 캡처 후</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-border text-charcoal-600">
                    Ctrl+V / Cmd+V
                  </span>
                  <span>로 붙여넣기</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Original Material Text Scanning & Extraction Area (Core Requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-600 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-forest-600" />
            <span>4. 원본 수업자료 텍스트 내용 (스캔 및 분석 원문)</span>
          </label>
          <span className="text-[11px] text-forest-700 font-bold bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
            ✨ AI 학습지 생성 필수 반영 원문
          </span>
        </div>

        <p className="text-xs text-charcoal-500">
          업로드한 이미지/PDF의 텍스트가 자동으로 스캔 분석됩니다. 필요 시 직접 텍스트를 입력하거나 수정하실 수 있습니다.
        </p>

        <textarea
          rows={4}
          value={state.sourceText || ''}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="업로드한 파일이나 교과서/신문기사 원문 내용이 여기에 스캔되어 입력됩니다. 직접 복사하여 붙여넣으셔도 좋습니다."
          className="input-field px-4 py-3 text-xs leading-relaxed font-sans"
        />
      </div>

      {/* 5. Optional Core Topic */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-charcoal-600 flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-brown-600" />
          5. 단원/주제 제목 (선택 입력)
        </label>
        <input
          type="text"
          value={state.topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: 세계 불꽃 축제의 경제 자산 가치, 광합성의 원리"
          className="input-field px-4 py-3 text-sm"
        />
      </div>

      {/* PDF OVER-PAGE NOTICE MODAL (Requirement 4) */}
      {pdfOverPageNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-brown-300 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-brown-50 text-brown-600 border border-brown-300 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-charcoal">PDF 페이지 수 안내</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed font-semibold">
                  현재 버전에서는 <span className="text-brown-600 font-bold">PDF 1쪽씩</span> 교수적 수정할 수 있어요.
                </p>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  이번 수업에서 수정할 페이지 한 장만 PDF로 저장하거나, 필요한 화면을 캡처해 붙여넣어 주세요.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPdfOverPageNotice(false);
                  fileInputRef.current?.click();
                }}
                className="btn-primary px-4 py-2 text-xs"
              >
                [ 다른 파일 선택 ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPLACE CONFIRMATION MODAL (Requirement 5) */}
      {pendingReplaceFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-sage-100 text-forest-700 border border-sage-300 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-charcoal">자료 교체 확인</h3>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  현재 자료를 새 자료로 교체하시겠습니까?
                </p>
                <div className="mt-2 text-[11px] text-charcoal-500 font-mono bg-oat-50 p-2 rounded border border-border">
                  새 파일: <span className="text-charcoal font-semibold">{pendingReplaceFile.name}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingReplaceFile(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => processFile(pendingReplaceFile, true)}
                className="btn-primary px-4 py-2 text-xs"
              >
                교체
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
