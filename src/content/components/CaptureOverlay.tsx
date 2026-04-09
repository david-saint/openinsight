import React, { useEffect, useState, useRef } from 'react';

export interface CaptureOverlayProps {
  isActive: boolean;
  onCancel: () => void;
  onCapture: (region: { x: number; y: number; width: number; height: number }) => void;
}

export const CaptureOverlay: React.FC<CaptureOverlayProps> = ({
  isActive,
  onCancel,
  onCapture
}) => {
  const [highlightRect, setHighlightRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  useEffect(() => {
    if (!isActive) {
      setHighlightRect(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onCancel]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;

    // Use pointer events to find underlying element
    const overlay = e.currentTarget;
    const oldPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = oldPointerEvents;

    if (target && (target.tagName.toLowerCase() === 'img' || target.tagName.toLowerCase() === 'svg')) {
      const rect = target.getBoundingClientRect();
      setHighlightRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    } else {
      setHighlightRect(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;

    if (highlightRect) {
      // User clicked on a highlighted element
      onCapture(highlightRect);
      return;
    }

    // Temporary fallback click-to-cancel until freeform drawing is fully implemented
    onCancel();
  };

  if (!isActive) return null;

  return (
    <div
      data-testid="capture-overlay"
      className="fixed inset-0 z-[999999] cursor-crosshair"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {highlightRect && (
        <div
          data-testid="capture-highlight"
          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
          style={{
            left: `${highlightRect.x}px`,
            top: `${highlightRect.y}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
          }}
        />
      )}
    </div>
  );
};
