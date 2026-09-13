import React, { useState, useEffect, useRef } from 'react';
import { FileText, Minus, Square, X, Plus, GripHorizontal } from 'lucide-react';
import { SourceMaterial } from '../../types';

interface FloatingReferenceWindowProps {
  isOpen: boolean;
  onClose: () => void;
  materialFile?: {
    name?: string;
    type?: string;
    previewUrl?: string;
  } | null;
  sourceMaterials?: SourceMaterial[];
}

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

const STORAGE_KEY = 'udl_bridge_floating_ref_window_v1';

const DEFAULT_STATE: WindowState = {
  isOpen: true,
  isMinimized: false,
  x: 40,
  y: 120,
  width: 420,
  height: 560,
  zoom: 1.0
};

export const FloatingReferenceWindow: React.FC<FloatingReferenceWindowProps> = ({
  isOpen,
  onClose,
  materialFile
}) => {
  // Load state from localStorage or use defaults
  const [winState, setWinState] = useState<WindowState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          isOpen: true // ensure open when triggered
        };
      }
    } catch (e) {
      console.warn('Failed to load floating reference window state:', e);
    }
    return DEFAULT_STATE;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  const resizeStartRef = useRef<{ startX: number; startY: number; initialW: number; initialH: number }>({
    startX: 0,
    startY: 0,
    initialW: 0,
    initialH: 0
  });

  // Save winState to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(winState));
    } catch (e) {
      console.warn('Failed to save floating reference window state:', e);
    }
  }, [winState]);

  // Keep window bounds safe inside viewport on window resize
  useEffect(() => {
    const handleViewportResize = () => {
      setWinState(prev => {
        const maxX = Math.max(0, window.innerWidth - prev.width);
        const maxY = Math.max(0, window.innerHeight - 50);
        const newX = Math.min(prev.x, maxX);
        const newY = Math.min(prev.y, maxY);
        if (newX === prev.x && newY === prev.y) return prev;
        return { ...prev, x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, []);

  if (!isOpen) return null;

  // Header Draggable Pointer Events
  const handleDragPointerDown = (e: React.PointerEvent) => {
    // Ignore button clicks inside header
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: winState.x,
      initialY: winState.y
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    const newX = Math.max(0, Math.min(window.innerWidth - winState.width, dragStartRef.current.initialX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartRef.current.initialY + deltaY));

    setWinState(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleDragPointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore if pointer lost
      }
    }
  };

  // Resize Handle Pointer Events
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialW: winState.width,
      initialH: winState.height
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeStartRef.current.startX;
    const deltaY = e.clientY - resizeStartRef.current.startY;

    const minW = 320;
    const minH = 300;
    const maxW = Math.max(minW, window.innerWidth - winState.x);
    const maxH = Math.max(minH, window.innerHeight - winState.y);

    const newW = Math.max(minW, Math.min(maxW, resizeStartRef.current.initialW + deltaX));
    const newH = Math.max(minH, Math.min(maxH, resizeStartRef.current.initialH + deltaY));

    setWinState(prev => ({ ...prev, width: newW, height: newH }));
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (isResizing) {
      setIsResizing(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore if pointer lost
      }
    }
  };

  // Controls
  const handleToggleMinimize = () => {
    setWinState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  const handleResetSize = () => {
    setWinState(prev => ({
      ...prev,
      width: 420,
      height: 560,
      zoom: 1.0
    }));
  };

  const fileTypeLabel = materialFile?.type === 'image' ? '이미지' : 'PDF 1쪽';

  // Case A: Minimized Floating Chip Mode
  if (winState.isMinimized) {
    const chipX = Math.max(10, Math.min(window.innerWidth - 160, winState.x));
    const chipY = Math.max(10, Math.min(window.innerHeight - 50, winState.y));

    return (
      <div
        style={{ left: `${chipX}px`, top: `${chipY}px` }}
        onClick={handleToggleMinimize}
        className="fixed z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface text-forest-700 border border-forest-200 shadow-md cursor-pointer hover:bg-oat-50 transition-all select-none group animate-in fade-in duration-150"
        title="클릭하여 원본 수업자료 창 복원"
      >
        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-extrabold tracking-wide">📄 원문</span>
        <span className="text-[10px] text-sage-800 font-mono font-bold bg-sage-100 px-1.5 py-0.5 rounded border border-sage-300">
          {fileTypeLabel}
        </span>
      </div>
    );
  }

  // Case B: Full Floating Window Mode (Non-blocking, no backdrop)
  return (
    <div
      style={{
        left: `${winState.x}px`,
        top: `${winState.y}px`,
        width: `${winState.width}px`,
        height: `${winState.height}px`
      }}
      className="fixed z-40 bg-surface border border-border shadow-lg rounded-xl flex flex-col overflow-hidden text-charcoal select-none transition-shadow animate-in zoom-in-95 duration-150"
    >
      {/* Window Title Bar (Draggable) */}
      <div
        onPointerDown={handleDragPointerDown}
        onPointerMove={handleDragPointerMove}
        onPointerUp={handleDragPointerUp}
        className={`px-3.5 py-2.5 bg-oat-50 border-b border-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none ${
          isDragging ? 'bg-oat-100 border-forest-300' : ''
        }`}
      >
        <div className="flex items-center gap-2 pointer-events-none truncate pr-2">
          <GripHorizontal className="w-4 h-4 text-charcoal-300 flex-shrink-0" />
          <FileText className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span className="text-xs font-extrabold text-charcoal truncate max-w-[160px]">
            원본 수업자료
          </span>
          <span className="text-[10px] text-sage-800 font-mono font-bold px-1.5 py-0.5 rounded bg-sage-100 border border-sage-300 flex-shrink-0">
            {fileTypeLabel}
          </span>
        </div>

        {/* Title Bar Controls: [— 최소화] [□ 기본 크기] [× 닫기] */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleToggleMinimize}
            className="p-1 rounded-md hover:bg-white text-charcoal-500 hover:text-charcoal transition-colors"
            title="최소화 (─)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetSize}
            className="p-1 rounded-md hover:bg-white text-charcoal-500 hover:text-charcoal transition-colors"
            title="기본 크기 복원 (420×560)"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-red-50 text-charcoal-500 hover:text-red-600 transition-colors"
            title="닫기 (×)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Internal Zoom & Reset Toolbar */}
      <div className="px-3.5 py-1.5 bg-surface border-b border-border flex items-center justify-between text-xs">
        <span className="text-[11px] text-charcoal-400 font-medium truncate">참고용 원문 뷰어</span>

        {/* Zoom Controls: [−] [100%] [+] [화면 맞춤] */}
        <div className="flex items-center gap-1 bg-oat-50 px-2 py-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setWinState(prev => ({ ...prev, zoom: Math.max(0.4, Math.round((prev.zoom - 0.2) * 10) / 10) }))}
            className="p-0.5 rounded hover:bg-white text-charcoal-500 hover:text-charcoal"
            title="축소"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-1 font-mono text-[11px] text-forest-700 font-bold min-w-[38px] text-center">
            {Math.round(winState.zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setWinState(prev => ({ ...prev, zoom: Math.min(3.0, Math.round((prev.zoom + 0.2) * 10) / 10) }))}
            className="p-0.5 rounded hover:bg-white text-charcoal-500 hover:text-charcoal"
            title="확대"
          >
            <Plus className="w-3 h-3" />
          </button>
          <div className="h-3 w-[1px] bg-border mx-0.5" />
          <button
            type="button"
            onClick={() => setWinState(prev => ({ ...prev, zoom: 1.0 }))}
            className="px-1.5 py-0.5 text-[10px] font-bold text-forest-700 hover:text-forest-800"
          >
            화면 맞춤
          </button>
        </div>
      </div>

      {/* Floating Window Content (Image / PDF Preview with Zoom & Internal Scroll) */}
      <div className="flex-1 bg-oat-50 p-4 overflow-auto flex items-center justify-center relative select-none">
        {materialFile?.previewUrl ? (
          <div
            className="transition-transform duration-150 origin-center max-w-full"
            style={{ transform: `scale(${winState.zoom})` }}
          >
            <img
              src={materialFile.previewUrl}
              alt="원본 수업자료"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm border border-border pointer-events-none"
            />
          </div>
        ) : (
          <div className="text-center p-6 space-y-2">
            <FileText className="w-10 h-10 text-forest-400 mx-auto opacity-60" />
            <p className="text-xs font-bold text-charcoal-600">
              {materialFile?.name || '업로드된 원본 파일이 없습니다.'}
            </p>
            <p className="text-[11px] text-charcoal-400 leading-relaxed">
              수업자료를 참고하면서 A4 미리보기 및 세부 편집 패널을 자유롭게 이용하실 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Bottom-Right Corner Resize Handle */}
      <div
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-center justify-center text-charcoal-300 hover:text-forest-600 select-none z-50"
        title="드래그하여 창 크기 조절"
      >
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 14H10V12H14V14ZM14 10H6V8H14V10ZM14 6H2V4H14V6Z" />
        </svg>
      </div>
    </div>
  );
};
