import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getRichTooltipData, RichTooltipData } from '../../data/richTooltipData';
import { Info, X } from 'lucide-react';

interface RichHoverCardProps {
  dataKey?: string;
  data?: RichTooltipData;
  children: React.ReactElement;
  className?: string;
}

export const RichHoverCard: React.FC<RichHoverCardProps> = ({
  dataKey,
  data: directData,
  children,
  className = ''
}) => {
  const cardData: RichTooltipData = directData || (dataKey ? getRichTooltipData(dataKey) : getRichTooltipData(''));

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 340;
    const cardEstimatedHeight = 240;

    // Horizontal centering relative to trigger element
    let left = rect.left + rect.width / 2 - cardWidth / 2;
    // Clamp horizontal bounds inside viewport
    left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

    // Prefer placing BELOW the button with offset so it NEVER covers the button icon
    const spaceBelow = window.innerHeight - rect.bottom;
    let top = rect.bottom + 6;
    if (spaceBelow < cardEstimatedHeight + 16 && rect.top > cardEstimatedHeight + 16) {
      top = rect.top - cardEstimatedHeight - 6;
    }

    setCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOpen) {
      setIsOpen(false);
    } else {
      calculatePosition();
      setIsOpen(true);
    }
  };

  // Close on click/pointerdown outside
  useEffect(() => {
    const handlePointerDownOutside = (e: PointerEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDownOutside);
    return () => window.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [isOpen]);

  // Recalculate position on scroll or window resize
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => calculatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const formatPlainText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^(수정 전 · |수정 후 · |\[수정 전\] |\[수정 후\] )/g, '')
      .trim();
  };

  const displayCoreRole = formatPlainText(cardData.coreRole || cardData.description || '');

  return (
    <div ref={triggerRef} className="inline-flex items-center gap-1 relative select-none">
      {children}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`${cardData.title} 상세 설명 토글`}
        title={`${cardData.title} 상세 설명 보기`}
        className={`p-1 rounded-full transition-colors shrink-0 cursor-pointer ${
          isOpen
            ? 'text-forest-700 bg-forest-100 ring-2 ring-forest-300'
            : 'text-charcoal-400 hover:text-forest-700 hover:bg-oat-100'
        }`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={cardRef}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: '340px'
            }}
            className={`fixed z-[9999] pointer-events-auto rounded-xl bg-white border border-border shadow-2xl p-3.5 sm:p-4 text-charcoal font-sans text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150 ${className}`}
          >
            {/* Header with Title and Close button */}
            <div className="flex items-center justify-between border-b border-oat-200 pb-2">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-forest-600 shrink-0"></span>
                <h4 className="text-xs sm:text-sm font-extrabold text-charcoal truncate">
                  {cardData.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-charcoal-400 hover:text-charcoal p-0.5 rounded hover:bg-oat-100 transition-colors shrink-0 cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ① 핵심 역할 */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-forest-800 tracking-tight block">
                [핵심 역할]
              </span>
              <p className="text-[11px] text-charcoal-700 leading-snug font-normal">
                {displayCoreRole}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-oat-200 pt-2 space-y-1.5">
              {/* 수정 전 */}
              <div className="p-2 rounded-lg bg-oat-50 border border-oat-200 text-[11px] text-charcoal-600 space-y-0.5">
                <span className="font-bold text-charcoal-400 text-[10px] block">수정 전</span>
                <p className="leading-snug whitespace-pre-wrap">{formatPlainText(cardData.beforeExample)}</p>
              </div>

              {/* Arrow Indicator */}
              <div className="text-center text-[10px] text-charcoal-400 font-bold -my-0.5">
                ↓
              </div>

              {/* 수정 후 */}
              <div className="p-2 rounded-lg bg-sage-50 border border-sage-200 text-[11px] text-forest-900 font-medium space-y-0.5">
                <span className="font-bold text-forest-700 text-[10px] block">수정 후</span>
                <p className="leading-snug whitespace-pre-wrap">{formatPlainText(cardData.afterExample)}</p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
