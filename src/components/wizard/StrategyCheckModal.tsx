import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { StrategyItem, StrategyRelation } from '../../types';

interface StrategyCheckModalProps {
  relation: StrategyRelation;
  existingStrategy: StrategyItem;
  candidateStrategy: StrategyItem;
  onChoosePriority: (priorityStrategy: StrategyItem) => void;
  onCancel: () => void;
}

export const StrategyCheckModal: React.FC<StrategyCheckModalProps> = ({
  relation,
  existingStrategy,
  candidateStrategy,
  onChoosePriority,
  onCancel
}) => {
  const existingIsRelationA = relation.aId === existingStrategy.id;

  const explanationExisting = existingIsRelationA ? relation.explanationA : relation.explanationB;
  const explanationCandidate = existingIsRelationA ? relation.explanationB : relation.explanationA;

  const priorityLabelExisting = existingIsRelationA ? relation.priorityALabel : relation.priorityBLabel;
  const priorityDetailExisting = existingIsRelationA ? relation.priorityADetail : relation.priorityBDetail;
  const priorityLabelCandidate = existingIsRelationA ? relation.priorityBLabel : relation.priorityALabel;
  const priorityDetailCandidate = existingIsRelationA ? relation.priorityBDetail : relation.priorityADetail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-brown-300 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-brown-50 text-brown-600 border border-brown-300 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-charcoal">수정 방법을 확인해주세요</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              선택한 두 수정 방법은 적용 방식이 서로 다릅니다.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-oat-50 border border-border">
            <div className="text-xs font-bold text-charcoal mb-1">① {existingStrategy.label}</div>
            <p className="text-[11px] text-charcoal-600 leading-relaxed">{explanationExisting}</p>
          </div>
          <div className="p-3 rounded-lg bg-oat-50 border border-border">
            <div className="text-xs font-bold text-charcoal mb-1">② {candidateStrategy.label}</div>
            <p className="text-[11px] text-charcoal-600 leading-relaxed">{explanationCandidate}</p>
          </div>
        </div>

        <p className="text-xs font-semibold text-charcoal-700">어떤 방법을 우선할까요?</p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onChoosePriority(existingStrategy)}
            className="w-full text-left p-3 rounded-lg border border-forest-200 bg-forest-50 hover:bg-forest-100 transition-colors"
          >
            <div className="text-xs font-bold text-forest-800">[{priorityLabelExisting}]</div>
            {priorityDetailExisting && (
              <p className="text-[11px] text-forest-700 mt-0.5 leading-relaxed">{priorityDetailExisting}</p>
            )}
          </button>
          <button
            type="button"
            onClick={() => onChoosePriority(candidateStrategy)}
            className="w-full text-left p-3 rounded-lg border border-sage-200 bg-sage-50 hover:bg-sage-100 transition-colors"
          >
            <div className="text-xs font-bold text-sage-800">[{priorityLabelCandidate}]</div>
            {priorityDetailCandidate && (
              <p className="text-[11px] text-sage-700 mt-0.5 leading-relaxed">{priorityDetailCandidate}</p>
            )}
          </button>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary px-4 py-2 text-xs"
          >
            선택 다시 하기
          </button>
        </div>
      </div>
    </div>
  );
};
