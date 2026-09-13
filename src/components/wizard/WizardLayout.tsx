import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { Step1MaterialUpload } from './Step1MaterialUpload';
import { Step2StudentNeeds } from './Step2StudentNeeds';
import { Step3ModificationLevel } from './Step3ModificationLevel';
import { Step4MustKeepAndGenerate } from './Step4MustKeepAndGenerate';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BridgeMotif } from '../common/BridgeMotif';

interface WizardLayoutProps {
  onMaterialGenerated: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({ onMaterialGenerated, onShowToast }) => {
  const { state, setStep, nextStep, prevStep } = useWizard();

  const steps = [
    { num: 1, title: '1. 수업자료' },
    { num: 2, title: '2. 필요한 지원' },
    { num: 3, title: '3. 수정 정도/방법' },
    { num: 4, title: '4. 보존 & 생성' }
  ];

  const renderStepComponent = () => {
    switch (state.currentStep) {
      case 1: return <Step1MaterialUpload />;
      case 2: return <Step2StudentNeeds />;
      case 3: return <Step3ModificationLevel />;
      case 4: return <Step4MustKeepAndGenerate onMaterialGenerated={onMaterialGenerated} onShowToast={onShowToast} />;
      default: return <Step1MaterialUpload />;
    }
  };

  const isStep1Incomplete = state.currentStep === 1 && !state.materialFile;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 4-Step Stepper Navigation Bar */}
      <div className="card p-3 relative">
        <BridgeMotif className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 text-sage-200 px-6 pointer-events-none hidden sm:block" />
        <div className="grid grid-cols-4 gap-2 relative">
          {steps.map(s => {
            const isActive = state.currentStep === s.num;
            const isCompleted = state.currentStep > s.num;
            const isDisabled = s.num > 1 && !state.materialFile;

            return (
              <button
                key={s.num}
                onClick={() => {
                  if (!isDisabled) setStep(s.num);
                }}
                disabled={isDisabled}
                className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-forest-600 text-white'
                    : isCompleted
                    ? 'bg-sage-100 text-forest-700 border border-sage-300'
                    : isDisabled
                    ? 'bg-oat-50 text-charcoal-300 cursor-not-allowed'
                    : 'bg-white text-charcoal-500 border border-border hover:text-charcoal hover:bg-oat-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-extrabold ${
                  isActive ? 'bg-white text-forest-700' : isCompleted ? 'bg-forest-600 text-white' : 'bg-oat-100 text-charcoal-400'
                }`}>
                  {s.num}
                </span>
                <span className="hidden sm:inline truncate">{s.title.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Form Container */}
      <div className="card p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
        <div className="flex-1">{renderStepComponent()}</div>

        {/* Stepper Footer Nav */}
        <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={state.currentStep === 1}
            className="btn-secondary px-4 py-2.5 text-xs sm:text-sm disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 단계</span>
          </button>

          <span className="text-xs text-charcoal-400 font-mono">
            STEP <strong className="text-forest-700">{state.currentStep}</strong> / 4
          </span>

          {state.currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isStep1Incomplete}
              title={isStep1Incomplete ? '수업자료를 먼저 업로드해주세요' : undefined}
              className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1 transition-all ${
                isStep1Incomplete
                  ? 'bg-oat-100 text-charcoal-300 cursor-not-allowed'
                  : 'bg-forest-600 hover:bg-forest-700 text-white'
              }`}
            >
              <span>다음 단계</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-forest-700 font-bold">생성 준비 완료</span>
          )}
        </div>
      </div>
    </div>
  );
};
