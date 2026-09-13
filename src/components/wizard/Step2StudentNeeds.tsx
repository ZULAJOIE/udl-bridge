import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import {
  SPECIAL_EDUCATION_TARGETS,
  GENERAL_STUDENT_TARGETS,
  OBSERVED_DIFFICULTIES,
  OBSERVED_DIFFICULTY_CATEGORY_LABELS,
  OBSERVED_DIFFICULTY_CATEGORY_ICONS,
  OBSERVED_DIFFICULTY_CATEGORY_ORDER,
  recommendSupportsForDifficulties
} from '../../data/udlData';
import { SupportRecommendationResult } from '../../types';
import { UserCheck, Sparkles, AlertCircle, CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';

export const Step2StudentNeeds: React.FC = () => {
  const {
    state,
    togglePrimaryNeed,
    toggleDisabilityCategory,
    applyRecommendedSupports
  } = useWizard();

  const { user } = useAuth();

  const [showSelectedSummary, setShowSelectedSummary] = useState(false);
  const [recommendation, setRecommendation] = useState<SupportRecommendationResult | null>(null);
  const [editedTextStrats, setEditedTextStrats] = useState<string[]>([]);
  const [editedVisualStrats, setEditedVisualStrats] = useState<string[]>([]);
  const [showRecNotice, setShowRecNotice] = useState(false);

  const selectedCount = state.primaryNeeds.length;

  const handleFetchRecommendation = () => {
    const rec = recommendSupportsForDifficulties(state.primaryNeeds);
    setRecommendation(rec);
    setEditedTextStrats(rec.textStrategies);
    setEditedVisualStrats(rec.visualStrategies);
    setShowRecNotice(false);
  };

  const toggleEditedText = (label: string) => {
    setEditedTextStrats(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]);
  };
  const toggleEditedVisual = (label: string) => {
    setEditedVisualStrats(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]);
  };

  const handleApplyAsIs = () => {
    if (!recommendation) return;
    applyRecommendedSupports(recommendation, { rejectedTextStrategies: [], rejectedVisualStrategies: [] }, user?.uid);
    finishApply();
  };

  const handleApplyEdited = () => {
    if (!recommendation) return;
    const rejectedTextStrategies = recommendation.textStrategies.filter(s => !editedTextStrats.includes(s));
    const rejectedVisualStrategies = recommendation.visualStrategies.filter(s => !editedVisualStrats.includes(s));
    applyRecommendedSupports(
      { ...recommendation, textStrategies: editedTextStrats, visualStrategies: editedVisualStrats },
      { rejectedTextStrategies, rejectedVisualStrategies },
      user?.uid
    );
    finishApply();
  };

  const finishApply = () => {
    setRecommendation(null);
    setShowRecNotice(true);
    setTimeout(() => setShowRecNotice(false), 4000);
  };

  const hasAnyRecommendation = recommendation && (recommendation.textStrategies.length > 0 || recommendation.visualStrategies.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-forest-700 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>STEP 2</span>
          <span>•</span>
          <span>학생에게 필요한 지원</span>
        </div>
        <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-forest-600" />
          학생에게 어떤 지원이 필요한가요?
        </h2>
      </div>

      {/* 1. Special Education Targets Section */}
      <div className="p-4 rounded-xl bg-oat-50 border border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-600">
            1. 특수교육대상자
          </label>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {SPECIAL_EDUCATION_TARGETS.map(cat => {
            const isSelected = state.disabilityCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleDisabilityCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-forest-600 text-white border-forest-600'
                    : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border font-medium'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="font-extrabold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. General Student Targets Section */}
      <div className="p-4 rounded-xl bg-oat-50 border border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-600">
            2. 일반 학생
          </label>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {GENERAL_STUDENT_TARGETS.map(cat => {
            const isSelected = state.disabilityCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleDisabilityCategory(cat)}
                className={isSelected ? 'chip-selected px-3.5 py-2 text-xs sm:text-sm flex items-center gap-1.5' : 'chip px-3.5 py-2 text-xs sm:text-sm flex items-center gap-1.5'}
              >
                <span>{cat}</span>
                {isSelected && <span className="font-extrabold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Observed Classroom Difficulties (replaces the old "대표 주요 지원 선택" chips) */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-charcoal-600">
              3. 학생이 어떤 부분에서 어려움을 보이나요?
            </label>
            <span className="text-xs text-forest-700 font-bold shrink-0">{selectedCount}개 선택됨</span>
          </div>
          <p className="text-xs text-charcoal-400 mt-1">
            수업에서 자주 관찰되는 모습을 선택해주세요. 여러 개 선택할 수 있어요.
          </p>
        </div>

        {selectedCount > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowSelectedSummary(v => !v)}
              className="text-xs font-semibold text-forest-700 hover:text-forest-800 inline-flex items-center gap-1"
            >
              {showSelectedSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>선택한 어려움 {showSelectedSummary ? '숨기기' : '보기'}</span>
            </button>

            {showSelectedSummary && (
              <div className="mt-2 flex flex-wrap gap-1.5 p-3 rounded-lg bg-oat-50 border border-border animate-fadeIn">
                {state.primaryNeeds.map(label => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-white border border-border text-charcoal-600"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => togglePrimaryNeed(label)}
                      aria-label={`${label} 선택 해제`}
                      className="text-charcoal-400 hover:text-brown-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OBSERVED_DIFFICULTY_CATEGORY_ORDER.map(category => {
            const items = OBSERVED_DIFFICULTIES.filter(d => d.category === category);
            return (
              <div key={category} className="rounded-xl border border-border bg-white p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-bold text-charcoal">
                  <span aria-hidden="true">{OBSERVED_DIFFICULTY_CATEGORY_ICONS[category]}</span>
                  <span>{OBSERVED_DIFFICULTY_CATEGORY_LABELS[category]}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map(diff => {
                    const isSelected = state.primaryNeeds.includes(diff.label);
                    return (
                      <label
                        key={diff.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sage-50 border-forest-600'
                            : 'bg-white hover:bg-oat-50 border-border'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePrimaryNeed(diff.label)}
                          className="mt-0.5 w-4 h-4 accent-forest-600 shrink-0"
                        />
                        <span className={`text-xs sm:text-sm leading-relaxed ${isSelected ? 'text-forest-800 font-semibold' : 'text-charcoal-600'}`}>
                          {diff.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✨ 지원 추천받기 Section — recommends, does not decide */}
      <div className="pt-4 border-t border-border">
        <div className="p-4 rounded-xl bg-sage-50 border border-sage-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sage-700" />
                어떤 지원이 적절할지 고민되시나요?
              </h4>
              <p className="text-xs text-charcoal-500 mt-0.5">
                선택한 학생의 어려움을 바탕으로 적절한 교수적 지원을 추천해드려요.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFetchRecommendation}
              disabled={selectedCount === 0}
              title={selectedCount === 0 ? '어려움을 1개 이상 선택해주세요' : undefined}
              className="btn-ai w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ 지원 추천받기</span>
            </button>
          </div>

          {/* Recommendation review-and-confirm panel — nothing is applied until the teacher picks a button */}
          {recommendation && (
            <div className="p-3.5 rounded-lg bg-white border border-sage-300 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sage-700 shrink-0" />
                <h5 className="text-sm font-bold text-charcoal">이런 지원을 활용해볼 수 있어요</h5>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-brown-700 bg-brown-50 p-2 rounded-lg border border-brown-100">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>추천된 지원은 자동으로 확정되지 않습니다. 학생에게 적용할 지원을 직접 확인하고 선택해주세요.</span>
              </div>

              {!hasAnyRecommendation && (
                <p className="text-xs text-charcoal-500">
                  선택한 어려움에 딱 맞는 구체적인 지원을 찾지 못했어요. 다음 단계에서 수정 방법을 직접 선택해주세요.
                </p>
              )}

              {recommendation.textStrategies.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-charcoal-500">글 자료 지원</div>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.textStrategies.map(label => {
                      const checked = editedTextStrats.includes(label);
                      return (
                        <label
                          key={label}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer flex items-center gap-1.5 transition-colors ${
                            checked ? 'bg-sage-50 border-forest-600 text-forest-800' : 'bg-white border-border text-charcoal-400 line-through'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEditedText(label)}
                            className="w-3.5 h-3.5 accent-forest-600"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {recommendation.visualStrategies.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-charcoal-500">시각자료 지원</div>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.visualStrategies.map(label => {
                      const checked = editedVisualStrats.includes(label);
                      return (
                        <label
                          key={label}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer flex items-center gap-1.5 transition-colors ${
                            checked ? 'bg-sage-50 border-forest-600 text-forest-800' : 'bg-white border-border text-charcoal-400 line-through'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEditedVisual(label)}
                            className="w-3.5 h-3.5 accent-forest-600"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {hasAnyRecommendation && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                  <button type="button" onClick={handleApplyAsIs} className="btn-primary flex-1 text-xs sm:text-sm py-2.5">
                    이대로 적용
                  </button>
                  <button type="button" onClick={handleApplyEdited} className="btn-secondary flex-1 text-xs sm:text-sm py-2.5">
                    수정해서 적용
                  </button>
                </div>
              )}
            </div>
          )}

          {showRecNotice && (
            <div className="p-3 rounded-lg bg-white border border-sage-300 text-sage-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0" />
              <span>
                선택한 지원이 STEP 3(글/시각자료 수정 단계)에 반영되었습니다! (직접 확인 후 해제/추가 가능)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-brown-700 bg-brown-50 p-2 rounded-lg border border-brown-100">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>이 추천은 학생의 장애유형이나 수준을 진단하지 않습니다. 교사가 관찰한 어려움을 바탕으로 한 교수설계 제안입니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
