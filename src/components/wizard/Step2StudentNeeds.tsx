import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import {
  PRIMARY_NEED_CHIPS,
  SPECIAL_EDUCATION_TARGETS,
  GENERAL_STUDENT_TARGETS,
  EDUCATIONAL_NEEDS_BY_CATEGORY
} from '../../data/udlData';
import { UserCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Step2StudentNeeds: React.FC = () => {
  const {
    state,
    togglePrimaryNeed,
    toggleDetailedNeed,
    toggleDisabilityCategory,
    triggerRecommendation
  } = useWizard();

  const { user } = useAuth();
  const [showMoreNeeds, setShowMoreNeeds] = useState(false);
  const [showRecNotice, setShowRecNotice] = useState(false);

  const handleTriggerRec = () => {
    triggerRecommendation(user?.uid);
    setShowRecNotice(true);
    setTimeout(() => setShowRecNotice(false), 4000);
  };

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

      {/* 3. Primary Need Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-600">3. 대표 주요 지원 선택 (복수 선택 가능)</label>
          <span className="text-xs text-forest-700 font-bold">{state.primaryNeeds.length}개 선택됨</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRIMARY_NEED_CHIPS.map(chip => {
            const isSelected = state.primaryNeeds.includes(chip.label);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => togglePrimaryNeed(chip.label)}
                className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-forest-600 text-white border-forest-600'
                    : 'bg-white hover:bg-oat-50 text-charcoal-600 border-border'
                }`}
              >
                <span>{chip.label}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  isSelected ? 'bg-white text-forest-700 font-bold border-white' : 'border-charcoal-300'
                }`}>
                  {isSelected ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ✨ 지원 추천받기 Section (Section 6 Requirement) - AI action: Sage only */}
      <div className="pt-4 border-t border-border">
        <div className="p-4 rounded-xl bg-sage-50 border border-sage-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sage-700" />
                어떤 지원이 적절할지 고민되시나요?
              </h4>
              <p className="text-xs text-charcoal-500 mt-0.5">
                선택한 지원 항목을 바탕으로 교수적 수정 전략 3~5개를 규칙 기반 알고리즘으로 추천받으실 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerRec}
              className="btn-ai w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ 지원 추천받기</span>
            </button>
          </div>

          {showRecNotice && (
            <div className="p-3 rounded-lg bg-white border border-sage-300 text-sage-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0" />
              <span>
                추천 지원 전략이 STEP 3(글/시각자료 수정 단계)에 반영되었습니다! (직접 확인 후 해제/추가 가능)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-brown-700 bg-brown-50 p-2 rounded-lg border border-brown-100">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>AI 추천 항목은 자동으로 최종 확정되지 않으며, 교사가 다음 단계에서 직접 결정합니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
