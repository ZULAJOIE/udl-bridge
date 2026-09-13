import React, { useState, useEffect, useRef } from 'react';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import {
  GeneratedMaterial,
  MaterialActivity,
  VisualSuggestion,
  GeneratedVisual,
  VisualFormatStyle,
  VISUAL_STYLE_LABELS,
  WorksheetVerificationResult
} from '../../types';
import { saveMaterial, logUsageEvent } from '../../services/dataService';
import { DocxExportService, PdfExportService } from '../../services/export';
import { StudentDocumentRenderer } from '../document/StudentDocumentRenderer';
import { FloatingReferenceWindow } from './FloatingReferenceWindow';
import { defaultAiProvider, getFallbackEducationalSvg } from '../../services/aiProvider';
import { Tooltip } from '../common/Tooltip';
import { RichHoverCard } from '../common/RichHoverCard';
import { AiVerificationModal } from '../common/AiVerificationModal';
import { EducationalImageGuidelinesModal } from '../common/EducationalImageGuidelinesModal';
import {
  FileText, Sparkles, Edit3, BookmarkPlus, Copy, RefreshCw, Check, ArrowLeft, Wand2,
  Download, Code, Eye, Plus, Minus, X, Image as ImageIcon, Trash2, Upload, ShieldCheck, HelpCircle
} from 'lucide-react';

interface MaterialResultViewProps {
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  onBackToWizard: () => void;
  onNavigateToMyMaterials: () => void;
}

export const MaterialResultView: React.FC<MaterialResultViewProps> = ({
  onShowToast,
  onBackToWizard,
  onNavigateToMyMaterials
}) => {
  const { state, updateGeneratedContent, setTeacherRequest } = useWizard();
  const { user } = useAuth();

  const material = state.generatedResult;
  const [activeTab, setActiveTab] = useState<'result' | 'prompt'>('result');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<VisualFormatStyle>('photorealistic');

  // A4 Zoom & Fit Page State (Default: 'fit')
  const [zoomLevel, setZoomLevel] = useState<number | 'fit'>('fit');

  // Selected Visual Suggestion ID state for scroll-sync & highlights
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  // Hidden File Input Ref & Upload target state for teacher custom image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetSugg, setUploadTargetSugg] = useState<VisualSuggestion | null>(null);

  // Left Side Drawer State for Original Material
  const [showOriginalDrawer, setShowOriginalDrawer] = useState(false);
  const [drawerZoom, setDrawerZoom] = useState(1.0);

  // AI Block Rewrite State
  const [rewritingAction, setRewritingAction] = useState<'simplify' | 'shorten' | 'add_example' | null>(null);

  // Granular Local Editable States (Real-time sync to Center Document Preview)
  const [editedTitle, setEditedTitle] = useState(material?.title || '');
  const [editedConcept, setEditedConcept] = useState(material?.coreConcept || '');
  const [editedKeywords, setEditedKeywords] = useState<string[]>(material?.keywords || []);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [editedContent, setEditedContent] = useState(material?.simplifiedContent || '');
  const [editedActivities, setEditedActivities] = useState<MaterialActivity[]>(material?.activities || []);
  const [editedTeacherNote, setEditedTeacherNote] = useState(material?.teacherNote || '');

  // Visual Image Size Controls: 'small' | 'medium' | 'large'
  const [imageSizes, setImageSizes] = useState<Record<string, 'small' | 'medium' | 'large'>>({});

  // Teacher Custom Prompt Requests for AI Visual Generation
  const [customVisualPrompts, setCustomVisualPrompts] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // AI Visual Material Generation State
  const [generatingVisualId, setGeneratingVisualId] = useState<string | null>(null);
  const [showImageGuidelinesModal, setShowImageGuidelinesModal] = useState(false);

  // AI Verification State & Handlers
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyingWorksheet, setVerifyingWorksheet] = useState(false);
  const [verificationResult, setVerificationResult] = useState<WorksheetVerificationResult | null>(null);
  const [regeneratingWithTeacherRequest, setRegeneratingWithTeacherRequest] = useState(false);

  const handleRunAiVerification = async () => {
    setShowVerificationModal(true);
    setVerifyingWorksheet(true);
    try {
      const origText = state.sourceText || state.materialFile?.extractedText || state.topic || '';
      const res = await defaultAiProvider.verifyWorksheetAgainstOriginal!({
        originalText: origText,
        worksheetContent: currentLatestContent
      });
      setVerificationResult(res);
    } catch (err) {
      onShowToast('error', '점검 실패', 'AI 원문-학습지 점검 수행 중 오류가 발생했습니다.');
    } finally {
      setVerifyingWorksheet(false);
    }
  };

  const handleApplySuggestionsToWorksheet = (suggestionsText: string) => {
    setEditedContent(prev => `${prev}\n\n💡 **[AI 점검 보완]** ${suggestionsText}`);
    onShowToast('success', '✓ AI 제안 반영 완료', '점검에서 제안된 보완사항이 학습지 본문에 추가되었습니다.');
    setShowVerificationModal(false);
  };

  const handleApplyTeacherCustomRequest = async () => {
    if (!state.teacherRequest && !state.mustKeepText) {
      onShowToast('info', '교사 추가 지침 입력 필요', '교사 추가 요청사항을 입력해 주세요.');
      return;
    }
    setRegeneratingWithTeacherRequest(true);
    try {
      const regenerated = await defaultAiProvider.generateMaterial({
        ...state,
        educationalNeeds: state.primaryNeeds,
        teacherRequest: state.teacherRequest
      });
      setEditedTitle(regenerated.title);
      setEditedConcept(regenerated.coreConcept);
      setEditedKeywords(regenerated.keywords || []);
      setEditedContent(regenerated.simplifiedContent);
      setEditedActivities(regenerated.activities || []);
      setEditedTeacherNote(regenerated.teacherNote || '');
      updateGeneratedContent(regenerated);
      onShowToast('success', '✓ 교사 지침 반영 AI 재구성 완료', '작성하신 지침이 반영되어 학습지가 실시간으로 재구성되었습니다.');
    } catch (err) {
      onShowToast('error', '재구성 실패', 'AI 재구성 도중 오류가 발생했습니다.');
    } finally {
      setRegeneratingWithTeacherRequest(false);
    }
  };

  // Listen for ESC key to close Left Side Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOriginalDrawer) {
        setShowOriginalDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOriginalDrawer]);

  if (!material) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-charcoal-500">생성된 학습자료가 없습니다.</p>
        <button
          onClick={onBackToWizard}
          className="btn-primary px-4 py-2 text-sm"
        >
          학습자료 만들기 단계로 돌아가기
        </button>
      </div>
    );
  }

  const promptText = material.generatedPrompt || state.generatedPrompt || '생성된 프롬프트가 존재하지 않습니다.';

  // Visual Suggestions List
  const visualSuggestions: VisualSuggestion[] =
    material.visualSuggestions && material.visualSuggestions.length > 0
      ? material.visualSuggestions
      : [
          {
            id: 'sugg-default-1',
            sectionId: 'concept',
            title: `${material.coreConcept || '학습 주제'} 단계별 시각자료`,
            description: '핵심 발생 원리와 단계를 한눈에 파악할 수 있는 시각적 설명 그림',
            reason: '개념 이해를 돕고 직관적인 파악을 지원합니다.',
            visualLevel: state.visualModificationLevel,
            strategies: state.visualStrategies
          }
        ];

  const isLandscape = (material?.pageOrientation || state.pageOrientation) === 'landscape';

  // Real-Time Consolidated Content Model
  const currentLatestContent: GeneratedMaterial = {
    ...material,
    pageSize: material?.pageSize || state.pageSize || 'A4',
    pageOrientation: material?.pageOrientation || state.pageOrientation || 'portrait',
    pageLength: material?.pageLength || state.pageLength || 'auto',
    title: editedTitle,
    coreConcept: editedConcept,
    keywords: editedKeywords,
    simplifiedContent: editedContent,
    activities: editedActivities,
    teacherNote: editedTeacherNote
  };

  // Handler to select visual from A4 preview click & scroll right panel card into view
  const handleSelectVisualFromA4 = (suggestionId?: string, visualId?: string) => {
    if (suggestionId) {
      setSelectedSuggestionId(suggestionId);
      setTimeout(() => {
        const cardElement = document.getElementById(`visual-card-${suggestionId}`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  // Trigger hidden file picker for teacher custom image upload
  const handleTriggerTeacherImageUpload = (sugg: VisualSuggestion) => {
    setUploadTargetSugg(sugg);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // FileReader handler for teacher uploaded image file
  const handleTeacherImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetSugg) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('error', '이미지 선택 오류', 'JPG, JPEG, PNG 이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const newVisual: GeneratedVisual = {
        id: `vis-teacher-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        suggestionId: uploadTargetSugg.id,
        sectionId: uploadTargetSugg.sectionId,
        imageUrl: dataUrl,
        description: uploadTargetSugg.title || '교사 업로드 이미지',
        generationPrompt: '교사 직접 업로드 이미지',
        visualLevel: uploadTargetSugg.visualLevel || state.visualModificationLevel,
        strategies: uploadTargetSugg.strategies || state.visualStrategies,
        source: 'teacher_upload',
        createdAt: new Date().toISOString()
      };

      const currentVisuals = material.visuals ? [...material.visuals] : [];
      const existingIndex = currentVisuals.findIndex(
        v => v.suggestionId === uploadTargetSugg.id || (uploadTargetSugg.sectionId && v.sectionId === uploadTargetSugg.sectionId)
      );

      if (existingIndex >= 0) {
        currentVisuals[existingIndex] = newVisual;
      } else {
        currentVisuals.push(newVisual);
      }

      updateGeneratedContent({
        ...material,
        visuals: currentVisuals
      });

      setSelectedSuggestionId(uploadTargetSugg.id);
      onShowToast('success', '✓ 교사 이미지 추가 완료', '업로드하신 이미지가 A4 미리보기에 즉시 반영되었습니다.');
    };

    reader.readAsDataURL(file);
  };

  // Keyword tag helpers
  const handleRemoveKeyword = (index: number) => {
    setEditedKeywords(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddKeyword = () => {
    if (!newKeywordInput.trim()) return;
    setEditedKeywords(prev => [...prev, newKeywordInput.trim()]);
    setNewKeywordInput('');
  };

  // Activity editing helpers
  const handleUpdateActivityField = (index: number, field: keyof MaterialActivity, value: any) => {
    setEditedActivities(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Visual Image Size Setter
  const handleSetImageSize = (visualId: string, size: 'small' | 'medium' | 'large') => {
    setImageSizes(prev => ({ ...prev, [visualId]: size }));
  };

  // On-Demand AI Image Generation Handler (Supports Teacher Custom Prompt Feedback)
  const handleGenerateVisual = async (sugg: VisualSuggestion, styleOverride?: VisualFormatStyle, customPromptText?: string) => {
    const styleToUse = styleOverride || selectedStyle;
    const promptFeedback = customPromptText !== undefined ? customPromptText : (customVisualPrompts[sugg.id] || '');

    if (customPromptText !== undefined && !customPromptText.trim()) {
      onShowToast('info', '핵심어휘 / 요청사항 입력 필요', '시각자료에 반영할 핵심어휘나 추가 요청사항을 먼저 입력해주세요.');
      return;
    }

    setGeneratingVisualId(sugg.id);
    try {
      const newVisual = await defaultAiProvider.generateVisual({
        suggestionId: sugg.id,
        sectionId: sugg.sectionId,
        topic: material.coreConcept || material.title,
        suggestionTitle: sugg.title,
        suggestionDescription: sugg.description,
        reason: sugg.reason,
        visualLevel: sugg.visualLevel || state.visualModificationLevel,
        strategies: sugg.strategies && sugg.strategies.length > 0 ? sugg.strategies : state.visualStrategies,
        visualStyle: styleToUse,
        teacherCustomPrompt: promptFeedback
      });

      const currentVisuals = material.visuals ? [...material.visuals] : [];
      const existingIndex = currentVisuals.findIndex(
        v => v.suggestionId === sugg.id || (sugg.sectionId && v.sectionId === sugg.sectionId)
      );

      if (existingIndex >= 0) {
        currentVisuals[existingIndex] = { ...newVisual, source: 'ai' };
      } else {
        currentVisuals.push({ ...newVisual, source: 'ai' });
      }

      const updatedMaterial: GeneratedMaterial = {
        ...material,
        visuals: currentVisuals
      };

      updateGeneratedContent(updatedMaterial);
      setSelectedSuggestionId(sugg.id);
      onShowToast(
        'success',
        promptFeedback ? '✓ 추가 요청 반영 재생성 완료' : '✓ 시각자료 생성 완료',
        promptFeedback
          ? `교사 추가 지침("${promptFeedback}")이 반영되어 시각자료가 재생성되었습니다.`
          : `[${VISUAL_STYLE_LABELS[styleToUse]}] Level ${newVisual.visualLevel} 시각자료가 추가되었습니다.`
      );
    } catch (err) {
      onShowToast('error', '이미지 생성 실패', '시각자료 생성 중 오류가 발생했습니다.');
    } finally {
      setGeneratingVisualId(null);
    }
  };

  // Delete Visual Image Handler
  const handleDeleteVisual = (visualId: string) => {
    const updatedVisuals = (material.visuals || []).filter(v => v.id !== visualId);
    updateGeneratedContent({
      ...material,
      visuals: updatedVisuals
    });
    onShowToast('info', '시각자료 삭제됨', '선택하신 시각자료가 삭제되었습니다.');
  };

  // Copy Prompt Handler
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      onShowToast('success', '✓ 프롬프트가 복사되었습니다.');

      logUsageEvent({
        userId: user?.uid || 'demo-teacher',
        eventType: 'copy_material',
        metadata: { type: 'prompt' }
      });

      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      onShowToast('error', '복사 실패', '클립보드 복사 중 오류가 발생했습니다.');
    }
  };

  // Save Material to Firebase/LocalStorage
  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveMaterial({
        userId: user?.uid || 'demo-teacher-01',
        userEmail: user?.email,
        title: currentLatestContent.title,
        schoolLevel: state.schoolLevel,
        subject: state.subject,
        topic: state.topic,
        fileName: state.materialFile?.name,
        fileType: state.materialFile?.type,
        filePreviewUrl: state.materialFile?.previewUrl,
        disabilityCategories: state.disabilityCategories,
        educationalNeeds: state.primaryNeeds,
        textModificationLevel: state.textModificationLevel,
        textStrategies: state.textStrategies,
        visualModificationLevel: state.visualModificationLevel,
        visualStrategies: state.visualStrategies,
        mustKeepOptions: state.mustKeepOptions,
        mustKeepText: state.mustKeepText,
        teacherRequest: state.teacherRequest,
        generatedContent: currentLatestContent,
        generatedPrompt: promptText
      });

      logUsageEvent({
        userId: user?.uid || 'anonymous',
        eventType: 'save_material',
        metadata: { materialId: saved.id }
      });

      onShowToast('success', '✓ 내 자료에 성공적으로 저장되었습니다.');
      onNavigateToMyMaterials();
    } catch (e) {
      onShowToast('error', '저장 실패', '자료 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // DOCX Export
  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      const docxExporter = new DocxExportService();
      await docxExporter.export(currentLatestContent, imageSizes);
      onShowToast('success', 'DOCX 다운로드 완료', '현재 최신 수정본 기준 한글 문서(.docx)가 생성되었습니다.');
    } catch (e) {
      console.error(e);
      onShowToast('error', '다운로드 실패', 'DOCX 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setExportingDocx(false);
    }
  };

  // PDF Export
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const pdfExporter = new PdfExportService();
      await pdfExporter.export(currentLatestContent, 'student-document-renderer');
      onShowToast('success', 'PDF 다운로드 완료', '현재 최신 수정본 기준 학생용 PDF 파일이 생성되었습니다.');
    } catch (e) {
      console.error(e);
      onShowToast('error', '다운로드 실패', 'PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setExportingPdf(false);
    }
  };

  // Real AI Block Rewrite
  const handleBlockRewrite = async (action: 'simplify' | 'shorten' | 'add_example') => {
    setRewritingAction(action);
    try {
      const rewritten = await defaultAiProvider.rewriteBlock!({
        action,
        content: editedContent,
        context: {
          schoolLevel: state.schoolLevel,
          subject: state.subject,
          topic: state.topic,
          mustKeepText: state.mustKeepText
        }
      });

      setEditedContent(rewritten);
      const actionLabel = action === 'simplify' ? '더 쉽게' : action === 'shorten' ? '더 짧게' : '예시 추가';
      onShowToast('success', `✓ ${actionLabel} 수정 완료`, '선택한 블록 내용이 수정되었습니다.');
    } catch (err) {
      onShowToast('error', 'AI 수정 실패', '기존 내용을 유지합니다.');
    } finally {
      setRewritingAction(null);
    }
  };

  const handleCleanIrrelevantContent = (cleanedText?: string) => {
    if (cleanedText && cleanedText.trim().length > 0) {
      setEditedContent(cleanedText);
    } else {
      // Clean off-topic sentences or template leftovers
      setEditedContent(prev =>
        prev
          .replace(/ㆍ 식물이 햇빛과 물.*?\n/g, '')
          .replace(/식물이 광합성을 마치면.*?\n/g, '')
          .replace(/3\) 얼음 조각/g, '3) 소상공인 가게')
      );
    }
    // Clean off-topic activities if present
    setEditedActivities(prev =>
      prev.filter(act =>
        !act.title.includes('광합성') &&
        !act.content.includes('광합성') &&
        !act.content.includes('식물 화분')
      )
    );
    onShowToast('success', '✓ 관련 없는 내용 삭제 완료 (교사 승인)', '학습지에서 원문 주제와 무관한 내용이 성공적으로 삭제되었습니다.');
    setShowVerificationModal(false);
  };

  // Zoom controls for center A4 document preview
  const getZoomScale = (): number => {
    if (zoomLevel === 'fit') return isLandscape ? 0.45 : 0.50;
    return zoomLevel;
  };

  const handleZoomIn = () => {
    const current = getZoomScale();
    const next = Math.min(1.5, Math.round((current + 0.1) * 10) / 10);
    setZoomLevel(next);
  };

  const handleZoomOut = () => {
    const current = getZoomScale();
    const next = Math.max(0.4, Math.round((current - 0.1) * 10) / 10);
    setZoomLevel(next);
  };

  const handleFitPage = () => {
    setZoomLevel('fit');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hidden File Input for Teacher Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleTeacherImageFileChange}
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
      />

      {/* Top Bar Header & Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToWizard}
            className="btn-secondary p-2"
            title="학습자료 만들기 단계로 이동"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-300">
                {state.schoolLevel === 'elementary' ? '초등' : state.schoolLevel === 'middle' ? '중등' : '고등'} · {state.subject}
              </span>
              <h1 className="text-lg font-bold text-charcoal truncate max-w-xs sm:max-w-md">
                {currentLatestContent.title}
              </h1>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              오른쪽 편집 패널에서 내용을 수정하면 가운데 A4 학습지 미리보기에 즉시 반영됩니다.
            </p>
          </div>
        </div>

        {/* Tab & Drawer Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* 📄 원문 보기 Floating Window Toggle Button */}
          <Tooltip content="독립 플로팅 창으로 업로드된 원본 수업자료(PDF/이미지)를 대조하며 확인합니다." position="bottom">
            <button
              onClick={() => setShowOriginalDrawer(true)}
              className="btn-secondary px-3.5 py-2 text-xs font-extrabold"
              title="원문 수업자료 플로팅 창 열기"
            >
              <FileText className="w-4 h-4" />
              <span>📄 원문 보기</span>
            </button>
          </Tooltip>

          <div className="flex items-center gap-1 bg-oat-50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setActiveTab('result')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'result'
                  ? 'bg-forest-600 text-white'
                  : 'text-charcoal-500 hover:text-charcoal'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>A4 실시간 미리보기</span>
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'prompt'
                  ? 'bg-forest-600 text-white'
                  : 'text-charcoal-500 hover:text-charcoal'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>생성된 AI 프롬프트</span>
            </button>
          </div>

          {/* Export & Save Buttons */}
          <Tooltip content="현재 최신 수정본 기준 한글/Word 문서(.docx)를 생성하여 다운로드합니다." position="bottom">
            <button
              onClick={handleExportDocx}
              disabled={exportingDocx}
              className="btn-secondary px-3.5 py-2 text-xs font-extrabold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportingDocx ? '생성 중...' : 'DOCX 다운로드'}</span>
            </button>
          </Tooltip>

          <Tooltip content="현재 최신 수정본 기준 학생용 A4 PDF 파일을 다운로드합니다." position="bottom">
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="btn-secondary px-3.5 py-2 text-xs font-extrabold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportingPdf ? '생성 중...' : 'PDF 다운로드'}</span>
            </button>
          </Tooltip>

          <Tooltip content="선생님이 저장하기 전에 Gemini AI가 원문 자료와 학습지 내용의 팩트 및 오류가 있는지 1:1 대조 점검합니다." position="bottom">
            <button
              onClick={handleRunAiVerification}
              disabled={verifyingWorksheet}
              className="btn-ai px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-forest-200" />
              <span>{verifyingWorksheet ? 'AI 점검 중...' : '🔍 AI로 원문-학습지 점검하기'}</span>
            </button>
          </Tooltip>

          <Tooltip content="현재 학습자료 및 교사 수정 내역을 내 보관함에 최종 저장합니다." position="bottom">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-4 py-2 text-xs font-extrabold"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>{saving ? '저장 중...' : '내 자료에 저장'}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'prompt' ? (
        /* Prompt Inspection Tab */
        <div className="card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
              <Code className="w-5 h-5 text-forest-600" />
              AI 특수교육 교수적 수정 생성 프롬프트
            </h3>
            <button
              onClick={handleCopyPrompt}
              className="btn-primary px-4 py-2 text-xs"
            >
              {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPrompt ? '복사 완료!' : '프롬프트 전체 복사'}</span>
            </button>
          </div>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            UDL-Bridge가 특수교육 및 UDL 원칙에 따라 AI 엔진에 입력한 내부 지시문 프롬프트 전체 구조입니다.
          </p>
          <pre className="p-4 rounded-lg bg-oat-50 border border-border text-charcoal-600 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
            {promptText}
          </pre>
        </div>
      ) : (
        /* Result Tab: Main Grid (A4 Document Preview + Editing Panel) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: A4 Live Document Preview (5/12 cols on lg, 4/12 on xl) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            {/* Top Zoom Controller Bar */}
            <div className="flex items-center justify-between bg-surface px-4 py-3 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sage-700 shrink-0" />
                <span className="text-xs font-bold text-charcoal-600 truncate">A4 미리보기</span>
                <span className="text-[11px] text-charcoal-400 font-mono hidden xl:inline">
                  (📄 {isLandscape ? '가로형' : '세로형'})
                </span>
              </div>

              {/* [−] 50% [+] [페이지 맞춤] Zoom Controller */}
              <div className="flex items-center gap-1 bg-oat-50 px-2 py-1 rounded-lg border border-border text-xs shrink-0">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 rounded-md hover:bg-white text-charcoal-500 hover:text-charcoal transition-colors"
                  title="축소"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-mono font-bold text-forest-700 min-w-[45px] text-center text-xs">
                  {`${Math.round(getZoomScale() * 100)}%`}
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 rounded-md hover:bg-white text-charcoal-500 hover:text-charcoal transition-colors"
                  title="확대"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <div className="h-3.5 w-[1px] bg-border mx-0.5" />
                <button
                  type="button"
                  onClick={handleFitPage}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold transition-all ${
                    zoomLevel === 'fit'
                      ? 'bg-sage-100 text-sage-800 border border-sage-300'
                      : 'text-charcoal-500 hover:text-charcoal'
                  }`}
                >
                  맞춤
                </button>
              </div>
            </div>

            {/* A4 Preview Container with Interactive Selection & Multi-page Support */}
            <div className="bg-oat-50 p-3 sm:p-4 rounded-xl border border-border flex flex-col items-center justify-start min-h-[780px] relative overflow-hidden">
              <div
                className="w-full flex justify-center overflow-y-auto max-h-[820px] p-2 transition-all duration-200"
              >
                <div
                  id="a4-preview-scale-wrapper"
                  className="origin-top transition-transform duration-200"
                  style={{
                    transform: `scale(${getZoomScale()})`,
                    width: isLandscape ? '297mm' : '210mm'
                  }}
                >
                  <StudentDocumentRenderer
                    material={currentLatestContent}
                    imageSizes={imageSizes}
                    selectedSuggestionId={selectedSuggestionId}
                    onSelectVisual={handleSelectVisualFromA4}
                    isExporting={exportingPdf}
                    id="student-document-renderer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Editing Panel (7/12 cols on lg, 8/12 on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 card p-5 space-y-5 shadow-sm lg:sticky lg:top-24 max-h-[880px] overflow-y-auto">
            {/* Field 1: 자료 제목 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-600">자료 제목</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="input-field p-2.5 text-xs font-bold"
              />
            </div>

            {/* Field 2: 핵심 개념 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-600">핵심 개념</label>
              <input
                type="text"
                value={editedConcept}
                onChange={(e) => setEditedConcept(e.target.value)}
                className="input-field p-2.5 text-xs font-semibold"
              />
            </div>

            {/* Field 3: 핵심어 목록 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-600">핵심어 목록</label>
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-oat-50 border border-border min-h-[42px]">
                {editedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white text-forest-700 text-xs font-bold flex items-center gap-1 border border-forest-100"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(i)}
                      className="text-charcoal-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder="새 핵심어 입력"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddKeyword();
                  }}
                  className="input-field flex-1 px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Field 4: 학생용 본문 설명 & AI 부분 수정 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal-600">학생용 본문 내용</label>
                <span className="text-[10px] text-forest-600 font-semibold">A4 미리보기 실시간 연동</span>
              </div>
              <textarea
                rows={6}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="input-field p-3 text-xs leading-relaxed resize-none font-sans"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <RichHoverCard dataKey="더 쉽게">
                  <button
                    type="button"
                    onClick={() => handleBlockRewrite('simplify')}
                    disabled={!!rewritingAction}
                    className="btn-ai px-3 py-1.5 text-xs font-semibold"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{rewritingAction === 'simplify' ? '✨ 수정 중...' : '더 쉽게'}</span>
                  </button>
                </RichHoverCard>

                <RichHoverCard dataKey="더 짧게">
                  <button
                    type="button"
                    onClick={() => handleBlockRewrite('shorten')}
                    disabled={!!rewritingAction}
                    className="btn-ai px-3 py-1.5 text-xs font-semibold"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{rewritingAction === 'shorten' ? '✨ 수정 중...' : '더 짧게'}</span>
                  </button>
                </RichHoverCard>

                <RichHoverCard dataKey="예시 추가">
                  <button
                    type="button"
                    onClick={() => handleBlockRewrite('add_example')}
                    disabled={!!rewritingAction}
                    className="btn-ai px-3 py-1.5 text-xs font-semibold"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{rewritingAction === 'add_example' ? '✨ 수정 중...' : '예시 추가'}</span>
                  </button>
                </RichHoverCard>
              </div>
            </div>

            {/* Field 5: AI 시각자료 및 교사 직접 이미지 추가 카운터 */}
            <div className="space-y-4 pt-2 border-t border-border">
              <label className="text-xs font-bold text-charcoal-600 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sage-700" />
                <span>시각자료 제어 & AI 생성 화풍 선택</span>
              </label>

              {/* Visual Style Selection 1-Line Compact Segmented Chips (Quick Click) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-oat-50/90 border border-border shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-charcoal-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                    <span>AI 시각자료 화풍 스타일</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowImageGuidelinesModal(true)}
                      className="text-[10px] text-[#2D5A3F] bg-[#EAF2EC] hover:bg-[#d8e8dc] px-2 py-0.5 rounded-md font-bold border border-[#C5DDCB] flex items-center gap-1 cursor-pointer transition-colors"
                      title="교사용 AI 시각자료 교육적 생성 및 안전 지침 확인"
                    >
                      <ShieldCheck className="w-3 h-3 text-[#2D5A3F]" />
                      <span>💡 생성 지침 확인</span>
                    </button>
                    <span className="text-[10px] text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded font-medium border border-forest-200 hidden sm:inline-block">
                      클릭 한 번으로 변환
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedStyle('simple_drawing')}
                    className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                      selectedStyle === 'simple_drawing'
                        ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                        : 'bg-white text-charcoal-600 border-border hover:bg-oat-50'
                    }`}
                  >
                    <span>✏️ 간단한 그림</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                      selectedStyle === 'simple_drawing' ? 'bg-forest-800 text-white' : 'bg-forest-50 text-forest-700 border border-forest-200'
                    }`}>
                      배경제거
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStyle('photorealistic')}
                    className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                      selectedStyle === 'photorealistic'
                        ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                        : 'bg-white text-charcoal-600 border-border hover:bg-oat-50'
                    }`}
                  >
                    <span>📸 실사 이미지</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStyle('illustration')}
                    className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                      selectedStyle === 'illustration'
                        ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                        : 'bg-white text-charcoal-600 border-border hover:bg-oat-50'
                    }`}
                  >
                    <span>🎨 일러스트</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {visualSuggestions.map(sugg => {
                  const existingVisual = (material.visuals || []).find(
                    v => v.suggestionId === sugg.id || (sugg.sectionId && v.sectionId === sugg.sectionId)
                  );
                  const isGenerating = generatingVisualId === sugg.id;
                  const currentSize = existingVisual ? imageSizes[existingVisual.id] || 'medium' : 'medium';
                  const isCardSelected = selectedSuggestionId === sugg.id || (existingVisual && selectedSuggestionId === existingVisual.id);

                  // Visual Card Case 1: Image ALREADY EXISTS (AI or Teacher Uploaded)
                  if (existingVisual) {
                    return (
                      <div
                        key={sugg.id}
                        id={`visual-card-${sugg.id}`}
                        className={`p-3.5 rounded-lg bg-oat-50 border transition-all space-y-3 ${
                          isCardSelected
                            ? 'border-forest-400 bg-white shadow-sm'
                            : 'border-border'
                        }`}
                      >
                        {/* Card Header & Source Tag */}
                        <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                          <span className="font-bold text-charcoal truncate max-w-[170px]">{sugg.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              existingVisual.source === 'teacher_upload'
                                ? 'bg-forest-50 text-forest-700 border-forest-200'
                                : 'bg-sage-100 text-sage-800 border-sage-300'
                            }`}
                          >
                            {existingVisual.source === 'teacher_upload' ? '📁 교사 업로드 이미지' : '✨ AI 생성 이미지'}
                          </span>
                        </div>

                        {/* Image Thumbnail Box */}
                        <div className="p-2 bg-white rounded-lg border border-border flex items-center justify-center min-h-[90px] max-h-[140px] overflow-hidden">
                          {existingVisual.imageUrl && existingVisual.imageUrl.startsWith('<svg') ? (
                            <div
                              className="max-h-[120px] max-w-full flex items-center justify-center object-contain"
                              dangerouslySetInnerHTML={{ __html: existingVisual.imageUrl }}
                            />
                          ) : (
                            <img
                              src={existingVisual.imageUrl}
                              alt={existingVisual.description || sugg.title}
                              onError={(e) => {
                                e.currentTarget.src = getFallbackEducationalSvg(existingVisual.description || sugg.title);
                              }}
                              className="max-h-[120px] max-w-full object-contain rounded border border-border shadow-sm"
                            />
                          )}
                        </div>

                        {/* Action Buttons: [교체] [삭제] */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTriggerTeacherImageUpload(sugg)}
                              className="btn-secondary px-2.5 py-1.5 text-xs font-bold"
                              title="다른 교사 이미지 파일 선택"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>[교체]</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleGenerateVisual(sugg, selectedStyle)}
                              disabled={isGenerating}
                              className="btn-secondary px-2.5 py-1.5 text-xs font-bold"
                              title="AI로 다시 생성"
                            >
                              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                              <span>AI 재생성</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteVisual(existingVisual.id)}
                            className="btn-danger-ghost px-2.5 py-1.5 text-xs font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>[삭제]</span>
                          </button>
                        </div>

                        {/* Teacher Custom Prompt Feedback Field */}
                        <div className="pt-2.5 border-t border-border space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-600">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-forest-600" />
                              <span>교사 추가 요청사항 (입력 필수)</span>
                            </span>
                            <span className="text-[10px] text-charcoal-400 font-normal">재생성 시 직접 반영</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={customVisualPrompts[sugg.id] || ''}
                              onChange={(e) => setCustomVisualPrompts(prev => ({ ...prev, [sugg.id]: e.target.value }))}
                              placeholder="예: 햇빛을 더 밝은 노란색으로 강조해주세요"
                              className="input-field px-2.5 py-1.5 text-xs flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && customVisualPrompts[sugg.id]?.trim()) {
                                  handleGenerateVisual(sugg, selectedStyle, customVisualPrompts[sugg.id]);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleGenerateVisual(sugg, selectedStyle, customVisualPrompts[sugg.id])}
                              disabled={isGenerating || !customVisualPrompts[sugg.id]?.trim()}
                              className={`px-2.5 py-1.5 text-xs font-bold shrink-0 flex items-center gap-1 transition-all rounded-lg border ${
                                !customVisualPrompts[sugg.id]?.trim()
                                  ? 'bg-oat-100 text-charcoal-300 border-border opacity-60 cursor-not-allowed'
                                  : 'btn-ai shadow-2xs cursor-pointer'
                              }`}
                              title={!customVisualPrompts[sugg.id]?.trim() ? '핵심어휘나 추가 요청사항을 입력해야 선택할 수 있습니다.' : '입력한 지침을 반영하여 시각자료 재생성'}
                            >
                              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                              <span>{isGenerating ? '생성 중...' : '요청 반영 재생성'}</span>
                            </button>
                          </div>
                          {!customVisualPrompts[sugg.id]?.trim() && (
                            <p className="text-[10px] text-amber-700 font-medium pt-0.5">
                              ⚠️ 추가 요청사항이나 핵심어휘를 입력해야 [요청 반영 재생성]을 선택할 수 있습니다.
                            </p>
                          )}
                        </div>

                        {/* Size Setter Controls */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                          <span className="text-charcoal-500 font-semibold">문서 내 크기:</span>
                          <div className="flex items-center gap-1">
                            {(['small', 'medium', 'large'] as const).map(sz => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleSetImageSize(existingVisual.id, sz)}
                                className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all ${
                                  currentSize === sz
                                    ? 'bg-forest-600 text-white border-forest-600'
                                    : 'bg-white text-charcoal-500 border-border hover:text-charcoal'
                                }`}
                              >
                                {sz === 'small' ? '작게' : sz === 'medium' ? '중간' : '크게'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Visual Card Case 2: Image DOES NOT exist yet -> [✨ AI로 생성] [↑ 내 이미지 추가]
                  return (
                    <div
                      key={sugg.id}
                      id={`visual-card-${sugg.id}`}
                      className={`p-3.5 rounded-lg bg-oat-50 border transition-all space-y-3 ${
                        isCardSelected
                          ? 'border-forest-400 bg-white shadow-sm'
                          : 'border-border'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-forest-700 block">{sugg.title}</span>
                        <p className="text-[11px] text-charcoal-500 leading-relaxed">{sugg.description}</p>
                      </div>

                      {/* Teacher Custom Prompt Feedback Input (Initial) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-charcoal-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-forest-600" />
                          <span>교사 추가 요청사항 (선택)</span>
                        </label>
                        <input
                          type="text"
                          value={customVisualPrompts[sugg.id] || ''}
                          onChange={(e) => setCustomVisualPrompts(prev => ({ ...prev, [sugg.id]: e.target.value }))}
                          placeholder="예: 배경을 깔끔한 단색으로 하고 화살표 추가"
                          className="input-field px-2.5 py-1.5 text-xs w-full"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleGenerateVisual(sugg, selectedStyle, customVisualPrompts[sugg.id]);
                            }
                          }}
                        />
                      </div>

                      {/* Dual Actions: [✨ AI로 생성] [↑ 내 이미지 추가] */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <RichHoverCard dataKey="✨ AI로 생성">
                          <button
                            type="button"
                            onClick={() => handleGenerateVisual(sugg, selectedStyle, customVisualPrompts[sugg.id])}
                            disabled={isGenerating}
                            className="btn-ai py-2 px-3 text-xs font-extrabold w-full"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isGenerating ? '생성 중...' : '✨ AI로 생성'}</span>
                          </button>
                        </RichHoverCard>

                        <RichHoverCard dataKey="↑ 내 이미지 추가">
                          <button
                            type="button"
                            onClick={() => handleTriggerTeacherImageUpload(sugg)}
                            className="btn-secondary py-2 px-3 text-xs font-extrabold w-full"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>↑ 내 이미지 추가</span>
                          </button>
                        </RichHoverCard>
                      </div>

                      {/* Visual Format Style Picker (For AI generation) */}
                      <div className="flex items-center gap-1.5 text-xs pt-1 border-t border-border">
                        <span className="text-charcoal-500 font-semibold text-[11px]">AI 방식:</span>
                        <div className="flex items-center gap-1 flex-1 justify-end">
                          {(['photorealistic', 'illustration', 'diagram'] as VisualFormatStyle[]).map(stKey => (
                            <button
                              key={stKey}
                              type="button"
                              onClick={() => setSelectedStyle(stKey)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                                selectedStyle === stKey
                                  ? 'bg-sage-100 text-sage-800 border-sage-300'
                                  : 'bg-white text-charcoal-500 border-border hover:text-charcoal'
                              }`}
                            >
                              {stKey === 'photorealistic' ? '실사형' : stKey === 'illustration' ? '일러스트' : '도식'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field 6: 학습 활동 및 확인 문항 */}
            <div className="space-y-3 pt-2 border-t border-border">
              <label className="text-xs font-bold text-charcoal-600">학습 활동 & 문제 편집</label>

              {editedActivities.map((act, actIdx) => (
                <div key={act.id || actIdx} className="p-3.5 rounded-lg bg-oat-50 border border-border space-y-2">
                  <input
                    type="text"
                    value={act.title}
                    onChange={(e) => handleUpdateActivityField(actIdx, 'title', e.target.value)}
                    className="input-field p-2 text-xs font-bold"
                  />
                  <textarea
                    rows={3}
                    value={act.content}
                    onChange={(e) => handleUpdateActivityField(actIdx, 'content', e.target.value)}
                    className="input-field p-2 text-xs resize-none font-sans"
                  />
                </div>
              ))}
            </div>

            {/* Field 7: 교사용 정답 및 안내 */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <label className="text-xs font-bold text-charcoal-600">교사용 정답 & 참고사항</label>
              <textarea
                rows={2}
                value={editedTeacherNote}
                onChange={(e) => setEditedTeacherNote(e.target.value)}
                className="input-field p-2.5 text-xs resize-none font-sans"
              />
            </div>

            {/* Action Buttons: [🔍 AI로 원문-학습지 점검하기] & [내 자료에 최종 저장하기] */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRunAiVerification}
                disabled={verifyingWorksheet}
                className="btn-ai py-3 px-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-forest-200" />
                <span>{verifyingWorksheet ? 'AI 점검 중...' : '🔍 AI로 원문-학습지 점검하기'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary py-3 px-4 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{saving ? '저장 중...' : '수정 내역 내 자료에 최종 저장하기'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Verification Modal */}
      <AiVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        loading={verifyingWorksheet}
        result={verificationResult}
        onApplySuggestions={handleApplySuggestionsToWorksheet}
        onProceedSave={() => {
          setShowVerificationModal(false);
          handleSave();
        }}
      />

      {/* Educational Image Guidelines Modal */}
      <EducationalImageGuidelinesModal
        isOpen={showImageGuidelinesModal}
        onClose={() => setShowImageGuidelinesModal(false)}
      />

      {/* Independent Floating Reference Window (Non-blocking, Draggable, Resizable, Persistent) */}
      <FloatingReferenceWindow
        isOpen={showOriginalDrawer}
        onClose={() => setShowOriginalDrawer(false)}
        materialFile={state.materialFile}
        sourceMaterials={state.sourceMaterials}
      />
    </div>
  );
};
