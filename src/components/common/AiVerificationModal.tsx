import React from 'react';
import { WorksheetVerificationResult, VerificationFinding } from '../../types';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Sparkles, X, ArrowRight } from 'lucide-react';

interface AiVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  result: WorksheetVerificationResult | null;
  onApplySuggestions?: (suggestionsText: string) => void;
  onProceedSave: () => void;
}

export const AiVerificationModal: React.FC<AiVerificationModalProps> = ({
  isOpen,
  onClose,
  loading,
  result,
  onApplySuggestions,
  onProceedSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-forest-900 via-forest-800 to-sage-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20">
              <ShieldCheck className="w-5 h-5 text-forest-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">AI 원문 - 학습지 내용 오류 점검</h3>
              <p className="text-xs text-forest-200">원본 수업자료와 학생용 학습지의 팩트 및 내용 일치성을 대조합니다.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-forest-50 border border-forest-200 text-forest-600 animate-bounce">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-charcoal-800">Gemini AI가 원문과 학습지를 1:1 점검 중입니다...</h4>
                <p className="text-xs text-charcoal-500">팩트 정확성, 핵심 수치, 주요 어휘 누락 및 난이도를 분석하고 있습니다.</p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Score Summary Box */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  result.score >= 90
                    ? 'bg-forest-50/80 border-forest-200 text-forest-950'
                    : result.score >= 70
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-red-50/80 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-xs ${
                      result.score >= 90
                        ? 'bg-forest-600 text-white'
                        : result.score >= 70
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {result.score}점
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">점검 총평</span>
                    <h4 className="text-sm font-bold">{result.summary}</h4>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 border ${
                    result.status === 'all_good'
                      ? 'bg-forest-100 text-forest-800 border-forest-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {result.status === 'all_good' ? '✓ 내용 정확성 높음' : '⚠️ 점검 권장 항목 있음'}
                </span>
              </div>

              {/* Findings Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-charcoal-700 uppercase tracking-wider">
                  세부 점검 항목 ({result.findings.length}건)
                </h4>

                <div className="space-y-2.5">
                  {result.findings.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-oat-50/60 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.type === 'correct' && <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />}
                          {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                          {item.type === 'error' && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          <span className="font-bold text-charcoal-800">{item.category}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                            item.type === 'correct'
                              ? 'bg-forest-50 text-forest-700 border-forest-200'
                              : item.type === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {item.type === 'correct' ? '일치' : item.type === 'warning' ? '주의' : '오류'}
                        </span>
                      </div>

                      <p className="text-charcoal-600 pl-6 leading-relaxed">{item.message}</p>

                      {item.suggestion && (
                        <div className="ml-6 p-2 rounded-lg bg-white border border-forest-200 text-forest-900 font-medium flex items-start gap-1.5 mt-1">
                          <Sparkles className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px]">AI 수정 제안: </span>
                            <span>{item.suggestion}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-oat-100 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-xs font-bold w-full sm:w-auto"
          >
            닫기
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {result && result.findings.some(f => f.suggestion) && onApplySuggestions && (
              <button
                type="button"
                onClick={() => {
                  const suggestions = result.findings
                    .filter(f => f.suggestion)
                    .map(f => f.suggestion)
                    .join('\n');
                  onApplySuggestions(suggestions);
                }}
                className="btn-ai px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI 제안사항 학습지에 자동 반영</span>
              </button>
            )}

            <button
              type="button"
              onClick={onProceedSave}
              className="btn-primary px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
            >
              <span>확인 완료 및 저장하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
