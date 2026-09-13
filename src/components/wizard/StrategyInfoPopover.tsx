import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { StrategyItem } from '../../types';

interface StrategyInfoPopoverProps {
  strategy: StrategyItem;
  accent?: 'forest' | 'sage';
}

const POPOVER_WIDTH = 280;
const VIEWPORT_MARGIN = 12;

export const StrategyInfoPopover: React.FC<StrategyInfoPopoverProps> = ({ strategy, accent = 'forest' }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverCloseTimer = useRef<number | null>(null);

  const computePosition = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN));

    const spaceBelow = window.innerHeight - rect.bottom;
    const placement: 'top' | 'bottom' = spaceBelow < 260 && rect.top > 260 ? 'top' : 'bottom';
    const top = placement === 'bottom' ? rect.bottom + 8 : rect.top - 8;

    setCoords({ top, left, placement });
  }, []);

  const openPopover = () => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    computePosition();
    setOpen(true);
  };

  const scheduleClose = () => {
    hoverCloseTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (open) {
      setOpen(false);
    } else {
      openPopover();
    }
  };

  useLayoutEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleReposition = () => computePosition();

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open, computePosition]);

  const hasDetail = strategy.description || strategy.principle || strategy.exampleBefore || strategy.exampleAfter;
  if (!hasDetail) return null;

  const principleAccentClass = accent === 'sage'
    ? 'text-sage-800 bg-sage-50 border-sage-200'
    : 'text-forest-700 bg-forest-50 border-forest-100';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClose}
        aria-label={`${strategy.label} 설명 보기`}
        className="inline-flex items-center justify-center shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <Info className="w-3 h-3" />
      </button>
      {open && coords && createPortal(
        <div
          ref={popoverRef}
          onMouseEnter={openPopover}
          onMouseLeave={scheduleClose}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: POPOVER_WIDTH,
            transform: coords.placement === 'top' ? 'translateY(-100%)' : undefined
          }}
          className="z-[100] bg-surface border border-border rounded-xl shadow-xl p-3.5 text-left animate-fadeIn"
        >
          <div className="text-sm font-bold text-charcoal mb-1.5">{strategy.label}</div>

          {strategy.description && (
            <p className="text-xs text-charcoal-600 leading-relaxed mb-2">{strategy.description}</p>
          )}

          {strategy.principle && (
            <p className={`text-[11px] rounded-lg px-2 py-1.5 mb-2 leading-relaxed border ${principleAccentClass}`}>
              유지 원칙 · {strategy.principle}
            </p>
          )}

          {(strategy.exampleBefore || strategy.exampleAfter) && (
            <div className="space-y-1.5 border-t border-border pt-2 mt-1">
              <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wide">예시</div>
              {strategy.exampleBefore && (
                <div className="text-[11px] text-charcoal-500 leading-relaxed">
                  <span className="font-semibold text-charcoal-400">수정 전 · </span>
                  {strategy.exampleBefore}
                </div>
              )}
              {strategy.exampleAfter && (
                <div className="text-[11px] text-charcoal-700 leading-relaxed">
                  <span className="font-semibold text-charcoal-400">수정 후 · </span>
                  {strategy.exampleAfter}
                </div>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
