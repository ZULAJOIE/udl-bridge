import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import { MUST_KEEP_OPTIONS } from '../../data/udlData';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

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
    {
      label: '관심사 활용',
      text: '학생이 좋아하는 관심사(동물, 캐릭터, 게임 등)를 활용한 예시를 본문에 넣어주세요.',
      tooltip: '학생이 흥미를 느끼는 관심사(캐릭터, 동물 등)를 반영하여 친숙하고 재밌는 예시를 제시합니다.'
    },
    {
      label: '선택형 응답',
      text: '말로 대답하기 어려우므로 손가락으로 선택해서 답할 수 있도록 보기 선택형 문항으로 구성해주세요.',
      tooltip: '표현 언어에 어려움이 있는 학생을 위해 손가락 지시나 동그라미 선택형 응답 방식을 지원합니다.'
    },
    {
      label: 'A4 한 장 맞춤',
      text: 'A4 한 장 안에 여유 있게 들어가도록 보기 깔끔하게 한 페이지 맞춤으로 구성해주세요.',
      tooltip: 'A4 단일 페이지 규격 내에 여유 있고 보기 좋게 배치되는 레이아웃으로 작성합니다.'
    },
    {
      label: '교사용 정답',
      text: '교사용 정답 및 선생님 지도용 참고사항을 하단에 작은 글씨로 제공해주세요.',
      tooltip: '수업 지도 시 교사가 한눈에 참고할 수 있는 정답과 지도 요령을 하단에 수록합니다.'
    },
    {
      label: '실생활 연결',
      text: '학생이 일상생활에서 쉽게 경험할 수 있는 구체적 상황을 실생활 예시로 포함해주세요.',
      tooltip: '교과 개념을 학생이 매일 접하는 실제 일상 경험과 연계하여 구체적으로 설명합니다.'
    },
    {
      label: '단계별 힌트',
      text: '문제를 스스로 해결할 수 있도록 단계별 힌트나 시각적 풀이 순서를 추가해주세요.',
      tooltip: '독립적 활동을 돕는 단계별 힌트, 순서도 및 시각적 가이드를 포함합니다.'
    },
    {
      label: '어휘 쉬운 풀이',
      text: '어려운 교과 필수 어휘 옆에 쉬운 단어 뜻풀이 상자를 함께 배치해주세요.',
      tooltip: '생소한 교과 어휘 옆에 학생 눈높이에 맞춘 쉬운 낱말 풀이 상자를 함께 제공합니다.'
    },
    {
      label: '자기점검 체크',
      text: '학습을 마친 후 스스로 이해 정도를 체크해볼 수 있는 Self-Check 박스를 하단에 넣어주세요.',
      tooltip: '학습 후 핵심 내용을 잘 이해했는지 스스로 체크해볼 수 있는 셀프 점검표를 추가합니다.'
    },
    {
      label: '시각적 빈칸',
      text: '핵심 개념 낱말을 직관적으로 완성할 수 있는 빈칸 괄호( [  ] ) 문항을 추가해주세요.',
      tooltip: '핵심 어휘를 손쉽게 적거나 채워 넣을 수 있는 직관적인 괄호 작성란을 구성합니다.'
    }
  ];

  const mustKeepTooltips: Record<string, string> = {
    '원래 학습목표': '수업에서 달성해야 할 성취기준과 원래 학습목표를 유지합니다.',
    '핵심 개념': '단원의 핵심 원리와 필수 교과 개념 지식을 보존합니다.',
    '필수 교과 어휘': '수업 진행에 반드시 필요한 교과서 필수 핵심 단어를 포함합니다.',
    '원래 활동 방식': '동료 학습자와 함께 수행하는 활동이나 원래의 탐구 방식을 보존합니다.',
    '원래 문제 유형': '교과서에 제시된 원래 확인 문항 및 평가 유형을 유지합니다.',
    '핵심 그림·자료': '원문 학습자료에 포함되어 있던 시각자료나 표를 유지합니다.',
    '또래와 함께 수행하는 활동': '협동 학습 및 또래와 함께 나누는 활동 요소를 보존합니다.'
  };

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

        {/* Compact Selectable Chips with Tooltips */}
        <div className="flex flex-wrap gap-2">
          {MUST_KEEP_OPTIONS.map(opt => {
            const isSelected = state.mustKeepOptions.includes(opt);
            const tooltipText = mustKeepTooltips[opt] || '선택 시 해당 학습 요소를 AI 생성물에 유지합니다.';

            return (
              <Tooltip key={opt} content={tooltipText} position="top">
                <button
                  type="button"
                  onClick={() => toggleMustKeepOption(opt)}
                  className={`py-1.5 px-3 rounded-lg text-xs transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-brown-50 text-brown-700 border-brown-300 font-semibold shadow-sm'
                      : 'bg-white hover:bg-oat-50 text-charcoal-500 border-border font-normal'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-brown-600 shrink-0" />}
                  <span>{opt}</span>
                </button>
              </Tooltip>
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-semibold text-charcoal-600">
            ② 추가 요청 (선택)
          </h3>
          <span className="text-xs text-forest-700 font-medium">💡 예시 버튼을 누르면 자동 입력됩니다.</span>
        </div>

        <textarea
          rows={3}
          value={state.teacherRequest}
          onChange={(e) => setTeacherRequest(e.target.value)}
          placeholder="예: 말로 대답하기 어려우므로 손가락으로 선택해서 답할 수 있도록 해주세요."
          className="input-field px-3.5 py-2.5 text-xs resize-none"
        />

        {/* Quick Prompt Chips with Popup Tooltips */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-charcoal-500 block">자주 쓰이는 요청 예시 (마우스를 올리면 상세 설명 표시)</span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, idx) => (
              <Tooltip key={idx} content={qp.tooltip} position="top">
                <button
                  type="button"
                  onClick={() => {
                    const updated = state.teacherRequest ? `${state.teacherRequest}\n${qp.text}` : qp.text;
                    setTeacherRequest(updated);
                  }}
                  className="chip px-3 py-1.5 text-xs font-medium bg-white hover:bg-forest-50 hover:border-forest-300 text-charcoal-700 border border-border shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>+ {qp.label}</span>
                </button>
              </Tooltip>
            ))}
          </div>
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
              <Tooltip content="표준 A4 세로 문서 규격 (210×297mm)" position="top">
                <button
                  type="button"
                  onClick={() => setPageOrientation('portrait')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border cursor-pointer ${
                    state.pageOrientation === 'portrait'
                      ? 'bg-forest-50 text-forest-700 border-forest-300 shadow-2xs'
                      : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                  }`}
                >
                  <svg className="w-3.5 h-4 stroke-current" fill="none" viewBox="0 0 16 20">
                    <rect x="2" y="2" width="12" height="16" rx="2" strokeWidth="2" />
                  </svg>
                  <span>세로형</span>
                </button>
              </Tooltip>

              <Tooltip content="와이드 A4 가로 문서 규격 (297×210mm)" position="top">
                <button
                  type="button"
                  onClick={() => setPageOrientation('landscape')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border cursor-pointer ${
                    state.pageOrientation === 'landscape'
                      ? 'bg-sage-50 text-sage-800 border-sage-300 shadow-2xs'
                      : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                  }`}
                >
                  <svg className="w-4 h-3.5 stroke-current" fill="none" viewBox="0 0 20 16">
                    <rect x="2" y="2" width="16" height="12" rx="2" strokeWidth="2" />
                  </svg>
                  <span>가로형</span>
                </button>
              </Tooltip>
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
          className="btn-primary w-full py-3.5 px-6 text-sm sm:text-base cursor-pointer"
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
