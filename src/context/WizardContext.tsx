import React, { createContext, useContext, useState } from 'react';
import {
  SchoolLevel, ModificationLevel, MaterialFile, GeneratedMaterial, SavedMaterial, SourceMaterial, StrategyResolution,
  SupportRecommendationResult
} from '../types';
import {
  SUBJECTS_BY_LEVEL,
  TEXT_MODIFICATION_LEVELS,
  VISUAL_MODIFICATION_LEVELS,
  getRecommendedStrategiesForNeeds
} from '../data/udlData';
import { defaultAiProvider } from '../services/aiProvider';
import { logRecommendationEvent, logUsageEvent } from '../services/dataService';

interface WizardState {
  currentStep: number; // 1~4
  schoolLevel: SchoolLevel;
  subject: string;
  topic: string;
  sourceText?: string;
  materialFile: MaterialFile | null;
  sourceMaterials: SourceMaterial[];
  pageSize: 'A4';
  pageOrientation: 'portrait' | 'landscape';
  pageLength: 'auto' | 'a4_1' | 'a4_2';

  primaryNeeds: string[]; // 8 simplified chips
  detailedNeeds: string[]; // PRD category needs
  disabilityCategories: string[]; // optional detail

  textModificationLevel: ModificationLevel;
  textStrategies: string[];

  visualModificationLevel: ModificationLevel;
  visualStrategies: string[];

  // Teacher-resolved priorities between strategies flagged as 'conflicting' when both are selected (Step 3).
  // UI-only state — not part of SavedMaterial/Firebase schema.
  strategyResolutions: StrategyResolution[];

  mustKeepOptions: string[];
  mustKeepText: string;

  teacherRequest: string;

  isGenerating: boolean;
  generatedResult: GeneratedMaterial | null;
  generatedPrompt?: string;

  isRecommendedApplied: boolean;
  lastRecommendedTextStrats: string[];
  lastRecommendedVisualStrats: string[];
}

interface WizardContextType {
  state: WizardState;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setSchoolLevel: (level: SchoolLevel) => void;
  setSubject: (subject: string) => void;
  setTopic: (topic: string) => void;
  setSourceText: (text: string) => void;
  setMaterialFile: (file: MaterialFile | null) => void;
  setSourceMaterials: (sources: SourceMaterial[]) => void;
  setPageOrientation: (orientation: 'portrait' | 'landscape') => void;
  setPageLength: (length: 'auto' | 'a4_1' | 'a4_2') => void;

  togglePrimaryNeed: (chipId: string) => void;
  toggleDetailedNeed: (need: string) => void;
  toggleDisabilityCategory: (cat: string) => void;

  setTextModificationLevel: (level: ModificationLevel) => void;
  toggleTextStrategy: (strategy: string) => void;

  setVisualModificationLevel: (level: ModificationLevel) => void;
  toggleVisualStrategy: (strategy: string) => void;
  addStrategyResolution: (resolution: StrategyResolution) => void;

  toggleMustKeepOption: (option: string) => void;
  setMustKeepText: (text: string) => void;

  setTeacherRequest: (req: string) => void;

  triggerRecommendation: (userId?: string) => void;
  applyRecommendedSupports: (
    rec: SupportRecommendationResult,
    rejected: { rejectedTextStrategies: string[]; rejectedVisualStrategies: string[] },
    userId?: string
  ) => void;
  generateMaterialAction: (userId?: string) => Promise<GeneratedMaterial>;
  updateGeneratedContent: (updatedResult: GeneratedMaterial) => void;

  resetWizard: () => void;
  loadSavedMaterial: (material: SavedMaterial) => void;
}

const INITIAL_STATE: WizardState = {
  currentStep: 1,
  schoolLevel: 'middle',
  subject: '과학',
  topic: '',
  materialFile: null,
  sourceMaterials: [],
  pageSize: 'A4',
  pageOrientation: 'portrait',
  pageLength: 'auto',
  primaryNeeds: ['긴 글을 끝까지 읽기 어려워해요', '어려운 단어의 뜻을 이해하기 어려워해요', '여러 단계의 지시를 한 번에 수행하기 어려워해요'],
  detailedNeeds: ['긴 글 이해가 어려움', '어려운 어휘를 이해하기 어려움'],
  disabilityCategories: [],
  textModificationLevel: 3,
  textStrategies: ['긴 문장을 짧게 나누기', '어려운 어휘 쉬운 말 풀이', '핵심 요약 박스 제공'],
  visualModificationLevel: 3,
  visualStrategies: ['중요한 부분 강조', '핵심 요소 라벨'],
  strategyResolutions: [],
  mustKeepOptions: ['원래 학습목표', '핵심 개념', '필수 교과 어휘'],
  mustKeepText: '',
  teacherRequest: '',
  isGenerating: false,
  generatedResult: null,
  isRecommendedApplied: false,
  lastRecommendedTextStrats: [],
  lastRecommendedVisualStrats: []
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const setStep = (step: number) => setState(prev => ({ ...prev, currentStep: Math.max(1, Math.min(4, step)) }));
  const nextStep = () => setState(prev => ({ ...prev, currentStep: Math.min(4, prev.currentStep + 1) }));
  const prevStep = () => setState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));

  const setSchoolLevel = (schoolLevel: SchoolLevel) => {
    const available = SUBJECTS_BY_LEVEL[schoolLevel];
    setState(prev => ({
      ...prev,
      schoolLevel,
      subject: available.includes(prev.subject) ? prev.subject : available[0]
    }));
  };

  const setSubject = (subject: string) => setState(prev => ({ ...prev, subject }));
  const setTopic = (topic: string) => setState(prev => ({ ...prev, topic }));
  const setSourceText = (sourceText: string) => setState(prev => ({ ...prev, sourceText }));

  const setMaterialFile = (materialFile: MaterialFile | null) => {
    setState(prev => {
      if (!materialFile) {
        return { ...prev, materialFile: null, sourceMaterials: [] };
      }
      const sourceMat: SourceMaterial = {
        id: `src-${Date.now()}`,
        type: materialFile.type === 'image' ? 'image' : 'pdf',
        fileName: materialFile.name,
        previewUrl: materialFile.previewUrl,
        fileSize: materialFile.size,
        mimeType: materialFile.mimeType,
        pageNumber: 1
      };
      return {
        ...prev,
        materialFile,
        sourceMaterials: [sourceMat]
      };
    });
  };

  const setSourceMaterials = (sourceMaterials: SourceMaterial[]) => {
    setState(prev => ({ ...prev, sourceMaterials }));
  };

  const setPageOrientation = (pageOrientation: 'portrait' | 'landscape') => {
    setState(prev => ({ ...prev, pageOrientation }));
  };

  const setPageLength = (pageLength: 'auto' | 'a4_1' | 'a4_2') => {
    setState(prev => ({ ...prev, pageLength }));
  };

  const togglePrimaryNeed = (chipId: string) => {
    setState(prev => {
      const exists = prev.primaryNeeds.includes(chipId);
      return {
        ...prev,
        primaryNeeds: exists ? prev.primaryNeeds.filter(c => c !== chipId) : [...prev.primaryNeeds, chipId]
      };
    });
  };

  const toggleDetailedNeed = (need: string) => {
    setState(prev => {
      const exists = prev.detailedNeeds.includes(need);
      return {
        ...prev,
        detailedNeeds: exists ? prev.detailedNeeds.filter(n => n !== need) : [...prev.detailedNeeds, need]
      };
    });
  };

  const toggleDisabilityCategory = (cat: string) => {
    setState(prev => {
      const exists = prev.disabilityCategories.includes(cat);
      return {
        ...prev,
        disabilityCategories: exists ? prev.disabilityCategories.filter(c => c !== cat) : [...prev.disabilityCategories, cat]
      };
    });
  };

  const setTextModificationLevel = (level: ModificationLevel) => {
    setState(prev => ({ ...prev, textModificationLevel: level }));
  };

  const toggleTextStrategy = (strategy: string) => {
    setState(prev => {
      const exists = prev.textStrategies.includes(strategy);
      return {
        ...prev,
        textStrategies: exists ? prev.textStrategies.filter(s => s !== strategy) : [...prev.textStrategies, strategy],
        // Dropping a strategy also drops any priority decision that referenced it
        strategyResolutions: exists
          ? prev.strategyResolutions.filter(r => !(r.domain === 'text' && r.strategyLabels.includes(strategy)))
          : prev.strategyResolutions
      };
    });
  };

  const setVisualModificationLevel = (level: ModificationLevel) => {
    setState(prev => ({ ...prev, visualModificationLevel: level }));
  };

  const toggleVisualStrategy = (strategy: string) => {
    setState(prev => {
      const exists = prev.visualStrategies.includes(strategy);
      return {
        ...prev,
        visualStrategies: exists ? prev.visualStrategies.filter(s => s !== strategy) : [...prev.visualStrategies, strategy],
        strategyResolutions: exists
          ? prev.strategyResolutions.filter(r => !(r.domain === 'visual' && r.strategyLabels.includes(strategy)))
          : prev.strategyResolutions
      };
    });
  };

  const addStrategyResolution = (resolution: StrategyResolution) => {
    setState(prev => ({
      ...prev,
      strategyResolutions: [
        ...prev.strategyResolutions.filter(r => !(
          r.domain === resolution.domain &&
          r.strategyLabels.every(l => resolution.strategyLabels.includes(l))
        )),
        resolution
      ]
    }));
  };

  const toggleMustKeepOption = (option: string) => {
    setState(prev => {
      const exists = prev.mustKeepOptions.includes(option);
      return {
        ...prev,
        mustKeepOptions: exists ? prev.mustKeepOptions.filter(o => o !== option) : [...prev.mustKeepOptions, option]
      };
    });
  };

  const setMustKeepText = (mustKeepText: string) => setState(prev => ({ ...prev, mustKeepText }));
  const setTeacherRequest = (teacherRequest: string) => setState(prev => ({ ...prev, teacherRequest }));

  const triggerRecommendation = (userId?: string) => {
    const rec = getRecommendedStrategiesForNeeds(state.primaryNeeds, state.detailedNeeds);

    setState(prev => {
      const mergedText = Array.from(new Set([...prev.textStrategies, ...rec.recommendedTextStrats]));
      const mergedVisual = Array.from(new Set([...prev.visualStrategies, ...rec.recommendedVisualStrats]));

      return {
        ...prev,
        textModificationLevel: rec.suggestedTextLevel,
        visualModificationLevel: rec.suggestedVisualLevel,
        textStrategies: mergedText,
        visualStrategies: mergedVisual,
        isRecommendedApplied: true,
        lastRecommendedTextStrats: rec.recommendedTextStrats,
        lastRecommendedVisualStrats: rec.recommendedVisualStrats
      };
    });

    logRecommendationEvent({
      userId: userId || 'demo-teacher-01',
      schoolLevel: state.schoolLevel,
      subject: state.subject,
      educationalNeeds: [...state.primaryNeeds, ...state.detailedNeeds],
      recommendedStrategies: [...rec.recommendedTextStrats, ...rec.recommendedVisualStrats],
      teacherSelectedStrategies: [...rec.recommendedTextStrats, ...rec.recommendedVisualStrats],
      teacherRejectedStrategies: []
    });
  };

  // STEP 2 "지원 추천받기" review-and-confirm flow: unlike triggerRecommendation (which
  // both computes and immediately merges), the caller here has already shown the teacher
  // a preview (via recommendSupportsForDifficulties, a pure function) and lets them confirm
  // as-is or edit it first — this only commits whatever the teacher approved.
  const applyRecommendedSupports = (
    rec: SupportRecommendationResult,
    rejected: { rejectedTextStrategies: string[]; rejectedVisualStrategies: string[] },
    userId?: string
  ) => {
    setState(prev => {
      const mergedText = Array.from(new Set([...prev.textStrategies, ...rec.textStrategies]));
      const mergedVisual = Array.from(new Set([...prev.visualStrategies, ...rec.visualStrategies]));

      return {
        ...prev,
        textModificationLevel: rec.textLevel,
        visualModificationLevel: rec.visualLevel,
        textStrategies: mergedText,
        visualStrategies: mergedVisual,
        isRecommendedApplied: true,
        lastRecommendedTextStrats: rec.textStrategies,
        lastRecommendedVisualStrats: rec.visualStrategies
      };
    });

    logRecommendationEvent({
      userId: userId || 'demo-teacher-01',
      schoolLevel: state.schoolLevel,
      subject: state.subject,
      educationalNeeds: state.primaryNeeds,
      recommendedStrategies: [...rec.textStrategies, ...rec.visualStrategies, ...rejected.rejectedTextStrategies, ...rejected.rejectedVisualStrategies],
      teacherSelectedStrategies: [...rec.textStrategies, ...rec.visualStrategies],
      teacherRejectedStrategies: [...rejected.rejectedTextStrategies, ...rejected.rejectedVisualStrategies]
    });
  };

  const generateMaterialAction = async (userId?: string): Promise<GeneratedMaterial> => {
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const result = await defaultAiProvider.generateMaterial({
        schoolLevel: state.schoolLevel,
        subject: state.subject,
        topic: state.topic,
        sourceText: state.sourceText,
        file: state.materialFile,
        sourceMaterials: state.sourceMaterials,
        pageSize: state.pageSize,
        pageOrientation: state.pageOrientation,
        pageLength: state.pageLength,
        primaryNeeds: state.primaryNeeds,
        educationalNeeds: state.detailedNeeds,
        disabilityCategories: state.disabilityCategories,
        textModificationLevel: state.textModificationLevel,
        textStrategies: state.textStrategies,
        visualModificationLevel: state.visualModificationLevel,
        visualStrategies: state.visualStrategies,
        strategyResolutions: state.strategyResolutions,
        mustKeepOptions: state.mustKeepOptions,
        mustKeepText: state.mustKeepText,
        teacherRequest: state.teacherRequest
      });

      const resultWithPageConfig: GeneratedMaterial = {
        ...result,
        sourceMaterials: state.sourceMaterials,
        pageSize: state.pageSize,
        pageOrientation: state.pageOrientation,
        pageLength: state.pageLength
      };

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedResult: resultWithPageConfig,
        generatedPrompt: resultWithPageConfig.generatedPrompt
      }));

      logUsageEvent({
        userId: userId || 'demo-teacher-01',
        eventType: 'generate_material',
        metadata: { schoolLevel: state.schoolLevel, subject: state.subject }
      });

      return resultWithPageConfig;
    } catch (err) {
      setState(prev => ({ ...prev, isGenerating: false }));
      throw err;
    }
  };

  const updateGeneratedContent = (updatedResult: GeneratedMaterial) => {
    setState(prev => ({ ...prev, generatedResult: updatedResult }));
  };

  const resetWizard = () => setState(INITIAL_STATE);

  const loadSavedMaterial = (material: SavedMaterial) => {
    const loadedSource: SourceMaterial[] = material.sourceMaterials || (material.fileName ? [{
      id: `src-saved-${Date.now()}`,
      type: material.fileType === 'image' ? 'image' : 'pdf',
      fileName: material.fileName,
      previewUrl: material.filePreviewUrl,
      pageNumber: 1
    }] : []);

    setState({
      currentStep: 1,
      schoolLevel: material.schoolLevel,
      subject: material.subject,
      topic: material.topic || '',
      materialFile: material.fileName ? {
        name: material.fileName,
        type: material.fileType || 'pdf',
        mimeType: material.fileType === 'image' ? 'image/jpeg' : 'application/pdf',
        size: 1500000,
        previewUrl: material.filePreviewUrl
      } : null,
      sourceMaterials: loadedSource,
      pageSize: material.pageSize || 'A4',
      pageOrientation: material.pageOrientation || 'portrait',
      pageLength: material.pageLength || 'auto',
      primaryNeeds: material.educationalNeeds || [],
      detailedNeeds: [],
      disabilityCategories: material.disabilityCategories || [],
      textModificationLevel: material.textModificationLevel,
      textStrategies: material.textStrategies || [],
      visualModificationLevel: material.visualModificationLevel,
      visualStrategies: material.visualStrategies || [],
      strategyResolutions: [],
      mustKeepOptions: material.mustKeepOptions || [],
      mustKeepText: material.mustKeepText || '',
      teacherRequest: material.teacherRequest || '',
      isGenerating: false,
      generatedResult: material.generatedContent,
      generatedPrompt: material.generatedPrompt,
      isRecommendedApplied: false,
      lastRecommendedTextStrats: [],
      lastRecommendedVisualStrats: []
    });
  };

  return (
    <WizardContext.Provider
      value={{
        state,
        setStep,
        nextStep,
        prevStep,
        setSchoolLevel,
        setSubject,
        setTopic,
        setSourceText,
        setMaterialFile,
        setSourceMaterials,
        setPageOrientation,
        setPageLength,
        togglePrimaryNeed,
        toggleDetailedNeed,
        toggleDisabilityCategory,
        setTextModificationLevel,
        toggleTextStrategy,
        setVisualModificationLevel,
        toggleVisualStrategy,
        addStrategyResolution,
        toggleMustKeepOption,
        setMustKeepText,
        setTeacherRequest,
        triggerRecommendation,
        applyRecommendedSupports,
        generateMaterialAction,
        updateGeneratedContent,
        resetWizard,
        loadSavedMaterial
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used within a WizardProvider');
  return context;
};
