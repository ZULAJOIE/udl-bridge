import React from 'react';
import { LegalTab } from './LegalModal';

interface FooterProps {
  onOpenLegal: (tab: LegalTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur-xs py-6 text-xs text-charcoal-500 font-sans texture-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        
        {/* Left Column: Copyright & Description */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-[#1A3323]">udl·bridge</span>
            <span>© 2026 특수교육 학생용 교수적 수정 학습자료 생성 서비스</span>
          </div>
          <p className="text-[11px] text-charcoal-400">
            장애유형보다 교육적 요구 중심 • AI 추천 교사 최종 결정을 준수합니다.
          </p>
        </div>

        {/* Right Column: Legal Links & Manager Info */}
        <div className="flex flex-col items-center md:items-end gap-1.5">
          <div className="flex items-center gap-3 font-semibold text-[#2D5A3F]">
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:underline hover:text-[#234731] transition-colors cursor-pointer"
            >
              이용약관
            </button>
            <span className="text-charcoal-300">|</span>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:underline hover:text-[#234731] transition-colors cursor-pointer"
            >
              개인정보처리방침
            </button>
          </div>
          
          <div className="text-[11px] text-charcoal-500 flex flex-wrap items-center justify-center md:justify-end gap-1.5">
            <span>개인정보보호책임자:</span>
            <span className="font-medium bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
              [확인 필요: 교사 성명]
            </span>
            <span className="text-charcoal-300">•</span>
            <span className="font-medium bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
              [확인 필요: 소속 학교명]
            </span>
            <span className="text-charcoal-300">•</span>
            <span>문의:</span>
            <span className="font-medium bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
              [확인 필요: 교무실 내선 번호]
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
