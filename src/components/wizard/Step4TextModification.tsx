import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { ModificationLevel } from '../../types';
import { TEXT_MODIFICATION_LEVELS, ALL_TEXT_STRATEGIES } from '../../data/udlData';
import { FileText, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const Step4TextModification: React.FC = () => {
  const { state, setTextModificationLevel, toggleTextStrategy } = useWizard();
  const [showAllStrategies, setShowAllStrategies] = useState(false);

  const levels: ModificationLevel[] = [1, 2, 3, 4, 5];
  const currentLevelInfo = TEXT_MODIFICATION_LEVELS[state.textModificationLevel];

  // Recommended strategies for the currently selected level
  const primaryStrategies = ALL_TEXT_STRATEGIES.filter(s =>
    s.recommendedForLevel?.includes(state.textModificationLevel)
  );

  // Other strategies
  const otherStrategies = ALL_TEXT_STRATEGIES.filter(s =>
    !s.recommendedForLevel?.includes(state.textModificationLevel)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-forest-700 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>STEP 4</span>
          <span>•</span>
          <span>글 교수적 수정</span>
        </div>
        <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
          <FileText className="w-6 h-6 text-forest-600" />
          글 수정 수준(Level 1~5) 및 세부 전략 선택
        </h2>
        <p className="text-sm text-charcoal-500 mt-1">
          글자, 문장, 어휘 및 문단 구성의 변형 강도를 결정하고 적용할 세부 기법을 선택합니다.
        </p>
      </div>

      {/* Level Slider / Button Picker */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wide">글 교수적 수정 강도</span>
          <span className="text-sm font-extrabold text-forest-700">Level {state.textModificationLevel}</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {levels.map(lvl => {
            const isSelected = state.textModificationLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setTextModificationLevel(lvl)}
                className={`py-3 rounded-lg font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-1 border ${
                  isSelected
                    ? 'bg-forest-600 text-white border-forest-600'
                    : 'bg-white hover:bg-oat-50 text-charcoal-500 border-border'
                }`}
              >
                <span>Level {lvl}</span>
                <span className="text-[10px] font-normal opacity-80 hidden sm:inline">
                  {lvl === 1 ? '원문 유지' : lvl === 3 ? '구조화' : lvl === 5 ? '핵심 중심' : ''}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3.5 rounded-lg bg-forest-50 border border-forest-100 text-xs text-charcoal-600">
          <p className="font-bold text-forest-700 mb-0.5">{currentLevelInfo.name}</p>
          <p className="text-charcoal-500">{currentLevelInfo.purpose}</p>
        </div>
      </div>

      {/* Primary Recommended Strategies for Selected Level */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-600">
            Level {state.textModificationLevel} 추천 세부 수정 전략
          </label>
          <span className="text-xs text-charcoal-400">선택된 전략: <strong className="text-forest-700">{state.textStrategies.length}개</strong></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {primaryStrategies.map(strat => {
            const isSelected = state.textStrategies.includes(strat.label);
            const isAiRec = state.lastRecommendedTextStrats.includes(strat.label);

            return (
              <button
                key={strat.id}
                type="button"
                onClick={() => toggleTextStrategy(strat.label)}
                className={`p-3 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-forest-50 text-forest-700 border-forest-300 font-semibold'
                    : 'bg-white hover:bg-oat-50 text-charcoal-500 border-border'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{strat.label}</span>
                  {isAiRec && (
                    <span className="badge-ai px-1.5 py-0.5">
                      <Sparkles className="w-3 h-3" /> 추천
                    </span>
                  )}
                </div>
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                  isSelected ? 'bg-forest-600 border-forest-600 text-white' : 'border-border'
                }`}>
                  {isSelected ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle Extra Strategies from other levels */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAllStrategies(!showAllStrategies)}
          className="text-xs font-semibold text-charcoal-500 hover:text-forest-700 flex items-center gap-1 transition-colors"
        >
          {showAllStrategies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{showAllStrategies ? '다른 수정 방법 닫기' : '+ 다른 Level 수정 방법도 함께 보기'}</span>
        </button>

        {showAllStrategies && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-xl bg-oat-50 border border-border">
            {otherStrategies.map(strat => {
              const isSelected = state.textStrategies.includes(strat.label);
              return (
                <button
                  key={strat.id}
                  type="button"
                  onClick={() => toggleTextStrategy(strat.label)}
                  className={`p-2.5 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-sage-50 text-sage-800 border-sage-300 font-semibold'
                      : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                  }`}
                >
                  <span>{strat.label}</span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-sage-600 border-sage-600 text-white font-bold' : 'border-border'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
