import React, { useState } from 'react';
import udlGuideImg from '../../assets/udl-guidelines.png';
import { X, ZoomIn, ZoomOut, BookOpen, ExternalLink, Sparkles, HelpCircle } from 'lucide-react';

interface UdlGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UdlGuideModal: React.FC<UdlGuideModalProps> = ({ isOpen, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.0, Math.round((prev + 0.2) * 10) / 10));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.8, Math.round((prev - 0.2) * 10) / 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-900/60 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#F8F6F0] border border-border rounded-3xl p-5 sm:p-8 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF2EC] border border-[#C5DDCB] flex items-center justify-center text-[#2D5A3F]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#1A3323] tracking-tight">
                  보편적 학습 설계 (UDL) 지침 3.0
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2EC] text-[#2D5A3F] text-xs font-bold border border-[#C5DDCB]">
                  CAST 공식 가이드라인
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-0.5">
                학습자 주도성과 다각적 수업자료 설계를 위한 3대 영역(참여, 표상, 행동과 표현) 지침입니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 rounded-lg hover:bg-gray-100 text-charcoal-600 transition-colors"
                title="축소"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-bold text-xs text-[#2D5A3F] min-w-[40px] text-center font-mono">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 rounded-lg hover:bg-gray-100 text-charcoal-600 transition-colors"
                title="확대"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-100 text-charcoal-500 hover:text-charcoal transition-colors border border-border"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Image Area */}
        <div className="flex-1 overflow-auto bg-white rounded-2xl border border-border p-4 flex items-center justify-center min-h-[360px] relative">
          <div
            className="transition-transform duration-200 origin-top flex items-center justify-center max-w-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={udlGuideImg}
              alt="보편적 학습 설계 지침 (CAST Universal Design for Learning Guidelines v3.0)"
              className="max-w-full h-auto object-contain rounded-lg filter drop-shadow-xs select-none"
            />
          </div>
        </div>

        {/* Footer info & quick reference explanation */}
        <div className="mt-4 pt-3 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-600 shrink-0">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              참여 (Engagement)
            </span>
            <span className="flex items-center gap-1.5 text-purple-900">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
              표상 (Representation)
            </span>
            <span className="flex items-center gap-1.5 text-blue-900">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              행동과 표현 (Action &amp; Expression)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://udlguidelines.cast.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#2D5A3F] font-bold hover:underline"
            >
              <span>CAST 공식 사이트</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="bg-[#2D5A3F] hover:bg-[#234731] text-white font-bold px-4 py-1.5 rounded-xl transition-colors text-xs"
            >
              닫기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
