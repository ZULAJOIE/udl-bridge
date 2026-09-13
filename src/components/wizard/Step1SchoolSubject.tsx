import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { SchoolLevel } from '../../types';
import { SCHOOL_LEVEL_LABELS, SUBJECTS_BY_LEVEL } from '../../data/udlData';
import { GraduationCap, BookOpen, Check } from 'lucide-react';

export const Step1SchoolSubject: React.FC = () => {
  const { state, setSchoolLevel, setSubject } = useWizard();
  const schoolLevels: SchoolLevel[] = ['elementary', 'middle', 'high'];
  const subjects = SUBJECTS_BY_LEVEL[state.schoolLevel];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-forest-700 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>STEP 1</span>
          <span>•</span>
          <span>수업 기본 설정</span>
        </div>
        <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-forest-600" />
          학교급 및 교과목을 선택해주세요
        </h2>
        <p className="text-sm text-charcoal-500 mt-1">
          교과 특성에 적합한 UDL 지원 프롬프트를 구성하기 위한 첫 번째 단계입니다.
        </p>
      </div>

      {/* School Level Selector */}
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
                className={`py-3.5 px-4 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border ${
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

      {/* Subject Selector */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-600 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sage-600" />
            2. 교과목 선택 ({SCHOOL_LEVEL_LABELS[state.schoolLevel]})
          </label>
          <span className="text-xs text-charcoal-400">선택됨: <span className="text-forest-700 font-bold">{state.subject}</span></span>
        </div>

        <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-oat-50 border border-border">
          {subjects.map(subj => {
            const isSelected = state.subject === subj;
            return (
              <button
                key={subj}
                type="button"
                onClick={() => setSubject(subj)}
                className={isSelected ? 'chip-selected px-3.5 py-2 text-xs sm:text-sm' : 'chip px-3.5 py-2 text-xs sm:text-sm'}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
