import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import { MUST_KEEP_OPTIONS } from '../../data/udlData';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { RichHoverCard } from '../common/RichHoverCard';

interface Step4Props {
  onMaterialGenerated: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

interface SupportGroup {
  category: string;
  items: {
    label: string;
    text: string;
  }[];
}

export const Step4MustKeepAndGenerate: React.FC<Step4Props> = ({ onMaterialGenerated, onShowToast }) => {
  const {
    state,
    toggleMustKeepOption,
    setMustKeepText,
    setTeacherRequest,
    setPageOrientation,
    setPageLength,
    generateMaterialAction
  } = useWizard();

  const { user } = useAuth();

  const supportGroups: SupportGroup[] = [
    {
      category: '개인화',
      items: [
        {
          label: '관심사 반영',
          text: '학생이 좋아하는 주제나 소재(동물, 캐릭터, 게임 등)를 활용한 친숙한 맥락으로 문제를 구성해주세요.'
        }
      ]
    },
    {
      category: '응답 지원',
      items: [
        {
          label: '선택형 응답',
          text: '학생이 직접 문장을 만들어 답하기 어려우므로 보기 선택지 중 골라서 응답할 수 있도록 구성해주세요.'
        },
        {
          label: '말로 답하기',
          text: '쓰기 부담을 경감하기 위해 말이나 손가락 지시로 표현할 수 있도록 활동 방식을 조정해주세요.'
        }
      ]
    },
    {
      category: '학습 과정 지원',
      items: [
        {
          label: '단계별 힌트',
          text: '정답을 바로 알려주지 않고 학생이 막혔을 때 단계적으로 확인할 수 있는 힌트를 제공해주세요.'
        },
        {
          label: '자기점검 체크',
          text: '활동을 마친 뒤 학생이 스스로 수행 여부를 확인할 수 있는 Self-Check 항목을 제공해주세요.'
        },
        {
          label: '추가 연습',
          text: '같은 학습목표를 한 번 더 단단히 복습할 수 있도록 간단한 추가 연습 문제나 활동을 제공해주세요.'
        }
      ]
    },
    {
      category: '상호작용 지원',
      items: [
        {
          label: '짝과 함께하기',
          text: '혼자 수행하는 활동 중 적절한 부분을 또래 짝과 함께 협동하여 수행할 수 있도록 구성해주세요.'
        }
      ]
    },
    {
      category: '교사 지원',
      items: [
        {
          label: '교사용 정답',
          text: '학생용 자료와 별도로 하단에 교사 정답 또는 지도 참고용 가이드를 제공해주세요.'
        },
        {
          label: '교사 발문',
          text: '교사가 학생의 생각이나 응답을 촉진할 때 사용할 수 있는 질문이나 촉진 문장을 추가해주세요.'
        }
      ]
    }
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

        {/* Compact Selectable Chips with Rich Hover Cards */}
        <div className="flex flex-wrap gap-2">
          {MUST_KEEP_OPTIONS.map(opt => {
            const isSelected = state.mustKeepOptions.includes(opt);
            return (
              <RichHoverCard key={opt} dataKey={opt}>
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
              </RichHoverCard>
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

      {/* ② 추가 지원 (선택) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm sm:text-base font-semibold text-charcoal-600">
          ② 추가 지원 (선택)
        </h3>
        <p className="text-xs text-charcoal-500 -mt-1">
          자료 수정 외에 학생에게 필요한 지원을 추가해보세요.
        </p>

        <textarea
          rows={3}
          value={state.teacherRequest}
          onChange={(e) => setTeacherRequest(e.target.value)}
          placeholder="예: 말로 답하기 어려우므로 선택해서 답할 수 있게 해주세요."
          className="input-field px-3.5 py-2.5 text-xs resize-none font-sans"
        />

        {/* Categorized Quick Support Chips */}
        <div className="space-y-3 pt-1">
          <span className="text-xs font-semibold text-charcoal-500 block">빠른 지원 선택</span>

          <div className="space-y-2.5">
            {supportGroups.map(group => (
              <div key={group.category} className="space-y-1">
                <span className="text-[11px] font-bold text-charcoal-500 tracking-tight">
                  [{group.category}]
                </span>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(item => (
                    <RichHoverCard key={item.label} dataKey={item.label}>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = state.teacherRequest
                            ? `${state.teacherRequest}\n${item.text}`
                            : item.text;
                          setTeacherRequest(updated);
                        }}
                        className="chip px-3 py-1.5 text-xs font-medium bg-white hover:bg-forest-50 hover:border-forest-300 text-charcoal-700 border border-border shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>+ {item.label}</span>
                      </button>
                    </RichHoverCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ③ 결과물 설정 */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm sm:text-base font-semibold text-charcoal-600">
          ③ 결과물 설정
        </h3>

        <div className="space-y-3 p-4 rounded-xl bg-oat-50 border border-border text-xs">
          {/* Top Row: 용지 & 방향 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="text-charcoal-500 font-medium">용지 규격</span>
              <span className="font-bold text-charcoal-600 bg-white px-2 py-0.5 rounded border border-border">A4</span>
              <span className="text-[11px] text-charcoal-400 font-mono">
                {state.pageOrientation === 'landscape' ? '(297 × 210mm)' : '(210 × 297mm)'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-charcoal-500 font-medium">방향</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPageOrientation('landscape')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border cursor-pointer ${
                    state.pageOrientation === 'landscape'
                      ? 'bg-sage-600 text-white border-sage-600 shadow-2xs'
                      : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                  }`}
                >
                  <svg className="w-4 h-3.5 stroke-current" fill="none" viewBox="0 0 20 16">
                    <rect x="2" y="2" width="16" height="12" rx="2" strokeWidth="2" />
                  </svg>
                  <span>가로형</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPageOrientation('portrait')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border cursor-pointer ${
                    state.pageOrientation === 'portrait'
                      ? 'bg-forest-600 text-white border-forest-600 shadow-2xs'
                      : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                  }`}
                >
                  <svg className="w-3.5 h-4 stroke-current" fill="none" viewBox="0 0 16 20">
                    <rect x="2" y="2" width="12" height="16" rx="2" strokeWidth="2" />
                  </svg>
                  <span>세로형</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: 결과물 분량 설정 (Moved A4 한 장 맞춤 here) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-charcoal-500 font-medium">결과물 분량</span>
            <div className="flex flex-wrap items-center gap-2">
              <RichHoverCard dataKey="자동 (분량)">
                <button
                  type="button"
                  onClick={() => setPageLength('auto')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    state.pageLength === 'auto' || !state.pageLength
                      ? 'bg-forest-600 text-white border-forest-600 font-bold'
                      : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                  }`}
                >
                  <span>○ 자동 (분량 조절)</span>
                </button>
              </RichHoverCard>

              <RichHoverCard dataKey="A4 1장">
                <button
                  type="button"
                  onClick={() => setPageLength('a4_1')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    state.pageLength === 'a4_1'
                      ? 'bg-forest-600 text-white border-forest-600 font-bold'
                      : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                  }`}
                >
                  <span>○ A4 1장 (한 페이지 맞춤)</span>
                </button>
              </RichHoverCard>

              <RichHoverCard dataKey="A4 2장 이상">
                <button
                  type="button"
                  onClick={() => setPageLength('a4_2')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    state.pageLength === 'a4_2'
                      ? 'bg-forest-600 text-white border-forest-600 font-bold'
                      : 'bg-white hover:bg-oat-100 text-charcoal-500 border-border'
                  }`}
                >
                  <span>○ A4 2장 이상</span>
                </button>
              </RichHoverCard>
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
