import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import { MUST_KEEP_OPTIONS } from '../../data/udlData';
import { Check, Sparkles, Loader2 } from 'lucide-react';

interface Step4Props {
  onMaterialGenerated: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const Step4MustKeepAndGenerate: React.FC<Step4Props> = ({ onMaterialGenerated, onShowToast }) => {
  const {
    state,
    toggleMustKeepOption,
    setMustKeepText,
    setTeacherRequest,
    setPageOrientation,
    generateMaterialAction
  } = useWizard();

  const { user } = useAuth();

  const quickPrompts = [
    { label: '관심사 활용', text: '학생이 좋아하는 관심사를 활용한 예시를 넣어주세요.' },
    { label: '선택형 응답', text: '말로 대답하기 어려우므로 손가락으로 선택해서 답할 수 있도록 해주세요.' },
    { label: 'A4 한 장 맞춤', text: 'A4 한 장 안에 들어가도록 만들어주세요.' },
    { label: '교사용 정답', text: '교사용 정답 및 힌트를 하단에 작은 글씨로 제공해주세요.' }
  ];

  const handleGenerate = async () => {
    try {
      await generateMaterialAction(user?.uid);
      onShowToast('success', '학습자료 생성 완료!', 'AI가 맞춤형 학생용 학습자료를 생성하였습니다.');
      onMaterialGenerated();
    } catch (err) {
      onShowToast('error', '생성 실패', '학습자료 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2 text-forest-700 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>STEP 4</span>
          <span>•</span>
          <span>보존 & 생성</span>
        </div>
        <h2 className="text-xl font-bold text-charcoal">
          이번 수업에서 꼭 유지해야 하는 것은 무엇인가요?
        </h2>
      </div>

      {/* ① 꼭 유지할 내용 */}
      <div className="space-y-3">
        <h3 className="text-sm sm:text-base font-semibold text-charcoal-600">
          ① 꼭 유지할 내용
        </h3>

        {/* Compact Selectable Chips */}
        <div className="flex flex-wrap gap-2">
          {MUST_KEEP_OPTIONS.map(opt => {
            const isSelected = state.mustKeepOptions.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleMustKeepOption(opt)}
                className={`py-1.5 px-3 rounded-lg text-xs transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-brown-50 text-brown-700 border-brown-300 font-semibold'
                    : 'bg-white hover:bg-oat-50 text-charcoal-500 border-border font-normal'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-brown-600 shrink-0" />}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Must Keep Input */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-medium text-charcoal-500">직접 추가하기 (선택)</label>
          <input
            type="text"
            value={state.mustKeepText}
            onChange={(e) => setMustKeepText(e.target.value)}
            placeholder="예: 광합성의 핵심 개념과 필수 용어는 유지해주세요."
            className="input-field px-3.5 py-2.5 text-xs"
          />
        </div>
      </div>

      {/* ② 추가 요청 (선택) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm sm:text-base font-semibold text-charcoal-600">
          ② 추가 요청 (선택)
        </h3>

        <textarea
          rows={3}
          value={state.teacherRequest}
          onChange={(e) => setTeacherRequest(e.target.value)}
          placeholder="예: 학생이 좋아하는 강아지를 활용한 예시를 넣어주세요."
          className="input-field px-3.5 py-2.5 text-xs resize-none"
        />

        {/* Quick Prompt Chips */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const updated = state.teacherRequest ? `${state.teacherRequest}\n${qp.text}` : qp.text;
                setTeacherRequest(updated);
              }}
              className="chip px-2.5 py-1 text-xs font-medium"
            >
              + {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ③ 결과물 설정 */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm sm:text-base font-semibold text-charcoal-600">
          ③ 결과물 설정
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-oat-50 border border-border text-xs">
          <div className="flex items-center gap-2">
            <span className="text-charcoal-500 font-medium">용지</span>
            <span className="font-bold text-charcoal-600">A4</span>
            <span className="text-[11px] text-charcoal-400 font-mono">(210 × 297mm)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-charcoal-500 font-medium">방향</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageOrientation('portrait')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border ${
                  state.pageOrientation === 'portrait'
                    ? 'bg-forest-50 text-forest-700 border-forest-300'
                    : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                }`}
              >
                <svg className="w-3.5 h-4 stroke-current" fill="none" viewBox="0 0 16 20">
                  <rect x="2" y="2" width="12" height="16" rx="2" strokeWidth="2" />
                </svg>
                <span>세로형</span>
              </button>

              <button
                type="button"
                onClick={() => setPageOrientation('landscape')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border ${
                  state.pageOrientation === 'landscape'
                    ? 'bg-sage-50 text-sage-800 border-sage-300'
                    : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                }`}
              >
                <svg className="w-4 h-3.5 stroke-current" fill="none" viewBox="0 0 20 16">
                  <rect x="2" y="2" width="16" height="12" rx="2" strokeWidth="2" />
                </svg>
                <span>가로형</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Button (CTA) */}
      <div className="pt-6 border-t border-border">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={state.isGenerating}
          className="btn-primary w-full py-3.5 px-6 text-sm sm:text-base"
        >
          {state.isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI 맞춤형 학생용 학습자료 생성 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>✨ 교수적 수정 자료 만들기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
