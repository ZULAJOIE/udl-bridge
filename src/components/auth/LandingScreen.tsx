import React from 'react';
import brandLogo from '../../assets/udl-bridge-brand.png';
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Footer } from '../common/Footer';
import { LegalTab } from '../common/LegalModal';

interface LandingScreenProps {
  onStart: () => void;
  onOpenLegal: (tab: LegalTab) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, onOpenLegal }) => {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-charcoal flex flex-col justify-between selection:bg-[#EAF2EC] font-sans texture-paper">
      {/* Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2D5A3F] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            UDL
          </div>
          <span className="font-bold text-lg text-[#1A3323] tracking-tight">UDL·Bridge</span>
        </div>
      </header>

      {/* Main Landing Visual & Copy Hero */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-4 sm:py-8 flex flex-col items-center justify-center text-center">
        
        {/* Brand Image Container with object-contain & gentle breathing float animation */}
        <div className="w-full max-w-xl aspect-[16/10] mb-6 relative flex items-center justify-center pointer-events-none">
          <img
            src={brandLogo}
            alt="UDL-BRIDGE - BRIDGING TEACHING & LEARNING 가르침과 배움을 잇는 다리"
            className="w-full h-full object-contain filter drop-shadow-sm select-none brand-logo-gentle-float"
          />
        </div>

        {/* Subtitle & Value Proposition */}
        <div className="max-w-xl mx-auto space-y-4 mb-8">
          <p className="text-lg md:text-xl text-charcoal-700 font-medium leading-relaxed">
            다양한 학습자의 배움을 위해<br className="hidden sm:inline" />
            수업자료를 함께 설계합니다.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-charcoal-600">
            <span className="inline-flex items-center gap-1.5 bg-[#EAF2EC] text-[#2D5A3F] px-3 py-1 rounded-full font-semibold border border-[#C5DDCB]">
              <Sparkles className="w-3.5 h-3.5" /> 교수적 수정 AI 설계
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#EAF2EC] text-[#2D5A3F] px-3 py-1 rounded-full font-semibold border border-[#C5DDCB]">
              <ShieldCheck className="w-3.5 h-3.5" /> 교사 최종 결정권 보장
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onStart}
            className="inline-flex items-center justify-center gap-3 bg-[#2D5A3F] hover:bg-[#234731] active:bg-[#1E3F2B] text-white text-lg font-bold px-10 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <span>시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-charcoal-400">
            별도의 복잡한 회원가입 없이 빠르게 시작하실 수 있습니다.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left max-w-3xl w-full">
          <div className="bg-white/80 backdrop-blur-xs border border-border/80 p-5 rounded-2xl shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#EAF2EC] text-[#2D5A3F] flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#1A3323] mb-1">맞춤형 난이도 재구성</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              수업 텍스트와 시각 자료를 학습자의 읽기/인지 단계에 맞게 1~5단계로 수정합니다.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-xs border border-border/80 p-5 rounded-2xl shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#EAF2EC] text-[#2D5A3F] flex items-center justify-center mb-3">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#1A3323] mb-1">UDL 기반 다각적 접근</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              보편적 학습설계 원칙으로 표현·작동·참여 전략을 유연하게 결합합니다.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-xs border border-border/80 p-5 rounded-2xl shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#EAF2EC] text-[#2D5A3F] flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#1A3323] mb-1">A4 학습지 즉시 인쇄</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              실시간 연동되는 가로/세로 규격 A4 미리보기로 바로 출력하고 다운로드하세요.
            </p>
          </div>
        </div>
      </main>

      {/* Shared Legal & Operational Footer */}
      <Footer onOpenLegal={onOpenLegal} />
    </div>
  );
};
