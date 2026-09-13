import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import { ModificationLevel, StrategyItem, StrategyRelation, SupportRecommendationResult } from '../../types';
import {
  TEXT_MODIFICATION_LEVELS,
  ALL_TEXT_STRATEGIES,
  TEXT_STRATEGY_CATEGORY_LABELS,
  TEXT_STRATEGY_CATEGORY_ORDER,
  TEXT_STRATEGY_RELATIONS,
  VISUAL_MODIFICATION_LEVELS,
  ALL_VISUAL_STRATEGIES,
  VISUAL_STRATEGY_CATEGORY_LABELS,
  VISUAL_STRATEGY_CATEGORY_ORDER,
  VISUAL_STRATEGY_RELATIONS,
  findStrategyByLabel,
  findStrategyRelation,
  recommendSupportsForDifficulties
} from '../../data/udlData';
import { FileText, Image as ImageIcon, Sparkles, Plus, Minus, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';
import { StrategyInfoPopover } from './StrategyInfoPopover';
import { StrategyCheckModal } from './StrategyCheckModal';
import { RichHoverCard } from '../common/RichHoverCard';

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
  4: '시각적 구조화',
  5: '핵심 시각정보 중심'
};

interface ConflictModalInfo {
  type: 'text' | 'visual';
  label: string;
  currentLevel: ModificationLevel;
}

interface StrategyCheckInfo {
  domain: 'text' | 'visual';
  relation: StrategyRelation;
  existing: StrategyItem;
  candidate: StrategyItem;
}

interface AdjustableNoteInfo {
  domain: 'text' | 'visual';
  message: string;
}

// Finds the most relevant relationship between a candidate strategy and the strategies
// already selected. A 'conflicting' match always takes priority over an 'adjustable' one.
// Chips render as <div role="button"> (not <button>) because each chip also contains a
// StrategyInfoPopover trigger button — nesting a <button> inside a <button> is invalid HTML
// and browsers will mis-parse it, breaking layout and click handling.
function onChipKeyActivate(fn: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
}

function evaluateStrategyRelations(
  candidate: StrategyItem,
  selectedLabels: string[],
  allStrategies: StrategyItem[],
  relations: StrategyRelation[]
): { type: 'conflicting' | 'adjustable'; other: StrategyItem; relation: StrategyRelation } | null {
  let adjustableMatch: { type: 'adjustable'; other: StrategyItem; relation: StrategyRelation } | null = null;

  for (const label of selectedLabels) {
    const other = findStrategyByLabel(label, allStrategies);
    if (!other || !candidate.id || !other.id || other.id === candidate.id) continue;

    const relation = findStrategyRelation(candidate.id, other.id, relations);
    if (!relation) continue;

    if (relation.type === 'conflicting') {
      return { type: 'conflicting', other, relation };
    }
    if (!adjustableMatch) {
      adjustableMatch = { type: 'adjustable', other, relation };
    }
  }

  return adjustableMatch;
}

export const Step3ModificationLevel: React.FC = () => {
  const {
    state,
    setTextModificationLevel,
    toggleTextStrategy,
    setVisualModificationLevel,
    toggleVisualStrategy,
    addStrategyResolution,
    applyRecommendedSupports
  } = useWizard();

  const { user } = useAuth();

  const [showExtraTextStrats, setShowExtraTextStrats] = useState(false);
  const [showExtraVisualStrats, setShowExtraVisualStrats] = useState(false);

  // AI Support Recommendation Modal State
  const [showAiRecModal, setShowAiRecModal] = useState(false);
  const [modalRecResult, setModalRecResult] = useState<SupportRecommendationResult | null>(null);
  const [selectedRecTextStrats, setSelectedRecTextStrats] = useState<string[]>([]);
  const [selectedRecVisualStrats, setSelectedRecVisualStrats] = useState<string[]>([]);

  const handleOpenAiRecModal = () => {
    const rec = recommendSupportsForDifficulties(state.primaryNeeds);
    setModalRecResult(rec);
    setSelectedRecTextStrats(rec.textStrategies);
    setSelectedRecVisualStrats(rec.visualStrategies);
    setShowAiRecModal(true);
  };

  const handleApplyRecommendationModal = () => {
    if (!modalRecResult) return;
    const rejectedTextStrategies = modalRecResult.textStrategies.filter(s => !selectedRecTextStrats.includes(s));
    const rejectedVisualStrategies = modalRecResult.visualStrategies.filter(s => !selectedRecVisualStrats.includes(s));

    applyRecommendedSupports(
      { ...modalRecResult, textStrategies: selectedRecTextStrats, visualStrategies: selectedRecVisualStrats },
      { rejectedTextStrategies, rejectedVisualStrategies },
      user?.uid
    );
    setShowAiRecModal(false);
  };

  // Degree(level)-vs-strategy warning (existing behavior, unchanged)
  const [pendingConflict, setPendingConflict] = useState<ConflictModalInfo | null>(null);

  // New: strategy-vs-strategy relationship checks
  const [pendingStrategyCheck, setPendingStrategyCheck] = useState<StrategyCheckInfo | null>(null);
  const [adjustableNote, setAdjustableNote] = useState<AdjustableNoteInfo | null>(null);

  const showAdjustableNote = (domain: 'text' | 'visual', message: string) => {
    setAdjustableNote({ domain, message });
    window.setTimeout(() => {
      setAdjustableNote(prev => (prev && prev.domain === domain && prev.message === message ? null : prev));
    }, 7000);
  };

  const handleTextStrategyToggle = (strat: StrategyItem) => {
    const isSelected = state.textStrategies.includes(strat.label);

    if (isSelected) {
      toggleTextStrategy(strat.label);
      return;
    }

    const relMatch = evaluateStrategyRelations(strat, state.textStrategies, ALL_TEXT_STRATEGIES, TEXT_STRATEGY_RELATIONS);
    if (relMatch?.type === 'conflicting') {
      setPendingStrategyCheck({ domain: 'text', relation: relMatch.relation, existing: relMatch.other, candidate: strat });
      return;
    }
    if (relMatch?.type === 'adjustable' && relMatch.relation.note) {
      showAdjustableNote('text', relMatch.relation.note);
    }

    if (strat.conflictLevels?.includes(state.textModificationLevel)) {
      setPendingConflict({ type: 'text', label: strat.label, currentLevel: state.textModificationLevel });
    } else {
      toggleTextStrategy(strat.label);
    }
  };

  const handleVisualStrategyToggle = (strat: StrategyItem) => {
    const isSelected = state.visualStrategies.includes(strat.label);

    if (isSelected) {
      toggleVisualStrategy(strat.label);
      return;
    }

    const relMatch = evaluateStrategyRelations(strat, state.visualStrategies, ALL_VISUAL_STRATEGIES, VISUAL_STRATEGY_RELATIONS);
    if (relMatch?.type === 'conflicting') {
      setPendingStrategyCheck({ domain: 'visual', relation: relMatch.relation, existing: relMatch.other, candidate: strat });
      return;
    }
    if (relMatch?.type === 'adjustable' && relMatch.relation.note) {
      showAdjustableNote('visual', relMatch.relation.note);
    }

    if (strat.conflictLevels?.includes(state.visualModificationLevel)) {
      setPendingConflict({ type: 'visual', label: strat.label, currentLevel: state.visualModificationLevel });
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

  const handleChooseStrategyPriority = (priorityStrategy: StrategyItem) => {
    if (!pendingStrategyCheck) return;
    const { domain, existing, candidate } = pendingStrategyCheck;

    if (domain === 'text') {
      toggleTextStrategy(candidate.label);
    } else {
      toggleVisualStrategy(candidate.label);
    }

    addStrategyResolution({
      domain,
      strategyLabels: [existing.label, candidate.label],
      priorityLabel: priorityStrategy.label
    });

    setPendingStrategyCheck(null);
  };

  const levels: ModificationLevel[] = [1, 2, 3, 4, 5];

  // 1. TEXT STRATEGIES COMPUTATION
  const currentTextLevelInfo = TEXT_MODIFICATION_LEVELS[state.textModificationLevel];

  const primaryTextStrats = ALL_TEXT_STRATEGIES.filter(s =>
    s.recommendedForLevel?.includes(state.textModificationLevel)
  );

  const extraSelectedTextStrats = ALL_TEXT_STRATEGIES.filter(s =>
    !s.recommendedForLevel?.includes(state.textModificationLevel) &&
    state.textStrategies.includes(s.label)
  );

  const activeTopTextStrats: StrategyItem[] = [];
  const addedTextLabels = new Set<string>();

  [...primaryTextStrats, ...extraSelectedTextStrats].forEach(s => {
    if (!addedTextLabels.has(s.label)) {
      addedTextLabels.add(s.label);
      activeTopTextStrats.push(s);
    }
  });

  // All remaining strategies, grouped by teacher-facing purpose (not by level)
  const otherTextGroups = TEXT_STRATEGY_CATEGORY_ORDER
    .map(cat => ({
      category: cat,
      label: TEXT_STRATEGY_CATEGORY_LABELS[cat],
      items: ALL_TEXT_STRATEGIES.filter(s => s.category === cat && !addedTextLabels.has(s.label))
    }))
    .filter(group => group.items.length > 0);

  // 2. VISUAL STRATEGIES COMPUTATION
  const currentVisualLevelInfo = VISUAL_MODIFICATION_LEVELS[state.visualModificationLevel];

  const primaryVisualStrats = ALL_VISUAL_STRATEGIES.filter(s =>
    s.recommendedForLevel?.includes(state.visualModificationLevel)
  );

  const extraSelectedVisualStrats = ALL_VISUAL_STRATEGIES.filter(s =>
    !s.recommendedForLevel?.includes(state.visualModificationLevel) &&
    state.visualStrategies.includes(s.label)
  );

  const activeTopVisualStrats: StrategyItem[] = [];
  const addedVisualLabels = new Set<string>();

  [...primaryVisualStrats, ...extraSelectedVisualStrats].forEach(s => {
    if (!addedVisualLabels.has(s.label)) {
      addedVisualLabels.add(s.label);
      activeTopVisualStrats.push(s);
    }
  });

  const otherVisualGroups = VISUAL_STRATEGY_CATEGORY_ORDER
    .map(cat => ({
      category: cat,
      label: VISUAL_STRATEGY_CATEGORY_LABELS[cat],
      items: ALL_VISUAL_STRATEGIES.filter(s => s.category === cat && !addedVisualLabels.has(s.label))
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-3">
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
            자료를 얼마나 수정할지 정하고, 적용할 세부 수정 방법을 선택하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAiRecModal}
          className="btn-ai px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✨ AI 추천</span>
        </button>
      </div>

      {/* 1. TEXT MODIFICATION LEVEL SECTION */}
      <div className="card p-5 space-y-4">
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <label className="text-base font-semibold text-charcoal flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-forest-600" />
            <span>1. 글 자료 수정 정도</span>
          </label>
          <span className="text-xs font-bold text-forest-700 px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-100">
            선택한 수정 정도 · {TEXT_SHORT_NAMES[state.textModificationLevel]}
          </span>
        </div>
        <p className="text-xs text-charcoal-500 -mt-2">
          글을 어느 정도 수정할까요?
        </p>

        {/* Modification Degree Segmented Control Bar (internal values 1~5 preserved, not shown to user) */}
        <div className="grid grid-cols-5 p-1 bg-oat-50 rounded-lg border border-border">
          {levels.map(lvl => {
            const isSelected = state.textModificationLevel === lvl;
            return (
              <RichHoverCard key={lvl} dataKey={TEXT_SHORT_NAMES[lvl]}>
                <button
                  type="button"
                  onClick={() => setTextModificationLevel(lvl)}
                  className={`w-full py-2.5 px-1 rounded-md transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-forest-600 text-white font-bold'
                      : 'text-charcoal-500 hover:text-charcoal hover:bg-white font-medium'
                  }`}
                >
                  <span className="text-[11px] leading-tight font-semibold truncate max-w-full">
                    {TEXT_SHORT_NAMES[lvl]}
                  </span>
                </button>
              </RichHoverCard>
            );
          })}
        </div>

        {/* Selected Degree Explanation Box */}
        <div className="p-3.5 rounded-lg bg-oat-50 border border-border space-y-1">
          <div className="text-xs font-bold text-forest-700">
            {TEXT_SHORT_NAMES[state.textModificationLevel]}
          </div>
          <p className="text-xs text-charcoal-600 leading-relaxed font-normal">
            {currentTextLevelInfo.purpose}
          </p>
        </div>

        {/* Recommended Strategies as Selectable Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-charcoal-500 block">
            추천 수정 방법
          </span>
          <div className="flex flex-wrap gap-2">
            {activeTopTextStrats.map(strat => {
              const isSelected = state.textStrategies.includes(strat.label);
              const isAiRec = state.lastRecommendedTextStrats.includes(strat.label);

              return (
                <RichHoverCard key={strat.id || strat.label} dataKey={strat.label}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleTextStrategyToggle(strat)}
                    onKeyDown={onChipKeyActivate(() => handleTextStrategyToggle(strat))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                      isSelected
                        ? 'bg-forest-600 text-white border-forest-600 font-bold'
                        : 'bg-white hover:bg-oat-50 text-charcoal-500 border-border'
                    }`}
                  >
                    <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-charcoal-300'}`}>
                      {isSelected ? '✓' : '+'}
                    </span>
                    <span>{strat.label}</span>
                    {isAiRec && (
                      <span className="badge-ai px-1.5 py-0.2">
                        <Sparkles className="w-2.5 h-2.5" /> 추천
                      </span>
                    )}
                  </div>
                </RichHoverCard>
              );
            })}
          </div>
        </div>

        {/* Adjustable relationship note (non-blocking) */}
        {adjustableNote?.domain === 'text' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-brown-50 border border-brown-200 animate-fadeIn">
            <Info className="w-3.5 h-3.5 text-brown-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-brown-700 leading-relaxed flex-1">{adjustableNote.message}</p>
            <button type="button" onClick={() => setAdjustableNote(null)} className="text-brown-500 hover:text-brown-700 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* All other strategies, grouped by purpose and expanded by default */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowExtraTextStrats(!showExtraTextStrats)}
            className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors bg-oat-50 border border-border"
          >
            {showExtraTextStrats ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showExtraTextStrats ? '− 다른 수정 방법 닫기' : '+ 다른 수정 방법 보기'}</span>
          </button>

          {showExtraTextStrats && (
            <div className="mt-3 p-3.5 rounded-lg bg-oat-50 border border-border space-y-3 animate-fadeIn">
              <span className="text-xs font-semibold text-charcoal-500 block">
                추가로 사용할 수정 방법
              </span>
              <p className="text-[11px] text-charcoal-400 -mt-2">
                필요한 방법을 자유롭게 추가할 수 있어요.
              </p>

              {otherTextGroups.map(group => (
                <div key={group.category} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-charcoal-500">[{group.label}]</div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(strat => {
                      const isSelected = state.textStrategies.includes(strat.label);
                      return (
                        <RichHoverCard key={strat.id} dataKey={strat.label}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleTextStrategyToggle(strat)}
                            onKeyDown={onChipKeyActivate(() => handleTextStrategyToggle(strat))}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                              isSelected
                                ? 'bg-forest-600 text-white border-forest-600 font-bold'
                                : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                            }`}
                          >
                            <span className={isSelected ? 'text-white' : 'text-charcoal-300'}>{isSelected ? '✓' : '+'}</span>
                            <span>{strat.label}</span>
                          </div>
                        </RichHoverCard>
                      );
                    })}
                  </div>
                </div>
              ))}
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
            <span>2. 그림·시각자료 수정 정도</span>
          </label>
          <span className="text-xs font-bold text-sage-800 px-2.5 py-0.5 rounded-full bg-sage-50 border border-sage-200">
            선택한 수정 정도 · {VISUAL_SHORT_NAMES[state.visualModificationLevel]}
          </span>
        </div>
        <p className="text-xs text-charcoal-500 -mt-2">
          시각자료를 어느 정도 수정할까요?
        </p>

        {/* Modification Degree Segmented Control Bar (internal values 1~5 preserved, not shown to user) */}
        <div className="grid grid-cols-5 p-1 bg-oat-50 rounded-lg border border-border">
          {levels.map(lvl => {
            const isSelected = state.visualModificationLevel === lvl;
            return (
              <RichHoverCard key={lvl} dataKey={VISUAL_SHORT_NAMES[lvl]}>
                <button
                  type="button"
                  onClick={() => setVisualModificationLevel(lvl)}
                  className={`w-full py-2.5 px-1 rounded-md transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-sage-600 text-white font-bold'
                      : 'text-charcoal-500 hover:text-charcoal hover:bg-white font-medium'
                  }`}
                >
                  <span className="text-[11px] leading-tight font-semibold truncate max-w-full">
                    {VISUAL_SHORT_NAMES[lvl]}
                  </span>
                </button>
              </RichHoverCard>
            );
          })}
        </div>

        {/* Selected Degree Explanation Box */}
        <div className="p-3.5 rounded-lg bg-oat-50 border border-border space-y-1">
          <div className="text-xs font-bold text-sage-800">
            {VISUAL_SHORT_NAMES[state.visualModificationLevel]}
          </div>
          <p className="text-xs text-charcoal-600 leading-relaxed font-normal">
            {currentVisualLevelInfo.purpose}
          </p>
        </div>

        {/* Recommended Strategies as Selectable Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-charcoal-500 block">
            추천 수정 방법
          </span>
          <div className="flex flex-wrap gap-2">
            {activeTopVisualStrats.map(strat => {
              const isSelected = state.visualStrategies.includes(strat.label);
              const isAiRec = state.lastRecommendedVisualStrats.includes(strat.label);

              return (
                <RichHoverCard key={strat.id || strat.label} dataKey={strat.label}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleVisualStrategyToggle(strat)}
                    onKeyDown={onChipKeyActivate(() => handleVisualStrategyToggle(strat))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                      isSelected
                        ? 'bg-sage-600 text-white border-sage-600 font-bold'
                        : 'bg-white hover:bg-oat-50 text-charcoal-500 border-border'
                    }`}
                  >
                    <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-charcoal-300'}`}>
                      {isSelected ? '✓' : '+'}
                    </span>
                    <span>{strat.label}</span>
                    {isAiRec && (
                      <span className="badge-ai px-1.5 py-0.2">
                        <Sparkles className="w-2.5 h-2.5" /> 추천
                      </span>
                    )}
                  </div>
                </RichHoverCard>
              );
            })}
          </div>
        </div>

        {/* Adjustable relationship note (non-blocking) */}
        {adjustableNote?.domain === 'visual' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-brown-50 border border-brown-200 animate-fadeIn">
            <Info className="w-3.5 h-3.5 text-brown-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-brown-700 leading-relaxed flex-1">{adjustableNote.message}</p>
            <button type="button" onClick={() => setAdjustableNote(null)} className="text-brown-500 hover:text-brown-700 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* All other strategies, grouped by purpose and expanded by default */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowExtraVisualStrats(!showExtraVisualStrats)}
            className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors bg-oat-50 border border-border"
          >
            {showExtraVisualStrats ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showExtraVisualStrats ? '− 다른 수정 방법 닫기' : '+ 다른 수정 방법 보기'}</span>
          </button>

          {showExtraVisualStrats && (
            <div className="mt-3 p-3.5 rounded-lg bg-oat-50 border border-border space-y-3 animate-fadeIn">
              <span className="text-xs font-semibold text-charcoal-500 block">
                추가로 사용할 수정 방법
              </span>
              <p className="text-[11px] text-charcoal-400 -mt-2">
                필요한 방법을 자유롭게 추가할 수 있어요.
              </p>

              {otherVisualGroups.map(group => (
                <div key={group.category} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-charcoal-500">[{group.label}]</div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(strat => {
                      const isSelected = state.visualStrategies.includes(strat.label);
                      return (
                        <RichHoverCard key={strat.id} dataKey={strat.label}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleVisualStrategyToggle(strat)}
                            onKeyDown={onChipKeyActivate(() => handleVisualStrategyToggle(strat))}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                              isSelected
                                ? 'bg-sage-600 text-white border-sage-600 font-bold'
                                : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                            }`}
                          >
                            <span className={isSelected ? 'text-white' : 'text-charcoal-300'}>{isSelected ? '✓' : '+'}</span>
                            <span>{strat.label}</span>
                          </div>
                        </RichHoverCard>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NEW: STRATEGY-VS-STRATEGY CHECK MODAL (conflicting relationships only) */}
      {pendingStrategyCheck && (
        <StrategyCheckModal
          relation={pendingStrategyCheck.relation}
          existingStrategy={pendingStrategyCheck.existing}
          candidateStrategy={pendingStrategyCheck.candidate}
          onChoosePriority={handleChooseStrategyPriority}
          onCancel={() => setPendingStrategyCheck(null)}
        />
      )}

      {/* EXISTING: DEGREE(LEVEL)-VS-STRATEGY WARNING MODAL (unchanged) */}
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
                  현재 선택한 <span className="font-bold text-brown-700">
                    {pendingConflict.type === 'text'
                      ? TEXT_SHORT_NAMES[pendingConflict.currentLevel]
                      : VISUAL_SHORT_NAMES[pendingConflict.currentLevel]}
                  </span> 수정 정도의 방향과 일부 충돌할 수 있는 전략입니다. 그래도 추가하시겠습니까?
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
      {/* NEW: AI RECOMMENDATION MODAL */}
      {showAiRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-sage-300 rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-sage-800 font-bold text-base">
                <Sparkles className="w-5 h-5 text-sage-600 shrink-0" />
                <span>학생 어려움 기반 AI 추천</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiRecModal(false)}
                className="text-charcoal-400 hover:text-charcoal p-1 rounded-lg hover:bg-oat-100 transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {state.primaryNeeds.length === 0 ? (
              <div className="p-5 rounded-xl bg-oat-50 border border-border text-center space-y-2">
                <AlertCircle className="w-7 h-7 text-brown-500 mx-auto" />
                <p className="text-xs sm:text-sm text-charcoal-800 font-bold">
                  선택된 학생 어려움이 없습니다
                </p>
                <p className="text-xs text-charcoal-500 leading-relaxed max-w-xs mx-auto">
                  STEP 2에서 학생이 겪는 어려움을 선택해 주시면, AI가 맞춤형 교수적 수정 방법을 자동으로 추천해 드립니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-sage-50 border border-sage-200 text-xs text-sage-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>🎯 선택된 학생 어려움 ({state.primaryNeeds.length}개)</span>
                  </p>
                  <p className="text-[11px] text-sage-700 font-medium">
                    {state.primaryNeeds.join(', ')}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-brown-700 bg-brown-50 p-2.5 rounded-lg border border-brown-100">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>이 추천은 장애유형을 진단하지 않으며, 교사가 관찰한 어려움을 바탕으로 한 교수설계 제안입니다. 필요에 따라 항목을 선택/해제하세요.</span>
                </div>

                {/* Text Strategies */}
                {modalRecResult && modalRecResult.textStrategies.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-charcoal-600 block">글 자료 추천 수정 방법</span>
                    <div className="flex flex-wrap gap-2">
                      {modalRecResult.textStrategies.map(label => {
                        const checked = selectedRecTextStrats.includes(label);
                        return (
                          <label
                            key={label}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer flex items-center gap-1.5 transition-colors ${
                              checked ? 'bg-forest-600 text-white border-forest-600 font-bold' : 'bg-white border-border text-charcoal-400 line-through'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedRecTextStrats(prev =>
                                  prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
                                );
                              }}
                              className="w-3.5 h-3.5 accent-forest-600"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visual Strategies */}
                {modalRecResult && modalRecResult.visualStrategies.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-charcoal-600 block">그림·시각자료 추천 수정 방법</span>
                    <div className="flex flex-wrap gap-2">
                      {modalRecResult.visualStrategies.map(label => {
                        const checked = selectedRecVisualStrats.includes(label);
                        return (
                          <label
                            key={label}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer flex items-center gap-1.5 transition-colors ${
                              checked ? 'bg-sage-600 text-white border-sage-600 font-bold' : 'bg-white border-border text-charcoal-400 line-through'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedRecVisualStrats(prev =>
                                  prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
                                );
                              }}
                              className="w-3.5 h-3.5 accent-sage-600"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAiRecModal(false)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                닫기
              </button>
              {state.primaryNeeds.length > 0 && modalRecResult && (
                <button
                  type="button"
                  onClick={handleApplyRecommendationModal}
                  className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>선택한 추천 방법 적용</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
