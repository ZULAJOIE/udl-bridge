import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import {
  SPECIAL_EDUCATION_TARGETS,
  GENERAL_STUDENT_TARGETS,
  OBSERVED_DIFFICULTIES,
  OBSERVED_DIFFICULTY_CATEGORY_LABELS,
  OBSERVED_DIFFICULTY_CATEGORY_ICONS,
  OBSERVED_DIFFICULTY_CATEGORY_ORDER
} from '../../data/udlData';
import { UserCheck, X, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { UdlGuideModal } from '../common/UdlGuideModal';

export const Step2StudentNeeds: React.FC = () => {
  const {
    state,
    togglePrimaryNeed,
    toggleDisabilityCategory
  } = useWizard();

  const [showSelectedSummary, setShowSelectedSummary] = useState(false);
  const [showUdlGuideModal, setShowUdlGuideModal] = useState(false);

  const selectedCount = state.primaryNeeds.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
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

        <button
          type="button"
          onClick={() => setShowUdlGuideModal(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#2D5A3F] bg-[#EAF2EC] hover:bg-[#d8e8dc] border border-[#C5DDCB] transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
          title="보편적 학습 설계(UDL) 3.0 지침 도표 확인"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#2D5A3F]" />
          <span>UDL 지침 3.0</span>
        </button>
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

      {/* UDL Guidelines Help Modal */}
      <UdlGuideModal
        isOpen={showUdlGuideModal}
        onClose={() => setShowUdlGuideModal(false)}
      />
    </div>
  );
};
