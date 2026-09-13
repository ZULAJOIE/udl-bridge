import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { ModificationLevel, StrategyItem } from '../../types';
import {
  TEXT_MODIFICATION_LEVELS,
  ALL_TEXT_STRATEGIES,
  VISUAL_MODIFICATION_LEVELS,
  ALL_VISUAL_STRATEGIES
} from '../../data/udlData';
import { FileText, Image as ImageIcon, Sparkles, ChevronRight, Plus, Minus, AlertTriangle } from 'lucide-react';

const TEXT_SHORT_NAMES: Record<ModificationLevel, string> = {
  1: '원문 유지',
  2: '부분 지원',
  3: '구조화',
  4: '쉬운말',
  5: '핵심 중심'
};

const VISUAL_SHORT_NAMES: Record<ModificationLevel, string> = {
  1: '원본 유지',
  2: '핵심 강조',
  3: '단순화',
  4: '구조화',
  5: '핵심 중심'
};

interface ConflictModalInfo {
  type: 'text' | 'visual';
  label: string;
  currentLevel: ModificationLevel;
}

export const Step3ModificationLevel: React.FC = () => {
  const {
    state,
    setTextModificationLevel,
    toggleTextStrategy,
    setVisualModificationLevel,
    toggleVisualStrategy
  } = useWizard();

  // Accordion toggle states
  const [showExtraTextStrats, setShowExtraTextStrats] = useState(false);
  const [activeTextAccordionLevel, setActiveTextAccordionLevel] = useState<ModificationLevel | null>(null);

  const [showExtraVisualStrats, setShowExtraVisualStrats] = useState(false);
  const [activeVisualAccordionLevel, setActiveVisualAccordionLevel] = useState<ModificationLevel | null>(null);

  // Warning Modal State for Conflicting Strategies
  const [pendingConflict, setPendingConflict] = useState<ConflictModalInfo | null>(null);

  const handleTextStrategyToggle = (strat: StrategyItem) => {
    const isSelected = state.textStrategies.includes(strat.label);
    if (!isSelected && strat.conflictLevels?.includes(state.textModificationLevel)) {
      setPendingConflict({
        type: 'text',
        label: strat.label,
        currentLevel: state.textModificationLevel
      });
    } else {
      toggleTextStrategy(strat.label);
    }
  };

  const handleVisualStrategyToggle = (strat: StrategyItem) => {
    const isSelected = state.visualStrategies.includes(strat.label);
    if (!isSelected && strat.conflictLevels?.includes(state.visualModificationLevel)) {
      setPendingConflict({
        type: 'visual',
        label: strat.label,
        currentLevel: state.visualModificationLevel
      });
    } else {
      toggleVisualStrategy(strat.label);
    }
  };

  const handleConfirmAddConflict = () => {
    if (pendingConflict) {
      if (pendingConflict.type === 'text') {
        toggleTextStrategy(pendingConflict.label);
      } else {
        toggleVisualStrategy(pendingConflict.label);
      }
      setPendingConflict(null);
    }
  };

  const levels: ModificationLevel[] = [1, 2, 3, 4, 5];

  // 1. TEXT STRATEGIES COMPUTATION
  const currentTextLevelInfo = TEXT_MODIFICATION_LEVELS[state.textModificationLevel];

  // Exclude current Level from accordion (Requirement 2 & 7)
  const otherTextLevels = levels.filter(lvl => lvl !== state.textModificationLevel);

  // Combine strategies recommended for current level + any strategies from other levels that teacher has selected
  const primaryTextStrats = ALL_TEXT_STRATEGIES.filter(s =>
    s.recommendedForLevel?.includes(state.textModificationLevel)
  );

  const extraSelectedTextStrats = ALL_TEXT_STRATEGIES.filter(s =>
    !s.recommendedForLevel?.includes(state.textModificationLevel) &&
    state.textStrategies.includes(s.label)
  );

  // Combined top active list (deduplicated)
  const activeTopTextStrats: StrategyItem[] = [];
  const addedTextLabels = new Set<string>();

  [...primaryTextStrats, ...extraSelectedTextStrats].forEach(s => {
    if (!addedTextLabels.has(s.label)) {
      addedTextLabels.add(s.label);
      activeTopTextStrats.push(s);
    }
  });


  // 2. VISUAL STRATEGIES COMPUTATION
  const currentVisualLevelInfo = VISUAL_MODIFICATION_LEVELS[state.visualModificationLevel];

  // Exclude current Level from accordion (Requirement 2 & 7)
  const otherVisualLevels = levels.filter(lvl => lvl !== state.visualModificationLevel);

  const primaryVisualStrats = ALL_VISUAL_STRATEGIES.filter(s =>
    s.recommendedForLevel?.includes(state.visualModificationLevel)
  );

  const extraSelectedVisualStrats = ALL_VISUAL_STRATEGIES.filter(s =>
    !s.recommendedForLevel?.includes(state.visualModificationLevel) &&
    state.visualStrategies.includes(s.label)
  );

  // Combined top active list (deduplicated)
  const activeTopVisualStrats: StrategyItem[] = [];
  const addedVisualLabels = new Set<string>();

  [...primaryVisualStrats, ...extraSelectedVisualStrats].forEach(s => {
    if (!addedVisualLabels.has(s.label)) {
      addedVisualLabels.add(s.label);
      activeTopVisualStrats.push(s);
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-forest-700 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>STEP 3</span>
          <span>•</span>
          <span>수정 정도 및 방법</span>
        </div>
        <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
          <FileText className="w-5 h-5 text-forest-600" />
          글과 시각자료를 얼마나 수정할까요?
        </h2>
        <p className="text-xs text-charcoal-500 mt-1">
          글과 시각자료의 수정 레벨(강도)을 지정하고 적용할 세부 전략을 선택하세요.
        </p>
      </div>

      {/* 1. TEXT MODIFICATION LEVEL SECTION */}
      <div className="card p-5 space-y-4">
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <label className="text-base font-semibold text-charcoal flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-forest-600" />
            <span>1. 글 교수적 수정 정도</span>
          </label>
          <span className="text-xs font-bold text-forest-700 px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-100">
            Level {state.textModificationLevel} · {TEXT_SHORT_NAMES[state.textModificationLevel]}
          </span>
        </div>

        {/* Level 1~5 Connected Segmented Control Bar */}
        <div className="grid grid-cols-5 p-1 bg-oat-50 rounded-lg border border-border">
          {levels.map(lvl => {
            const isSelected = state.textModificationLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setTextModificationLevel(lvl)}
                className={`py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-forest-600 text-white font-bold'
                    : 'text-charcoal-500 hover:text-charcoal hover:bg-white font-medium'
                }`}
              >
                <span className="text-xs sm:text-sm font-extrabold">{lvl}</span>
                <span className="text-[11px] leading-tight font-semibold truncate max-w-full">
                  {TEXT_SHORT_NAMES[lvl]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Level Explanation Box */}
        <div className="p-3.5 rounded-lg bg-oat-50 border border-border space-y-1">
          <div className="text-xs font-bold text-forest-700">
            {currentTextLevelInfo.name}
          </div>
          <p className="text-xs text-charcoal-600 leading-relaxed font-normal">
            {currentTextLevelInfo.purpose}
          </p>
        </div>

        {/* Selected / Recommended Strategies as Selectable Chips (Requirement 1 & 5) */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-charcoal-500 block">
            선택할 수정 방법
          </span>
          <div className="flex flex-wrap gap-2">
            {activeTopTextStrats.map(strat => {
              const isSelected = state.textStrategies.includes(strat.label);
              const isAiRec = state.lastRecommendedTextStrats.includes(strat.label);
              const stratLevel = strat.recommendedForLevel && strat.recommendedForLevel[0];
              const isFromOtherLevel = stratLevel && stratLevel !== state.textModificationLevel;

              return (
                <button
                  key={strat.id || strat.label}
                  type="button"
                  onClick={() => handleTextStrategyToggle(strat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-forest-600 text-white border-forest-600 font-bold'
                      : 'bg-white hover:bg-oat-50 text-charcoal-500 border-border'
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-charcoal-300'}`}>
                    {isSelected ? '✓' : '+'}
                  </span>
                  <span>{strat.label}</span>
                  {isFromOtherLevel && isSelected && (
                    <span className="text-[10px] font-mono px-1 rounded bg-white/20 border border-white/30 text-white">
                      L{stratLevel}
                    </span>
                  )}
                  {isAiRec && (
                    <span className="badge-ai px-1.5 py-0.2">
                      <Sparkles className="w-2.5 h-2.5" /> 추천
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Accordion for Other Levels (Excludes Current Selected Level - Requirement 2, 3, 6) */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowExtraTextStrats(!showExtraTextStrats)}
            className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors bg-oat-50 border border-border"
          >
            {showExtraTextStrats ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showExtraTextStrats ? '− 다른 Level의 수정 방법 닫기' : '+ 다른 Level의 수정 방법 추가'}</span>
          </button>

          {showExtraTextStrats && (
            <div className="mt-3 p-3.5 rounded-lg bg-oat-50 border border-border space-y-2 animate-fadeIn">
              <span className="text-xs font-semibold text-charcoal-500 block mb-2">
                다른 Level의 수정 방법 (선택 시 상단에 추가됩니다)
              </span>

              {otherTextLevels.map((lvl) => {
                const levelStrats = ALL_TEXT_STRATEGIES.filter(s => s.recommendedForLevel?.includes(lvl));
                const isExpanded = activeTextAccordionLevel === lvl;

                return (
                  <div key={lvl} className="rounded-lg bg-white border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveTextAccordionLevel(isExpanded ? null : lvl)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-semibold text-charcoal-600 hover:bg-oat-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-forest-50 text-forest-700 border border-forest-100 text-[11px] font-bold">
                          Level {lvl}
                        </span>
                        <span>{TEXT_SHORT_NAMES[lvl]}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-charcoal-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-oat-50 border-t border-border flex flex-wrap gap-2">
                        {levelStrats.map(strat => {
                          const isSelected = state.textStrategies.includes(strat.label);
                          return (
                            <button
                              key={strat.id}
                              type="button"
                              onClick={() => handleTextStrategyToggle(strat)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                                isSelected
                                  ? 'bg-forest-600 text-white border-forest-600 font-bold'
                                  : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                              }`}
                            >
                              <span className="mr-1">{isSelected ? '✓' : '+'}</span>
                              <span>{strat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. VISUAL MODIFICATION LEVEL SECTION (Identical Logic & Layout, Sage Accent) */}
      <div className="card p-5 space-y-4">
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <label className="text-base font-semibold text-charcoal flex items-center gap-2">
            <ImageIcon className="w-4.5 h-4.5 text-sage-700" />
            <span>2. 시각자료 교수적 수정 정도</span>
          </label>
          <span className="text-xs font-bold text-sage-800 px-2.5 py-0.5 rounded-full bg-sage-50 border border-sage-200">
            Level {state.visualModificationLevel} · {VISUAL_SHORT_NAMES[state.visualModificationLevel]}
          </span>
        </div>

        {/* Level 1~5 Connected Segmented Control Bar */}
        <div className="grid grid-cols-5 p-1 bg-oat-50 rounded-lg border border-border">
          {levels.map(lvl => {
            const isSelected = state.visualModificationLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setVisualModificationLevel(lvl)}
                className={`py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-sage-600 text-white font-bold'
                    : 'text-charcoal-500 hover:text-charcoal hover:bg-white font-medium'
                }`}
              >
                <span className="text-xs sm:text-sm font-extrabold">{lvl}</span>
                <span className="text-[11px] leading-tight font-semibold truncate max-w-full">
                  {VISUAL_SHORT_NAMES[lvl]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Level Explanation Box */}
        <div className="p-3.5 rounded-lg bg-oat-50 border border-border space-y-1">
          <div className="text-xs font-bold text-sage-800">
            {currentVisualLevelInfo.name}
          </div>
          <p className="text-xs text-charcoal-600 leading-relaxed font-normal">
            {currentVisualLevelInfo.purpose}
          </p>
        </div>

        {/* Selected / Recommended Strategies as Selectable Chips (Requirement 1 & 5) */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-charcoal-500 block">
            선택할 수정 방법
          </span>
          <div className="flex flex-wrap gap-2">
            {activeTopVisualStrats.map(strat => {
              const isSelected = state.visualStrategies.includes(strat.label);
              const isAiRec = state.lastRecommendedVisualStrats.includes(strat.label);
              const stratLevel = strat.recommendedForLevel && strat.recommendedForLevel[0];
              const isFromOtherLevel = stratLevel && stratLevel !== state.visualModificationLevel;

              return (
                <button
                  key={strat.id || strat.label}
                  type="button"
                  onClick={() => handleVisualStrategyToggle(strat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-sage-600 text-white border-sage-600 font-bold'
                      : 'bg-white hover:bg-oat-50 text-charcoal-500 border-border'
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-charcoal-300'}`}>
                    {isSelected ? '✓' : '+'}
                  </span>
                  <span>{strat.label}</span>
                  {isFromOtherLevel && isSelected && (
                    <span className="text-[10px] font-mono px-1 rounded bg-white/20 border border-white/30 text-white">
                      L{stratLevel}
                    </span>
                  )}
                  {isAiRec && (
                    <span className="badge-ai px-1.5 py-0.2">
                      <Sparkles className="w-2.5 h-2.5" /> 추천
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Accordion for Other Levels (Excludes Current Selected Level - Requirement 2, 3, 6) */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowExtraVisualStrats(!showExtraVisualStrats)}
            className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors bg-oat-50 border border-border"
          >
            {showExtraVisualStrats ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showExtraVisualStrats ? '− 다른 Level의 수정 방법 닫기' : '+ 다른 Level의 수정 방법 추가'}</span>
          </button>

          {showExtraVisualStrats && (
            <div className="mt-3 p-3.5 rounded-lg bg-oat-50 border border-border space-y-2 animate-fadeIn">
              <span className="text-xs font-semibold text-charcoal-500 block mb-2">
                다른 Level의 수정 방법 (선택 시 상단에 추가됩니다)
              </span>

              {otherVisualLevels.map((lvl) => {
                const levelStrats = ALL_VISUAL_STRATEGIES.filter(s => s.recommendedForLevel?.includes(lvl));
                const isExpanded = activeVisualAccordionLevel === lvl;

                return (
                  <div key={lvl} className="rounded-lg bg-white border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveVisualAccordionLevel(isExpanded ? null : lvl)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-semibold text-charcoal-600 hover:bg-oat-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sage-50 text-sage-800 border border-sage-200 text-[11px] font-bold">
                          Level {lvl}
                        </span>
                        <span>{VISUAL_SHORT_NAMES[lvl]}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-charcoal-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-oat-50 border-t border-border flex flex-wrap gap-2">
                        {levelStrats.map(strat => {
                          const isSelected = state.visualStrategies.includes(strat.label);
                          return (
                            <button
                              key={strat.id}
                              type="button"
                              onClick={() => handleVisualStrategyToggle(strat)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                                isSelected
                                  ? 'bg-sage-600 text-white border-sage-600 font-bold'
                                  : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                              }`}
                            >
                              <span className="mr-1">{isSelected ? '✓' : '+'}</span>
                              <span>{strat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* STRATEGY CONFLICT WARNING MODAL */}
      {pendingConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-brown-300 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-brown-50 text-brown-600 border border-brown-300 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-charcoal">수정 방향 충돌 안내</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  현재 선택한 <span className="font-bold text-brown-700">Level {pendingConflict.currentLevel}</span>의 수정 방향과 일부 충돌할 수 있는 전략입니다. 그래도 추가하시겠습니까?
                </p>
                <div className="mt-2 text-[11px] text-charcoal-500 font-mono bg-oat-50 p-2 rounded border border-border">
                  선택 전략: <span className="text-charcoal font-semibold">{pendingConflict.label}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setPendingConflict(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmAddConflict}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-brown-600 hover:bg-brown-700 transition-colors"
              >
                그래도 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
